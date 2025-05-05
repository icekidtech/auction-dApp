import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { AuctionPlatform } from "../typechain-types";

// Create a type that extends AuctionPlatform with an index signature
type AuctionPlatformContract = AuctionPlatform & {
  [key: string]: any;
};

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
    auctionPlatform = (await AuctionPlatform.deploy()) as AuctionPlatformContract;
    await auctionPlatform.waitForDeployment();
  });
  
  describe("Auction Creation", function() {
    it("Should create a new auction", async function() {
      const typedContract = auctionPlatform as AuctionPlatformContract;

      await expect(typedContract.createAuction(
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
          (value: any) => typeof value === "number" || typeof value === "bigint"
        );
      
      const auction = await typedContract.getAuction(1);
      expect(auction.itemName).to.equal(auctionData.itemName);
      expect(auction.creatorAddress).to.equal(mockLiskAddress1);
      expect(auction.startingBid).to.equal(auctionData.startingBid);
      expect(auction.isActive).to.equal(true);
    });
    
    it("Should not create an auction with empty item name", async function() {
      const typedContract = auctionPlatform as AuctionPlatformContract;

      await expect(typedContract.createAuction(
        "",
        auctionData.itemImageUrl,
        auctionData.startingBid,
        auctionData.duration,
        mockLiskAddress1
      )).to.be.revertedWith("Item name cannot be empty");
    });
    
    it("Should not create an auction with zero starting bid", async function() {
      const typedContract = auctionPlatform as AuctionPlatformContract;

      await expect(typedContract.createAuction(
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
      const typedContract = auctionPlatform as AuctionPlatformContract;

      await typedContract.createAuction(
        auctionData.itemName,
        auctionData.itemImageUrl,
        auctionData.startingBid,
        auctionData.duration,
        mockLiskAddress1
      );
    });
    
    it("Should place a bid", async function() {
      const typedContract = auctionPlatform as AuctionPlatformContract;
      const bidAmount = ethers.parseUnits("150", 8);
      
      await expect(typedContract.placeBid(
        1,
        bidAmount,
        mockLiskAddress2
      )).to.emit(auctionPlatform, "BidPlaced")
        .withArgs(
          1, 
          mockLiskAddress2, 
          bidAmount, 
          // Ignore the timestamp
          (value: any) => typeof value === "number" || typeof value === "bigint"
        );
      
      const auction = await typedContract.getAuction(1);
      expect(auction.currentHighestBid).to.equal(bidAmount);
      expect(auction.highestBidder).to.equal(mockLiskAddress2);
    });
    
    it("Should not allow bids below the current highest bid", async function() {
      const typedContract = auctionPlatform as AuctionPlatformContract;

      await typedContract.placeBid(
        1,
        ethers.parseUnits("150", 8),
        mockLiskAddress2
      );
      
      await expect(typedContract.placeBid(
        1,
        ethers.parseUnits("120", 8),
        "lsk8f92h3f98h2f98h2f98h2f98h2f98h2f98h2f9"
      )).to.be.revertedWith("Bid amount must be greater than current highest bid");
    });
    
    it("Should not allow creator to bid on own auction", async function() {
      const typedContract = auctionPlatform as AuctionPlatformContract;

      await expect(typedContract.placeBid(
        1,
        ethers.parseUnits("150", 8),
        mockLiskAddress1
      )).to.be.revertedWith("Creator cannot bid on own auction");
    });
    
    it("Should not allow bids on expired auctions", async function() {
      const typedContract = auctionPlatform as AuctionPlatformContract;

      // Fast forward time past the auction end
      await time.increase(auctionData.duration + 1);
      
      await expect(typedContract.placeBid(
        1,
        ethers.parseUnits("150", 8),
        mockLiskAddress2
      )).to.be.revertedWith("Auction has ended");
    });
  });
  
  describe("Auction Completion", function() {
    beforeEach(async function() {
      const typedContract = auctionPlatform as AuctionPlatformContract;

      await typedContract.createAuction(
        auctionData.itemName,
        auctionData.itemImageUrl,
        auctionData.startingBid,
        auctionData.duration,
        mockLiskAddress1
      );
      
      await typedContract.placeBid(
        1,
        ethers.parseUnits("150", 8),
        mockLiskAddress2
      );
    });
    
    it("Should finalize an expired auction", async function() {
      const typedContract = auctionPlatform as AuctionPlatformContract;

      await time.increase(auctionData.duration + 1);
      
      await expect(typedContract.finalizeAuction(
        1,
        mockLiskAddress2
      )).to.emit(auctionPlatform, "AuctionCompleted")
        .withArgs(1, mockLiskAddress2, ethers.parseUnits("150", 8));
      
      const auction = await typedContract.getAuction(1);
      expect(auction.isActive).to.equal(false);
      expect(auction.isCompleted).to.equal(true);
    });
    
    it("Should allow creator to finalize auction early", async function() {
      const typedContract = auctionPlatform as AuctionPlatformContract;

      await expect(typedContract.finalizeAuction(
        1,
        mockLiskAddress1
      )).to.emit(auctionPlatform, "AuctionCompleted");
      
      const auction = await typedContract.getAuction(1);
      expect(auction.isActive).to.equal(false);
      expect(auction.isCompleted).to.equal(true);
    });
    
    it("Should not allow non-creator to finalize active auction", async function() {
      const typedContract = auctionPlatform as AuctionPlatformContract;

      await expect(typedContract.finalizeAuction(
        1,
        "lsk8f92h3f98h2f98h2f98h2f98h2f98h2f98h2f9"
      )).to.be.revertedWith("Auction still active or unauthorized");
    });
  });
  
  describe("Querying Auctions", function() {
    beforeEach(async function() {
      const typedContract = auctionPlatform as AuctionPlatformContract;

      // Create auction 1 by mockLiskAddress1
      await typedContract.createAuction(
        "Auction 1",
        "https://example.com/image1.jpg",
        ethers.parseUnits("100", 8),
        3600,
        mockLiskAddress1
      );
      
      // Create auction 2 by mockLiskAddress2
      await typedContract.createAuction(
        "Auction 2",
        "https://example.com/image2.jpg",
        ethers.parseUnits("200", 8),
        7200,
        mockLiskAddress2
      );
      
      // Place bids
      await typedContract.placeBid(1, ethers.parseUnits("150", 8), mockLiskAddress2);
      await typedContract.placeBid(2, ethers.parseUnits("250", 8), mockLiskAddress1);
    });
    
    it("Should get auctions by creator", async function() {
      const typedContract = auctionPlatform as AuctionPlatformContract;

      const auctions = await typedContract.getAuctionsByCreator(mockLiskAddress1);
      expect(auctions.length).to.equal(1);
      expect(auctions[0]).to.equal(1);
    });
    
    it("Should get auctions by bidder", async function() {
      const typedContract = auctionPlatform as AuctionPlatformContract;

      const auctions = await typedContract.getAuctionsByBidder(mockLiskAddress2);
      expect(auctions.length).to.equal(1);
      expect(auctions[0]).to.equal(1);
    });
    
    it("Should get auctions by winner", async function() {
      const typedContract = auctionPlatform as AuctionPlatformContract;

      // Finalize auctions
      await time.increase(3601);
      await typedContract.finalizeAuction(1, mockLiskAddress1);
      await typedContract.finalizeAuction(2, mockLiskAddress2);
      
      const auctions = await typedContract.getAuctionsByWinner(mockLiskAddress2);
      expect(auctions.length).to.equal(1);
      expect(auctions[0]).to.equal(1);
    });
  });

  describe("Example Usage", function() {
    it("Should demonstrate example usage of createAuction and getAddress", async function() {
      await auctionPlatform.createAuction("Item", "image.jpg", 100, 86400, "lisk-address");
      const address = await auctionPlatform.getAddress();
      expect(address).to.be.a("string");
    });
  });
});
