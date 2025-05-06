export interface Auction {
  id: string;
  auctionId: string;
  itemName: string;
  creatorAddress: string;
  startingBid: string;
  endTimestamp: string;
  blockTimestamp: string;
  transactionHash: string;
}

export interface Bid {
  auctionId: string;
  bidderAddress: string;
  amount: string;
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