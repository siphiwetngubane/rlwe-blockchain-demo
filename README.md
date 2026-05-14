# Post-Quantum Blockchain Simulator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity ^0.8.20](https://img.shields.io/badge/Solidity-^0.8.20-blue)](https://soliditylang.org)
[![Prototype](https://img.shields.io/badge/status-prototype-orange)]()

A simulation framework for post-quantum privacy-preserving blockchain
transactions using Ring-LWE backed Groth16 zk-SNARK proofs with
Layer 2 batch rollup capabilities.

**Live simulator:** https://pqbc-simulator.netlify.app/
**This repository:** https://github.com/siphiwetngubane/rlwe-blockchain-demo
**Circuits and security tests:** https://github.com/siphiwetngubane/zk-rlwe-sis

## Research Objectives

- Simulate post-quantum secure private transactions
- Demonstrate zk-SNARK proof verification on-chain
- Implement nullifier-based replay protection
- Test L2 batch rollup performance
- Evaluate RLWE-based commitment schemes

## Project Structure

| Directory | Description |
|-----------|-------------|
| `web3/`   | Smart contracts (Foundry/Solidity) |
| `client/` | Frontend simulation interface (React/Vite) |

The zero-knowledge circuits, experiment runners, and security test suites
that this simulator builds on live in a separate repository:
https://github.com/siphiwetngubane/zk-rlwe-sis

## Smart Contract: QuantumSpectra.sol

`QuantumSpectra.sol` is the on-chain settlement layer. It implements
`ReentrancyGuard`, `AccessControl`, and `Pausable` from OpenZeppelin.

| Function | Access | Purpose |
|---|---|---|
| `submitTransaction` | Public | Submit single proof; consume nullifier; record commitment |
| `processBatch` | VERIFIER_ROLE | Submit batch of proofs; pay BPS reward |
| `anchorMerkleRoot` | ADMIN_ROLE | Whitelist a Merkle root for future proofs |
| `fundRewardPool` | ADMIN_ROLE | Add ETH to verifier reward pool |
| `setVerifierRewardBps` | ADMIN_ROLE | Set reward rate (max 1,000 bps) |
| `pause` / `unpause` | PAUSER_ROLE | Emergency circuit breaker |
| `emergencyWithdraw` | ADMIN_ROLE + paused | Drain reward pool when paused |
| `verifyProofOnly` | Public view | Verify proof without state change |
| `getStats` | Public view | Read aggregate proof/batch/tx counters |

Replay protection uses a nullifier derived as
`keccak256(pubSignals, sender, nonce)`. Batch verification earns a
basis-point reward from a funded pool, with the reward rate capped at
1,000 basis points (10%).

## Quick Start

### Prerequisites

- [Foundry](https://book.getfoundry.sh/)
- [Node.js](https://nodejs.org/) (v18+)
- [MetaMask](https://metamask.io/) or compatible wallet
- [Circom](https://docs.circom.io/) (for circuit compilation)

### Smart Contracts

```bash
cd web3

# Install dependencies
forge install

# Compile
forge build

# Run tests
forge test

# Deploy to local/testnet
forge script script/Deploy.s.sol --rpc-url <RPC_URL> --broadcast
```

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
2. The `RLWESISDeployment` circuit executes RLWE key generation,
   encryption, decryption, and Ring-SIS Merkle commitment, producing 15
   public signals.
3. snarkjs computes the R1CS witness and generates a Groth16 proof under
   the trusted `.zkey`.
4. The proof calldata is dispatched to the on-chain `IGroth16Verifier`.
5. `QuantumSpectra.sol` verifies the proof, consumes the nullifier,
   records the commitment, and distributes any batch verifier reward.

On-chain verification gas cost is approximately 309,500 units and is
constant across Merkle tree depths, a direct consequence of Groth16
succinctness.

## Notes

- This is a research prototype using deliberately small RLWE parameters
  (modulus q = 122321, polynomial degree n = 4) so the full pipeline runs
  on consumer hardware. These parameters are not cryptographic-strength;
  see the accompanying paper for the production parameter discussion.
- The on-chain components are intended for local development and testnet
  use. Do not deploy with development keys on a production network.

## License

MIT
