"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useEffect, useState } from "react";
import Link from "next/link";

interface AuctionCardProps {
  id: string;
  name: string;
  image: string;
  currentBid: number;
  endTime: Date;
  featured?: boolean;
  index?: number;
  creatorAddress?: string;
}

export function AuctionCard({ 
  id, 
  name, 
  image, 
  currentBid, 
  endTime, 
  featured, 
  index = 0,
  creatorAddress
}: AuctionCardProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    expired: boolean;
  }>({
    days: 0,
    hours: 0, 
    minutes: 0,
    seconds: 0,
    expired: false
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endTime.getTime() - new Date().getTime();
      
      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          expired: true
        };
      }
      
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        expired: false
      };
    };
    
    // Set initial time left
    setTimeLeft(calculateTimeLeft());
    
    // Update timer every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <Link href={`/auction/${id}`}>
      <Card 
        className={`overflow-hidden transition-all duration-300 hover:shadow-md hover:shadow-purple-500/10 hover:border-purple-500/30 ${
          featured ? "border-purple-500/40 bg-purple-500/5" : ""
        }`}
        style={{
          animationDelay: `${index * 150}ms`,
        }}
      >
        <CardHeader className="p-0">
          <div className="aspect-[4/3] relative overflow-hidden">
            <img
              src={image}
              alt={name}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            />
            
            <div className="absolute top-2 right-2 flex gap-2">
              {featured && (
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">Featured</Badge>
              )}
              
              {timeLeft.expired ? (
                <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                  Ended
                </Badge>
              ) : timeLeft.days === 0 && timeLeft.hours < 12 ? (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                  Ending Soon
                </Badge>
              ) : null}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <h3 className="font-medium truncate">{name}</h3>
          <p className="text-xs text-muted-foreground truncate mt-1">By {creatorAddress?.substring(0, 16)}...</p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Current bid</p>
            <p className="font-semibold">{currentBid.toLocaleString()} LSK</p>
          </div>
          
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Ends in</p>
            <p className="font-mono text-sm">
              {timeLeft.expired ? (
                <span className="text-red-500">Ended</span>
              ) : timeLeft.days > 0 ? (
                `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`
              ) : (
                `${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`
              )}
            </p>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
