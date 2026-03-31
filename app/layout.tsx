import type { Metadata } from "next";
import { Manrope, IBM_Plex_Mono } from "next/font/google";
import { Suspense } from "react";
import { Toaster } from "sonner";

import "@/app/globals.css";
import { TrackingProvider } from "@/components/privacy/tracking-provider";
import { env } from "@/lib/config/env";

const headingFont = Manrope({
  subsets: ["latin"],
  variable: "--font-heading"
});

const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"]
});

export const metadata: Metadata = {
  title: "Meta Dashboard",
  description: "Private internal dashboard for Meta business messaging, leads, ads, archive, and audit workflows."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${headingFont.variable} ${monoFont.variable} antialiased`}>
        {children}
        <Suspense fallback={null}>
          <TrackingProvider
            policyVersion={env.NEXT_PUBLIC_PRIVACY_POLICY_VERSION}
            privacyPolicyPath={env.NEXT_PUBLIC_PRIVACY_POLICY_PATH}
          />
        </Suspense>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
