"use client";

import type React from "react";
import { Space_Grotesk, Syne } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { Navigation } from "@/components/navigation";
import { WalletProvider } from "@/hooks/use-wallet";
import { ApolloProvider } from "@apollo/client";
import { graphqlClient } from "@/lib/graphql-client";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
});

// Removed metadata export - it's now in metadata.ts

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Zenthra</title>
        <meta name="description" content="Decentralized auction platform built on the Lisk blockchain" />
      </head>
      <body
        className={cn(
          "min-h-screen font-sans antialiased",
          spaceGrotesk.variable,
          syne.variable
        )}
      >
        <ApolloProvider client={graphqlClient}>
          <WalletProvider>
            <div className="flex min-h-screen flex-col">
              <Navigation />
              <div className="flex-1">{children}</div>
            </div>
          </WalletProvider>
        </ApolloProvider>
      </body>
    </html>
  );
}
