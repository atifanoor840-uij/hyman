"use client";

import CardNav, { type CardNavItem } from "@/components/CardNav";
import Image from "next/image";

export default function PointerNavbar() {
  const items: CardNavItem[] = [
    { label: "Trading", bgColor: "bg-slate-800", textColor: "text-white", links: [
      { label: "Features", href: "#features-section", ariaLabel: "Features" },
      { label: "Symbols", href: "/symbols", ariaLabel: "Symbols" },
      { label: "Economic Calendar", href: "/economic-calendar", ariaLabel: "Economic Calendar" },
      { label: "Heatmap", href: "/heatmap", ariaLabel: "Heatmap" },
      { label: "Platform", href: "/platform", ariaLabel: "Platform" },
    ] },
    { label: "Accounts", bgColor: "bg-slate-800", textColor: "text-white", links: [
      { label: "Account Types", href: "/account-types", ariaLabel: "Account Types" },
      { label: "Rules", href: "/rules", ariaLabel: "Rules" },
      { label: "Payouts", href: "/payouts", ariaLabel: "Payouts" },
    ] },
    { label: "Dragon Club", bgColor: "bg-slate-800", textColor: "text-white", links: [
      { label: "Dragon Club", href: "/programs", ariaLabel: "Dragon Club" },
      { label: "Lucky Draw", href: "/programs/lucky-draw", ariaLabel: "Lucky Draw" },
      { label: "Dragon Special", href: "/programs/dragon-special", ariaLabel: "Dragon Special" },
      { label: "Claim $10", href: "/programs/claim-10", ariaLabel: "Claim 10" },
    ] },
    { label: "Support", bgColor: "bg-slate-800", textColor: "text-white", links: [
      { label: "FAQs", href: "/faqs", ariaLabel: "FAQs" },
      { label: "Contact", href: "/contact", ariaLabel: "Contact" },
      { label: "Live Chat", href: "/dashboard/live-chat", ariaLabel: "Live Chat" },
    ] },
    { label: "More", bgColor: "bg-slate-800", textColor: "text-white", links: [
      { label: "Features", href: "#features-section", ariaLabel: "Features" },
      { label: "Pricing", href: "#pricing-section", ariaLabel: "Pricing" },
      { label: "Terms", href: "/legal/terms", ariaLabel: "Terms" },
      { label: "Privacy", href: "/legal/privacy", ariaLabel: "Privacy" },
    ] },
  ];

  return (
    <CardNav
      logo="https://res.cloudinary.com/dufcjjaav/image/upload/v1760892554/dragon_funded_logo-01-01-01_bkaqko.png"
      logoAlt="Dragon Funded"
      items={items}
      baseColor="#ffffff"
      menuColor="#0f172a"
      buttonBgColor="#DEBF74"
      buttonTextColor="#111827"
      className=""
    />
  );
}





