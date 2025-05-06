"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { ethers, BrowserProvider, Contract } from "ethers";
import AuctionPlatform from "@/artifacts/contracts/AuctionPlatform.sol/AuctionPlatform.json";
import { useToast } from "@/components/ui/use-toast";

// Define the shape of our wallet context
interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  balance: string;
  chainId: number | null;
  contract: Contract | null;
  connect: (walletType?: string) => Promise<void>;
  disconnect: () => void;
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
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const { toast } = useToast();

  // Auto-reconnect on startup
  useEffect(() => {
    const savedAddress = localStorage.getItem("zenthra-wallet-address");
    if (savedAddress) {
      connect();
    }
  }, []);

  // Update contract when provider or address changes
  useEffect(() => {
    const setupContract = async () => {
      if (provider && isConnected && CONTRACT_ADDRESS) {
        try {
          const signer = await provider.getSigner();
          const contract = new Contract(
            CONTRACT_ADDRESS,
            AuctionPlatform.abi,
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

  // Network change handler
  const handleNetworkChange = async () => {
    if (provider) {
      try {
        const network = await provider.getNetwork();
        setChainId(Number(network.chainId));
        
        // Check if we're on the right network
        if (Number(network.chainId) !== CHAIN_ID) {
          toast({
            variant: "destructive",
            title: "Wrong Network",
            description: `Please switch to the correct network (Chain ID: ${CHAIN_ID})`
          });
        }
      } catch (error) {
        console.error("Error getting network:", error);
      }
    }
  };

  // Connect wallet
  const connect = async (walletType?: string) => {
    if (typeof window === 'undefined' || typeof window.ethereum === 'undefined') {
      toast({
        variant: "destructive",
        title: "Wallet Not Found",
        description: "Please install a Web3 wallet like MetaMask"
      });
      return;
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const connectedAddress = accounts[0];
      
      // Create provider
      const ethersProvider = new BrowserProvider(window.ethereum);
      setProvider(ethersProvider);
      
      // Get and set balance
      const bigintBalance = await ethersProvider.getBalance(connectedAddress);
      const formattedBalance = ethers.formatEther(bigintBalance);
      setBalance(formattedBalance);
      
      // Set wallet state
      setAddress(connectedAddress);
      setIsConnected(true);
      
      // Save address for auto-reconnect
      localStorage.setItem("zenthra-wallet-address", connectedAddress);
      
      // Check network
      await handleNetworkChange();
      
      // Add event listeners
      window.ethereum.on('accountsChanged', handleAccountChange);
      window.ethereum.on('chainChanged', handleChainChange);
      
      toast({
        title: "Connected",
        description: `Wallet connected: ${connectedAddress.substring(0, 6)}...${connectedAddress.substring(connectedAddress.length - 4)}`
      });
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again."
      });
    }
  };

  // Disconnect wallet
  const disconnect = () => {
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
  };

  // Handle account change
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

  // Handle chain change
  const handleChainChange = () => {
    window.location.reload();
  };

  // Context value
  const value = {
    address,
    isConnected,
    balance,
    chainId,
    contract,
    connect,
    disconnect,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

// Custom hook for using the wallet context
export const useWallet = () => useContext(WalletContext);