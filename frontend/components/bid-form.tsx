"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"

interface BidFormProps {
  currentBid: number
}

export function BidForm({ currentBid }: BidFormProps) {
  const [bidAmount, setBidAmount] = useState<number>(currentBid + 10)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (bidAmount <= currentBid) {
      toast({
        title: "Bid too low",
        description: "Your bid must be higher than the current bid.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Bid placed!",
        description: `You've successfully placed a bid of ${bidAmount} LSK.`,
      })
      setIsSubmitting(false)
    }, 1500)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={bidAmount}
            onChange={(e) => setBidAmount(Number(e.target.value))}
            min={currentBid + 1}
            step="1"
            required
            className="font-mono bg-background/50 border-purple-500/20 focus-visible:ring-purple-500/30"
          />
          <span className="text-sm font-medium">LSK</span>
        </div>
        <p className="text-xs text-muted-foreground">Enter {currentBid + 10} LSK or more</p>
      </div>

      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
          disabled={isSubmitting || bidAmount <= currentBid}
        >
          {isSubmitting ? "Placing Bid..." : "Place Bid"}
        </Button>
      </motion.div>
    </form>
  )
}
