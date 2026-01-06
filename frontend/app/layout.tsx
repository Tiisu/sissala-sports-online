import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Sissala Sports Online - Upper West Region, Ghana",
  description: "Official platform for Sissala Sports Online. Follow live scores, team standings, player statistics, and the latest football news from Upper West Region, Ghana.",
  keywords: ["Sissala", "Football", "League", "Ghana", "Upper West", "Soccer", "Sports", "Sissala Sports Online"],
  authors: [{ name: "Sissala Sports Online" }],
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://sissalaleague.com",
    title: "Sissala Sports Online",
    description: "Official platform for Sissala Sports Online",
    siteName: "Sissala Sports Online",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
