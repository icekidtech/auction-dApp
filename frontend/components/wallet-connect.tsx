"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import Image from "next/image";
import { useWallet } from "@/hooks/use-wallet";

const walletOptions = [
  {
    id: "lisk",
    name: "Lisk Wallet",
    logo: "/images/lisk-logo.png",
  },
  {
    id: "metamask",
    name: "MetaMask",
    logo: "/images/metamask-logo.png", 
  },
  {
    id: "walletconnect",
    name: "WalletConnect",
    logo: "/images/walletconnect-logo.png",
  },
];

export function WalletConnect() {
  const [isOpen, setIsOpen] = useState(false);
  const { connect, address, isConnected, disconnect } = useWallet();

  const handleConnect = async (walletId: string) => {
    try {
      await connect(walletId);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to connect:", error);
      // You could show an error message here
    }
  };

  return (
    <>
      {isConnected ? (
        <Button 
          onClick={disconnect}
          variant="outline"
          className="bg-green-50 text-green-900 hover:bg-green-100 border-green-300"
        >
          {`${address.substring(0, 6)}...${address.substring(address.length - 4)}`}
        </Button>
      ) : (
        <Button onClick={() => setIsOpen(true)}>
          Connect Wallet
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Wallet</DialogTitle>
            <DialogDescription>
              Choose a wallet to connect to Zenthra
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {walletOptions.map((wallet) => (
              <Button
                key={wallet.id}
                variant="outline"
                className="flex justify-start items-center gap-4 h-16"
                onClick={() => handleConnect(wallet.id)}
              >
                <div className="w-8 h-8 relative">
                  <Image
                    src={wallet.logo}
                    alt={wallet.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <span>{wallet.name}</span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}