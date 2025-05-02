"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wallet } from "lucide-react"
import { cn } from "@/lib/utils"

export function ConnectWalletButton() {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [inputValue, setInputValue] = useState("")

  const handleConnect = () => {
    if (inputValue.trim()) {
      setWalletAddress(inputValue)
      setIsConnected(true)
    }
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setWalletAddress("")
    setInputValue("")
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className={cn(
            "relative overflow-hidden group",
            isConnected
              ? "bg-purple-900/20 hover:bg-purple-900/30 text-purple-400"
              : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500",
          )}
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Wallet className="mr-2 h-4 w-4 relative z-10" />
          <span className="relative z-10">
            {isConnected ? walletAddress.slice(0, 6) + "..." + walletAddress.slice(-4) : "Connect Wallet"}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border border-purple-500/20 bg-background/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {isConnected ? "Wallet Connected" : "Connect Your Wallet"}
          </DialogTitle>
          <DialogDescription>
            {isConnected
              ? "Your wallet is connected to the Lisk blockchain."
              : "Enter your Lisk wallet address or connect with Web3."}
          </DialogDescription>
        </DialogHeader>
        {isConnected ? (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="connected-address">Connected Address</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="connected-address"
                  value={walletAddress}
                  readOnly
                  className="font-mono text-sm bg-background/50 border-purple-500/20 focus-visible:ring-purple-500/30"
                />
              </div>
              <Button
                onClick={handleDisconnect}
                variant="destructive"
                className="mt-2 bg-red-900/20 hover:bg-red-900/30 text-red-400 border border-red-500/20"
              >
                Disconnect Wallet
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="wallet-address">Lisk Wallet Address</Label>
              <Input
                id="wallet-address"
                placeholder="Enter your Lisk address"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="font-mono bg-background/50 border-purple-500/20 focus-visible:ring-purple-500/30"
              />
            </div>
            <Button
              onClick={handleConnect}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
            >
              Connect Wallet
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-purple-500/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            <Button variant="outline" className="border-purple-500/20 hover:bg-purple-500/10 hover:text-purple-400">
              Connect with Web3 Wallet
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
