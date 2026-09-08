import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import WalletContextProvider from "@/components/WalletContextProvider";
import { Toaster } from "sonner";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BNBMint Launchpad — Create BEP-20 Meme Coins on BNB Smart Chain",
  description:
    "Deploy your own BEP-20 meme coin on BNB Smart Chain in minutes. No code required — no platform fee, just BNB Chain's own network gas costs.",
  metadataBase: new URL("https://bnbmint-launchpad.vercel.app"),
  openGraph: {
    title: "BNBMint Launchpad",
    description: "Create BEP-20 meme coins on BNB Smart Chain. Free, no platform fee.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}>
        <WalletContextProvider>
          <div className="relative min-h-screen overflow-x-hidden">
            <div className="press-bed pointer-events-none absolute inset-0 h-[640px]" />
            <div className="bg-grid-glow pointer-events-none absolute inset-0" />
            <div className="relative">
              <Navbar />
              {children}
            </div>
          </div>
          <Toaster theme="dark" position="bottom-right" richColors />
        </WalletContextProvider>
      </body>
    </html>
  );
}
