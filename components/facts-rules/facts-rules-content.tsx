"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, AlertTriangle } from "lucide-react"

const rules = [
  {
    title: "Trading rules",
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
    items: [
      "One account per person. Multiple accounts require approval.",
      "Expert Advisors (EAs) and copy trading are allowed.",
      "Consistency rule: no single day may exceed 40% of total profit target.",
      "Same login and server must be used for evaluation and funded account.",
    ],
  },
  {
    title: "General rules",
    items: [
      "You must be 18+ and comply with your jurisdiction’s laws.",
      "We reserve the right to amend rules. Changes apply to new evaluations only.",
      "Abuse, manipulation, or arbitrage strategies may result in account termination.",
    ],
  },
]

export function FactsRulesContent() {
  return (
    <div className="space-y-8 animate-fade-in">
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Rules
        </h2>
        <div className="space-y-4">
          {rules.map((group, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="px-5 py-4 border-b border-border bg-muted/30">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  {group.title}
                </h3>
              </div>
              <ul className="divide-y divide-border">
                {group.items.map((item, j) => (
                  <li key={j} className="px-5 py-3 flex gap-3">
                    <Badge variant="outline" className="shrink-0 h-5 w-5 p-0 rounded-full flex items-center justify-center text-[10px] font-bold border-primary/30 text-primary">
                      {j + 1}
                    </Badge>
                    <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
