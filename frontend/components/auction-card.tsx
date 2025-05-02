"use client"

import Image from "next/image"
import Link from "next/link"
import { CountdownTimer } from "@/components/countdown-timer"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface AuctionCardProps {
  id: string
  name: string
  image: string
  currentBid: number
  endTime: Date
  featured?: boolean
  index?: number
}

export function AuctionCard({ id, name, image, currentBid, endTime, featured, index = 0 }: AuctionCardProps) {
  return (
    <Link href={`/auction/${id}`}>
      <motion.div
        className={cn(
          "group relative overflow-hidden rounded-xl transition-all duration-300",
          "hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]",
          "before:absolute before:inset-0 before:rounded-xl before:border before:border-purple-500/20 before:content-['']",
          "after:absolute after:inset-0 after:rounded-xl after:border after:border-transparent after:content-[''] after:hover:border-purple-500/50",
          featured ? "h-full" : "h-full",
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        whileHover={{ scale: 1.02 }}
      >
        <div className="relative aspect-square overflow-hidden rounded-t-xl">
          <Image
            src={image || "/placeholder.svg"}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {featured && (
            <div className="absolute top-3 right-3 z-10">
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none px-3 py-1 rounded-full">
                Featured
              </Badge>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-0 group-hover:opacity-70 transition-opacity duration-300" />
        </div>

        <div className="relative p-4 bg-background/80 backdrop-blur-sm rounded-b-xl">
          <h3 className="font-display text-lg font-bold line-clamp-1 group-hover:text-purple-400 transition-colors">
            {name}
          </h3>

          <div className="mt-2 flex justify-between items-end">
            <div>
              <p className="text-xs text-muted-foreground">Current bid</p>
              <p className="font-display text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                {currentBid} LSK
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">Ends in</p>
              <CountdownTimer endTime={endTime} compact />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
