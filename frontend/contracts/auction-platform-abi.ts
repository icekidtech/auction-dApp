export const AuctionPlatformABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "auctionId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "creatorAddress",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "itemName",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "startingBid",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "endTimestamp",
        "type": "uint256"
      }
    ],
    "name": "AuctionCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "auctionId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "winner",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "finalPrice",
        "type": "uint256"
      }
    ],
    "name": "AuctionCompleted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "auctionId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "bidderAddress",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "BidPlaced",
    "type": "event"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "itemName", "type": "string"},
      {"internalType": "string", "name": "itemImageUrl", "type": "string"},
      {"internalType": "uint256", "name": "startingBid", "type": "uint256"},
      {"internalType": "uint256", "name": "duration", "type": "uint256"},
      {"internalType": "string", "name": "creatorAddress", "type": "string"}
    ],
    "name": "createAuction",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "auctionId", "type": "uint256"}
    ],
    "name": "getAuction",
    "outputs": [
      {"internalType": "uint256", "name": "id", "type": "uint256"},
      {"internalType": "string", "name": "itemName", "type": "string"},
      {"internalType": "string", "name": "itemImageUrl", "type": "string"},
      {"internalType": "string", "name": "creatorAddress", "type": "string"},
      {"internalType": "uint256", "name": "startingBid", "type": "uint256"},
      {"internalType": "uint256", "name": "currentHighestBid", "type": "uint256"},
      {"internalType": "string", "name": "highestBidder", "type": "string"},
      {"internalType": "uint256", "name": "createdTimestamp", "type": "uint256"},
      {"internalType": "uint256", "name": "endTimestamp", "type": "uint256"},
      {"internalType": "bool", "name": "isActive", "type": "bool"},
      {"internalType": "bool", "name": "isCompleted", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "auctionId", "type": "uint256"},
      {"internalType": "uint256", "name": "bidAmount", "type": "uint256"},
      {"internalType": "string", "name": "bidderAddress", "type": "string"}
    ],
    "name": "placeBid",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "auctionId", "type": "uint256"},
      {"internalType": "string", "name": "requesterAddress", "type": "string"}
    ],
    "name": "finalizeAuction",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "creatorAddress", "type": "string"}
    ],
    "name": "getAuctionsByCreator",
    "outputs": [
      {"internalType": "uint256[]", "name": "", "type": "uint256[]"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
]