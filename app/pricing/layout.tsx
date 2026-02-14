import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trading Challenge Pricing — Fx Genz",
  description:
    "Transparent pricing for Fx Genz trader development programs. Choose your skills assessment — simulated account evaluations with refundable fees. Educational purposes only.",
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
