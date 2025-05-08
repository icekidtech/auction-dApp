"use client";

import type React from "react";
import { Space_Grotesk, Syne } from "next/font/google";
import localFont from "next/font/local";
import "@/styles/globals.css";
import { cn } from "@/lib/utils";
import { WalletProvider } from "@/hooks/use-wallet";
import { graphqlClient } from "@/lib/graphql-client";
import { ClientWalletProvider } from "@/components/client-wallet-provider";
import { ApolloWrapper } from "@/components/apollo-wrapper";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { UIReset } from "@/components/ui-reset";

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
      <body>
        <UIReset />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ApolloWrapper>
            <ClientWalletProvider>
              {children}
              <Toaster />
            </ClientWalletProvider>
          </ApolloWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
