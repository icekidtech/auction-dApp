const { ethers } = require('ethers');
const { MongoClient } = require('mongodb');
const AuctionPlatform = require('../../blockchain/artifacts/contracts/AuctionPlatform.sol/AuctionPlatform.json');

// Configuration 
const config = {
  rpcUrl: process.env.RPC_URL || 'http://localhost:8545',
  contractAddress: process.env.CONTRACT_ADDRESS,
  mongoUrl: process.env.MONGO_URL || 'mongodb://localhost:27017',
  dbName: 'liskauction'
};

// Database connection
let db;
async function connectToDatabase() {
  const client = new MongoClient(config.mongoUrl);
  await client.connect();
  db = client.db(config.dbName);
  console.log('Connected to MongoDB');
  
  // Create indexes for faster queries
  await db.collection('bids').createIndex({ auctionId: 1 });
  await db.collection('bids').createIndex({ bidderAddress: 1 });
  await db.collection('auctions').createIndex({ creatorAddress: 1 });
}

// Connect to blockchain
async function setupEventListener() {
  const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
  const contract = new ethers.Contract(config.contractAddress, AuctionPlatform.abi, provider);

  console.log('Listening for events...');

  // Listen for BidPlaced events
  contract.on('BidPlaced', async (auctionId, bidderAddress, amount, timestamp, isHighestBid, event) => {
    console.log(`New bid: Auction #${auctionId}, Bidder: ${bidderAddress}, Amount: ${amount}`);
    
    // Store in database
    await db.collection('bids').insertOne({
      auctionId: auctionId.toString(),
      bidderAddress,
      amount: amount.toString(),
      timestamp: new Date(timestamp.toNumber() * 1000),
      isHighestBid,
      transactionHash: event.transactionHash,
      blockNumber: event.blockNumber
    });
  });

  // Listen for AuctionCreated events
  contract.on('AuctionCreated', async (auctionId, creatorAddress, itemName, startingBid, endTimestamp, event) => {
    console.log(`New auction: #${auctionId}, Item: ${itemName}`);
    
    await db.collection('auctions').insertOne({
      auctionId: auctionId.toString(),
      creatorAddress,
      itemName,
      startingBid: startingBid.toString(),
      endTimestamp: new Date(endTimestamp.toNumber() * 1000),
      transactionHash: event.transactionHash,
      blockNumber: event.blockNumber
    });
  });

  // Listen for AuctionCompleted events
  contract.on('AuctionCompleted', async (auctionId, winner, finalPrice, event) => {
    console.log(`Auction completed: #${auctionId}, Winner: ${winner}, Final price: ${finalPrice}`);
    
    await db.collection('auctions').updateOne(
      { auctionId: auctionId.toString() },
      { 
        $set: { 
          completed: true,
          winner,
          finalPrice: finalPrice.toString() 
        }
      }
    );
  });
}

// Main function to run the event listener
async function main() {
  try {
    await connectToDatabase();
    await setupEventListener();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();