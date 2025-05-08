// components/client-wallet-provider.tsx
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Create a loading placeholder
const LoadingProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

// Dynamically import the WalletProvider with SSR disabled
const DynamicWalletProvider = dynamic(
  () => import("@/hooks/use-wallet").then((mod) => mod.WalletProvider),
  { 
    ssr: false,
    loading: () => <LoadingProvider /> 
  }
);

export function ClientWalletProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only render provider when component is mounted on client
  if (!mounted) {
    return <>{children}</>;
  }

  return <DynamicWalletProvider>{children}</DynamicWalletProvider>;
}