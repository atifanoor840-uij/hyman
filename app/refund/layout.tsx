import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy — GenzProp",
  description:
    "GenzProp refund policy: evaluation fees are non-refundable once activated, and refunded in full after your first payout from a funded account. Operated by Nexthorne Pvt Ltd.",
};

export default function RefundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
