"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  TrendingDown,
  Percent,
  Calendar,
  Shield,
  Activity,
  Scale,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const rules = [
  {
    title: "Trading rules",
    description: "Core limits for your evaluation and funded account.",
    icon: Activity,
    iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    items: [
      "Maximum daily loss: 5% of initial balance. Trading halts until next day if reached.",
      "Maximum total drawdown: 10% of initial balance. Account fails if exceeded.",
      "Profit target Phase 1: 8%. Phase 2: 5%.",
      "Minimum trading days: 4 in Phase 1, 4 in Phase 2.",
      "Overnight and weekend holding allowed. No max position hold time.",
    ],
  },
  {
    title: "Account & risk rules",
    description: "Account usage and risk management requirements.",
    icon: Shield,
    iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    items: [
      "One account per person. Multiple accounts require approval.",
      "Expert Advisors (EAs) and copy trading are allowed.",
      "Consistency rule: no single day may exceed 40% of total profit target.",
      "Same login and server must be used for evaluation and funded account.",
    ],
  },
  {
    title: "General rules",
    description: "Terms and compliance requirements.",
    icon: Scale,
    iconBg: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    items: [
      "You must be 18+ and comply with your jurisdiction's laws.",
      "We reserve the right to amend rules. Changes apply to new evaluations only.",
      "Abuse, manipulation, or arbitrage strategies may result in account termination.",
    ],
  },
]

const quickRef = [
  { label: "Max daily loss", value: "5%", icon: TrendingDown },
  { label: "Max drawdown", value: "10%", icon: Percent },
  { label: "Min trading days", value: "4 + 4", icon: Calendar },
]

export function FactsRulesContent() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Quick reference strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {quickRef.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-border bg-card px-4 py-3 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <item.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {item.label}
              </p>
              <p className="text-lg font-bold text-foreground tabular-nums">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Rule sections */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {rules.map((group, i) => (
          <Card
            key={i}
            className="overflow-hidden border-border shadow-sm hover:shadow-md transition-shadow"
          >
            <CardHeader className="border-b border-border bg-muted/20 px-6 py-4">
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${group.iconBg}`}
                >
                  <group.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-foreground">
                    {group.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {group.description}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y divide-border">
                {group.items.map((item, j) => (
                  <li
                    key={j}
                    className="flex gap-4 px-6 py-4 hover:bg-muted/20 transition-colors"
                  >
                    <span className="flex h-7 min-w-[28px] shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {j + 1}
                    </span>
                    <span className="text-sm text-foreground/90 leading-relaxed pt-0.5">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Full rules CTA */}
      <div className="rounded-xl border border-border bg-gradient-to-br from-muted/50 to-muted/20 px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-semibold text-foreground">
            Need full rules & pricing by account size?
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            View the complete rules, phase-by-phase limits, and pricing for all account sizes.
          </p>
        </div>
        <Button variant="outline" size="sm" className="shrink-0 h-9 rounded-lg gap-2" asChild>
          <Link href="/rules">
            <ExternalLink className="h-4 w-4" />
            View full rules
          </Link>
        </Button>
      </div>
    </div>
  )
}
