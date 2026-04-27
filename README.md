# Post-Quantum Blockchain Simulator 🔐

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity ^0.8.20](https://img.shields.io/badge/Solidity-^0.8.20-blue)](https://soliditylang.org)
[![Prototype](https://img.shields.io/badge/status-prototype-orange)]()

A simulation framework for post-quantum privacy-preserving blockchain 
transactions using Ring-LWE backed Groth16 zk-SNARK proofs with 
Layer 2 batch rollup capabilities.

## 🎯 Research Objectives

- Simulate post-quantum secure private transactions
- Demonstrate zk-SNARK proof verification on-chain
- Implement nullifier-based replay protection
- Test L2 batch rollup performance
- Evaluate RLWE-based commitment schemes

## 🏗️ Project Structure

| Directory | Description |
|-----------|-------------|
| `web3/`   | Smart contracts (Foundry/Solidity) |
| `client/` | Frontend simulation interface (React/Vite) |

## 🚀 Quick Start

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
