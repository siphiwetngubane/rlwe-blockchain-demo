// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// =============================================================================
// QuantumSpectra.sol
// =============================================================================

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

interface IGroth16Verifier {
    function verifyProof(
        uint256[2] calldata _pA,
        uint256[2][2] calldata _pB,
        uint256[2] calldata _pC,
        uint256[15] calldata _pubSignals
    ) external view returns (bool);
}

contract QuantumSpectra is ReentrancyGuard, AccessControl, Pausable {

    bytes32 public constant ADMIN_ROLE    = keccak256("ADMIN_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant PAUSER_ROLE   = keccak256("PAUSER_ROLE");

    IGroth16Verifier public immutable verifier;

    uint256 public verifierRewardPool;
    uint256 public verifierRewardBps = 100;

    uint256 public maxProofsPerBlock = 5;
    mapping(address => uint256) private lastProofBlock;
    mapping(address => uint256) private proofsThisBlock;

    mapping(bytes32 => bool) public nullifiers;
    mapping(bytes32 => bool) public anchoredRoots;
    mapping(bytes32 => bool) public commitments;
    mapping(address => uint256) public nonces;

    uint256 public totalProofsVerified;
    uint256 public totalBatchesProcessed;
    uint256 public totalTransactionsProcessed;

    struct Proof {
        uint256[2]    pA;
        uint256[2][2] pB;
        uint256[2]    pC;
        uint256[15]   pubSignals;
    }

    struct PrivateTransaction {
        bytes32 commitment;
        bytes32 nullifier;
        bytes32 merkleRoot;
        uint256 timestamp;
        bool    settled;
    }

    struct BatchRecord {
        address verifierAddr;
        uint256 transactionCount;
        bytes32 batchRoot;
        uint256 timestamp;
        bool    settled;
    }

    mapping(bytes32 => PrivateTransaction) public privateTransactions;
    mapping(address => bytes32[]) private userCommitments;
    mapping(address => BatchRecord[]) private verifierBatches;

    // Events
    event TransactionCommitted(bytes32 indexed commitment, bytes32 indexed nullifier, bytes32 merkleRoot, uint256 timestamp);
    event BatchProcessed(address indexed verifierAddr, uint256 transactionCount, bytes32 batchRoot, uint256 rewardPaid, uint256 timestamp);
    event VerifierRewardPaid(address indexed verifierAddr, uint256 amount, uint256 timestamp);
    event RewardPoolFunded(address indexed funder, uint256 amount, uint256 newTotal, uint256 timestamp);
    event NullifierConsumed(bytes32 indexed nullifier, uint256 timestamp);
    event MerkleRootAnchored(bytes32 indexed root, address indexed anchoredBy, uint256 timestamp);
    event VerifierRewardBpsUpdated(uint256 oldBps, uint256 newBps);
    event RateLimitUpdated(uint256 newMaxProofsPerBlock);
    event EmergencyWithdraw(address indexed to, uint256 amount, uint256 timestamp);
    event CommitmentRecorded(bytes32 indexed commitment, bytes32 indexed nullifier, uint256 timestamp);

    //Errors
    error InvalidVerifierAddress();
    error InvalidProof();
    error NullifierAlreadyUsed(bytes32 nullifier);
    error InsufficientRewardPool(uint256 required, uint256 available);
    error MerkleRootNotAnchored(bytes32 root);
    error RateLimitExceeded(address sender, uint256 limit);
    error ArrayLengthMismatch();
    error ZeroAmount();
    error UnauthorizedRole(address caller, bytes32 role);
    error TransferFailed(address recipient, uint256 amount);
    error InvalidBps(uint256 bps);
    error CommitmentNotFound(bytes32 commitment);

    constructor(address _verifier) {
        if (_verifier == address(0)) revert InvalidVerifierAddress();
        verifier = IGroth16Verifier(_verifier);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE,         msg.sender);
        _grantRole(PAUSER_ROLE,        msg.sender);
    }

    modifier validProof(Proof calldata proof) {
        if (!verifier.verifyProof(proof.pA, proof.pB, proof.pC, proof.pubSignals)) 
            revert InvalidProof();
        _;
    }

    modifier withinRateLimit() {
        if (block.number > lastProofBlock[msg.sender]) {
            lastProofBlock[msg.sender]  = block.number;
            proofsThisBlock[msg.sender] = 0;
        }
        if (proofsThisBlock[msg.sender] >= maxProofsPerBlock) {
            revert RateLimitExceeded(msg.sender, maxProofsPerBlock);
        }
        proofsThisBlock[msg.sender]++;
        _;
    }

    function submitTransaction(
        bytes32        commitment,
        bytes32        nullifier,
        bytes32        merkleRoot,
        Proof calldata proof
    )
        external
        nonReentrant
        whenNotPaused
        withinRateLimit
        validProof(proof)
    {
        if (!anchoredRoots[merkleRoot]) revert MerkleRootNotAnchored(merkleRoot);

        // Derive nullifier from pubSignals + caller + CURRENT nonce
        bytes32 derivedNullifier = _deriveNullifier(
            proof.pubSignals,
            msg.sender,
            nonces[msg.sender]
        );
        if (derivedNullifier != nullifier) revert InvalidProof();
        if (nullifiers[nullifier])         revert NullifierAlreadyUsed(nullifier);

        // Consume nullifier (irrevocable replay guard)
        nullifiers[nullifier] = true;
        commitments[commitment] = true; // Record commitment (but don't reject duplicates)

        privateTransactions[commitment] = PrivateTransaction({
            commitment: commitment,
            nullifier:  nullifier,
            merkleRoot: merkleRoot,
            timestamp:  block.timestamp,
            settled:    true
        });

        userCommitments[msg.sender].push(commitment);

        unchecked { ++nonces[msg.sender]; }
        unchecked { ++totalProofsVerified; }
        unchecked { ++totalTransactionsProcessed; }

        emit NullifierConsumed(nullifier, block.timestamp);
        emit CommitmentRecorded(commitment, nullifier, block.timestamp);
        emit TransactionCommitted(commitment, nullifier, merkleRoot, block.timestamp);
    }

    function processBatch(
        bytes32[]    calldata commitments_,
        bytes32[]    calldata nullifiers_,
        bytes32               batchRoot,
        Proof[]      calldata proofs
    )
        external
        nonReentrant
        whenNotPaused
    {
        if (!hasRole(VERIFIER_ROLE, msg.sender)) 
            revert UnauthorizedRole(msg.sender, VERIFIER_ROLE);
        if (commitments_.length != nullifiers_.length || commitments_.length != proofs.length) 
            revert ArrayLengthMismatch();
        if (!anchoredRoots[batchRoot]) revert MerkleRootNotAnchored(batchRoot);

        uint256 count      = commitments_.length;
        uint256 baseNonce  = nonces[msg.sender];

        for (uint256 i = 0; i < count; ) {
            if (!verifier.verifyProof(
                proofs[i].pA, proofs[i].pB, proofs[i].pC, proofs[i].pubSignals
            )) revert InvalidProof();

            bytes32 expectedNullifier = _deriveNullifier(
                proofs[i].pubSignals, msg.sender, baseNonce + i
            );
            bytes32 nul = nullifiers_[i];
            if (expectedNullifier != nul) revert InvalidProof();
            if (nullifiers[nul])          revert NullifierAlreadyUsed(nul);
            nullifiers[nul] = true;

            bytes32 com = commitments_[i];
            commitments[com] = true;

            privateTransactions[com] = PrivateTransaction({
                commitment: com,
                nullifier:  nul,
                merkleRoot: batchRoot,
                timestamp:  block.timestamp,
                settled:    true
            });

            emit NullifierConsumed(nul, block.timestamp);
            emit CommitmentRecorded(com, nul, block.timestamp);
            emit TransactionCommitted(com, nul, batchRoot, block.timestamp);

            unchecked { ++i; }
        }

        unchecked { nonces[msg.sender] += count; }

        verifierBatches[msg.sender].push(BatchRecord({
            verifierAddr:     msg.sender,
            transactionCount: count,
            batchRoot:        batchRoot,
            timestamp:        block.timestamp,
            settled:          true
        }));

        unchecked { totalProofsVerified       += count; }
        unchecked { totalTransactionsProcessed += count; }
        unchecked { ++totalBatchesProcessed; }

        uint256 reward = _computeReward(count);
        if (reward > 0) _payVerifier(msg.sender, reward);

        emit BatchProcessed(msg.sender, count, batchRoot, reward, block.timestamp);
    }

    // Admin functions (unchanged)
    function anchorMerkleRoot(bytes32 root) external onlyRole(ADMIN_ROLE) {
        anchoredRoots[root] = true;
        emit MerkleRootAnchored(root, msg.sender, block.timestamp);
    }

    function fundRewardPool() external payable onlyRole(ADMIN_ROLE) {
        unchecked { verifierRewardPool += msg.value; }
        emit RewardPoolFunded(msg.sender, msg.value, verifierRewardPool, block.timestamp);
    }

    function setVerifierRewardBps(uint256 bps) external onlyRole(ADMIN_ROLE) {
        if (bps > 1000) revert InvalidBps(bps);
        emit VerifierRewardBpsUpdated(verifierRewardBps, bps);
        verifierRewardBps = bps;
    }

    function setMaxProofsPerBlock(uint256 max_) external onlyRole(ADMIN_ROLE) {
        maxProofsPerBlock = max_;
        emit RateLimitUpdated(max_);
    }

    function pause() external onlyRole(PAUSER_ROLE) { _pause(); }
    function unpause() external onlyRole(PAUSER_ROLE) { _unpause(); }

    function emergencyWithdraw(address to) external onlyRole(ADMIN_ROLE) whenPaused {
        uint256 amount = verifierRewardPool;
        verifierRewardPool = 0;
        (bool ok,) = to.call{value: amount}("");
        if (!ok) revert TransferFailed(to, amount);
        emit EmergencyWithdraw(to, amount, block.timestamp);
    }

    // View functions (unchanged)
    function isNullifierUsed(bytes32 nullifier) external view returns (bool) {
        return nullifiers[nullifier];
    }

    function isCommitmentRecorded(bytes32 commitment) external view returns (bool) {
        return commitments[commitment];
    }

    function getUserCommitments(address user) external view returns (bytes32[] memory) {
        return userCommitments[user];
    }

    function getVerifierBatches(address verifierAddr) external view returns (BatchRecord[] memory) {
        return verifierBatches[verifierAddr];
    }

    function getTransaction(bytes32 commitment) external view returns (PrivateTransaction memory) {
        if (!commitments[commitment]) revert CommitmentNotFound(commitment);
        return privateTransactions[commitment];
    }

    function verifyProofOnly(Proof calldata proof) external view returns (bool) {
        return verifier.verifyProof(proof.pA, proof.pB, proof.pC, proof.pubSignals);
    }

    function getStats() external view returns (
        uint256 proofsVerified,
        uint256 batchesProcessed,
        uint256 transactionsProcessed,
        uint256 rewardPool
    ) {
        return (totalProofsVerified, totalBatchesProcessed, totalTransactionsProcessed, verifierRewardPool);
    }

    // Internal functions
    function _deriveNullifier(
        uint256[15] calldata pubSignals,
        address sender,
        uint256 nonce
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(pubSignals, sender, nonce));
    }

    function _computeReward(uint256 count) internal view returns (uint256) {
        uint256 reward = (count * verifierRewardBps * 1 ether) / 10000;
        return reward > verifierRewardPool ? verifierRewardPool : reward;
    }

    function _payVerifier(address verifierAddr, uint256 reward) internal {
        verifierRewardPool -= reward;
        (bool ok,) = verifierAddr.call{value: reward}("");
        if (!ok) revert TransferFailed(verifierAddr, reward);
        emit VerifierRewardPaid(verifierAddr, reward, block.timestamp);
    }

    receive() external payable { revert("Use fundRewardPool()"); }
    fallback() external payable { revert("Use fundRewardPool()"); }
}