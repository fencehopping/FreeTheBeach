import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Free The Beach | Coastal Merch for Shared Shorelines",
  description:
    "Beach people, common sense, shared shorelines. Free The Beach is a coastal merch brand and beach-access movement - stickers, hats, and gear. Not anti-bird, anti-overreach."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
