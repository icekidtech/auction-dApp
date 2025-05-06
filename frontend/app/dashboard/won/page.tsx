"use client";

import { useQuery, gql } from "@apollo/client";
import { useWallet } from "@/hooks/use-wallet";
import { AuctionCard } from "@/components/auction-card";
import { Loader2, AlertCircle, Trophy } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const GET_WON_AUCTIONS = gql`
  query GetWonAuctions($address: String!) {
    auctionCompleteds(where: {winner: $address}) {
      id
      auctionId
      winner
      finalPrice
      blockTimestamp
    }
    auctionCreateds {
      auctionId
      itemName
      creatorAddress
      startingBid
      endTimestamp
    }
  }
`;

export default function WonAuctionsPage() {
  const { address } = useWallet();

  const { data, loading, error } = useQuery(GET_WON_AUCTIONS, {
    variables: { address: address || "" },
    skip: !address,
  });

  const processAuctions = () => {
    if (!data?.auctionCompleteds || !data?.auctionCreateds) return [];

    return data.auctionCompleteds.map((completed: any) => {
      // Find the auction details
      const auction = data.auctionCreateds.find((a: any) => 
        a.auctionId === completed.auctionId
      );

      if (!auction) return null;

      return {
        id: auction.auctionId,
        name: auction.itemName,
        image: `/api/auction-image/${auction.auctionId}`, // Updated image path
        currentBid: parseInt(completed.finalPrice) / 1e8,
        endTime: new Date(parseInt(auction.endTimestamp) * 1000),
        creatorAddress: auction.creatorAddress,
        winDate: new Date(parseInt(completed.blockTimestamp) * 1000)
      };
    }).filter(Boolean);
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
            Failed to load your won auctions: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const wonAuctions = processAuctions();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Won Auctions</h2>
        <Button asChild>
          <Link href="/">Explore More Auctions</Link>
        </Button>
      </div>

      {wonAuctions.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-lg">
          <h3 className="text-lg font-medium mb-2">No won auctions yet</h3>
          <p className="text-muted-foreground mb-6">
            You haven't won any auctions yet. Start bidding to win!
          </p>
          <Button asChild>
            <Link href="/">Explore Auctions</Link>
          </Button>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wonAuctions.map((auction: any, index: number) => (
              <div key={auction.id} className="relative">
                <div className="absolute -top-3 -right-3 z-10">
                  <div className="bg-yellow-500 text-white p-2 rounded-full">
                    <Trophy className="h-4 w-4" />
                  </div>
                </div>
                <AuctionCard {...auction} index={index} />
                <div className="mt-2">
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-200">
                      Won
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {auction.winDate.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}