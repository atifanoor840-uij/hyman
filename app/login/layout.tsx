import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description:
    "Log in to your Fx Genz account. Access your skills assessment dashboard and manage your trader development programs.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
