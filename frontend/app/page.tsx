"use client";

import { useQuery, gql } from "@apollo/client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuctionCard } from "@/components/auction-card";
import { Loader2, AlertCircle } from "lucide-react";
import { ProcessedAuction } from "@/types/auction";
import Link from "next/link";

// Updated query with fewer filters to ensure data returns
const GET_ALL_AUCTIONS = gql`
  query GetAllAuctions($first: Int!, $skip: Int!) {
    auctionCreateds(first: $first, skip: $skip) {
      id
      auctionId
      itemName
      creatorAddress
      startingBid
      endTimestamp
      blockTimestamp
      transactionHash
    }
    bidPlaceds {
      auctionId
      bidderAddress
      amount
      timestamp
    }
    auctionCompleteds {
      auctionId
      winner
      finalPrice
    }
  }
`;

export default function Home() {
  const [retryCount, setRetryCount] = useState(0);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const { loading, error, data, refetch } = useQuery(GET_ALL_AUCTIONS, {
    variables: { 
      first: 10, 
      skip: 0
    },
    notifyOnNetworkStatusChange: true,
    errorPolicy: 'all',
    fetchPolicy: 'network-only'
  });

  // Add a timeout to retry on loading taking too long
  useEffect(() => {
    if (loading && !timeoutId) {
      const id = setTimeout(() => {
        console.log("Query timeout, retrying...");
        if (retryCount < 3) {
          setRetryCount(prev => prev + 1);
          refetch();
        }
      }, 10000); // 10-second timeout
      
      setTimeoutId(id);
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [loading, timeoutId, retryCount, refetch]);

  // Clear timeout when data loads or error occurs
  useEffect(() => {
    if ((!loading && data) || error) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }
    }
    
    if (data) {
      console.log("Data loaded successfully:", data);
    }
    
    if (error) {
      console.error("GraphQL Error:", error);
    }
  }, [data, error, loading, timeoutId]);

  // Process auction data safely
  const processAuctions = (): ProcessedAuction[] => {
    if (!data?.auctionCreateds) return [];
    
    const currentTimestamp = Math.floor(Date.now() / 1000);
    
    return data.auctionCreateds.map((auction: any) => {
      // Get bids for this auction safely
      const auctionBids = data.bidPlaceds?.filter(
        (bid: any) => bid.auctionId === auction.auctionId
      ) || [];
      
      // Check if auction is completed
      const completedAuction = data.auctionCompleteds?.find(
        (completed: any) => completed.auctionId === auction.auctionId
      );
      
      // Calculate if auction is active based on time
      const isTimeUp = parseInt(auction.endTimestamp) < currentTimestamp;
      const isActive = !isTimeUp && !completedAuction;
      const isCompleted = !!completedAuction;
      
      // Calculate highest bid
      const highestBid = auctionBids.length > 0
        ? Math.max(...auctionBids.map((b: any) => parseInt(b.amount)))
        : parseInt(auction.startingBid);
      
      return {
        id: auction.auctionId,
        name: auction.itemName || "Unnamed Auction",
        image: `/api/auction-image/${auction.auctionId}`,
        currentBid: highestBid / 1e8,
        endTime: new Date(parseInt(auction.endTimestamp) * 1000),
        creatorAddress: auction.creatorAddress,
        isActive,
        isCompleted,
        winner: completedAuction?.winner || "",
        bidCount: auctionBids.length
      };
    });
  };

  const auctions = processAuctions();

  if (loading && retryCount === 0) {
    return (
      <div className="container flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Loading auctions...</p>
        </div>
      </div>
    );
  }

  // Show retry UI after first timeout
  if (loading && retryCount > 0) {
    return (
      <div className="container flex items-center justify-center min-h-[50vh]">
        <div className="text-center max-w-md">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Still loading...</h2>
          <p className="text-muted-foreground mb-4">
            The Lisk auction data is taking longer than expected to load.
          </p>
          <Button onClick={() => refetch()}>
            Retry Now
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error.message || "Failed to load auctions"}
          </AlertDescription>
        </Alert>
        <div className="flex justify-center mt-6">
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <main>
      {/* Hero/welcome section */}
      <section className="bg-gradient-to-b from-purple-500/5 to-transparent py-16">
        <div className="container text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Zenthra</h1>
          <p className="text-lg mb-8 text-muted-foreground max-w-2xl mx-auto">
            The decentralized auction platform built on Lisk
          </p>
          <Button asChild size="lg">
            <Link href="/create">Create Auction</Link>
          </Button>
        </div>
      </section>
      
      {/* If no auctions, show empty state */}
      {auctions.length === 0 ? (
        <div className="container py-16">
          <div className="text-center border border-dashed rounded-lg py-16">
            <h2 className="text-2xl font-semibold mb-2">No auctions yet</h2>
            <p className="text-muted-foreground mb-8">Be the first to create an auction!</p>
            <Button asChild>
              <Link href="/create">Create Auction</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="container py-12">
          <h2 className="text-2xl font-bold mb-8">Active Auctions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.filter(a => a.isActive).map((auction, index) => (
              <AuctionCard
                key={auction.id}
                {...auction}
                index={index}
              />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
