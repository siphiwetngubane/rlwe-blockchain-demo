# Post-Quantum Blockchain Simulator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity ^0.8.20](https://img.shields.io/badge/Solidity-^0.8.20-blue)](https://soliditylang.org)
[![Network: Sepolia](https://img.shields.io/badge/network-Sepolia-purple)]()
[![Prototype](https://img.shields.io/badge/status-prototype-orange)]()

A simulation framework for post-quantum privacy-preserving blockchain
transactions using Ring-LWE backed Groth16 zk-SNARK proofs with batched
on-chain proof verification and a verifier-reward mechanism.

**Live simulator:** https://pqbc-simulator.netlify.app/
**This repository:** https://github.com/siphiwetngubane/rlwe-blockchain-demo
**Circuits and security tests:** https://github.com/siphiwetngubane/zk-rlwe-sis

## Deployment

The contract is deployed on the **Sepolia** Ethereum testnet
(Chain ID `11155111`). You will need Sepolia ETH from a public faucet
(for example, https://sepoliafaucet.com/) to submit transactions.

| Component | Value |
|-----------|-------|
| **Network** | Sepolia testnet (Chain ID `11155111`) |
| **Contract Address** | [`0x90D55080e24d06D3c368a015136b8F22B93164a0`](https://sepolia.etherscan.io/address/0x90D55080e24d06D3c368a015136b8F22B93164a0) |
| **Anchored Merkle Root** | `0x000000000000000000000000000000000000000000000000000000009cc34896` |
| **Source circuit** | `DEXP01_Baseline_n4_d1` (n = 4, depth = 1) |
| **Groth16 Verifier** | Generated from `DEXP01_Baseline_n4_d1` via `snarkjs zkey export solidityverifier` |

The anchored Merkle root is the deterministic output of the Ring-SIS
Merkle commitment for the `DEXP01_Baseline_n4_d1` baseline witness. With
the SIS polynomial degree $n_s = 4$ and rounding modulus $\rho = 256$,
the packed hash output occupies the low 32 bits of the `bytes32` slot
(at most $\rho^{n_s} = 2^{32}$), which is why the value appears
left-padded with zeros. Every valid proof against this configuration
will produce exactly this root.

### AccessControl Roles

The contract uses OpenZeppelin's `AccessControl`. Each role hash is the
standard `keccak256` of the role name and can be verified independently.

| Role | `keccak256(name)` |
|------|--------------------|
| `ADMIN_ROLE` | `0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775` |
| `VERIFIER_ROLE` | `0x0ce23c3e399818cfee81a7ab0880f714e53d7672b08df0fa62f2843416e1ea09` |
| `PAUSER_ROLE` | `0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a` |

## Research Objectives

- Simulate post-quantum secure private transactions
- Demonstrate zk-SNARK proof verification on-chain
- Implement nullifier-based replay protection
- Test batched on-chain proof verification
- Evaluate RLWE-based commitment schemes

## Project Structure

| Directory | Description |
|-----------|-------------|
| `web3/`   | Smart contracts (Foundry/Solidity) |
| `client/` | Frontend simulation interface (React/Vite) |

The zero-knowledge circuits, experiment runners, and security test
suites that this simulator builds on live in a separate repository:
https://github.com/siphiwetngubane/zk-rlwe-sis

## Smart Contract: `QuantumSpectra.sol`

`QuantumSpectra.sol` is the on-chain settlement layer. It implements
`ReentrancyGuard`, `AccessControl`, and `Pausable` from OpenZeppelin.

| Function | Access | Purpose |
|---|---|---|
| `submitTransaction` | Public | Submit single proof; consume nullifier; record commitment |
| `processBatch` | `VERIFIER_ROLE` | Submit batch of proofs; pay BPS reward |
| `anchorMerkleRoot` | `ADMIN_ROLE` | Whitelist a Merkle root for future proofs |
| `fundRewardPool` | `ADMIN_ROLE` | Add ETH to verifier reward pool |
| `setVerifierRewardBps` | `ADMIN_ROLE` | Set reward rate (max 1,000 bps) |
| `pause` / `unpause` | `PAUSER_ROLE` | Emergency circuit breaker |
| `emergencyWithdraw` | `ADMIN_ROLE` + paused | Drain reward pool when paused |
| `verifyProofOnly` | Public view | Verify proof without state change |
| `getStats` | Public view | Read aggregate proof/batch/tx counters |

Replay protection uses a nullifier derived as
`keccak256(pubSignals, sender, nonce)`. Batch verification earns a
basis-point reward from a funded pool, with the reward rate capped at
1,000 basis points (10%).

## Public Signals

The `DEXP01_Baseline_n4_d1` circuit exports 15 public signals, consumed
by `IGroth16Verifier` in the order they appear in the `snarkjs
generatecall` output:

| Index | Signal | Expected value (baseline) |
|-------|--------|---------------------------|
| 0  | `isValidMerkle` | `1` |
| 1  | `isValidSum` | `1` |
| 2  | `hashedSumsInRange` | `1` |
| 3  | `isValidCommitment` | `1` |
| 4  | `isValidNoise` | `1` |
| 5  | `isValidKey` | `1` |
| 6  | `isValidSecret` | `1` |
| 7  | `isValidMessage` | `1` |
| 8  | `isValidNorm` | `1` |
| 9  | `isValidRange` | `1` |
| 10 | `isValidNTT` | `1` |
| 11 | `isValidNonce` | `1` |
| 12 | `isValidDecryption` | `1` |
| 13 | `nonceHash` | `0x...51c96146` |
| 14 | `merkleRoot` | `0x...9cc34896` |

`QuantumSpectra.sol` checks that all thirteen `isValid*` flags equal
`1`, that the `merkleRoot` matches a previously anchored root, and that
the nullifier has not been consumed. Any mismatch reverts.

## Using the Live Simulator

The fastest way to interact with the system is the hosted simulator at
https://pqbc-simulator.netlify.app/.

1. **Install a wallet.** Install [MetaMask](https://metamask.io/) (or
   any EIP-1193 compatible wallet) in your browser.
2. **Switch to Sepolia.** In MetaMask, switch the network to **Sepolia**
   (Chain ID `11155111`). If Sepolia is not listed, add it from your
   wallet's network settings.
3. **Get Sepolia ETH.** Request testnet ETH from a public faucet such
   as https://sepoliafaucet.com/ or
   https://www.alchemy.com/faucets/ethereum-sepolia.
4. **Open the simulator** and click **Connect Wallet**. Approve the
   connection request.
5. **Load a proof.** Use a pre-generated `proof.json` / `public.json`
   pair, or generate a fresh pair yourself (see next section).
6. **Submit the transaction.** The simulator builds the calldata for
   `submitTransaction`, you sign the transaction in your wallet, and
   the contract verifies the proof, consumes the nullifier, and records
   the commitment on-chain. The transaction receipt and the
   `TransactionVerified` event log appear in the dashboard.

## Preparing Proofs for Submission

Each transaction requires two files generated by the circuit:

- `proof.json` — the Groth16 proof produced by snarkjs
- `public.json` — the public signals exported by the circuit

These files are produced by the **`DEXP01_Baseline_n4_d1`**
configuration of the
[zk-rlwe-sis](https://github.com/siphiwetngubane/zk-rlwe-sis)
repository. The circuit executes RLWE key generation, encryption,
decryption, and Ring-SIS Merkle commitment, exporting the 15 public
signals listed above.

To generate a fresh pair locally:

```bash
git clone https://github.com/siphiwetngubane/zk-rlwe-sis.git
cd zk-rlwe-sis
git clone https://github.com/iden3/circomlib.git
chmod +x 03-full-rlwe-sis/rlwe_sis_deployment_runner.sh
cd 03-full-rlwe-sis
./rlwe_sis_deployment_runner.sh
```

After the runner completes, the proof and public-signals files for
`DEXP01_Baseline_n4_d1` live under
`03-full-rlwe-sis/circom_experiments/DEXP01_Baseline_n4_d1/`. From that
directory you can also regenerate the on-chain calldata directly with:

```bash
cd circom_experiments/DEXP01_Baseline_n4_d1
snarkjs generatecall
```

This emits the `pi_a`, `pi_b`, `pi_c` group elements and the 15 public
signals in the exact order `IGroth16Verifier` expects. Upload `proof.json`
and `public.json` in the simulator's "Load Proof" panel, or place them
where your local `client/` build expects them (see the frontend README
in that subdirectory for the exact path).

## Quick Start (Local Development)

### Prerequisites

- [Foundry](https://book.getfoundry.sh/)
- [Node.js](https://nodejs.org/) v18 or later
- [MetaMask](https://metamask.io/) or a compatible wallet
- [Circom](https://docs.circom.io/) (only if you also want to regenerate
  proofs locally)

### Smart Contracts

```bash
cd web3

# Install dependencies
forge install

# Compile
forge build

# Run tests
forge test

# Deploy to a network of your choice
forge script script/Deploy.s.sol --rpc-url <RPC_URL> --broadcast
```

The `Groth16Verifier.sol` shipped with this repository is generated from
the `DEXP01_Baseline_n4_d1` zkey via
`snarkjs zkey export solidityverifier`. If you change the circuit
configuration, regenerate the verifier from the new zkey and replace it
before redeploying.

After a fresh deployment you must, in order:

1. Grant `VERIFIER_ROLE` to the address you want to allow batch
   submissions (`grantRole(VERIFIER_ROLE, addr)` from the admin
   account).
2. Anchor the baseline Merkle root via
   `anchorMerkleRoot(0x000000000000000000000000000000000000000000000000000000009cc34896)`.
   Proofs referencing a non-anchored root will be rejected.
3. (Optional) Fund the reward pool via `fundRewardPool()` (payable) and
   set the reward rate via `setVerifierRewardBps(bps)` if you intend to
   use batch processing.

### Frontend

```bash
cd client

# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build
```

The production build is deployed at https://pqbc-simulator.netlify.app/.

## How It Works

The simulator drives the full pipeline end-to-end:

1. The user connects a wallet and supplies witness inputs (scalar, key,
   noise, nonce) through the React frontend.
2. The `RLWESISDeployment` circuit (`DEXP01_Baseline_n4_d1`: n = 4,
   d = 1) executes RLWE key generation, encryption, decryption, and
   Ring-SIS Merkle commitment, producing 15 public signals.
3. snarkjs computes the R1CS witness and generates a Groth16 proof
   under the trusted `.zkey`.
4. The proof calldata is dispatched to the on-chain
   `IGroth16Verifier`.
5. `QuantumSpectra.sol` verifies the proof, checks all 13 validity flags
   equal `1`, confirms the `merkleRoot` is anchored, consumes the
   nullifier, records the commitment, and distributes any batch verifier
   reward.

On-chain verification gas cost is approximately **309,500 units** and
is constant across Merkle tree depths, a direct consequence of Groth16
succinctness.

## Notes

- This is a **research prototype** using deliberately small RLWE
  parameters (modulus q = 122321, polynomial degree n = 4) so the full
  pipeline runs on consumer hardware. These parameters are not
  cryptographic-strength; see the accompanying paper for the production
  parameter discussion.
- The on-chain components are intended for **testnet use only**. Do not
  deploy with development keys on a production network, and treat the
  Sepolia deployment as ephemeral.
- The anchored Merkle root is fixed by the `DEXP01_Baseline_n4_d1`
  configuration. Switching to a different experimental configuration
  (different `n`, `d`, or witness) will produce a different Ring-SIS
  root, and the new root must be anchored before its proofs can be
  submitted.

## License

MIT
