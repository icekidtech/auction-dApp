"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ConnectWalletButton } from "@/components/connect-wallet-button"
import { ModeToggle } from "@/components/mode-toggle"
import { Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export function Navigation() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrollPosition > 50 ? "backdrop-blur-xl bg-background/80 border-b border-accent/20" : "bg-transparent",
        )}
      >
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="font-display text-xl font-bold text-white">L</span>
              </div>
              <span className="font-display text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
                LiskAuction
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={cn(
                "relative font-medium text-sm transition-colors hover:text-purple-400",
                pathname === "/" ? "text-purple-400" : "text-foreground/70",
              )}
            >
              Home
              {pathname === "/" && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500" />
              )}
            </Link>
            <Link
              href="/create"
              className={cn(
                "relative font-medium text-sm transition-colors hover:text-purple-400",
                pathname === "/create" ? "text-purple-400" : "text-foreground/70",
              )}
            >
              Create
              {pathname === "/create" && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500" />
              )}
            </Link>
            <Link
              href="/dashboard"
              className={cn(
                "relative font-medium text-sm transition-colors hover:text-purple-400",
                pathname === "/dashboard" ? "text-purple-400" : "text-foreground/70",
              )}
            >
              Dashboard
              {pathname === "/dashboard" && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500" />
              )}
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <ModeToggle />
            <ConnectWalletButton />
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-background/95 backdrop-blur-lg transition-transform duration-300 md:hidden",
          isMenuOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex justify-end p-4">
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="flex flex-col items-center justify-center h-[calc(100vh-80px)] gap-8">
          <Link
            href="/"
            className={cn(
              "text-2xl font-display font-bold transition-colors",
              pathname === "/" ? "text-purple-400" : "text-foreground/70",
            )}
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/create"
            className={cn(
              "text-2xl font-display font-bold transition-colors",
              pathname === "/create" ? "text-purple-400" : "text-foreground/70",
            )}
            onClick={() => setIsMenuOpen(false)}
          >
            Create
          </Link>
          <Link
            href="/dashboard"
            className={cn(
              "text-2xl font-display font-bold transition-colors",
              pathname === "/dashboard" ? "text-purple-400" : "text-foreground/70",
            )}
            onClick={() => setIsMenuOpen(false)}
          >
            Dashboard
          </Link>
        </nav>
      </div>
    </>
  )
}
