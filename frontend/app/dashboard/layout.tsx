"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/use-wallet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageTitle } from "@/components/page-title";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isConnected, address, connect } = useWallet();
  const router = useRouter();

  // Redirect to homepage if not connected
  useEffect(() => {
    if (!isConnected) {
      // Try to connect first
      connect();
      // If still not connected after 2 seconds, redirect
      const timeout = setTimeout(() => {
        if (!isConnected) {
          router.push("/");
        }
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [isConnected, router, connect]);

  // Show loading state while checking connection
  if (!isConnected) {
    return (
      <div className="container py-20 flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="h-10 w-10 animate-spin text-purple-500 mb-4" />
        <h2 className="text-xl font-medium">Connecting wallet...</h2>
        <p className="text-muted-foreground mt-2">
          Please connect your wallet to view your dashboard
        </p>
      </div>
    );
  }

  return (
    <div className="container py-8 md:py-12">
      <PageTitle
        title="Dashboard"
        subtitle={`Manage your auctions and bids for account ${address?.substring(
          0,
          6
        )}...${address?.substring(address.length - 4)}`}
      />

      <Tabs defaultValue="overview" className="mt-8">
        <TabsList className="mb-8">
          <TabsTrigger 
            value="overview" 
            onClick={() => router.push("/dashboard")}
            className="px-4 py-3"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="created" 
            onClick={() => router.push("/dashboard/created")}
            className="px-4 py-3"
          >
            My Auctions
          </TabsTrigger>
          <TabsTrigger 
            value="bidding" 
            onClick={() => router.push("/dashboard/bidding")}
            className="px-4 py-3"
          >
            My Bids
          </TabsTrigger>
          <TabsTrigger 
            value="won" 
            onClick={() => router.push("/dashboard/won")}
            className="px-4 py-3"
          >
            Won Auctions
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">{children}</div>
      </Tabs>
    </div>
  );
}