"use client";

import Link from "next/link";
import { ConnectWalletButton } from "@/components/connect-wallet-button";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useWallet } from "@/hooks/use-wallet";

export function SiteHeader() {
  const pathname = usePathname();
  const { isConnected } = useWallet();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-display text-xl font-bold">
            Zenthra
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link 
              href="/"
              className={cn(
                "transition-colors hover:text-foreground/80", 
                pathname === "/" ? "text-foreground" : "text-foreground/60"
              )}
            >
              Home
            </Link>
            
            {/* Only show Create and Dashboard when wallet is connected */}
            {isConnected && (
              <>
                <Link 
                  href="/create"
                  className={cn(
                    "transition-colors hover:text-foreground/80", 
                    pathname === "/create" ? "text-foreground" : "text-foreground/60"
                  )}
                >
                  Create
                </Link>
                <Link 
                  href="/dashboard"
                  className={cn(
                    "transition-colors hover:text-foreground/80", 
                    pathname === "/dashboard" ? "text-foreground" : "text-foreground/60"
                  )}
                >
                  Dashboard
                </Link>
              </>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <ConnectWalletButton />
        </div>
      </div>
    </header>
  );
}