"use client";

import { useQuery, gql } from "@apollo/client";
import { useWallet } from "@/hooks/use-wallet";
import { AuctionCard } from "@/components/auction-card";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const GET_USER_BIDDING_AUCTIONS = gql`
  query GetUserBiddingAuctions($address: String!) {
    bidPlaceds(where: {bidderAddress: $address}) {
      auctionId
      bidderAddress
      amount
      timestamp
    }
    auctionCreateds {
      auctionId
      itemName
      startingBid
      endTimestamp
      creatorAddress
    }
  }
`;

export default function BiddingAuctionsPage() {
  const { address } = useWallet();

  const { data, loading, error } = useQuery(GET_USER_BIDDING_AUCTIONS, {
    variables: { address: address || "" },
    skip: !address,
  });

  const processAuctions = () => {
    if (!data?.bidPlaceds || !data?.auctionCreateds) return [];

    // Get unique auction IDs from user's bids
    const biddingAuctionIds = [...new Set(data.bidPlaceds.map((bid: any) => bid.auctionId))];
    
    // Get auctions that match those IDs
    const userBiddingAuctions = data.auctionCreateds.filter((auction: any) => 
      biddingAuctionIds.includes(auction.auctionId)
    );
    
    // Process each auction with user's bid data
    return userBiddingAuctions.map((auction: any) => {
      // Find all bids for this auction
      const auctionBids = data.bidPlaceds.filter((bid: any) => 
        bid.auctionId === auction.auctionId
      );
      
      // Get highest bid amount
      const currentBid = Math.max(...auctionBids.map((bid: any) => parseInt(bid.amount)));
      
      // Get user's highest bid
      const userBids = auctionBids.filter((bid: any) => bid.bidderAddress === address);
      const userHighestBid = userBids.length > 0
        ? Math.max(...userBids.map((bid: any) => parseInt(bid.amount)))
        : 0;

      return {
        id: auction.auctionId,
        name: auction.itemName,
        image: `/api/auction-image/${auction.auctionId}`, // Updated image path
        currentBid: currentBid / 1e8,
        myBid: userHighestBid / 1e8,
        endTime: new Date(parseInt(auction.endTimestamp) * 1000),
        creatorAddress: auction.creatorAddress,
        isHighestBidder: currentBid === userHighestBid
      };
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load your auctions: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const processedAuctions = processAuctions();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">My Bids</h2>
        <Button asChild>
          <Link href="/">Explore More Auctions</Link>
        </Button>
      </div>

      {processedAuctions.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-lg">
          <h3 className="text-lg font-medium mb-2">No active bids</h3>
          <p className="text-muted-foreground mb-6">
            You haven't bid on any auctions yet. Start exploring!
          </p>
          <Button asChild>
            <Link href="/">Explore Auctions</Link>
          </Button>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {processedAuctions.map((auction: any, index: number) => (
              <div key={auction.id} className="relative">
                <AuctionCard {...auction} index={index} />
                {auction.isHighestBidder && (
                  <div className="absolute top-2 left-2">
                    <div className="bg-green-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                      Highest Bidder
                    </div>
                  </div>
                )}
                <div className="mt-2 text-sm">
                  <span className="text-muted-foreground">Your bid:</span>{" "}
                  <span className="font-semibold">{auction.myBid} LSK</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}