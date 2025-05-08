"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { ethers } from "ethers";

// Update the props interface to include auctionId
interface BidFormProps {
  currentBid: number;
  minIncrement: number;
  auctionId: string; // Add this property to fix the TypeScript error
}

export function BidForm({ currentBid, minIncrement, auctionId }: BidFormProps) {
  const [bidAmount, setBidAmount] = useState<number>(currentBid + minIncrement);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isConnected, address, contract } = useWallet();
  const { toast } = useToast();

  const handleBidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setBidAmount(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !contract) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to place a bid",
        variant: "destructive",
      });
      return;
    }
    
    if (bidAmount <= currentBid) {
      toast({
        title: "Bid too low",
        description: `Your bid must be higher than ${currentBid} LSK`,
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Convert LSK amount to smallest unit (assuming 8 decimals)
      const bidAmountInSmallestUnit = ethers.utils.parseUnits(
        bidAmount.toString(), 
        8
      );
      
      // Call the contract's placeBid function
      const tx = await contract.placeBid(auctionId, bidAmountInSmallestUnit);
      await tx.wait();
      
      toast({
        title: "Bid placed successfully!",
        description: `You've bid ${bidAmount} LSK on this auction`,
        variant: "default",
      });
      
      // Refresh the page to see the updated bid
      window.location.reload();
      
    } catch (error: any) {
      console.error("Error placing bid:", error);
      toast({
        title: "Failed to place bid",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label htmlFor="bid-amount" className="text-sm text-muted-foreground block mb-2">
            Your bid (LSK)
          </label>
          <Input
            id="bid-amount"
            type="number"
            value={bidAmount}
            onChange={handleBidChange}
            min={currentBid + 0.1}
            step={0.1}
            disabled={isSubmitting}
            className="bg-background"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Minimum bid: {(currentBid + minIncrement).toFixed(2)} LSK
          </p>
        </div>
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting || !isConnected || bidAmount <= currentBid}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Placing bid...
            </>
          ) : (
            `Place bid of ${bidAmount.toFixed(2)} LSK`
          )}
        </Button>
      </div>
    </form>
  );
}
