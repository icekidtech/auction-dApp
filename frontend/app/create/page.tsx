"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/use-wallet";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { parseUnits } from "ethers"; // Changed from import { ethers } to import { parseUnits }
import { PageTitle } from "@/components/page-title";
import { Loader2, Calendar, Clock, Coins } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";

// Form validation schema
const formSchema = z.object({
  itemName: z.string().min(3, "Item name must be at least 3 characters"),
  itemDescription: z.string().min(10, "Description must be at least 10 characters"),
  imageUrl: z.string().url("Please enter a valid image URL"),
  startingBid: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    "Starting bid must be greater than 0"
  ),
  duration: z.string().refine(
    (val) => !isNaN(parseInt(val)) && parseInt(val) > 0, 
    "Duration must be a positive number"
  ),
});

export default function CreateAuctionPage() {
  const { isConnected, connect, contract } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Initialize form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itemName: "",
      itemDescription: "",
      imageUrl: "",
      startingBid: "0.1",
      duration: "3",
    },
  });

  // Try to connect wallet when page loads
  useEffect(() => {
    if (!isConnected) {
      connect();
    }
  }, [isConnected, connect]);

  // Submit handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!isConnected || !contract) {
      toast({
        variant: "destructive",
        title: "Wallet not connected",
        description: "Please connect your wallet to create an auction",
      });
      connect();
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert values to contract format
      const startingBid = parseUnits(values.startingBid, 8); // Fixed this line, 8 decimals for LSK
      const durationInHours = parseInt(values.duration);
      const endTimestamp = Math.floor(Date.now() / 1000) + durationInHours * 60 * 60;

      // Call contract method to create auction
      const tx = await contract.createAuction(
        values.itemName,
        values.imageUrl,
        startingBid,
        endTimestamp
      );

      toast({
        title: "Transaction submitted",
        description: "Your auction creation transaction has been sent to the blockchain",
      });

      // Wait for transaction to be mined
      await tx.wait();

      toast({
        title: "Auction created!",
        description: "Your auction has been successfully created",
      });

      // Redirect to home page
      router.push("/");
    } catch (error: any) {
      console.error("Error creating auction:", error);
      toast({
        variant: "destructive",
        title: "Failed to create auction",
        description: error.message || "An unknown error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // If not connected, show connect prompt
  if (!isConnected) {
    return (
      <div className="container py-20 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="max-w-md w-full space-y-8 text-center">
          <PageTitle 
            title="Connect Wallet" 
            subtitle="Please connect your wallet to create an auction"
            align="center"
          />
          <Button 
            onClick={() => connect()} 
            size="lg" 
            className="mt-6 w-full"
          >
            Connect Wallet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 md:py-12">
      <PageTitle
        title="Create Auction"
        subtitle="List a new item for auction on the Zenthra platform"
      />

      <div className="grid gap-8 mt-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="itemName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Unique Digital Artwork #123" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter a descriptive name for your auction item
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="itemDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your item in detail..." 
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a detailed description of what you're selling
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter a URL to an image of your item (IPFS links recommended)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="startingBid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Starting Bid (LSK)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input type="number" step="0.01" className="pl-9" {...field} />
                        </div>
                      </FormControl>
                      <FormDescription>
                        The minimum bid in LSK tokens
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (hours)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input type="number" min="1" className="pl-9" {...field} />
                        </div>
                      </FormControl>
                      <FormDescription>
                        How long the auction will run in hours
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Auction...
                    </>
                  ) : (
                    "Create Auction"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        <div>
          <div className="sticky top-20">
            <h3 className="text-lg font-medium mb-4">Auction Preview</h3>
            
            <Card className="overflow-hidden">
              <div className="aspect-square bg-muted flex items-center justify-center">
                {form.watch("imageUrl") ? (
                  <img 
                    src={form.watch("imageUrl")} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg?height=400&width=400";
                    }}
                  />
                ) : (
                  <div className="text-muted-foreground">Image Preview</div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium truncate">
                  {form.watch("itemName") || "Item Name"}
                </h3>
                <p className="text-sm text-muted-foreground truncate mt-1">
                  Starting bid: {form.watch("startingBid") || "0"} LSK
                </p>
                
                <div className="flex items-center mt-3 gap-2 text-sm">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Ends in: {form.watch("duration") || "0"} hours
                  </span>
                </div>
              </CardContent>
            </Card>

            <Alert className="mt-6">
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                Creating an auction will require a transaction on the Lisk blockchain. 
                Make sure your wallet has enough LSK to cover gas fees.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </div>
  );
}
