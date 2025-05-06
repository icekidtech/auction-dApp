"use client";

import { useQuery, gql } from "@apollo/client";
import { useWallet } from "@/hooks/use-wallet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowRight, Package, Gavel, Trophy, History } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// GraphQL query for dashboard stats
const GET_USER_STATS = gql`
  query GetUserStats($address: String!) {
    auctionCreateds(where: {creatorAddress: $address}) {
      id
      auctionId
    }
    bidPlaceds(where: {bidderAddress: $address}) {
      id
      auctionId
      amount
    }
    auctionCompleteds(where: {winner: $address}) {
      id
      auctionId
      finalPrice
    }
  }
`;

export default function DashboardPage() {
  const { address } = useWallet();
  
  const { data, loading, error } = useQuery(GET_USER_STATS, {
    variables: { address: address || "" },
    skip: !address,
  });

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 mb-2">Error loading dashboard data</p>
        <p className="text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  // Calculate statistics from queried data
  const stats = {
    created: data?.auctionCreateds?.length || 0,
    bids: data?.bidPlaceds?.length || 0,
    won: data?.auctionCompleteds?.length || 0,
    totalSpent: data?.auctionCompleteds
      ? data.auctionCompleteds.reduce((sum: number, auction: any) => sum + parseInt(auction.finalPrice), 0)
      : 0,
  };

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <DashboardCard 
          title="Created Auctions" 
          value={stats.created} 
          description="Auctions you've created" 
          icon={<Package className="h-5 w-5" />}
          link="/dashboard/created"
        />
        <DashboardCard 
          title="Active Bids" 
          value={stats.bids} 
          description="Auctions you've bid on" 
          icon={<Gavel className="h-5 w-5" />}
          link="/dashboard/bidding"
        />
        <DashboardCard 
          title="Won Auctions" 
          value={stats.won} 
          description="Auctions you've won" 
          icon={<Trophy className="h-5 w-5" />}
          link="/dashboard/won"
        />
        <DashboardCard 
          title="Total Spent" 
          value={`${(stats.totalSpent / 1e8).toLocaleString()} LSK`} 
          description="Total LSK spent on auctions" 
          icon={<History className="h-5 w-5" />}
        />
      </div>

      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest auction activities</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.bidPlaceds && data.bidPlaceds.length > 0 ? (
              <div className="space-y-4">
                {data.bidPlaceds.slice(0, 5).map((bid: any) => (
                  <div key={bid.id} className="flex justify-between items-center border-b pb-3">
                    <div>
                      <p className="font-medium">Bid on Auction #{bid.auctionId}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(parseInt(bid.timestamp) * 1000).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{parseInt(bid.amount) / 1e8} LSK</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground py-4 text-center">No recent activity found</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button asChild>
          <Link href="/create" className="flex items-center gap-2">
            Create a New Auction <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function DashboardCard({ 
  title, 
  value, 
  description, 
  icon,
  link
}: { 
  title: string; 
  value: string | number; 
  description: string;
  icon: React.ReactNode;
  link?: string;
}) {
  const content = (
    <Card className="transition-all hover:border-purple-500/30 hover:shadow-sm hover:shadow-purple-500/10">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        <div className="rounded-full p-2 bg-purple-500/10 text-purple-500">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );

  if (link) {
    return <Link href={link}>{content}</Link>;
  }
  return content;
}
