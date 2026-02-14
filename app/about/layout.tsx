import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Fx Genz — Prop Firm Trading Evaluations",
  description:
    "Fx Genz offers trader development programs and skills assessments. Educational forex evaluation program on simulated accounts. Verifiable, skill-based — no profit promises.",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
