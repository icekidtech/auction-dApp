"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { ethers, providers, Contract } from "ethers";
import { useToast } from "@/components/ui/use-toast";

// Add this ABI directly in your file
const AuctionPlatformABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "auctionId",
        "type": "uint256"
      },
      // ... rest of your ABI ...
    ],
    "name": "AuctionCreated",
    "type": "event"
  },
  // ... rest of your ABI ...
];

declare global {
  interface Window {
    ethereum?: any;
    liskWallet?: any;
  }
}

// Define the shape of our wallet context
interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  balance: string;
  chainId: number | null;
  contract: Contract | null;
  connect: (walletType?: string) => Promise<void>;
  disconnect: () => void;
  isConnecting: boolean;
}

// Default context state
const defaultContext: WalletContextType = {
  address: null,
  isConnected: false,
  balance: "0",
  chainId: null,
  contract: null,
  connect: async () => {},
  disconnect: () => {},
  isConnecting: false,
};

// Create context
const WalletContext = createContext<WalletContextType>(defaultContext);

// Contract address from environment variable
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "4202");

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState("0");
  const [chainId, setChainId] = useState<number | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [provider, setProvider] = useState<providers.Web3Provider | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const handleAccountChange = (accounts: string[]) => {
    if (accounts.length === 0) {
      // User has disconnected their wallet
      disconnect();
    } else {
      // User has switched accounts
      setAddress(accounts[0]);
      toast({
        title: "Account Changed",
        description: `Switched to: ${accounts[0].substring(0, 6)}...${accounts[0].substring(accounts[0].length - 4)}`
      });
    }
  };

  const handleChainChange = () => {
    window.location.reload();
  };

  const connect = useCallback(async (walletType?: string) => {
    if (isConnecting || isConnected) return;
    setIsConnecting(true);
    console.log("Starting wallet connection attempt with:", walletType);
    
    try {
      // Store already shown errors in this session
      const shownErrors = new Set();
      
      // Handle different wallet types
      switch(walletType) {
        case "liskwallet":
          // Connect with Lisk Wallet
          if (!window.liskWallet) {
            const errorMessage = "Lisk wallet not detected. Please install Lisk Wallet extension.";
            if (!shownErrors.has(errorMessage)) {
              shownErrors.add(errorMessage);
              toast({
                variant: "destructive",
                title: "Lisk Wallet Not Found",
                description: errorMessage
              });
            }
            return;
          }
          
          // Lisk wallet connect implementation
          // This would use the LiskAuth implementation
          // For now, we'll mock this
          const liskAddress = await connectLiskWallet();
          setAddress(liskAddress);
          setIsConnected(true);
          break;
          
        case "walletconnect":
          // Implement WalletConnect
          const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
          if (!walletConnectProjectId) {
            const errorMessage = "WalletConnect configuration is missing";
            if (!shownErrors.has(errorMessage)) {
              shownErrors.add(errorMessage);
              toast({
                variant: "destructive",
                title: "Configuration Error",
                description: errorMessage
              });
            }
            return;
          }
          
          // WalletConnect implementation goes here
          // For now we'll default to MetaMask as fallback
          console.log("WalletConnect selected, falling back to MetaMask for now");
          
        case "metamask":
        default:
          // MetaMask is the default
          if (!window.ethereum) {
            const errorMessage = "Please install MetaMask or another compatible wallet";
            if (!shownErrors.has(errorMessage)) {
              shownErrors.add(errorMessage);
              toast({
                variant: "destructive",
                title: "No Ethereum Provider",
                description: errorMessage
              });
            }
            return;
          }
          
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          const userAddress = accounts[0];
          
          const ethersProvider = new providers.Web3Provider(window.ethereum);
          setProvider(ethersProvider);
          
          // Check we're on the right network
          const network = await ethersProvider.getNetwork();
          setChainId(network.chainId);
          
          if (network.chainId !== CHAIN_ID) {
            const errorMessage = `Please switch to Lisk chain ID ${CHAIN_ID}`;
            if (!shownErrors.has(errorMessage)) {
              shownErrors.add(errorMessage);
              toast({
                variant: "destructive",
                title: "Wrong Network",
                description: errorMessage
              });
            }
          }
          
          // Get and set balance
          const bigintBalance = await ethersProvider.getBalance(userAddress);
          const formattedBalance = ethers.utils.formatEther(bigintBalance);
          setBalance(formattedBalance);
          
          // Set wallet state
          setAddress(userAddress);
          setIsConnected(true);
          
          // Save address for auto-reconnect
          localStorage.setItem("zenthra-wallet-address", userAddress);
          
          // Add event listeners for account and chain changes
          window.ethereum.on('accountsChanged', handleAccountChange);
          window.ethereum.on('chainChanged', handleChainChange);
          break;
      }
      
      console.log("Wallet connected successfully:", address);
      
      toast({
        title: "Wallet Connected",
        description: `Connected to ${address?.substring(0,6)}...${address?.substring(address?.length-4) || ""}`
      });
    } catch (error) {
      console.error("Wallet connection error:", error);
      
      // Only show error toast once
      const errorMessage = error instanceof Error ? error.message : "Failed to connect wallet";
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: errorMessage
      });
    } finally {
      setIsConnecting(false);
    }
  }, [isConnected, isConnecting, toast, handleAccountChange, handleChainChange]);

  const connectLiskWallet = async () => {
    // This would be implemented with the actual Lisk Wallet connection flow
    // For now returning a mock address
    return "lsk24cd35u4jdq8szo3pnsqe5dsxwrnazyqqqg5eu";
  };

  const disconnect = useCallback(() => {
    setAddress(null);
    setIsConnected(false);
    setBalance("0");
    setChainId(null);
    setContract(null);
    localStorage.removeItem("zenthra-wallet-address");
    
    // Remove event listeners if they exist
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountChange);
      window.ethereum.removeListener('chainChanged', handleChainChange);
    }
    
    toast({
      title: "Disconnected",
      description: "Your wallet has been disconnected"
    });
  }, [toast]);

  useEffect(() => {
    const savedAddress = localStorage.getItem("zenthra-wallet-address");
    if (!isConnected && savedAddress) {
      connect();
    }
  }, [isConnected, connect]);

  useEffect(() => {
    const setupContract = async () => {
      if (provider && isConnected && CONTRACT_ADDRESS) {
        try {
          const signer = provider.getSigner();
          const contract = new Contract(
            CONTRACT_ADDRESS,
            AuctionPlatformABI,
            signer
          );
          setContract(contract);
        } catch (error) {
          console.error("Failed to set up contract:", error);
          toast({
            variant: "destructive",
            title: "Contract Setup Failed",
            description: "There was a problem setting up the contract. Please try again."
          });
        }
      }
    };

    setupContract();
  }, [provider, isConnected]);

  const value = {
    address,
    isConnected,
    balance,
    chainId,
    contract,
    connect,
    disconnect,
    isConnecting,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

// Custom hook for using the wallet context
export const useWallet = () => useContext(WalletContext);