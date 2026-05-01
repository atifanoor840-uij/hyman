import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { Suspense } from "react";
import Script from "next/script";
import "./globals.css";
import MetaPixel from "@/components/MetaPixel";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "GenzProp — Trader Development & Skills Assessment Programs",
    template: "%s | GenzProp",
  },
  description:
    "GenzProp offers trader development programs and skills assessments. Educational trading evaluations on simulated accounts. Complete our forex evaluation program to demonstrate your trading discipline. No profit promises — verifiable, skill-based assessments.",
  icons: {
    icon: [{ url: "/logo.png" }],
    apple: "/logo.png",
  },
  keywords: [
    "trading challenge",
    "prop firm evaluation",
    "trader development program",
    "forex evaluation program",
    "skills assessment",
    "simulated accounts",
    "trading evaluations",
    "GenzProp",
    "prop firm",
  ],
  openGraph: {
    title: "GenzProp — Trader Development & Evaluation Programs",
    description: "Educational trader development programs and skills assessments. Simulated account evaluations for serious traders. Verifiable, skill-based — no profit promises.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const metaPixelId =
    process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || "944876151762415";
  const metaPixelDebug = process.env.NEXT_PUBLIC_META_PIXEL_DEBUG === "true";

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${plusJakarta.variable} antialiased`}
      >
        {children}
        <Suspense fallback={null}>
          <MetaPixel pixelId={metaPixelId} debug={metaPixelDebug} />
        </Suspense>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
        <Script
          id="chatway"
          src="https://cdn.chatway.app/widget.js?id=Hwp2KLWVNhLU"
          strategy="afterInteractive"
          async
        />
      </body>
    </html>
  );
}
