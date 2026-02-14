import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trading Rules — Evaluation Guidelines",
  description:
    "Fx Genz skills assessment rules and guidelines. Clear evaluation parameters and program conditions for our trader development programs on simulated accounts. Educational purposes.",
};

export default function RulesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
