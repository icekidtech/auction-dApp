// components/client-wallet-provider.tsx
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamically import the WalletProvider with SSR disabled
const DynamicWalletProvider = dynamic(
  () => import("@/hooks/use-wallet").then((mod) => mod.WalletProvider),
  { 
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }
);

export function ClientWalletProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only render wallet functionality when client-side
  if (!mounted) {
    return <>{children}</>;
  }

  return <DynamicWalletProvider>{children}</DynamicWalletProvider>;
}