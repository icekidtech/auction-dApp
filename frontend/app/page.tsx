"use client";

import { useQuery, gql } from "@apollo/client";
import { AuctionCard } from "@/components/auction-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Sparkles, Loader2, Plus } from "lucide-react";
import { useState, useCallback } from "react";
import { Auction, Bid, ProcessedAuction } from "@/types/auction";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ethers } from "ethers";

// Make sure your query looks something like this:
const GET_AUCTIONS = gql`
  query GetAuctions {
    auctionCreateds(orderBy: blockTimestamp, orderDirection: desc) {
      id
      auctionId
      itemName
      startingBid
      endTimestamp
      creatorAddress
    }
  }
`;

// GraphQL query for featured auctions (highest value ones)
const GET_FEATURED_AUCTIONS = gql`
  query GetFeaturedAuctions {
    auctionCreateds(
      first: 3, 
      orderBy: startingBid, 
      orderDirection: desc,
      where: {blockTimestamp_gt: ${Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 7}}
    ) {
      id
      auctionId
      itemName
      creatorAddress
      startingBid
      endTimestamp
      blockTimestamp
      transactionHash
    }
  }
`;

// GraphQL query for all active auctions
const GET_ALL_AUCTIONS = gql`
  query GetAllAuctions($orderBy: String, $orderDirection: String, $first: Int, $skip: Int) {
    auctionCreateds(
      orderBy: $orderBy
      orderDirection: $orderDirection
      first: $first
      skip: $skip
    ) {
      id
      auctionId
      itemName
      itemImageUrl
      creatorAddress
      startingBid
      endTimestamp
      blockTimestamp
      transactionHash
    }
    bidPlaceds {
      id
      auctionId
      bidderAddress
      amount
      timestamp
      blockTimestamp
      transactionHash
    }
    auctionCompleteds {
      id
      auctionId
      winner
      finalPrice
      blockTimestamp
      transactionHash
    }
  }
`;

// Query to get auction stats
const GET_STATS = gql`
  query GetStats {
    auctionCreateds(first: 1000) {
      id
      auctionId
    }
    bidPlaceds {
      id
      bidderAddress
      amount
    }
  }
`;

export default function Home() {
  const [sortOrder, setSortOrder] = useState({
    orderBy: "blockTimestamp",
    orderDirection: "desc"
  });
  
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "active", or "completed"
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 6;
  
  const { loading, error, data } = useQuery(GET_ALL_AUCTIONS, {
    variables: { 
      orderBy: sortOrder.orderBy,
      orderDirection: sortOrder.orderDirection,
      first: PAGE_SIZE,
      skip: page * PAGE_SIZE
    },
    pollInterval: 30000, // Poll every 30 seconds for updates
  });

  const processAuctions = useCallback(() => {
    if (!data) return [];
    
    const currentTimestamp = Math.floor(Date.now() / 1000);
    
    return data.auctionCreateds.map((auction: any) => {
      // Find bids for this auction
      const auctionBids = data.bidPlaceds.filter(
        (bid: any) => bid.auctionId === auction.auctionId
      );
      
      // Sort bids by amount (highest first)
      const sortedBids = [...auctionBids].sort(
        (a: any, b: any) => parseInt(b.amount) - parseInt(a.amount)
      );
      
      // Get highest bid or use starting bid if no bids
      const highestBid = sortedBids[0]?.amount || auction.startingBid;
      const highestBidder = sortedBids[0]?.bidderAddress || "";
      
      // Check if auction is completed (in blockchain)
      const completedAuction = data.auctionCompleteds?.find(
        (completed: any) => completed.auctionId === auction.auctionId
      );
      
      // Check if auction time is up
      const isTimeUp = parseInt(auction.endTimestamp) < currentTimestamp;
      
      // An auction is active if time isn't up and it's not marked completed
      const isActive = !isTimeUp && !completedAuction;
      
      // An auction is completed if it's marked completed in blockchain
      const isCompleted = !!completedAuction;
      
      // Calculate auction end time as Date object
      const endTime = new Date(parseInt(auction.endTimestamp) * 1000);
      
      return {
        id: auction.auctionId,
        name: auction.itemName,
        image: auction.itemImageUrl || `/api/auction-image/${auction.auctionId}`,
        currentBid: parseFloat(ethers.utils.formatUnits(highestBid, 8)),
        endTime,
        creatorAddress: auction.creatorAddress,
        isActive,
        isCompleted,
        winner: completedAuction?.winner || highestBidder,
        bidCount: auctionBids.length,
        transactionHash: auction.transactionHash
      };
    })
    // Apply status filter
    .filter((auction: any) => {
      if (statusFilter === "active") return auction.isActive;
      if (statusFilter === "completed") return auction.isCompleted;
      return true; // "all"
    });
  }, [data, statusFilter]);
  
  const auctions = processAuctions();
  const hasAuctions = auctions?.length > 0;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500 text-xl">Error loading auctions</p>
          <p className="text-muted-foreground">Please check your connection and try again</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-background to-background z-0" />

        <div className="container relative z-10 pt-20 pb-24 md:pt-32 md:pb-40">
          <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                Decentralized Auctions
              </span>{" "}
              on the Zenthra Platform
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Discover, bid, and sell unique digital assets in a secure and transparent marketplace powered by
              blockchain technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
              >
                <Link href="#featured">Explore Auctions</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-purple-500/20 hover:bg-purple-500/10 hover:text-purple-400"
              >
                <Link href="/create">Create Auction</Link>
              </Button>
            </div>
          </div>

          {/* Stats - Using actual data */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto">
            <div className="bg-background/30 backdrop-blur-sm border border-purple-500/10 rounded-xl p-4 text-center">
              <p className="font-display text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                {loading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : data.auctionCreateds.length.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Active Auctions</p>
            </div>
            <div className="bg-background/30 backdrop-blur-sm border border-purple-500/10 rounded-xl p-4 text-center">
              <p className="font-display text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                {loading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : data.bidPlaceds.length.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Total Bids</p>
            </div>
            <div className="bg-background/30 backdrop-blur-sm border border-purple-500/10 rounded-xl p-4 text-center">
              <p className="font-display text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                {loading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : new Set(data.bidPlaceds.map((b: any) => b.bidderAddress)).size.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Users</p>
            </div>
            <div className="bg-background/30 backdrop-blur-sm border border-purple-500/10 rounded-xl p-4 text-center">
              <p className="font-display text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                {loading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : data.bidPlaceds.reduce((sum: number, bid: any) => sum + parseInt(bid.amount), 0).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">LSK Volume</p>
            </div>
          </div>
        </div>
      </section>

      {/* All Auctions */}
      <section id="all" className="py-16 md:py-24 relative">
        <div className="container">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight">All Auctions</h2>
            <Button asChild>
              <Link href="/create">
                <Plus className="mr-2 h-4 w-4" /> Create Auction
              </Link>
            </Button>
          </div>
          
          <Tabs 
            defaultValue="all" 
            className="mb-6"
            onValueChange={(value) => setStatusFilter(value)}
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
          ) : !hasAuctions ? (
            <div className="text-center py-16 border border-dashed rounded-lg">
              <h3 className="text-lg font-medium mb-2">No auctions found</h3>
              <p className="text-muted-foreground mb-6">
                {statusFilter === "all" ? (
                  "Be the first to create an auction!"
                ) : statusFilter === "active" ? (
                  "There are no active auctions at the moment."
                ) : (
                  "No completed auctions yet."
                )}
              </p>
              <Button asChild>
                <Link href="/create">Create Auction</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {auctions.map((auction: any, index: number) => (
                <div key={auction.id} className="relative">
                  <AuctionCard {...auction} index={index} />
                  {auction.isCompleted && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-purple-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                        Completed
                      </div>
                    </div>
                  )}
                  {auction.bidCount > 0 && (
                    <div className="absolute bottom-2 right-2">
                      <div className="bg-blue-500/80 text-white px-2 py-1 rounded-md text-xs font-medium">
                        {auction.bidCount} {auction.bidCount === 1 ? "Bid" : "Bids"}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
