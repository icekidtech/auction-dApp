import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Bridge adapter to connect Lisk addresses and authentication with Ethereum-based contract
 * This adapter handles the translation between Lisk and Ethereum ecosystems
 */
export class LiskBridgeAdapter {
  private contract: ethers.Contract;
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet | null = null;
  
  /**
   * Initialize the adapter with contract and network details
   * @param contractAddress The deployed AuctionPlatform address
   * @param rpcUrl The JSON-RPC URL for the Ethereum node
   * @param privateKey Optional private key for signing transactions
   */
  constructor(contractAddress: string, rpcUrl: string, privateKey?: string) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Load ABI dynamically to avoid circular dependencies
    const abiPath = path.join(__dirname, '../../artifacts/contracts/AuctionPlatform.sol/AuctionPlatform.json');
    const contractData = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
    const ABI = contractData.abi;
    
    if (privateKey) {
      this.wallet = new ethers.Wallet(privateKey, this.provider);
      this.contract = new ethers.Contract(
        contractAddress,
        ABI,
        this.wallet
      ) as unknown as ethers.Contract;
    } else {
      this.contract = new ethers.Contract(
        contractAddress,
        ABI,
        this.provider
      ) as unknown as ethers.Contract;
    }
  }
  
  /**
   * Connect the adapter with a Lisk wallet via private key
   * @param privateKey The private key from the Lisk wallet
   * @returns The Lisk address associated with the wallet
   */
  public connectLiskWallet(privateKey: string): string {
    // In a real implementation, this would validate the Lisk private key format
    // and derive the Lisk address properly
    
    // For demo purposes, we're using the Ethereum wallet derivation
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.contract = this.contract.connect(this.wallet) as ethers.Contract;
    
    // Return a mock Lisk address or derive it properly in production
    return `lsk${this.wallet.address.substring(2, 38)}`;
  }
  
  /**
   * Create a new auction
   */
  public async createAuction(
    itemName: string,
    itemImageUrl: string,
    startingBid: number,
    duration: number,
    liskAddress: string
  ): Promise<number> {
    const tx = await (this.contract as unknown as ethers.Contract).createAuction(
      itemName,
      itemImageUrl,
      startingBid,
      duration,
      liskAddress
    );
    
    const receipt = await tx.wait();
    const event = receipt.logs
      .filter((log: any) => {
        try {
          const parsed = (this.contract as unknown as ethers.Contract).interface.parseLog(log);
          return parsed && parsed.name === 'AuctionCreated';
        } catch (e) {
          return false;
        }
      })
      .map((log: any) => (this.contract as unknown as ethers.Contract).interface.parseLog(log))[0];
    
    if (!event) {
      throw new Error('Failed to create auction: event not found');
    }
    
    return Number(event.args.auctionId);
  }
  
  /**
   * Place a bid on an auction
   */
  public async placeBid(
    auctionId: number,
    bidAmount: number,
    liskAddress: string
  ): Promise<void> {
    const tx = await (this.contract as unknown as ethers.Contract).placeBid(auctionId, bidAmount, liskAddress);
    await tx.wait();
  }
  
  /**
   * Get details for an auction
   */
  public async getAuction(auctionId: number): Promise<any> {
    const auction = await (this.contract as unknown as ethers.Contract).getAuction(auctionId);
    
    return {
      id: Number(auction[0]),
      itemName: auction[1],
      itemImageUrl: auction[2],
      creatorAddress: auction[3],
      startingBid: Number(auction[4]),
      currentHighestBid: Number(auction[5]),
      highestBidder: auction[6],
      createdTimestamp: Number(auction[7]),
      endTimestamp: Number(auction[8]),
      isActive: auction[9],
      isCompleted: auction[10]
    };
  }
  
  /**
   * Get bid history for an auction
   */
  public async getBidHistory(auctionId: number): Promise<any[]> {
    const bids = await (this.contract as unknown as ethers.Contract).getBidHistory(auctionId);
    
    return bids.map((bid: any) => ({
      bidder: bid[0],
      amount: Number(bid[1]),
      timestamp: Number(bid[2])
    }));
  }
  
  /**
   * Finalize an auction
   */
  public async finalizeAuction(
    auctionId: number,
    requesterAddress: string
  ): Promise<void> {
    const tx = await (this.contract as unknown as ethers.Contract).finalizeAuction(auctionId, requesterAddress);
    await tx.wait();
  }
  
  /**
   * Get auctions created by an address
   */
  public async getAuctionsByCreator(creatorAddress: string): Promise<number[]> {
    const auctionIds = await (this.contract as unknown as ethers.Contract).getAuctionsByCreator(creatorAddress);
    return auctionIds.map((id: bigint) => Number(id));
  }
  
  /**
   * Get auctions where an address has placed bids
   */
  public async getAuctionsByBidder(bidderAddress: string): Promise<number[]> {
    const auctionIds = await (this.contract as unknown as ethers.Contract).getAuctionsByBidder(bidderAddress);
    return auctionIds.map((id: bigint) => Number(id));
  }
  
  /**
   * Get auctions won by an address
   */
  public async getAuctionsByWinner(winnerAddress: string): Promise<number[]> {
    const auctionIds = await (this.contract as unknown as ethers.Contract).getAuctionsByWinner(winnerAddress);
    return auctionIds.map((id: bigint) => Number(id));
  }
}