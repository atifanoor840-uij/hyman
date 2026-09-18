"use client";
/* Bar height h-10 (2.5rem) must match --promo-ticker-height in app/globals.css */

import { useEffect } from "react";
import { BadgePercent, Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { usePublicCoupons } from "@/hooks/use-public-coupons";

function CodePill({ code }: { code: string }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast({ title: "Copied", description: `${code} copied to clipboard.` });
    } catch {
      toast({ title: "Could not copy", description: "Try copying the code manually.", variant: "destructive" });
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
      aria-label={`Copy promo code ${code}`}
    >
      <span>Code: {code}</span>
      <Copy className="h-3.5 w-3.5 opacity-90" aria-hidden />
    </button>
  );
}

function Segment({
  labelPrefix,
  boldOffer,
  code,
}: {
  labelPrefix: string;
  boldOffer: string;
  code: string;
}) {
  return (
    <div className="flex shrink-0 items-center justify-center gap-2 sm:gap-2.5">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15">
        <BadgePercent className="h-4 w-4 text-white" aria-hidden />
      </span>
      <p className="text-center text-xs font-medium text-white sm:text-sm">
        <span className="whitespace-nowrap">{labelPrefix} </span>
        <span className="font-bold">{boldOffer}</span>
      </p>
      <CodePill code={code} />
    </div>
  );
}

export default function PromoTicker() {
  const coupons = usePublicCoupons();
  const hidden = coupons !== null && coupons.length === 0;

  // With nothing to advertise the bar disappears, so pull the navbar back up.
  useEffect(() => {
    const root = document.documentElement.style;
    if (hidden) root.setProperty("--promo-ticker-height", "0px");
    else root.removeProperty("--promo-ticker-height");
  }, [hidden]);

  if (hidden) return null;

  return (
    <div
      className="fixed left-0 right-0 top-0 z-[101] flex h-10 items-center border-b border-purple-400/30 bg-gradient-to-r from-purple-800 via-purple-950 to-purple-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
      style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}
      role="region"
      aria-label="Promotional offers"
    >
      <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-center gap-4 overflow-x-auto px-3 py-0 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-10 sm:px-6 [&::-webkit-scrollbar]:hidden">
        {coupons?.map((coupon, i) => (
          <div key={coupon.code} className="flex shrink-0 items-center gap-4 sm:gap-10">
            {i > 0 && <div className="h-4 w-px shrink-0 bg-white/25" aria-hidden />}
            <Segment
              labelPrefix={i === 0 ? "Limited Promo:" : "Promo:"}
              boldOffer={`${coupon.discountPercent}% OFF`}
              code={coupon.code}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
