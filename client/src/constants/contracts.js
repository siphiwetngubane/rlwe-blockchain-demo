// =============================================================================
// Contract ABIs + addresses
// =============================================================================

export const QUANTUM_SPECTRA_ADDRESS =
  import.meta.env.VITE_QUANTUM_SPECTRA_ADDRESS || '0x0000000000000000000000000000000000000000'

export const GROTH16_VERIFIER_ADDRESS =
  import.meta.env.VITE_GROTH16_VERIFIER_ADDRESS || '0x0000000000000000000000000000000000000000'

// Default to Sepolia; override with VITE_CHAIN_ID
export const TARGET_CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID || '11155111')

export const CHAIN_NAMES = {
  1:        'Ethereum Mainnet',
  11155111: 'Sepolia Testnet',
  8453:     'Base',
  84532:    'Base Sepolia',
  31337:    'Hardhat / Anvil',
}

// QuantumSpectra ABI — all external/public functions + events
export const QUANTUM_SPECTRA_ABI = [
  // ---- Read ----
  'function totalProofsVerified() view returns (uint256)',
  'function totalBatchesProcessed() view returns (uint256)',
  'function totalTransactionsProcessed() view returns (uint256)',
  'function verifierRewardPool() view returns (uint256)',
  'function verifierRewardBps() view returns (uint256)',
  'function maxProofsPerBlock() view returns (uint256)',
  'function getStats() view returns (uint256 proofsVerified, uint256 batchesProcessed, uint256 transactionsProcessed, uint256 rewardPool)',
  'function isNullifierUsed(bytes32 nullifier) view returns (bool)',
  'function isCommitmentRecorded(bytes32 commitment) view returns (bool)',
  'function getUserCommitments(address user) view returns (bytes32[])',
  'function getVerifierBatches(address verifierAddr) view returns (tuple(address verifierAddr, uint256 transactionCount, bytes32 batchRoot, uint256 timestamp, bool settled)[])',
  'function getTransaction(bytes32 commitment) view returns (tuple(bytes32 commitment, bytes32 nullifier, bytes32 merkleRoot, uint256 timestamp, bool settled))',
  'function verifyProofOnly(tuple(uint256[2] pA, uint256[2][2] pB, uint256[2] pC, uint256[15] pubSignals) proof) view returns (bool)',
  'function anchoredRoots(bytes32) view returns (bool)',
  'function nonces(address) view returns (uint256)',
  'function paused() view returns (bool)',
  'function hasRole(bytes32 role, address account) view returns (bool)',
  'function ADMIN_ROLE() view returns (bytes32)',
  'function VERIFIER_ROLE() view returns (bytes32)',
  'function PAUSER_ROLE() view returns (bytes32)',
  // ---- Write ----
  'function submitTransaction(bytes32 commitment, bytes32 nullifier, bytes32 merkleRoot, tuple(uint256[2] pA, uint256[2][2] pB, uint256[2] pC, uint256[15] pubSignals) proof) external',
  'function processBatch(bytes32[] commitments, bytes32[] nullifiers, bytes32 batchRoot, tuple(uint256[2] pA, uint256[2][2] pB, uint256[2] pC, uint256[15] pubSignals)[] proofs) external',
  'function anchorMerkleRoot(bytes32 root) external',
  'function fundRewardPool() external payable',
  'function setVerifierRewardBps(uint256 bps) external',
  'function setMaxProofsPerBlock(uint256 max_) external',
  'function pause() external',
  'function unpause() external',
  'function emergencyWithdraw(address to) external',
  // ---- Events ----
  'event TransactionCommitted(bytes32 indexed commitment, bytes32 indexed nullifier, bytes32 merkleRoot, uint256 timestamp)',
  'event BatchProcessed(address indexed verifierAddr, uint256 transactionCount, bytes32 batchRoot, uint256 rewardPaid, uint256 timestamp)',
  'event NullifierConsumed(bytes32 indexed nullifier, uint256 timestamp)',
  'event MerkleRootAnchored(bytes32 indexed root, address indexed anchoredBy, uint256 timestamp)',
]

export const GROTH16_VERIFIER_ABI = [
  'function verifyProof(uint256[2] _pA, uint256[2][2] _pB, uint256[2] _pC, uint256[15] _pubSignals) view returns (bool)',
]
