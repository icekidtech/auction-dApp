"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { WalletConnect } from "@/components/wallet-connect";
import { useWallet } from "@/hooks/use-wallet";

export function Navigation() {
  const pathname = usePathname();
  const { isConnected } = useWallet();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-display text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
              Zenthra
            </span>
          </Link>
        </div>
        <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
          <Link
            href="/"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/" 
                ? "text-foreground" 
                : "text-muted-foreground"
            )}
          >
            Explore
          </Link>
          
          <Link
            href="/create"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/create" 
                ? "text-foreground" 
                : "text-muted-foreground"
            )}
          >
            Create
          </Link>
          
          {/* Only show Dashboard when wallet is connected */}
          {isConnected && (
            <Link
              href="/dashboard"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/dashboard" 
                  ? "text-foreground" 
                  : "text-muted-foreground"
              )}
            >
              Dashboard
            </Link>
          )}
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <WalletConnect />
        </div>
      </div>
    </header>
  );
}
