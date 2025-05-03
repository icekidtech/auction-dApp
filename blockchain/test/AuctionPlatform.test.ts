import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("AuctionPlatform", function() {
  let auctionPlatform: Contract;
  let owner: HardhatEthersSigner;
  
  // Mock Lisk addresses
  const mockLiskAddress1 = "lsk24cd35u4jdq8szo3pnsqe5dsxwrnazyqqqg5eu";
  const mockLiskAddress2 = "lsk39fj28h4fh29fj39f8h2f98h2f98h2f98h2f98";
  
  const auctionData = {
    itemName: "Test Auction",
    itemImageUrl: "https://example.com/image.jpg",
    startingBid: ethers.parseUnits("100", 8),
    duration: 3600 // 1 hour
  };
  
  beforeEach(async function() {
    const signers = await ethers.getSigners();
    owner = signers[0];
    
    const AuctionPlatform = await ethers.getContractFactory("AuctionPlatform");
    auctionPlatform = await AuctionPlatform.deploy();
    await auctionPlatform.waitForDeployment();
  });
  
  describe("Auction Creation", function() {
    it("Should create a new auction", async function() {
      await expect(auctionPlatform.createAuction(
        auctionData.itemName,
        auctionData.itemImageUrl,
        auctionData.startingBid,
        auctionData.duration,
        mockLiskAddress1
      )).to.emit(auctionPlatform, "AuctionCreated")
        .withArgs(
          1, 
          mockLiskAddress1, 
          auctionData.itemName, 
          auctionData.startingBid, 
          // Ignore the timestamp
          (value: any) => typeof value === "number"
        );
      
      const auction = await auctionPlatform.getAuction(1);
      expect(auction.itemName).to.equal(auctionData.itemName);
      expect(auction.creatorAddress).to.equal(mockLiskAddress1);
      expect(auction.startingBid).to.equal(auctionData.startingBid);
      expect(auction.isActive).to.equal(true);
    });
    
    it("Should not create an auction with empty item name", async function() {
      await expect(auctionPlatform.createAuction(
        "",
        auctionData.itemImageUrl,
        auctionData.startingBid,
        auctionData.duration,
        mockLiskAddress1
      )).to.be.revertedWith("Item name cannot be empty");
    });
    
    it("Should not create an auction with zero starting bid", async function() {
      await expect(auctionPlatform.createAuction(
        auctionData.itemName,
        auctionData.itemImageUrl,
        0,
        auctionData.duration,
        mockLiskAddress1
      )).to.be.revertedWith("Starting bid must be greater than zero");
    });
  });
  
  describe("Bidding", function() {
    beforeEach(async function() {
      await auctionPlatform.createAuction(
        auctionData.itemName,
        auctionData.itemImageUrl,
        auctionData.startingBid,
        auctionData.duration,
        mockLiskAddress1
      );
    });
    
    it("Should place a bid", async function() {
      const bidAmount = ethers.parseUnits("150", 8);
      
      await expect(auctionPlatform.placeBid(
        1,
        bidAmount,
        mockLiskAddress2
      )).to.emit(auctionPlatform, "BidPlaced")
        .withArgs(
          1, 
          mockLiskAddress2, 
          bidAmount, 
          // Ignore the timestamp
          (value: any) => typeof value === "number"
        );
      
      const auction = await auctionPlatform.getAuction(1);
      expect(auction.currentHighestBid).to.equal(bidAmount);
      expect(auction.highestBidder).to.equal(mockLiskAddress2);
    });
    
    it("Should not allow bids below the current highest bid", async function() {
      await auctionPlatform.placeBid(
        1,
        ethers.parseUnits("150", 8),
        mockLiskAddress2
      );
      
      await expect(auctionPlatform.placeBid(
        1,
        ethers.parseUnits("120", 8),
        "lsk8f92h3f98h2f98h2f98h2f98h2f98h2f98h2f9"
      )).to.be.revertedWith("Bid amount must be greater than current highest bid");
    });
    
    it("Should not allow creator to bid on own auction", async function() {
      await expect(auctionPlatform.placeBid(
        1,
        ethers.parseUnits("150", 8),
        mockLiskAddress1
      )).to.be.revertedWith("Creator cannot bid on own auction");
    });
    
    it("Should not allow bids on expired auctions", async function() {
      // Fast forward time past the auction end
      await time.increase(auctionData.duration + 1);
      
      await expect(auctionPlatform.placeBid(
        1,
        ethers.parseUnits("150", 8),
        mockLiskAddress2
      )).to.be.revertedWith("Auction has ended");
    });
  });
  
  describe("Auction Completion", function() {
    beforeEach(async function() {
      await auctionPlatform.createAuction(
        auctionData.itemName,
        auctionData.itemImageUrl,
        auctionData.startingBid,
        auctionData.duration,
        mockLiskAddress1
      );
      
      await auctionPlatform.placeBid(
        1,
        ethers.parseUnits("150", 8),
        mockLiskAddress2
      );
    });
    
    it("Should finalize an expired auction", async function() {
      await time.increase(auctionData.duration + 1);
      
      await expect(auctionPlatform.finalizeAuction(
        1,
        mockLiskAddress2
      )).to.emit(auctionPlatform, "AuctionCompleted")
        .withArgs(1, mockLiskAddress2, ethers.parseUnits("150", 8));
      
      const auction = await auctionPlatform.getAuction(1);
      expect(auction.isActive).to.equal(false);
      expect(auction.isCompleted).to.equal(true);
    });
    
    it("Should allow creator to finalize auction early", async function() {
      await expect(auctionPlatform.finalizeAuction(
        1,
        mockLiskAddress1
      )).to.emit(auctionPlatform, "AuctionCompleted");
      
      const auction = await auctionPlatform.getAuction(1);
      expect(auction.isActive).to.equal(false);
      expect(auction.isCompleted).to.equal(true);
    });
    
    it("Should not allow non-creator to finalize active auction", async function() {
      await expect(auctionPlatform.finalizeAuction(
        1,
        "lsk8f92h3f98h2f98h2f98h2f98h2f98h2f98h2f9"
      )).to.be.revertedWith("Auction still active or unauthorized");
    });
  });
  
  describe("Querying Auctions", function() {
    beforeEach(async function() {
      // Create auction 1 by mockLiskAddress1
      await auctionPlatform.createAuction(
        "Auction 1",
        "https://example.com/image1.jpg",
        ethers.parseUnits("100", 8),
        3600,
        mockLiskAddress1
      );
      
      // Create auction 2 by mockLiskAddress2
      await auctionPlatform.createAuction(
        "Auction 2",
        "https://example.com/image2.jpg",
        ethers.parseUnits("200", 8),
        7200,
        mockLiskAddress2
      );
      
      // Place bids
      await auctionPlatform.placeBid(1, ethers.parseUnits("150", 8), mockLiskAddress2);
      await auctionPlatform.placeBid(2, ethers.parseUnits("250", 8), mockLiskAddress1);
    });
    
    it("Should get auctions by creator", async function() {
      const auctions = await auctionPlatform.getAuctionsByCreator(mockLiskAddress1);
      expect(auctions.length).to.equal(1);
      expect(auctions[0]).to.equal(1);
    });
    
    it("Should get auctions by bidder", async function() {
      const auctions = await auctionPlatform.getAuctionsByBidder(mockLiskAddress2);
      expect(auctions.length).to.equal(1);
      expect(auctions[0]).to.equal(1);
    });
    
    it("Should get auctions by winner", async function() {
      // Finalize auctions
      await time.increase(3601);
      await auctionPlatform.finalizeAuction(1, mockLiskAddress1);
      await auctionPlatform.finalizeAuction(2, mockLiskAddress2);
      
      const auctions = await auctionPlatform.getAuctionsByWinner(mockLiskAddress2);
      expect(auctions.length).to.equal(1);
      expect(auctions[0]).to.equal(1);
    });
  });
});
