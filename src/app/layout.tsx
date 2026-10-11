import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Buy & Sell | The Verified College Campus Marketplace",
  description:
    "Buy, sell, giveaway, and request textbooks, electronics, cycles, and dorm essentials with verified students on campus. Zero fees, real-time bargaining, safe meetup spots.",
  keywords: [
    "college marketplace",
    "campus buy and sell",
    "student textbooks",
    "used calculators",
    "campus cycle sale",
    "dorm essentials",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&family=Patrick+Hand&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Suspense fallback={<header className="glass-nav" style={{ height: "72px" }} />}>
          <Navbar />
        </Suspense>
        <main className="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
