import type { Metadata } from "next";

export function generateMetadata(): Metadata {
  return {
    title: "Zenthra",
    description: "Decentralized auction platform built on the Lisk blockchain",
    openGraph: {
      title: "Zenthra - Decentralized Auction Platform",
      description: "Discover, bid, and sell unique digital assets in a secure marketplace",
      images: ['/og-image.png'],
    },
    twitter: {
      card: "summary_large_image",
      title: "Zenthra - Decentralized Auction Platform",
      description: "Discover, bid, and sell unique digital assets",
      images: ['/og-image.png'],
    },
  };
}