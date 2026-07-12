import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { GlobalFeatures } from "@/components/global-features";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#071225",
};

export const metadata: Metadata = {
  title: "SmartBus — Never wait for a bus blindly again",
  description:
    "Real-time GPS school bus tracking for students, parents, drivers and transport administrators.",
  keywords: ["bus tracking", "school bus", "GPS", "SmartBus", "real-time"],
  metadataBase: new URL("https://smartbus.app"),
  openGraph: {
    title: "SmartBus — Never wait for a bus blindly again",
    description:
      "A premium real-time GPS school bus tracking platform for students, parents, drivers and transport teams.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans min-h-screen bg-background text-white antialiased`}
        style={{ colorScheme: "dark" }}
      >
        <Providers>
          <GlobalFeatures />
          {children}
        </Providers>
      </body>
    </html>
  );
}
