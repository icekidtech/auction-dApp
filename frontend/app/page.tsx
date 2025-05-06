"use client";

import { useQuery, gql } from "@apollo/client";
import { AuctionCard } from "@/components/auction-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import { Auction, Bid, ProcessedAuction } from "@/types/auction";

// Make sure your query looks something like this:
const GET_AUCTIONS = gql`
  query GetAuctions {
    auctionCreateds(orderBy: blockTimestamp, orderDirection: desc) {
      id
      auctionId
      itemName
      imageUrl
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
  query GetAllAuctions($skip: Int!, $first: Int!, $orderBy: String!, $orderDirection: String!) {
    auctionCreateds(
      skip: $skip
      first: $first
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: {endTimestamp_gt: ${Math.floor(Date.now() / 1000)}}
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
    bidPlaceds {
      auctionId
      amount
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
  // State for auction sorting/filtering
  const [sortOrder, setSortOrder] = useState({
    orderBy: "blockTimestamp",
    orderDirection: "desc"
  });
  
  // Featured auctions query
  const { 
    data: featuredData, 
    loading: featuredLoading, 
    error: featuredError
  } = useQuery(GET_FEATURED_AUCTIONS);
  
  // All auctions query with pagination and sorting
  const { 
    data: auctionsData, 
    loading: auctionsLoading, 
    error: auctionsError
  } = useQuery(GET_ALL_AUCTIONS, {
    variables: {
      skip: 0,
      first: 12,
      orderBy: sortOrder.orderBy,
      orderDirection: sortOrder.orderDirection
    }
  });
  
  // Stats query
  const { 
    data: statsData, 
    loading: statsLoading 
  } = useQuery(GET_STATS);

  // In your page component:
  const { data, loading, error } = useQuery(GET_AUCTIONS);

  // Add these console logs:
  console.log("GraphQL loading:", loading);
  console.log("GraphQL error:", error);
  console.log("GraphQL data:", data);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  // Process auction data to get current highest bids
  const processAuctionData = (auctions: Auction[], bids: Bid[]): ProcessedAuction[] => {
    if (!auctions || !bids) return [];
    
    return auctions.map((auction: Auction) => {
      // Find all bids for this auction
      const auctionBids = bids.filter((bid: Bid) => 
        bid.auctionId.toString() === auction.auctionId.toString()
      );
      
      // Get highest bid amount or use starting bid if no bids
      const currentBid = auctionBids.length > 0 
        ? Math.max(...auctionBids.map((bid: Bid) => parseInt(bid.amount)))
        : parseInt(auction.startingBid);

      return {
        id: auction.auctionId,
        name: auction.itemName,
        image: `/api/auction-image/${auction.auctionId}`, 
        currentBid: currentBid,
        endTime: new Date(parseInt(auction.endTimestamp) * 1000),
        creatorAddress: auction.creatorAddress
      };
    });
  };
  
  // Process featured auctions
  const featuredAuctions = featuredData?.auctionCreateds 
    ? processAuctionData(
        featuredData.auctionCreateds, 
        auctionsData?.bidPlaceds || []
      ).map((auction: ProcessedAuction) => ({ ...auction, featured: true }))
    : [];
  
  // Process all auctions
  const activeAuctions = auctionsData?.auctionCreateds 
    ? processAuctionData(auctionsData.auctionCreateds, auctionsData.bidPlaceds)
    : [];
    
  // Process stats
  const stats = {
    auctions: statsData?.auctionCreateds?.length || 0,
    bids: statsData?.bidPlaceds?.length || 0,
    users: statsData ? new Set([
      ...statsData.auctionCreateds.map((a: Auction) => a.creatorAddress),
      ...statsData.bidPlaceds.map((b: Bid) => b.bidderAddress)
    ]).size : 0,
    volume: statsData?.bidPlaceds 
      ? statsData.bidPlaceds.reduce((sum: number, bid: Bid) => sum + parseInt(bid.amount), 0) / 1e8
      : 0
  };
  
  // Handle sort changes
  const handleSortChange = (orderBy: string, orderDirection: string): void => {
    setSortOrder({ orderBy, orderDirection });
  };

  // Loading state
  if (featuredLoading && auctionsLoading && statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
      </div>
    );
  }

  // Error state
  if (featuredError || auctionsError) {
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
                {statsLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : stats.auctions.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Active Auctions</p>
            </div>
            <div className="bg-background/30 backdrop-blur-sm border border-purple-500/10 rounded-xl p-4 text-center">
              <p className="font-display text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                {statsLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : stats.bids.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Total Bids</p>
            </div>
            <div className="bg-background/30 backdrop-blur-sm border border-purple-500/10 rounded-xl p-4 text-center">
              <p className="font-display text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                {statsLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : stats.users.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Users</p>
            </div>
            <div className="bg-background/30 backdrop-blur-sm border border-purple-500/10 rounded-xl p-4 text-center">
              <p className="font-display text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                {statsLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : stats.volume.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">LSK Volume</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Auctions */}
      <section id="featured" className="py-16 md:py-24 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/10 via-background to-background z-0" />

        <div className="container relative z-10">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-purple-400" />
              <h2 className="font-display text-3xl font-bold">Featured Auctions</h2>
            </div>
            <Button variant="ghost" className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10" asChild>
              <Link href="#all" className="flex items-center gap-2">
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {featuredLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
          ) : featuredAuctions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {featuredAuctions.map((auction, index) => (
                <AuctionCard key={auction.id} {...auction} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-purple-500/20 rounded-xl bg-background/30">
              <p className="text-muted-foreground">No featured auctions available at the moment.</p>
              <Button asChild className="mt-4 bg-purple-600 hover:bg-purple-500">
                <Link href="/create">Create the first auction</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* All Auctions */}
      <section id="all" className="py-16 md:py-24 relative">
        <div className="container">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
            <h2 className="font-display text-3xl font-bold">All Auctions</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant={sortOrder.orderBy === "blockTimestamp" && sortOrder.orderDirection === "desc" ? "outline" : "ghost"}
                size="sm"
                className={sortOrder.orderBy === "blockTimestamp" && sortOrder.orderDirection === "desc" 
                  ? "border-purple-500/20 bg-purple-500/10 text-purple-400" 
                  : ""}
                onClick={() => handleSortChange("blockTimestamp", "desc")}
              >
                Latest
              </Button>
              <Button 
                variant={sortOrder.orderBy === "endTimestamp" && sortOrder.orderDirection === "asc" ? "outline" : "ghost"}
                size="sm"
                className={sortOrder.orderBy === "endTimestamp" && sortOrder.orderDirection === "asc" 
                  ? "border-purple-500/20 bg-purple-500/10 text-purple-400" 
                  : ""}
                onClick={() => handleSortChange("endTimestamp", "asc")}
              >
                Ending Soon
              </Button>
              <Button 
                variant={sortOrder.orderBy === "startingBid" && sortOrder.orderDirection === "desc" ? "outline" : "ghost"}
                size="sm"
                className={sortOrder.orderBy === "startingBid" && sortOrder.orderDirection === "desc" 
                  ? "border-purple-500/20 bg-purple-500/10 text-purple-400" 
                  : ""}
                onClick={() => handleSortChange("startingBid", "desc")}
              >
                Price: High to Low
              </Button>
            </div>
          </div>

          {auctionsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
          ) : activeAuctions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {activeAuctions.map((auction, index) => (
                <AuctionCard key={auction.id} {...auction} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-purple-500/20 rounded-xl bg-background/30">
              <p className="text-muted-foreground">No active auctions available at the moment.</p>
              <Button asChild className="mt-4 bg-purple-600 hover:bg-purple-500">
                <Link href="/create">Create the first auction</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
