// Create a new file: components/client-wallet-provider.tsx
"use client";

import { WalletProvider } from "@/hooks/use-wallet";

export function ClientWalletProvider({ children }: { children: React.ReactNode }) {
  return <WalletProvider>{children}</WalletProvider>;
}