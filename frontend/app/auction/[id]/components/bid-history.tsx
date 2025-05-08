"use client";

import { User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ethers } from "ethers";

// Use correct typing for Bid from the GraphQL response
interface Bid {
  id: string;
  bidderAddress: string;
  amount: string;
  timestamp: string;
  blockTimestamp: string;
  transactionHash: string;
}

interface BidHistoryProps {
  bids: Bid[];
  isLoading: boolean;
}

export function BidHistory({ bids, isLoading }: BidHistoryProps) {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-muted h-8 w-8" />
                <div className="space-y-1">
                  <div className="h-4 bg-muted rounded w-20" />
                  <div className="h-3 bg-muted rounded w-24" />
                </div>
              </div>
              <div className="h-4 bg-muted rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!bids || bids.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No bids have been placed yet</p>
      </div>
    );
  }
  
  // Sort bids by amount (highest first)
  const sortedBids = [...bids].sort(
    (a, b) => parseInt(b.amount) - parseInt(a.amount)
  );
  
  // Get highest bid for highlighting
  const highestBidAmount = sortedBids.length > 0 ? sortedBids[0].amount : "0";

  return (
    <div className="space-y-4">
      {sortedBids.map((bid, index) => {
        const isHighest = bid.amount === highestBidAmount;
        const bidAmount = parseFloat(ethers.utils.formatUnits(bid.amount, 8));
        
        return (
          <div key={bid.id} className="flex items-center justify-between py-2 border-b border-purple-500/10">
            <div className="flex items-center gap-3">
              <div className={`rounded-full p-2 ${isHighest ? 'bg-green-500/10 text-green-500' : 'bg-purple-500/10 text-purple-500'}`}>
                <User className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">
                  {bid.bidderAddress.substring(0, 6)}...{bid.bidderAddress.substring(bid.bidderAddress.length - 4)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(parseInt(bid.timestamp) * 1000), { addSuffix: true })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-semibold ${isHighest ? 'text-green-600 dark:text-green-400' : ''}`}>
                {bidAmount.toFixed(2)} LSK
              </p>
              {isHighest && (
                <p className="text-xs text-green-600 dark:text-green-400">Highest bid</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}