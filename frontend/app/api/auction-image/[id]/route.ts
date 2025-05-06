import { ethers } from 'ethers';
import { NextRequest, NextResponse } from 'next/server';
import AuctionPlatformAbi from '@/artifacts/contracts/AuctionPlatform.sol/AuctionPlatform.json';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Connect to the contract directly
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_RPC_URL
    );
    
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string,
      AuctionPlatformAbi.abi,
      provider
    );
    
    // Get auction details directly from contract
    const auctionDetails = await contract.getAuction(id);
    
    // Extract imageUrl from full contract data
    const imageUrl = auctionDetails.itemImageUrl;
    
    // Redirect to the actual image URL
    return NextResponse.redirect(imageUrl);
  } catch (error) {
    console.error('Error fetching auction image:', error);
    return NextResponse.redirect('/placeholder-auction.jpg');
  }
}