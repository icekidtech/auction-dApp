"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/use-wallet";
import { Loader2, ExternalLink, Copy, Check, ChevronDown, LogOut, RefreshCw, Wallet } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ConnectWalletButton() {
  const { isConnected, isConnecting, address, balance, connect, disconnect, updateBalance } = useWallet();
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleConnect = async () => {
    if (isConnecting || isDebouncing) return;
    
    setIsDebouncing(true);
    try {
      await connect();
    } finally {
      // Wait a bit before allowing another click
      setTimeout(() => {
        setIsDebouncing(false);
      }, 2000);
    }
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard",
      });
      
      // Reset copy state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const viewOnExplorer = () => {
    if (address) {
      // Using Liskscan as the explorer, adjust URL if needed
      window.open(`https://liskscan.com/address/${address}`, '_blank');
    }
  };

  const handleRefreshBalance = () => {
    if (updateBalance) {
      updateBalance();
      toast({
        title: "Balance refreshed",
        description: "Your wallet balance has been updated",
      });
    }
  };

  // When not connected, show a simple connect button
  if (!isConnected || !address) {
    return (
      <Button 
        onClick={handleConnect} 
        disabled={isConnecting || isDebouncing}
      >
        {isConnecting || isDebouncing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet
          </>
        )}
      </Button>
    );
  }

  // When connected, show the address with dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <span className="text-green-500 h-2 w-2 rounded-full bg-green-500 mr-1" aria-hidden="true" />
          <span className="truncate max-w-[100px]">
            {address.substring(0, 6)}...{address.substring(address.length - 4)}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <div className="p-2">
          <p className="text-sm font-medium">Connected Wallet</p>
          <p className="text-xs text-muted-foreground truncate mt-1">
            {address}
          </p>
        </div>
        
        <DropdownMenuSeparator />
        
        <div className="p-2">
          <p className="text-xs text-muted-foreground">Balance</p>
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium">
              {Number(balance).toFixed(4)} LSK
            </p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0"
              onClick={handleRefreshBalance}
            >
              <RefreshCw className="h-3 w-3" />
              <span className="sr-only">Refresh balance</span>
            </Button>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
          {copied ? (
            <Check className="mr-2 h-4 w-4" />
          ) : (
            <Copy className="mr-2 h-4 w-4" />
          )}
          <span>Copy Address</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={viewOnExplorer} className="cursor-pointer">
          <ExternalLink className="mr-2 h-4 w-4" />
          <span>View on Explorer</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={disconnect} 
          className="cursor-pointer text-red-500 focus:text-red-500"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Disconnect</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
