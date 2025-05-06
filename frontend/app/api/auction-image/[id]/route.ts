import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

// Complete ABI for getAuction function based on your contract
const AuctionPlatformABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "auctionId", "type": "uint256"}],
    "name": "getAuction",
    "outputs": [
      {"internalType": "uint256", "name": "id", "type": "uint256"},
      {"internalType": "string", "name": "itemName", "type": "string"},
      {"internalType": "string", "name": "itemImageUrl", "type": "string"},
      {"internalType": "string", "name": "creatorAddress", "type": "string"},
      {"internalType": "uint256", "name": "startingBid", "type": "uint256"},
      {"internalType": "uint256", "name": "currentHighestBid", "type": "uint256"},
      {"internalType": "string", "name": "highestBidder", "type": "string"},
      {"internalType": "uint256", "name": "createdTimestamp", "type": "uint256"},
      {"internalType": "uint256", "name": "endTimestamp", "type": "uint256"},
      {"internalType": "bool", "name": "isActive", "type": "bool"},
      {"internalType": "bool", "name": "isCompleted", "type": "bool"}
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
  console.log(`Fetching image for auction ID: ${id}`);
  
  // Add cache control headers
  const headers = {
    'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
  };
  
  try {
    // Check for valid auction ID
    if (!id || isNaN(Number(id))) {
      console.error('Invalid auction ID:', id);
      return NextResponse.redirect(new URL('/placeholder-auction.jpg', request.url), { headers });
    }

    // Connect to the Lisk network
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_RPC_URL
    );
    
    // Create contract instance
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string,
      AuctionPlatformABI,
      provider
    );
    
    console.log('Calling getAuction on contract...');
    
    // Get auction details including the image URL
    const auctionDetails = await contract.getAuction(id);
    
    console.log('Got auction details, image URL:', auctionDetails.itemImageUrl);
    
    // Validate the URL (basic check)
    let imageUrl = auctionDetails.itemImageUrl;
    if (!imageUrl || !imageUrl.startsWith('http')) {
      console.warn('Invalid image URL, using placeholder:', imageUrl);
      return NextResponse.redirect(new URL('/placeholder-auction.jpg', request.url), { headers });
    }
    
    // Return image URL (redirect)
    return NextResponse.redirect(new URL(imageUrl), { headers });
  } catch (error) {
    console.error('Error fetching auction image:', error);
    // Return a default image if there's an error
    return NextResponse.redirect(new URL('/placeholder-auction.jpg', request.url), { headers });
  }
}