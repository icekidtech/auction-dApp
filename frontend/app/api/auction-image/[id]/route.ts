import { NextRequest, NextResponse } from 'next/server';
import { ethers, providers } from 'ethers';

// You can directly use your ABI here
const AuctionPlatformABI = [
  // Minimal ABI with just getAuction function
  {
    "inputs": [{"internalType": "uint256", "name": "auctionId", "type": "uint256"}],
    "name": "getAuction",
    "outputs": [
      {"internalType": "uint256", "name": "id", "type": "uint256"},
      {"internalType": "string", "name": "itemName", "type": "string"},
      {"internalType": "string", "name": "itemImageUrl", "type": "string"},
      // other outputs...
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  try {
    // Connect to the Lisk network RPC directly
    const provider = new providers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_RPC_URL
    );
    
    // Create contract instance
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string,
      AuctionPlatformABI,
      provider
    );
    
    // Call getAuction to get full details
    const auctionDetails = await contract.getAuction(id);
    
    // Return image URL (redirect)
    return NextResponse.redirect(auctionDetails.itemImageUrl);
  } catch (error) {
    console.error('Error fetching auction image:', error);
    // Return a default image or placeholder
    return NextResponse.redirect('/placeholder.jpg');
  }
}