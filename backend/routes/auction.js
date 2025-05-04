const express = require('express');
const router = express.Router();
const { db } = require('../services/database');

// Get all auctions
router.get('/auctions', async (req, res) => {
  try {
    const auctions = await db.collection('auctions').find({}).toArray();
    res.json(auctions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single auction with its bids
router.get('/auctions/:auctionId', async (req, res) => {
  try {
    const auctionId = req.params.auctionId;
    
    // Get auction details
    const auction = await db.collection('auctions').findOne({ auctionId });
    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }
    
    // Get all bids for this auction
    const bids = await db.collection('bids')
      .find({ auctionId })
      .sort({ timestamp: -1 }) // Latest bids first
      .toArray();
    
    res.json({
      auction,
      bids
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get auctions by bidder address
router.get('/bids/bidder/:address', async (req, res) => {
  try {
    const bidderAddress = req.params.address;
    
    // Find all bids by this bidder
    const bids = await db.collection('bids')
      .find({ bidderAddress })
      .sort({ timestamp: -1 })
      .toArray();
    
    // Get unique auction IDs
    const auctionIds = [...new Set(bids.map(bid => bid.auctionId))];
    
    // Get auction details for each auction
    const auctions = await db.collection('auctions')
      .find({ auctionId: { $in: auctionIds } })
      .toArray();
    
    res.json({
      auctionIds,
      auctions,
      bids
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;