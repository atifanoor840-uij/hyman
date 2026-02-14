import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trading Platforms — MT4, MT5, DXtrade",
  description:
    "Fx Genz supports MetaTrader 4, MetaTrader 5, and DXtrade for trading evaluations. Simulated account access on professional platforms for our forex evaluation program.",
};

export default function PlatformsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
