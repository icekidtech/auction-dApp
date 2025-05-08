"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { TimeRemaining } from "@/components/TimeRemaining";

interface AuctionCardProps {
  id: string;
  name: string;
  image: string;
  currentBid: number;
  endTime: Date;
  featured?: boolean;
  index?: number;
  creatorAddress?: string;
  isActive?: boolean;
  isCompleted?: boolean;
  winner?: string;
}

export function AuctionCard({
  id,
  name,
  image,
  currentBid,
  endTime,
  isActive = true,
  isCompleted = false,
  winner = "",
  creatorAddress,
  index = 0
}: AuctionCardProps) {
  const isPast = !isActive;
  const now = new Date();
  const isEnding = isActive && endTime && (endTime.getTime() - now.getTime()) < 24 * 60 * 60 * 1000; // 24 hours
  
  return (
    <Link 
      href={`/auction/${id}`}
      className={cn(
        "block group rounded-lg overflow-hidden border bg-background transition-all", 
        "hover:shadow-md hover:shadow-purple-500/10 hover:-translate-y-1",
        isActive ? "border-border" : "border-gray-200 dark:border-gray-800"
      )}
    >
      <div className="aspect-square relative overflow-hidden bg-muted">
        <Image 
          src={image || "/placeholder-auction.jpg"} 
          alt={name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          priority={index < 6}
        />
      </div>
      <div className="p-4">
        <h3 className="font-medium text-lg line-clamp-1">{name}</h3>
        
        <div className="mt-2 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              {isCompleted ? "Winning bid" : "Current bid"}
            </p>
            <p className="font-semibold">{currentBid.toFixed(2)} LSK</p>
          </div>
          
          {!isCompleted ? (
            <div>
              <p className="text-xs text-muted-foreground mb-1 text-right">
                {isPast ? "Ended" : "Ends in"}
              </p>
              {isPast ? (
                <p className="text-sm text-muted-foreground text-right">Auction ended</p>
              ) : (
                <p className={cn(
                  "text-sm font-medium text-right",
                  isEnding ? "text-red-500" : "text-foreground"
                )}>
                  <TimeRemaining endTime={endTime} />
                </p>
              )}
            </div>
          ) : (
            <div>
              <p className="text-xs text-muted-foreground mb-1 text-right">Winner</p>
              <p className="text-sm font-medium text-right truncate max-w-[100px]">
                {winner.substring(0, 6)}...{winner.substring(winner.length - 4)}
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
