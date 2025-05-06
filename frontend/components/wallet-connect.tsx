"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/use-wallet";
import { Check, ChevronDown, Copy, ExternalLink, LogOut, Wallet } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";

export function WalletConnect() {
  const { address, isConnected, balance, connect, disconnect } = useWallet();
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Address Copied",
        description: "Address copied to clipboard",
      });
    }
  };

  const viewOnExplorer = () => {
    if (address) {
      const explorerUrl = `https://explorer.sepolia.lisk.com/address/${address}`;
      window.open(explorerUrl, "_blank");
    }
  };

  if (isConnected && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <span className="truncate max-w-[100px] hidden md:inline-block">
              {address.substring(0, 6)}...{address.substring(address.length - 4)}
            </span>
            <span className="md:hidden">
              <Wallet className="h-4 w-4" />
            </span>
            <ChevronDown className="h-4 w-4" />
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
            <p className="text-xs font-medium">Balance</p>
            <p className="text-sm">{parseFloat(balance).toFixed(4)} LSK</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
            {copied ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            <span>{copied ? "Copied" : "Copy Address"}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={viewOnExplorer} className="cursor-pointer">
            <ExternalLink className="mr-2 h-4 w-4" />
            <span>View on Explorer</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={disconnect} className="cursor-pointer text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Disconnect</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button onClick={() => connect()} className="flex items-center gap-2">
      <Wallet className="h-4 w-4" />
      <span className="hidden sm:inline-block">Connect Wallet</span>
    </Button>
  );
}