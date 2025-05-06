"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { LiskBridgeAdapter } from "../../blockchain/ignition/modules/lisk-adapter";
import { ethers } from "ethers";

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  connect: () => Promise<void>; // Make sure it returns a promise
  disconnect: () => void;
  contract: ethers.Contract | null; // Add this property
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState("0");
  const [walletType, setWalletType] = useState<string | null>(null);

  // Load wallet from localStorage on component mount
  useEffect(() => {
    const savedWallet = localStorage.getItem("zenthra_wallet");
    if (savedWallet) {
      const { address, walletType } = JSON.parse(savedWallet);
      setAddress(address);
      setWalletType(walletType);
      setIsConnected(true);
      
      // Verify the connection is still valid
      verifyConnection(walletType);
    }
  }, []);

  // Verify wallet is still connected
  const verifyConnection = async (walletTypeToVerify: string) => {
    try {
      switch (walletTypeToVerify) {
        case "metamask":
          if (window.ethereum) {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length === 0) {
              // User has disconnected wallet from site
              disconnect();
            }
          } else {
            disconnect();
          }
          break;
          
        case "lisk":
          // Check if Lisk wallet is still connected
          // Implementation would depend on Lisk SDK
          break;
          
        case "walletconnect":
          // WalletConnect handles session management internally
          break;
      }
    } catch (error) {
      console.error("Error verifying connection:", error);
      disconnect();
    }
  };

  const connect = async (walletTypeToConnect: string) => {
    try {
      console.log(`Connecting to ${walletTypeToConnect}...`);
      let connectedAddress = "";
      
      switch (walletTypeToConnect) {
        case "lisk":
          // Import Lisk wallet SDK dynamically to avoid issues in SSR
          try {
            // Replace with actual Lisk connection code
            // This is a placeholder for Lisk wallet connection
            const liskAddress = await connectToLiskWallet();
            if (liskAddress) connectedAddress = liskAddress;
          } catch (error) {
            console.error("Error connecting to Lisk wallet:", error);
            throw new Error("Failed to connect to Lisk wallet");
          }
          break;
          
        case "metamask":
          if (!window.ethereum) {
            window.open("https://metamask.io/download/", "_blank");
            throw new Error("MetaMask not installed");
          }
          
          try {
            // Request account access
            const accounts = await window.ethereum.request({ 
              method: 'eth_requestAccounts' 
            });
            
            if (accounts[0]) {
              connectedAddress = accounts[0];
              
              // Get balance
              const balance = await window.ethereum.request({
                method: 'eth_getBalance',
                params: [accounts[0], 'latest'],
              });
              
              setBalance(parseInt(balance, 16).toString());
              
              // Set up listeners for account changes
              window.ethereum.on('accountsChanged', handleAccountsChanged);
            }
          } catch (error) {
            console.error("MetaMask connection error:", error);
            throw error;
          }
          break;
          
        case "walletconnect":
          try {
            // WalletConnect v2 integration
            const { EthereumProvider } = await import("@walletconnect/ethereum-provider");
            
            const provider = await EthereumProvider.init({
              projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "", // Get from WalletConnect dashboard
              chains: [1], // Add chain IDs you want to support
              showQrModal: true,
            });
            
            await provider.connect();
            
            const wcAccounts = provider.accounts;
            if (wcAccounts[0]) {
              connectedAddress = wcAccounts[0];
            }
            
            provider.on("accountsChanged", handleAccountsChanged);
          } catch (error) {
            console.error("WalletConnect error:", error);
            throw error;
          }
          break;
      }
      
      if (!connectedAddress) {
        throw new Error("Failed to get address from wallet");
      }
      
      // Save to state and localStorage
      setAddress(connectedAddress);
      setWalletType(walletTypeToConnect);
      setIsConnected(true);
      localStorage.setItem("zenthra_wallet", JSON.stringify({ 
        address: connectedAddress,
        walletType: walletTypeToConnect
      }));
      
      return Promise.resolve();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      return Promise.reject(error);
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      disconnect();
    } else {
      // User switched accounts
      setAddress(accounts[0]);
      localStorage.setItem("zenthra_wallet", JSON.stringify({
        address: accounts[0],
        walletType
      }));
    }
  };

  const disconnect = () => {
    // Perform wallet-specific disconnect actions
    if (walletType === "walletconnect") {
      // WalletConnect specific disconnect
      // This would depend on how you initialized WalletConnect
    }
    
    // Cleanup event listeners if any
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    }
    
    setAddress(null);
    setIsConnected(false);
    setBalance("0");
    setWalletType(null);
    localStorage.removeItem("zenthra_wallet");
  };

  // Placeholder for Lisk wallet connection
  const connectToLiskWallet = async () => {
    // This should be replaced with actual Lisk SDK integration
    
    // Example code structure (replace with actual implementation):
    // 1. Check if Lisk wallet extension is available
    const liskWalletAvailable = false; // Replace with actual check
    
    if (!liskWalletAvailable) {
      // Redirect to Lisk wallet download or show instructions
      throw new Error("Lisk wallet not available");
    }
    
    // 2. Connect to wallet and get address
    // const address = await liskWallet.connect();
    // return address;
    
    // For now, we'll use a placeholder address to make the UI work
    return "lskr9jn6nxnsv7cyv43w8rkgwq94zj5se9n2vvupq";
  };

  return (
    <WalletContext.Provider value={{ 
      isConnected, 
      address, 
      balance, 
      connect, 
      disconnect,
      walletType,
      contract: null // Placeholder for contract
    }}>
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

// TypeScript support for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, listener: (...args: any[]) => void) => void;
      removeListener: (event: string, listener: (...args: any[]) => void) => void;
    };
  }
}