"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/use-wallet";
import { Check, ChevronDown, Copy, ExternalLink, LogOut, Wallet, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import ErrorManager from "@/utils/error-manager"; 

export function WalletConnect() {
  const { address, isConnected, balance, connect, disconnect, updateBalance } = useWallet();
  const [copied, setCopied] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

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

  const handleConnectOption = (walletType: string) => {
    connect(walletType);
    setDialogOpen(false);
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
            <p className="text-sm">
              {parseFloat(balance).toFixed(4)} LSK
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2 p-0 h-4"
                onClick={(e) => {
                  e.stopPropagation();
                  updateBalance && updateBalance();
                }}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </p>
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
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          <span className="hidden sm:inline-block">Connect Wallet</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>
            Choose a wallet to connect to the Lisk Auction Platform
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button 
            onClick={() => handleConnectOption("metamask")} 
            className="flex items-center justify-center gap-2"
          >
            <img src="/metamask.svg" alt="MetaMask" className="w-6 h-6" />
            <span>MetaMask</span>
          </Button>
          <Button 
            onClick={() => handleConnectOption("walletconnect")} 
            className="flex items-center justify-center gap-2"
            variant="outline"
          >
            <img src="/walletconnect.svg" alt="WalletConnect" className="w-6 h-6" />
            <span>WalletConnect</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}