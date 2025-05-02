"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AuctionCard } from "@/components/auction-card"
import { PlusCircle, Sparkles, Clock, Trophy } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

// Mock data for created auctions
const createdAuctions = [
  {
    id: "101",
    name: "Digital Art Collection - Series 1",
    image: "/placeholder.svg?height=400&width=400",
    currentBid: 450,
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: "102",
    name: "Blockchain Domain Name",
    image: "/placeholder.svg?height=400&width=400",
    currentBid: 780,
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  },
]

// Mock data for active bids
const activeBids = [
  {
    id: "201",
    name: "Rare Digital Artwork #1",
    image: "/placeholder.svg?height=400&width=400",
    currentBid: 1250,
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "202",
    name: "Exclusive NFT Collection",
    image: "/placeholder.svg?height=400&width=400",
    currentBid: 890,
    endTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
  },
  {
    id: "203",
    name: "Virtual Land in Metaverse",
    image: "/placeholder.svg?height=400&width=400",
    currentBid: 3200,
    endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
  },
]

// Mock data for won items
const wonItems = [
  {
    id: "301",
    name: "Limited Edition Digital Collectible",
    image: "/placeholder.svg?height=400&width=400",
    currentBid: 320,
    endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("created")

  const getEmptyStateContent = (tab: string) => {
    switch (tab) {
      case "created":
        return {
          title: "No Created Auctions",
          description: "You haven't created any auctions yet.",
          buttonText: "Create Your First Auction",
          buttonLink: "/create",
          icon: <Sparkles className="h-12 w-12 text-purple-400 mb-4" />,
        }
      case "active":
        return {
          title: "No Active Bids",
          description: "You haven't placed any bids yet.",
          buttonText: "Browse Auctions",
          buttonLink: "/",
          icon: <Clock className="h-12 w-12 text-purple-400 mb-4" />,
        }
      case "won":
        return {
          title: "No Won Items",
          description: "You haven't won any auctions yet.",
          buttonText: "Browse Auctions",
          buttonLink: "/",
          icon: <Trophy className="h-12 w-12 text-purple-400 mb-4" />,
        }
      default:
        return {
          title: "No Items",
          description: "Nothing to show here.",
          buttonText: "Browse Auctions",
          buttonLink: "/",
          icon: null,
        }
    }
  }

  return (
    <main className="min-h-screen py-12">
      <div className="container">
        <motion.div
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
            My Dashboard
          </h1>
          <Button
            asChild
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
          >
            <Link href="/create" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              <span>Create New Auction</span>
            </Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Tabs defaultValue="created" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-background/50 p-1 rounded-full border border-purple-500/20">
              <TabsTrigger
                value="created"
                className={cn(
                  "rounded-full data-[state=active]:bg-purple-500/10 data-[state=active]:text-purple-400",
                  "transition-all duration-300",
                )}
              >
                Created ({createdAuctions.length})
              </TabsTrigger>
              <TabsTrigger
                value="active"
                className={cn(
                  "rounded-full data-[state=active]:bg-purple-500/10 data-[state=active]:text-purple-400",
                  "transition-all duration-300",
                )}
              >
                Active Bids ({activeBids.length})
              </TabsTrigger>
              <TabsTrigger
                value="won"
                className={cn(
                  "rounded-full data-[state=active]:bg-purple-500/10 data-[state=active]:text-purple-400",
                  "transition-all duration-300",
                )}
              >
                Won Items ({wonItems.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="created">
              {createdAuctions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {createdAuctions.map((auction, index) => (
                    <AuctionCard key={auction.id} {...auction} index={index} />
                  ))}
                </div>
              ) : (
                <EmptyState tab="created" />
              )}
            </TabsContent>

            <TabsContent value="active">
              {activeBids.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {activeBids.map((auction, index) => (
                    <AuctionCard key={auction.id} {...auction} index={index} />
                  ))}
                </div>
              ) : (
                <EmptyState tab="active" />
              )}
            </TabsContent>

            <TabsContent value="won">
              {wonItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {wonItems.map((auction, index) => (
                    <AuctionCard key={auction.id} {...auction} index={index} />
                  ))}
                </div>
              ) : (
                <EmptyState tab="won" />
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </main>
  )
}

function EmptyState({ tab }: { tab: string }) {
  const content = {
    created: {
      title: "No Created Auctions",
      description: "You haven't created any auctions yet.",
      buttonText: "Create Your First Auction",
      buttonLink: "/create",
      icon: <Sparkles className="h-12 w-12 text-purple-400 mb-4" />,
    },
    active: {
      title: "No Active Bids",
      description: "You haven't placed any bids yet.",
      buttonText: "Browse Auctions",
      buttonLink: "/",
      icon: <Clock className="h-12 w-12 text-purple-400 mb-4" />,
    },
    won: {
      title: "No Won Items",
      description: "You haven't won any auctions yet.",
      buttonText: "Browse Auctions",
      buttonLink: "/",
      icon: <Trophy className="h-12 w-12 text-purple-400 mb-4" />,
    },
  }[tab]

  return (
    <motion.div
      className="rounded-2xl border border-purple-500/20 bg-background/50 backdrop-blur-sm p-12 text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-md mx-auto">
        {content.icon}
        <h2 className="font-display text-2xl font-bold mb-2">{content.title}</h2>
        <p className="text-muted-foreground mb-6">{content.description}</p>
        <Button
          asChild
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
        >
          <Link href={content.buttonLink}>{content.buttonText}</Link>
        </Button>
      </div>
    </motion.div>
  )
}
