export interface Auction {
  id: number;
  itemName: string;
  itemImageUrl: string;
  creatorAddress: string;
  startingBid: string | number;
  currentHighestBid: string | number;
  highestBidder: string;
  createdTimestamp: number;
  endTimestamp: number;
  isActive: boolean;
  isCompleted: boolean;
}

export interface Bid {
  bidderAddress: string;
  amount: string | number;
  timestamp: number;
}

export interface AuctionCompleted {
  id: string;
  auctionId: string;
  winner: string;
  finalPrice: string;
  blockTimestamp: string;
  transactionHash: string;
}

export interface ProcessedAuction {
  id: string;
  name: string;
  image: string;
  currentBid: number;
  endTime: Date;
  creatorAddress: string;
  featured?: boolean;
}