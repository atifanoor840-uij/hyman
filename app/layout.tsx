import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import ChatWidget from "./components/ChatWidget";

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
    default: "Fx Genz — Trader Development & Skills Assessment Programs",
    template: "%s | Fx Genz",
  },
  description:
    "Fx Genz offers trader development programs and skills assessments. Educational trading evaluations on simulated accounts. Complete our forex evaluation program to demonstrate your trading discipline. No profit promises — verifiable, skill-based assessments.",
  keywords: [
    "trading challenge",
    "prop firm evaluation",
    "trader development program",
    "forex evaluation program",
    "skills assessment",
    "simulated accounts",
    "trading evaluations",
    "fx genz",
    "prop firm",
  ],
  openGraph: {
    title: "Fx Genz — Trader Development & Evaluation Programs",
    description: "Educational trader development programs and skills assessments. Simulated account evaluations for serious traders. Verifiable, skill-based — no profit promises.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${plusJakarta.variable} antialiased`}
      >
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
