// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title Zenthra
 * @dev Main contract for managing decentralized auctions with Lisk compatibility
 */
contract AuctionPlatform is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _auctionIds;
    
    // Struct to store bid information
    struct Bid {
        string bidderAddress;       // Lisk address string
        uint256 amount;
        uint256 timestamp;
    }
    
    // Struct to store auction data
    struct Auction {
        uint256 id;
        string itemName;
        string itemImageUrl;
        string creatorLiskAddress;  // Lisk address string
        uint256 startingBid;
        uint256 currentHighestBid;
        string highestBidder;   // Lisk address string
        uint256 createdTimestamp;
        uint256 endTimestamp;
        bool isActive;
        bool isCompleted;
        Bid[] bidHistory;
    }
    
    // Mapping from auction ID to Auction
    mapping(uint256 => Auction) public auctions;
    
    // Mapping from creator address to auction IDs
    mapping(string => uint256[]) private creatorToAuctions;

    // Mapping from winner address to auction IDs
    mapping(string => uint256[]) private winnerToAuctions;

    // Events
    event AuctionCreated(
        uint256 indexed auctionId,
        string creatorAddress,
        string itemName,
        uint256 startingBid,
        uint256 endTimestamp
    );
    
    event BidPlaced(
        uint256 indexed auctionId,
        string bidder,
        uint256 amount,
        uint256 timestamp
    );
    
    event AuctionCompleted(
        uint256 indexed auctionId,
        string winner,
        uint256 finalPrice
    );
    
    /**
     * @dev Create a new auction
     * @param itemName Name of the item being auctioned
     * @param itemImageUrl URL or IPFS hash of the item image
     * @param startingBid Initial bid price
     * @param duration Duration of auction in seconds
     * @param creatorAddress Lisk address of auction creator
     */
    function createAuction(
        string memory itemName,
        string memory itemImageUrl,
        uint256 startingBid,
        uint256 duration,
        string memory creatorLiskAddress
    ) external {
        require(bytes(itemName).length > 0, "Item name cannot be empty");
        require(bytes(creatorLiskAddress).length > 0, "Creator address cannot be empty");
        require(startingBid > 0, "Starting bid must be greater than zero");
        require(duration > 0, "Duration must be greater than zero");
        
        _auctionIds.increment();
        uint256 newAuctionId = _auctionIds.current();
        uint256 currentTime = block.timestamp;
        
        auctions[newAuctionId] = Auction({
            id: newAuctionId,
            itemName: itemName,
            itemImageUrl: itemImageUrl,
            creatorLiskAddress: creatorLiskAddress,
            startingBid: startingBid,
            currentHighestBid: startingBid,
            highestBidder: "", // Explicitly initialized to an empty string
            createdTimestamp: currentTime,
            endTimestamp: currentTime + duration,
            isActive: true,
            isCompleted: false,
            bidHistory: new Bid[](0)
        });
        
        // Update mapping for creator address
        creatorToAuctions[creatorLiskAddress].push(newAuctionId);

        emit AuctionCreated(
            newAuctionId,
            creatorAddress,
            itemName,
            startingBid,
            currentTime + duration
        );
    }
    
    /**
     * @dev Place bid on an auction
     * @param auctionId ID of the auction
     * @param bidAmount Bid amount
     * @param bidderAddress Lisk address of bidder
     */
    function placeBid(
        uint256 auctionId,
        uint256 bidAmount,
        string memory bidderAddress
    ) external nonReentrant {
        Auction storage auction = auctions[auctionId];
        
        require(auction.id != 0, "Auction does not exist");
        require(auction.isActive, "Auction is not active");
        require(!stringExists(bidderAddress), "Creator cannot bid on own auction");
        require(bidAmount > auction.currentHighestBid, "Bid amount must be greater than current highest bid");
        require(bytes(bidderAddress).length > 0, "Bidder address cannot be empty");
        require(!stringEquals(bidderAddress, auction.creatorAddress), "Creator cannot bid on own auction");
        require(bytes(bidderAddress).length > 0, "Bidder address cannot be empty");
        
        // Create new bid
        Bid memory newBid = Bid({
            bidderAddress: bidderAddress,
            amount: bidAmount,
            timestamp: block.timestamp
        });
        
        // Update auction
        auction.currentHighestBid = bidAmount;
        auction.highestBidder = bidderAddress;
        auction.bidHistory.push(newBid);
        
        emit BidPlaced(
            auctionId,
            bidderAddress,
            bidAmount,
            block.timestamp
        );
    }
    
    /**
     * @dev Complete an auction
     * @param auctionId ID of auction to complete
     * @param requesterAddress Lisk address of requester
     */
    function finalizeAuction(
        uint256 auctionId,
        string memory requesterAddress
    ) external nonReentrant {
        Auction storage auction = auctions[auctionId];
        
        require(auction.id != 0, "Auction does not exist");
        require(!auction.isCompleted, "Auction already completed");
        require(
            block.timestamp >= auction.endTimestamp || 
            stringEquals(requesterAddress, auction.creatorLiskAddress),
            "Auction still active or unauthorized"
        );
        
        auction.isActive = false;
        auction.isCompleted = true;

        // Update mapping for winner address if there is a winner
        if (bytes(auction.highestBidder).length > 0) {
            winnerToAuctions[auction.highestBidder].push(auctionId);
        }
        
        // If there were no bids, no winner
        if (bytes(auction.highestBidder).length > 0) {
            emit AuctionCompleted(
                auctionId,
                auction.highestBidder,
                auction.currentHighestBid
            );
        } else {
            emit AuctionCompleted(
                auctionId,
                auction.creatorAddress,
                0
            );
        }
    }
    
    /**
     * @dev Get auction details
     * @param auctionId ID of the auction
     * @return id The auction's unique identifier
     * @return itemName Name of the item being auctioned
     * @return itemImageUrl URL or IPFS hash of the item image
     * @return creatorAddress Lisk address of the auction creator
     * @return startingBid Initial bid amount for the auction
     * @return currentHighestBid Current highest bid on the auction
     * @return highestBidder Lisk address of the current highest bidder
     * @return createdTimestamp Time when the auction was created (Unix timestamp)
     * @return endTimestamp Time when the auction ends (Unix timestamp)
     * @return isActive Whether the auction is currently active
     * @return isCompleted Whether the auction has been completed
     */
    function getAuction(uint256 auctionId) external view returns (
        uint256 id,
        string memory itemName,
        string memory itemImageUrl,
        string memory creatorAddress,
        uint256 startingBid,
        uint256 currentHighestBid,
        string memory highestBidder,
        uint256 createdTimestamp,
        uint256 endTimestamp,
        bool isActive,
        bool isCompleted
    ) {
        Auction storage auction = auctions[auctionId];
        require(auction.id != 0, "Auction does not exist");
        
        return (
            auction.id,
            auction.itemName,
            auction.itemImageUrl,
            auction.creatorAddress,
            auction.startingBid,
            auction.currentHighestBid,
            auction.highestBidder,
            auction.createdTimestamp,
            auction.endTimestamp,
            auction.isActive,
            auction.isCompleted
        );
    }
    
    /**
     * @dev Get bid history for an auction
     * @param auctionId ID of the auction
     * @return Array of bids
     */
    function getBidHistory(uint256 auctionId) public view returns (Bid[] memory) {
        Auction storage auction = auctions[auctionId];
        require(auction.id != 0, "Auction does not exist");
        
        return auction.bidHistory;
    }
    
    /**
     * @dev Get auctions created by an address
     * @param creatorAddress Creator's Lisk address
     * @return Array of auction IDs
     */
    function getAuctionsByCreator(string memory creatorAddress) external view returns (uint256[] memory) {
        uint256 count = 0;
        
        // Count auctions by creator
        for (uint256 i = 1; i <= _auctionIds.current(); i++) {
            if (stringEquals(auctions[i].creatorLiskAddress, creatorLiskAddress)) {
                count++;
            }
        }
        
        // Create result array
        return creatorToAuctions[creatorAddress];
        // Count auctions with bids by bidder
        for (uint256 i = 1; i <= _auctionIds.current(); i++) {
            bool hasBid = false;
            for (uint256 j = 0; j < auctions[i].bidHistory.length; j++) {
                if (stringEquals(auctions[i].bidHistory[j].bidderAddress, bidderAddress)) {
                    hasBid = true;
                    break;
                }
            }
            if (hasBid) {
                count++;
            }
        }
        
        // Create result array
        uint256[] memory result = new uint256[](count);
        uint256 index = 0;
        
        // Populate result array
        for (uint256 i = 1; i <= _auctionIds.current(); i++) {
            bool hasBid = false;
            for (uint256 j = 0; j < auctions[i].bidHistory.length; j++) {
                if (stringEquals(auctions[i].bidHistory[j].bidder, bidderAddress)) {
                    hasBid = true;
                    break;
                }
            }
            if (hasBid) {
                result[index] = auctions[i].id;
                index++;
            }
        }
        
        return result;
    }
    
    /**
     * @dev Get auctions won by an address
     * @param winnerAddress Winner's Lisk address
     * @return Array of auction IDs
     */
    function getAuctionsByWinner(string memory winnerAddress) external view returns (uint256[] memory) {
        return winnerToAuctions[winnerAddress];
    }
    
    /**
     * @dev Utility function to compare strings
     * @param a First string
     * @param b Second string
     * @return Boolean indicating if strings are equal
     */
    function stringEquals(string memory a, string memory b) private pure returns (bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }

    /**
     * @return isActive Whether the auction is still accepting bids
     * @return highestBid The current highest bid amount
     */
    function getAuctionStatus() public view returns (bool isActive, uint256 highestBid) {
        require(_auctionIds.current() > 0, "No auctions available");
        Auction storage latestAuction = auctions[_auctionIds.current()];
        return (latestAuction.isActive, latestAuction.currentHighestBid);
    }

    /**
     * @dev Utility function to store a string hash
     * @param str String to store
     */
    function storeStringHash(string memory str) private {
        stringHashes[keccak256(abi.encodePacked(str))] = true;
    }

    /**
     * @dev Utility function to check if a string hash exists
     * @param str String to check
     * @return Boolean indicating if the string hash exists
     */
    function stringExists(string memory str) private view returns (bool) {
        return stringHashes[keccak256(abi.encodePacked(str))];
    }
