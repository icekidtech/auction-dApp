import { NextRequest, NextResponse } from 'next/server';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const client = new ApolloClient({
  uri: process.env.NEXT_PUBLIC_SUBGRAPH_URL,
  cache: new InMemoryCache(),
});

const GET_AUCTION = gql`
  query GetAuction($id: ID!) {
    auctionCreated(id: $id) {
      id
      auctionId
      itemImageUrl
    }
  }
`;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  try {
    // Try to fetch the auction's image URL from the subgraph
    const { data } = await client.query({
      query: GET_AUCTION,
      variables: { id },
    });

    // If we have a valid image URL from the contract, redirect to it
    if (data?.auctionCreated?.itemImageUrl) {
      return NextResponse.redirect(data.auctionCreated.itemImageUrl);
    }
    
    // If no image found, return a placeholder image
    // Generate deterministic placeholder based on auction ID
    const colorHue = (parseInt(id) * 137) % 360;
    const placeholderUrl = `https://placehold.co/400x300/hsl(${colorHue},70%,60%)/white?text=Item+${id}`;
    
    return NextResponse.redirect(placeholderUrl);
  } catch (error) {
    console.error('Error fetching auction image:', error);
    // Return a generic placeholder on error
    return NextResponse.redirect('https://placehold.co/400x300/6D28D9/white?text=Zenthra+Auction');
  }
}