"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { ethers, providers, Contract } from "ethers";
import { useToast } from "@/components/ui/use-toast";
import ErrorManager from '@/utils/error-manager';
import { EthereumProvider } from "@walletconnect/ethereum-provider";

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
      handleDisconnect();
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

  const handleDisconnect = useCallback(() => {
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

  const connect = useCallback(async (walletType?: string) => {
    if (isConnecting || isConnected) return;
    setIsConnecting(true);
    console.log("Starting wallet connection attempt with:", walletType);
    
    let userAddress: string;
    let ethersProvider: providers.Web3Provider;
    let network: ethers.providers.Network;
    let bigintBalance: ethers.BigNumber;
    let formattedBalance: string;

    try {
      switch(walletType) {
        case "walletconnect":
          try {
            const wcProvider = await EthereumProvider.init({
              projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string,
              chains: [CHAIN_ID],
              showQrModal: true,
              methods: ["eth_sendTransaction", "personal_sign"],
              events: ["chainChanged", "accountsChanged"],
            });
            
            await wcProvider.enable();
            const wcAccounts = await wcProvider.request({ method: 'eth_accounts' });
            userAddress = (wcAccounts as string[])[0];
            
            // Create ethers provider from WalletConnect
            ethersProvider = new providers.Web3Provider(wcProvider);
            setProvider(ethersProvider);
            
            // Get chain ID and balance
            network = await ethersProvider.getNetwork();
            setChainId(network.chainId);
            
            bigintBalance = await ethersProvider.getBalance(userAddress);
            formattedBalance = ethers.utils.formatEther(bigintBalance);
            setBalance(formattedBalance);
            
            // Set wallet state
            setAddress(userAddress);
            setIsConnected(true);
            
            // Save address for auto-reconnect
            localStorage.setItem("zenthra-wallet-address", userAddress);
            localStorage.setItem("zenthra-wallet-type", "walletconnect");
            
            // Add WalletConnect specific event listeners
            wcProvider.on("accountsChanged", handleAccountChange);
            wcProvider.on("chainChanged", handleChainChange);
            wcProvider.on("disconnect", () => {
              disconnect();
            });
          } catch (error) {
            console.error("WalletConnect initialization error:", error);
            const errorMessage = "Failed to initialize WalletConnect";
            if (ErrorManager.shouldShowError(errorMessage)) {
              toast({
                variant: "destructive",
                title: "Connection Failed",
                description: errorMessage
              });
            }
          }
          break;
          
        case "metamask":
        default:
          // MetaMask is the default
          if (!window.ethereum) {
            const errorMessage = "Please install MetaMask or another compatible wallet";
            if (ErrorManager.shouldShowError(errorMessage)) {
              toast({
                variant: "destructive",
                title: "No Ethereum Provider",
                description: errorMessage
              });
            }
            return;
          }
          
          // Existing MetaMask connection logic
          const mmAccounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          userAddress = mmAccounts[0];
          
          ethersProvider = new providers.Web3Provider(window.ethereum);
          setProvider(ethersProvider);
          
          // Get and set chain ID
          network = await ethersProvider.getNetwork();
          setChainId(network.chainId);
          
          if (parseInt(network.chainId.toString()) !== CHAIN_ID) {
            const errorMessage = `Please switch to Lisk chain ID ${CHAIN_ID}`;
            if (ErrorManager.shouldShowError(errorMessage)) {
              toast({
                variant: "destructive",
                title: "Wrong Network",
                description: errorMessage
              });
            }
          }
          
          // Get and set balance
          bigintBalance = await ethersProvider.getBalance(userAddress);
          formattedBalance = ethers.utils.formatEther(bigintBalance);
          setBalance(formattedBalance);
          
          // Set wallet state
          setAddress(userAddress);
          setIsConnected(true);
          
          // Save data for auto-reconnect
          localStorage.setItem("zenthra-wallet-address", userAddress);
          localStorage.setItem("zenthra-wallet-type", "metamask");
          
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
      
      const errorMessage = error instanceof Error ? error.message : "Failed to connect wallet";
      if (ErrorManager.shouldShowError(errorMessage)) {
        toast({
          variant: "destructive",
          title: "Connection Failed",
          description: errorMessage
        });
      }
    } finally {
      setIsConnecting(false);
    }
  }, [isConnected, isConnecting, toast, handleAccountChange, handleChainChange, disconnect, CHAIN_ID, address]);

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