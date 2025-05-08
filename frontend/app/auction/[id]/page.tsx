"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CountdownTimer } from "@/components/countdown-timer";
import { BidForm } from "@/components/bid-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ExternalLink, Heart, Share2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery, gql } from "@apollo/client";
import { useParams } from "next/navigation";
import { ethers } from "ethers";
import { Bid } from "@/types/auction";
import { BidHistory } from "./components/bid-history";
import { useWallet } from "@/hooks/use-wallet";
import { Alert, AlertDescription } from "@/components/ui/alert";

// GraphQL query to get all auction data
const GET_AUCTION_DATA = gql`
  query GetAuctionData($id: String!) {
    auctionCreateds(where: {auctionId: $id}) {
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
    bidPlaceds(where: {auctionId: $id}) {
      id
      auctionId
      bidderAddress
      amount
      timestamp
      blockTimestamp
      transactionHash
    }
    auctionCompleteds(where: {auctionId: $id}) {
      id
      auctionId
      winner
      finalPrice
      blockTimestamp
      transactionHash
    }
  }
`;

export default function AuctionPage() {
  const params = useParams();
  const id = params?.id as string;
  const [liked, setLiked] = useState(false);
  const { address } = useWallet();
  
  // Fetch auction data from GraphQL
  const { loading, error, data, refetch } = useQuery(GET_AUCTION_DATA, {
    variables: { id },
    pollInterval: 30000, // Poll every 30 seconds for updates
  });

  // Process auction data from GraphQL
  const auction = data?.auctionCreateds?.[0];
  const bids = data?.bidPlaceds || [];
  const completed = data?.auctionCompleteds?.[0];

  // Sort bids by amount (highest first)
  const sortedBids = [...bids].sort(
    (a, b) => parseInt(b.amount) - parseInt(a.amount)
  );

  // Get highest bid
  const highestBid = sortedBids[0]?.amount || (auction?.startingBid || "0");
  const currentBidAmount = parseFloat(ethers.utils.formatUnits(highestBid, 8));
  
  // Determine if auction is active
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const isTimeUp = auction && parseInt(auction.endTimestamp) < currentTimestamp;
  const isActive = auction && !isTimeUp && !completed;
  const isCompleted = !!completed;
  
  // Calculate auction end time
  const endTime = auction ? new Date(parseInt(auction.endTimestamp) * 1000) : new Date();
  
  // Determine if current user is the creator
  const isCreator = address && auction?.creatorAddress === address;
  
  // Determine if current user is winning
  const isWinning = address && sortedBids[0]?.bidderAddress === address;
  
  // Format creator address for display
  const formattedCreator = auction?.creatorAddress ? 
    `${auction.creatorAddress.slice(0, 8)}...${auction.creatorAddress.slice(-8)}` : 
    '';

  // Handle loading state
  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Loading auction details...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="container py-10">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">Back to auctions</Link>
          </Button>
        </div>
        
        <Alert variant="destructive" className="mb-4 max-w-lg mx-auto">
          <AlertDescription>
            There was an error loading this auction. Please try again.
          </AlertDescription>
        </Alert>
        
        <div className="text-center mt-4">
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  // Handle case where auction doesn't exist
  if (!auction) {
    return (
      <div className="container py-10">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">Back to auctions</Link>
          </Button>
        </div>
        
        <div className="text-center py-16 border border-dashed rounded-xl max-w-lg mx-auto">
          <h2 className="text-2xl font-bold mb-4">Auction not found</h2>
          <p className="text-muted-foreground mb-6">
            The auction you're looking for doesn't exist or hasn't been indexed yet.
          </p>
          <Button asChild>
            <Link href="/">View all auctions</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-8 pb-16">
      <div className="container">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="group">
            <Link href="/" className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to auctions</span>
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Left Column - Image and Description */}
          <div className="lg:col-span-3 space-y-8">
            <motion.div
              className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-background/50 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative aspect-square">
                <Image 
                  src={auction.itemImageUrl || `/api/auction-image/${auction.auctionId}`} 
                  alt={auction.itemName} 
                  fill 
                  className="object-cover" 
                />
              </div>

              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90",
                    liked ? "text-red-500" : "text-muted-foreground",
                  )}
                  onClick={() => setLiked(!liked)}
                >
                  <Heart className={cn("h-5 w-5", liked && "fill-current")} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90 text-muted-foreground"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </motion.div>

            {auction.description && (
              <motion.div
                className="rounded-2xl border border-purple-500/20 bg-background/50 backdrop-blur-sm p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <h2 className="font-display text-xl font-bold mb-4">Item Description</h2>
                <p className="text-muted-foreground leading-relaxed">{auction.description}</p>
              </motion.div>
            )}
          </div>

          {/* Right Column - Auction Details */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              className="rounded-2xl border border-purple-500/20 bg-background/50 backdrop-blur-sm p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className="font-display text-3xl font-bold mb-2">{auction.itemName}</h1>
              <div className="flex items-center gap-2 mb-6">
                <span className="text-sm text-muted-foreground">Seller:</span>
                <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                  {formattedCreator}
                </code>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-muted-foreground hover:text-purple-400"
                  onClick={() => window.open(`https://liskscan.com/address/${auction.creatorAddress}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="sr-only">View on explorer</span>
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {isCompleted ? 'Final price' : 'Current bid'}
                  </p>
                  <p className="font-display text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                    {currentBidAmount.toFixed(2)} LSK
                  </p>
                  
                  {isWinning && !isCompleted && (
                    <p className="text-green-500 text-sm mt-1">You are the highest bidder!</p>
                  )}
                  
                  {isCompleted && completed.winner === address && (
                    <p className="text-green-500 text-sm mt-1">You won this auction!</p>
                  )}
                </div>

                {!isCompleted ? (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {isTimeUp ? 'Auction ended' : 'Auction ends in'}
                    </p>
                    {!isTimeUp ? (
                      <CountdownTimer endTime={endTime} />
                    ) : (
                      <p className="text-xl font-medium">Finalizing results...</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Winner</p>
                    <p className="text-xl font-medium">
                      {completed.winner === address ? 'You' : (
                        `${completed.winner.slice(0, 8)}...${completed.winner.slice(-8)}`
                      )}
                    </p>
                  </div>
                )}

                {!isCompleted && !isTimeUp && !isCreator && (
                  <BidForm 
                    currentBid={currentBidAmount} 
                    auctionId={auction.auctionId}
                    minIncrement={10} 
                  />
                )}
                
                {isCreator && (
                  <Alert className="bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
                    <AlertDescription>
                      You created this auction, so you cannot place bids.
                    </AlertDescription>
                  </Alert>
                )}
                
                {isTimeUp && !isCompleted && (
                  <Alert className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800">
                    <AlertDescription>
                      This auction has ended and is being finalized on the blockchain.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </motion.div>

            <motion.div
              className="rounded-2xl border border-purple-500/20 bg-background/50 backdrop-blur-sm overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Tabs defaultValue="history" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-background/50 p-1">
                  <TabsTrigger
                    value="history"
                    className="data-[state=active]:bg-purple-500/10 data-[state=active]:text-purple-400"
                  >
                    Bid History
                  </TabsTrigger>
                  <TabsTrigger
                    value="details"
                    className="data-[state=active]:bg-purple-500/10 data-[state=active]:text-purple-400"
                  >
                    Auction Details
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="history" className="p-6">
                  <BidHistory bids={bids} isLoading={loading} />
                </TabsContent>
                <TabsContent value="details" className="p-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 py-2 border-b border-purple-500/10">
                      <div className="text-sm text-muted-foreground">Starting bid</div>
                      <div className="font-medium">
                        {parseFloat(ethers.utils.formatUnits(auction.startingBid, 8)).toFixed(2)} LSK
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 py-2 border-b border-purple-500/10">
                      <div className="text-sm text-muted-foreground">Current bid</div>
                      <div className="font-medium">{currentBidAmount.toFixed(2)} LSK</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 py-2 border-b border-purple-500/10">
                      <div className="text-sm text-muted-foreground">Bid increment</div>
                      <div className="font-medium">10 LSK</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 py-2 border-b border-purple-500/10">
                      <div className="text-sm text-muted-foreground">Auction ID</div>
                      <div className="font-medium">{auction.auctionId}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 py-2 border-b border-purple-500/10">
                      <div className="text-sm text-muted-foreground">Creation date</div>
                      <div className="font-medium">
                        {new Date(parseInt(auction.blockTimestamp) * 1000).toLocaleString()}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 py-2">
                      <div className="text-sm text-muted-foreground">Blockchain</div>
                      <div className="font-medium">Lisk</div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-purple-500/10">
                      <a 
                        href={`https://liskscan.com/tx/${auction.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer" 
                        className="text-purple-500 hover:text-purple-600 text-sm flex items-center"
                      >
                        View on blockchain explorer
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
