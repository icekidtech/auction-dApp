"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/use-wallet";
import { Loader2, ExternalLink } from "lucide-react";

export function ConnectWalletButton() {
  const { isConnected, isConnecting, address, connect, disconnect } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);

  // Debounced connect function to prevent multiple triggers
  const handleConnect = async () => {
    if (isProcessing || isConnecting) return;
    
    setIsProcessing(true);
    try {
      await connect();
    } finally {
      // Add a slight delay before allowing another connection attempt
      setTimeout(() => {
        setIsProcessing(false);
      }, 1000);
    }
  };

  if (isConnected && address) {
    return (
      <Button 
        variant="outline" 
        onClick={disconnect}
        className="flex items-center gap-2"
      >
        <span className="truncate max-w-[120px]">
          {address.substring(0, 6)}...{address.substring(address.length - 4)}
        </span>
        <ExternalLink className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button 
      onClick={handleConnect} 
      disabled={isProcessing || isConnecting}
    >
      {isProcessing || isConnecting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        "Connect Wallet"
      )}
    </Button>
  );
}
