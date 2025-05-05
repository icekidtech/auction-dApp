"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface WalletContextType {
  isConnected: boolean;
  address: string;
  balance: string;
  connect: (walletType: string) => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("0");

  // Load wallet from localStorage on component mount
  useEffect(() => {
    const savedWallet = localStorage.getItem("zenthra_wallet");
    if (savedWallet) {
      const { address } = JSON.parse(savedWallet);
      setAddress(address);
      setIsConnected(true);
      // You would typically verify the connection is still valid here
    }
  }, []);

  const connect = async (walletType: string) => {
    try {
      console.log(`Connecting to ${walletType}...`);
      
      // Simulate wallet connection
      // In a real implementation, you would use the appropriate wallet SDK
      let connectedAddress = "";
      
      switch (walletType) {
        case "lisk":
          connectedAddress = "lskr9jn6nxnsv7cyv43w8rkgwq94zj5se9n2vvupq";
          break;
        case "metamask":
          connectedAddress = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
          break;
        case "walletconnect":
          connectedAddress = "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD";
          break;
      }
      
      // Save to state and localStorage
      setAddress(connectedAddress);
      setIsConnected(true);
      localStorage.setItem("zenthra_wallet", JSON.stringify({ 
        address: connectedAddress,
        walletType
      }));
      
      return Promise.resolve();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      return Promise.reject(error);
    }
  };

  const disconnect = () => {
    setAddress("");
    setIsConnected(false);
    setBalance("0");
    localStorage.removeItem("zenthra_wallet");
  };

  return (
    <WalletContext.Provider value={{ isConnected, address, balance, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}