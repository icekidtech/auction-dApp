# Lisk Auction Platform - Smart Contract

This project implements a decentralized auction platform using Lisk addresses for authentication and Hardhat for development and testing.

## Architecture Overview

The implementation uses:
- Solidity smart contract for the core auction functionality
- A bridge adapter for handling Lisk address compatibility
- TypeScript utilities for frontend integration

## Setup and Deployment

### Install Dependencies

```bash
cd blockchain
npm install
```

### Compile Contracts

```bash
npx hardhat compile
```

### Run Tests

```bash
npx hardhat test
```

### Deploy to Network

```bash
# Set environment variables in .env file first
# PRIVATE_KEY=your_wallet_private_key
# NEXT_PUBLIC_RPC_URL=your_rpc_url
npx hardhat run scripts/deploy.ts --network lisk_testnet
```

## Key Components

### AuctionPlatform Contract

Core smart contract for managing the auction system.

### LiskBridgeAdapter

Adapter class that handles the bridging between Lisk addresses and the Hardhat/Ethereum ecosystem.

### Integration with Frontend

The frontend interacts with the smart contract through the `AuctionService` class, which uses the LiskBridgeAdapter to handle Lisk address compatibility.

## Lisk Compatibility Notes

This implementation bridges Lisk addresses into an EVM-compatible smart contract by:

1. Using string representations of Lisk addresses in the smart contract
2. Providing adapter functions that handle the conversion between ecosystems
3. Implementing authentication flows that align with Lisk's cryptographic primitives

## License

MIT
