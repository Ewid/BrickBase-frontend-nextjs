import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/Providers";
import RemoveWalletBadge from "@/components/RemoveWalletBadge";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BrickBase - Own the future with blockchain real estate",
  description: "Experience the future of real estate with NFTs and blockchain technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <main className="flex-grow">
            {children}
          </main>
          <RemoveWalletBadge />
        </Providers>
      </body>
    </html>
  );
}
