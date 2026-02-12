"use client"

import React from "react";
import { useId } from "react";
import { 
  TrophyIcon, 
  RocketLaunchIcon, 
  AcademicCapIcon, 
  CalendarIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";

export function FeaturesSection() {
  return (
    <section className="relative py-16 lg:py-28 bg-gradient-to-br from-[#0a1f0a] via-[#0f5132] to-[#0a1f0a]">
      {/* Subtle background band for larger screens only */}
      <div className="hidden md:block absolute inset-x-0 top-1/2 -translate-y-1/2 h-40 bg-[#0f5132]/50" />

      {/* Mobile-first professional list */}
      <div className="md:hidden relative z-10 max-w-xl mx-auto px-5 space-y-3">
        {grid.slice(0, 4).map((feature) => (
          <div key={feature.title} className="group rounded-2xl border border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-md p-4 flex items-start gap-4 shadow-sm">
            <div className="shrink-0 h-11 w-11 rounded-xl bg-[#DEBF74] text-[#111827] flex items-center justify-center">
              {feature.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-white text-base font-semibold tracking-wide">{feature.title}</h3>
                <ChevronRightIcon className="w-5 h-5 text-white/40 group-hover:text-white/70 transition-colors" />
              </div>
              <p className="mt-1 text-sm text-white/60 leading-6">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop grid */}
      <div className="hidden md:grid relative z-10 max-w-6xl mx-auto grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-6">
        {grid.slice(0, 4).map((feature, index) => (
          <div
            key={feature.title}
            className={`bg-white dark:bg-neutral-950/80 rounded-2xl border border-white/10 shadow-xl px-8 py-10 text-center transition-transform duration-200 ${
              index % 2 === 1 ? "-translate-y-6" : "translate-y-0"
            }`}
          >
            <div className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-[#DEBF74] flex items-center justify-center text-[#111827]">
              {feature.icon}
            </div>
            <h3 className="text-neutral-900 dark:text-white text-lg font-semibold tracking-wide">
              {feature.title}
            </h3>
            <p className="mt-3 text-neutral-600 dark:text-neutral-400 leading-6">
              {feature.description}
            </p>
            <a href="#" className="mt-6 inline-flex items-center gap-2 font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
              Learn more
              <ChevronRightIcon className="w-4 h-4" />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

import { GiftIcon, UsersIcon, BanknotesIcon, SparklesIcon } from "@heroicons/react/24/outline";

const grid = [
  {
    title: "Dragon Club",
    description: "Unlock rewards with Dragon through community reviews and perks.",
    icon: <SparklesIcon className="w-9 h-9" />,
  },
  {
    title: "Lucky Draw",
    description: "Join weekly lucky draws for exciting rewards.",
    icon: <GiftIcon className="w-9 h-9" />,
  },
  {
    title: "Referral",
    description: "Invite friends and unlock rewards when they join Dragon.",
    icon: <UsersIcon className="w-9 h-9" />,
  },
  {
    title: "Unlock $10 Bonus",
    description: "Get a $10 bonus to kick-start your journey.",
    icon: <BanknotesIcon className="w-9 h-9" />,
  },
];

export const Grid = ({
  pattern,
  size,
}: {
  pattern?: number[][];
  size?: number;
}) => {
  const p = pattern ?? [
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
  ];
  return (
    <div className="pointer-events-none absolute left-1/2 top-0  -ml-20 -mt-2 h-full w-full [mask-image:linear-gradient(white,transparent)]">
      <div className="absolute inset-0 bg-gradient-to-r  [mask-image:radial-gradient(farthest-side_at_top,white,transparent)] dark:from-zinc-900/30 from-zinc-100/30 to-zinc-300/30 dark:to-zinc-900/30 opacity-100">
        <GridPattern
          width={size ?? 20}
          height={size ?? 20}
          x="-12"
          y="4"
          squares={p}
          className="absolute inset-0 h-full w-full  mix-blend-overlay dark:fill-white/10 dark:stroke-white/10 stroke-black/10 fill-black/10"
        />
      </div>
    </div>
  );
};

export function GridPattern({ width, height, x, y, squares, ...props }: any) {
  const patternId = useId();

  return (
    <svg aria-hidden="true" {...props}>
      <defs>
        <pattern
          id={patternId}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path d={`M.5 ${height}V.5H${width}`} fill="none" />
        </pattern>
      </defs>
      <rect
        width="100%"
        height="100%"
        strokeWidth={0}
        fill={`url(#${patternId})`}
      />
      {squares && (
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(([x, y]: any, i: number) => (
            <rect
              strokeWidth="0"
              key={`${x}-${y}-${i}`}
              width={width + 1}
              height={height + 1}
              x={x * width}
              y={y * height}
            />
          ))}
        </svg>
      )}
    </svg>
  );
}