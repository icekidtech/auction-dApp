"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CountdownTimer } from "@/components/countdown-timer"
import { BidForm } from "@/components/bid-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, ExternalLink, Heart, Share2, User } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

// Mock auction data
const getAuctionData = (id: string) => {
  return {
    id,
    name: "Rare Digital Artwork #1",
    image: "/placeholder.svg?height=600&width=600",
    description:
      "This is a rare digital artwork created by a renowned digital artist. The piece represents the fusion of traditional art techniques with modern digital tools, resulting in a unique visual experience that pushes the boundaries of digital art.",
    sellerAddress: "lsk24cd35u4jdq8szo3pnsqe5dsxwrnazyqqqg5eu",
    currentBid: 1250,
    startingBid: 500,
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    bidHistory: [
      {
        bidder: "lsk24cd35u4jdq8szo3pnsqe5dsxwrnazyqqqg5eu",
        amount: 1250,
        time: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        bidder: "lsk39fj28h4fh29fj39f8h2f98h2f98h2f98h2f98",
        amount: 1200,
        time: new Date(Date.now() - 5 * 60 * 60 * 1000),
      },
      {
        bidder: "lsk8f92h3f98h2f98h2f98h2f98h2f98h2f98h2f9",
        amount: 1100,
        time: new Date(Date.now() - 8 * 60 * 60 * 1000),
      },
      {
        bidder: "lsk24cd35u4jdq8szo3pnsqe5dsxwrnazyqqqg5eu",
        amount: 1000,
        time: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
      {
        bidder: "lsk39fj28h4fh29fj39f8h2f98h2f98h2f98h2f98",
        amount: 900,
        time: new Date(Date.now() - 15 * 60 * 60 * 1000),
      },
      {
        bidder: "lsk8f92h3f98h2f98h2f98h2f98h2f98h2f98h2f9",
        amount: 800,
        time: new Date(Date.now() - 18 * 60 * 60 * 1000),
      },
      {
        bidder: "lsk24cd35u4jdq8szo3pnsqe5dsxwrnazyqqqg5eu",
        amount: 700,
        time: new Date(Date.now() - 22 * 60 * 60 * 1000),
      },
      {
        bidder: "lsk39fj28h4fh29fj39f8h2f98h2f98h2f98h2f98",
        amount: 600,
        time: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        bidder: "lsk8f92h3f98h2f98h2f98h2f98h2f98h2f98h2f9",
        amount: 500,
        time: new Date(Date.now() - 26 * 60 * 60 * 1000),
      },
    ],
  }
}

function BidHistory({ bids }: { bids: Bid[] }) {
  if (!bids || bids.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No bids have been placed yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bids.map((bid, index) => (
        <div key={index} className="flex items-center justify-between py-2 border-b border-purple-500/10">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-purple-500/10 p-2">
              <User className="h-4 w-4 text-purple-500" />
            </div>
            <div>
              <p className="font-medium">
                {bid.bidder.substring(0, 6)}...{bid.bidder.substring(bid.bidder.length - 4)}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(bid.time).toLocaleString()}
              </p>
            </div>
          </div>
          <p className="font-semibold">{bid.amount.toFixed(2)} LSK</p>
        </div>
      ))}
    </div>
  );
}

export default function AuctionPage({ params }: { params: { id: string } }) {
  const auction = getAuctionData(params.id)
  const [liked, setLiked] = useState(false)

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
                <Image src={auction.image || "/placeholder.svg"} alt={auction.name} fill className="object-cover" />
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

            <motion.div
              className="rounded-2xl border border-purple-500/20 bg-background/50 backdrop-blur-sm p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="font-display text-xl font-bold mb-4">Item Description</h2>
              <p className="text-muted-foreground leading-relaxed">{auction.description}</p>
            </motion.div>
          </div>

          {/* Right Column - Auction Details */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              className="rounded-2xl border border-purple-500/20 bg-background/50 backdrop-blur-sm p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className="font-display text-3xl font-bold mb-2">{auction.name}</h1>
              <div className="flex items-center gap-2 mb-6">
                <span className="text-sm text-muted-foreground">Seller:</span>
                <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                  {auction.sellerAddress.slice(0, 8)}...{auction.sellerAddress.slice(-8)}
                </code>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-purple-400">
                  <ExternalLink className="h-4 w-4" />
                  <span className="sr-only">View on explorer</span>
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Current bid</p>
                  <p className="font-display text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                    {auction.currentBid} LSK
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Auction ends in</p>
                  <CountdownTimer endTime={auction.endTime} />
                </div>

                <BidForm currentBid={auction.currentBid} />
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
                  <BidHistory bids={auction.bidHistory} />
                </TabsContent>
                <TabsContent value="details" className="p-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 py-2 border-b border-purple-500/10">
                      <div className="text-sm text-muted-foreground">Starting bid</div>
                      <div className="font-medium">{auction.startingBid} LSK</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 py-2 border-b border-purple-500/10">
                      <div className="text-sm text-muted-foreground">Current bid</div>
                      <div className="font-medium">{auction.currentBid} LSK</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 py-2 border-b border-purple-500/10">
                      <div className="text-sm text-muted-foreground">Bid increment</div>
                      <div className="font-medium">10 LSK</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 py-2 border-b border-purple-500/10">
                      <div className="text-sm text-muted-foreground">Auction ID</div>
                      <div className="font-medium">{auction.id}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 py-2">
                      <div className="text-sm text-muted-foreground">Blockchain</div>
                      <div className="font-medium">Lisk</div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  )
}
