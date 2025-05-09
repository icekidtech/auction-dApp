"use client";

import type React from "react";
import { Space_Grotesk, Syne } from "next/font/google";
import localFont from "next/font/local";
import "@/styles/globals.css";
import { cn } from "@/lib/utils";
import { ClientWalletProvider } from "@/components/client-wallet-provider";
import { ApolloWrapper } from "@/components/apollo-wrapper";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { SiteHeader } from "@/components/site-header";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
});

const calSans = localFont({
  src: "../public/fonts/CalSans-SemiBold.woff2", // Option 1: Full path
  variable: "--font-cal-sans",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          spaceGrotesk.variable,
          syne.variable,
          calSans.variable
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <ApolloWrapper>
            <ClientWalletProvider>
              <div className="relative flex min-h-screen flex-col">
                <SiteHeader />
                <div className="flex-1">{children}</div>
              </div>
              <Toaster />
            </ClientWalletProvider>
          </ApolloWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
