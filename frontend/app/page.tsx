import { AuctionCard } from "@/components/auction-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"

// Mock data for featured auctions
const featuredAuctions = [
  {
    id: "1",
    name: "Rare Digital Artwork #1",
    image: "/placeholder.svg?height=400&width=400",
    currentBid: 1250,
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    featured: true,
  },
  {
    id: "2",
    name: "Exclusive NFT Collection",
    image: "/placeholder.svg?height=400&width=400",
    currentBid: 890,
    endTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
    featured: true,
  },
  {
    id: "3",
    name: "Virtual Land in Metaverse",
    image: "/placeholder.svg?height=400&width=400",
    currentBid: 3200,
    endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    featured: true,
  },
]

// Mock data for active auctions
const activeAuctions = [
  {
    id: "4",
    name: "Digital Art Collection - Series 1",
    image: "/placeholder.svg?height=400&width=400",
    currentBid: 450,
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: "5",
    name: "Blockchain Domain Name",
    image: "/placeholder.svg?height=400&width=400",
    currentBid: 780,
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: "6",
    name: "Limited Edition Digital Collectible",
    image: "/placeholder.svg?height=400&width=400",
    currentBid: 320,
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "7",
    name: "Crypto Art Masterpiece",
    image: "/placeholder.svg?height=400&width=400",
    currentBid: 1100,
    endTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
  },
  {
    id: "8",
    name: "Virtual Reality Experience",
    image: "/placeholder.svg?height=400&width=400",
    currentBid: 590,
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: "9",
    name: "Tokenized Real Estate Share",
    image: "/placeholder.svg?height=400&width=400",
    currentBid: 2400,
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
]

export default function Home() {
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
              on the Lisk Blockchain
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

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto">
            <div className="bg-background/30 backdrop-blur-sm border border-purple-500/10 rounded-xl p-4 text-center">
              <p className="font-display text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                1,234
              </p>
              <p className="text-sm text-muted-foreground">Active Auctions</p>
            </div>
            <div className="bg-background/30 backdrop-blur-sm border border-purple-500/10 rounded-xl p-4 text-center">
              <p className="font-display text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                56.7K
              </p>
              <p className="text-sm text-muted-foreground">Total Bids</p>
            </div>
            <div className="bg-background/30 backdrop-blur-sm border border-purple-500/10 rounded-xl p-4 text-center">
              <p className="font-display text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                890
              </p>
              <p className="text-sm text-muted-foreground">Users</p>
            </div>
            <div className="bg-background/30 backdrop-blur-sm border border-purple-500/10 rounded-xl p-4 text-center">
              <p className="font-display text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                12.3K
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {featuredAuctions.map((auction, index) => (
              <AuctionCard key={auction.id} {...auction} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* All Auctions */}
      <section id="all" className="py-16 md:py-24 relative">
        <div className="container">
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-display text-3xl font-bold">All Auctions</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-purple-500/20 hover:bg-purple-500/10 hover:text-purple-400"
              >
                Latest
              </Button>
              <Button variant="ghost" size="sm">
                Ending Soon
              </Button>
              <Button variant="ghost" size="sm">
                Price: High to Low
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {activeAuctions.map((auction, index) => (
              <AuctionCard key={auction.id} {...auction} index={index} />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
