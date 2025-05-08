export interface Auction {
  id: string;
  auctionId: string;
  itemName: string;
  itemImageUrl: string;
  creatorAddress: string;
  startingBid: string;
  currentHighestBid?: string;
  highestBidder?: string;
  endTimestamp: string;
  blockTimestamp: string;
  transactionHash: string;
  isActive?: boolean;
  isCompleted?: boolean;
}

export interface Bid {
  id: string;
  auctionId: string;
  bidderAddress: string;
  amount: string;
  timestamp: string;
  blockTimestamp: string;
  transactionHash: string;
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