import { LiskBridgeAdapter } from '../../blockchain/ignition/modules/lisk-adapter';

// Initialize the adapter with deployment details
const adapter = new LiskBridgeAdapter(
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string,
  process.env.NEXT_PUBLIC_RPC_URL as string,
  process.env.PRIVATE_KEY as string
);

export class AuctionService {
  /**
   * Create a new auction
   */
  static async createAuction(
    itemName: string,
    itemImageUrl: string,
    startingBid: number,
    durationInDays: number,
    creatorAddress: string
  ) {
    try {
      // Convert days to seconds for the smart contract
      const durationInSeconds = durationInDays * 24 * 60 * 60;
      
      const auctionId = await adapter.createAuction(
        itemName,
        itemImageUrl,
        startingBid,
        durationInSeconds,
        creatorAddress
      );
      
      return { success: true, auctionId };
    } catch (error) {
      console.error('Error creating auction:', error);
      return { success: false, error };
    }
  }
  
  /**
   * Place a bid on an auction
   */
  static async placeBid(
    auctionId: string,
    bidAmount: number,
    bidderAddress: string
  ) {
    try {
      await adapter.placeBid(parseInt(auctionId), bidAmount, bidderAddress);
      return { success: true };
    } catch (error) {
      console.error('Error placing bid:', error);
      return { success: false, error };
    }
  }
  
  /**
   * Get details for an auction
   */
  static async getAuction(auctionId: string) {
    try {
      const auction = await adapter.getAuction(parseInt(auctionId));
      const bidHistory = await adapter.getBidHistory(parseInt(auctionId));
      
      return {
        ...auction,
        bidHistory
      };
    } catch (error) {
      console.error('Error fetching auction:', error);
      throw error;
    }
  }
  
  /**
   * Finalize an auction
   */
  static async finalizeAuction(auctionId: string, requesterAddress: string) {
    try {
      await adapter.finalizeAuction(parseInt(auctionId), requesterAddress);
      return { success: true };
    } catch (error) {
      console.error('Error finalizing auction:', error);
      return { success: false, error };
    }
  }
  
  /**
   * Get all auctions for the dashboard
   */
  static async getDashboardAuctions(userAddress: string) {
    try {
      // Get auctions created by user
      const createdAuctionIds = await adapter.getAuctionsByCreator(userAddress);
      const createdAuctions = await Promise.all(
        createdAuctionIds.map(async (id: number) => {
          const auction = await adapter.getAuction(id);
          return auction;
        })
      );
      
      // Get auctions where user has bids
      const biddingAuctionIds = await adapter.getAuctionsByBidder(userAddress);
      const biddingAuctions = await Promise.all(
        biddingAuctionIds.map(async (id: number) => {
          const auction = await adapter.getAuction(id);
          return auction;
        })
      );
      
      // Get auctions won by user
      const wonAuctionIds = await adapter.getAuctionsByWinner(userAddress);
      const wonAuctions = await Promise.all(
        wonAuctionIds.map(async (id: number) => {
          const auction = await adapter.getAuction(id);
          return auction;
        })
      );
      
      return {
        created: createdAuctions,
        bidding: biddingAuctions,
        won: wonAuctions
      };
    } catch (error) {
      console.error('Error fetching dashboard auctions:', error);
      throw error;
    }
  }
}