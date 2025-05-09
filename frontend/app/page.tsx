"use client";

import { useQuery, gql } from "@apollo/client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AuctionCard } from "@/components/auction-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProcessedAuction } from "@/types/auction";

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

  return (
    <main>
      {/* Hero Section */}
      <section className="py-12 md:py-24 lg:py-32 bg-gradient-to-b from-purple-500/10 to-transparent">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Zenthra
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                The decentralized auction platform built on Lisk
              </p>
            </div>
            <div className="space-x-4">
              <Button asChild size="lg">
                <Link href="/create">
                  <Plus className="mr-2 h-4 w-4" /> Create Auction
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg">
                <Link href="/dashboard">View Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Auctions Section */}
      <section className="py-12 container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Auctions</h2>
          <Button asChild>
            <Link href="/create">
              <Plus className="mr-2 h-4 w-4" /> Create Auction
            </Link>
          </Button>
        </div>

        {/* Filter tabs */}
        <Tabs defaultValue="all" className="mb-8">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Conditional rendering based on loading/error/empty states */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        ) : error ? (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error.message || "Failed to load auctions"}
            </AlertDescription>
          </Alert>
        ) : auctions?.length === 0 ? (
          <div className="text-center py-16 border border-dashed rounded-lg">
            <h3 className="text-lg font-medium mb-2">No auctions found</h3>
            <p className="text-muted-foreground mb-6">
              Be the first to create an auction!
            </p>
            <Button asChild>
              <Link href="/create">Create Auction</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map((auction, index) => (
              <AuctionCard
                key={auction.id}
                {...auction}
                index={index}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
