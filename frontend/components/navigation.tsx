"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { WalletConnect } from "@/components/wallet-connect";
import { useWallet } from "@/hooks/use-wallet";
import {
  Search,
  Compass,
  PlusCircle,
  LayoutDashboard,
  Menu,
  X,
  ChevronDown,
  Bell,
  Sparkles,
  TrendingUp,
  Clock,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Navigation() {
  const pathname = usePathname();
  const { isConnected } = useWallet();
  const [scrolled, setScrolled] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled 
          ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b shadow-sm" 
          : "bg-transparent"
      )}
    >
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-purple-500" />
            <span className="font-display text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
              Zenthra
            </span>
          </Link>
        </div>
        
        {/* Desktop Search Bar */}
        <div className="hidden md:flex relative mx-4 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search auctions, collections, and items..." 
              className="w-full py-2 pl-10 pr-4 rounded-full bg-accent/30 border border-accent/10 placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/30"
            />
          </div>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-accent/50 transition-colors">
                <Compass className="h-4 w-4" />
                <span>Explore</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-48">
              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                <TrendingUp className="h-4 w-4" />
                <span>Trending</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                <Clock className="h-4 w-4" />
                <span>Ending Soon</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/" className="w-full cursor-pointer">View All Auctions</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Link 
            href="/create" 
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-accent/50 transition-colors",
              pathname === "/create" && "bg-purple-500/10 text-purple-500"
            )}
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create</span>
          </Link>
          
          {isConnected && (
            <Link 
              href="/dashboard" 
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-accent/50 transition-colors",
                pathname === "/dashboard" && "bg-purple-500/10 text-purple-500"
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          )}
        </nav>
        
        {/* Right Side - Authentication & Notifications */}
        <div className="ml-auto flex items-center gap-2">
          {/* Mobile Search Toggle */}
          <button 
            className="md:hidden flex items-center justify-center h-9 w-9 rounded-full bg-accent/30 hover:bg-accent/50 transition-colors"
            onClick={() => setMobileSearch(!mobileSearch)}
          >
            <Search className="h-4 w-4" />
          </button>
          
          {isConnected && (
            <button className="hidden sm:flex items-center justify-center h-9 w-9 rounded-full bg-accent/30 hover:bg-accent/50 transition-colors">
              <Bell className="h-4 w-4" />
            </button>
          )}
          
          {/* Wallet Connect Button */}
          <div className="ml-2">
            <WalletConnect />
          </div>
          
          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <button className="flex items-center justify-center h-9 w-9 rounded-full bg-accent/30 hover:bg-accent/50 transition-colors ml-1">
                  <Menu className="h-4 w-4" />
                </button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>
                    <div className="flex items-center">
                      <Sparkles className="h-5 w-5 text-purple-500 mr-2" />
                      <span className="font-display text-lg bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
                        Zenthra
                      </span>
                    </div>
                  </SheetTitle>
                </SheetHeader>
                
                <nav className="flex flex-col gap-2 mt-6">
                  <Link 
                    href="/" 
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-accent/50 transition-colors",
                      pathname === "/" && "bg-purple-500/10 text-purple-500"
                    )}
                  >
                    <Compass className="h-5 w-5" />
                    <span className="font-medium">Explore</span>
                  </Link>
                  
                  <Link 
                    href="/create" 
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-accent/50 transition-colors",
                      pathname === "/create" && "bg-purple-500/10 text-purple-500"
                    )}
                  >
                    <PlusCircle className="h-5 w-5" />
                    <span className="font-medium">Create</span>
                  </Link>
                  
                  {isConnected && (
                    <Link 
                      href="/dashboard" 
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-accent/50 transition-colors",
                        pathname === "/dashboard" && "bg-purple-500/10 text-purple-500"
                      )}
                    >
                      <LayoutDashboard className="h-5 w-5" />
                      <span className="font-medium">Dashboard</span>
                    </Link>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      
      {/* Mobile Search Bar - Expandable */}
      {mobileSearch && (
        <div className="md:hidden container py-2 pb-3 animate-in fade-in slide-in-from-top duration-300">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search auctions..." 
              className="w-full py-2 pl-10 pr-4 rounded-full bg-accent/30 border border-accent/10 placeholder:text-muted-foreground/70 focus:outline-none"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
}
