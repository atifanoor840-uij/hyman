import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Start Your Trader Development Program",
  description:
    "Sign up for Fx Genz skills assessments. Educational trading evaluations on simulated accounts. Demonstrate your trading discipline — no profit promises. Verifiable, skill-based programs.",
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
