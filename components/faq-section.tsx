"use client"

import type React from "react"
import { useState } from "react"
import { ChevronDownIcon } from "@heroicons/react/24/outline"

type FAQCategory = {
  id: string
  title: string
  items: { question: string; answer: string }[]
}

const faqCategories: FAQCategory[] = [
  {
    id: "general-information",
    title: "General Information",
    items: [
      {
        question: "What type of firm is GenzProp?",
        answer:
          "GenzProp offers trader development programs and skills assessments. We provide educational evaluations on simulated accounts. Programs are for educational purposes — no profit guarantees.",
      },
      {
        question: "What platforms are used for evaluations?",
        answer:
          "We work with trusted platform providers. Simulated accounts are provided for our trading evaluation programs. Each evaluation uses our defined program parameters.",
      },
      {
        question: "What trading platforms are available?",
        answer:
          "We currently support cTrader and TradeLocker. Setup guides are available in your trader dashboard.",
      },
      {
        question: "Do you accept third-party payments?",
        answer: "No. Payments must come directly from the account holder.",
      },
      {
        question: "Are these simulated or real accounts?",
        answer:
          "Our programs use simulated accounts for skills assessments. Participants complete trader development evaluations. Eligibility for further program stages and payout terms are disclosed in full — no profit guarantees.",
      },
      {
        question: "Who can I contact for technical support?",
        answer:
          "Our support team is available via email and live chat through the GenzProp website.",
      },
      {
        question: "How should I handle taxes?",
        answer:
          "Traders are responsible for declaring and paying taxes according to their local regulations. GenzProp does not provide tax advice.",
      },
    ],
  },
  {
    id: "accounts-programs",
    title: "Accounts & Programs",
    items: [
      {
        question: "What account sizes are available?",
        answer:
          "We offer $3k, $5k, $10k, $25k, $50k, $100k, $200k, and $500k accounts.",
      },
      {
        question: "What programs do you offer?",
        answer:
          "Dragon Apex – Single phase\n\nDragon Prime – Two-phase\n\nSwing – Flexible for longer-term trades\n\nHFT Dragon – For high-frequency trading\n\nDragon Instant Pro – Instant access model",
      },
      {
        question: "What are the profit targets?",
        answer:
          "Dragon Apex & Dragon Prime: 10% (Dragon Prime: Phase 1 = 10%, Phase 2 = 5%)\n\nSwing: Stage 1 = 8%, Stage 2 = 5%\n\nHFT Dragon: 8%\n\nDragon Instant Pro: 10%",
      },
      {
        question: "What are the drawdown rules?",
        answer:
          "Daily Drawdown: 4–5% depending on account type\n\nMaximum Drawdown: 8–10% depending on account type",
      },
      {
        question: "What are the minimum trading days?",
        answer:
          "Dragon Apex & Dragon Prime: 4 days minimum\n\nSwing: Trades must close within 4 days (no long-term holding)\n\nHFT Dragon: Minimum 1 trade required\n\nDragon Instant Pro: 4 days minimum",
      },
    ],
  },
  {
    id: "trading-rules",
    title: "Trading Rules",
    items: [
      {
        question: "Can I hold trades overnight or on weekends?",
        answer:
          "Dragon Apex: Overnight & weekend holding not allowed\n\nDragon Prime & Swing: Overnight & weekend holding allowed\n\nHFT Dragon: Overnight holding not allowed\n\nDragon Instant Pro: Overnight & weekend holding not allowed",
      },
      {
        question: "Are EAs, scalping, or martingale allowed?",
        answer:
          "Dragon Apex, Dragon Prime, Swing: EAs, scalping, martingale not allowed\n\nHFT Dragon: EAs allowed in challenge phase (scalping & martingale still not allowed)\n\nDragon Instant Pro: EAs, scalping, martingale not allowed",
      },
      {
        question: "Is hedging and news trading allowed?",
        answer: "Yes, hedging and news trading are allowed on all accounts.",
      },
      {
        question: "What is the minimum trade duration?",
        answer:
          "Dragon Apex, Dragon Prime, HFT Dragon: 2 minutes 30 seconds (funded stage only)\n\nSwing: No minimum holding time\n\nDragon Instant Pro: 2 minutes 30 seconds (live account)",
      },
      {
        question: "Is there a consistency rule?",
        answer:
          "Dragon Apex & HFT Dragon: No single trading day should exceed 30% of total profits\n\nDragon Prime & Swing: No consistency rule\n\nDragon Instant Pro: No single trading day should exceed 30% of total profits",
      },
      {
        question: "What is your policy on gambling strategies?",
        answer:
          "Gambling-style trading (random entries, excessive leverage, or strategies without logic) is strictly prohibited.",
      },
      {
        question: "Are stop loss and take profit orders required?",
        answer: "No, they are not mandatory.",
      },
      {
        question: "What is classified as hedging and stacking?",
        answer:
          "Hedging (allowed): Opening opposing positions on the same instrument or correlated pairs.\n\nStacking/Layering (not allowed): Opening multiple identical positions rapidly in the same direction.",
      },
    ],
  },
  {
    id: "withdrawals-payouts",
    title: "Withdrawals & Payouts",
    items: [
      {
        question: "What is the payout process?",
        answer: "Payouts are processed within 15 business days (excluding weekends).",
      },
      {
        question: "What are the minimum withdrawal requirements?",
        answer:
          "Minimum withdrawal = $200\n\nMinimum withdrawal = 10% of account balance",
      },
      {
        question: "What payout methods are available?",
        answer: "Bank transfers and cryptocurrency.",
      },
      {
        question: "What is the profit split?",
        answer:
          "You keep 80–100% of profits. After your first payout, the profit split increases by 5%.",
      },
      {
        question: "Is the purchase fee refundable?",
        answer:
          "Yes, for accounts starting at $10k, the purchase fee is refunded after your first payout.",
      },
    ],
  },
  {
    id: "kyc-verification",
    title: "KYC & Verification",
    items: [
      {
        question: "What documents are required for verification?",
        answer:
          "Valid ID (Passport, Driving License, or National ID)\n\nProof of Address (utility bill, bank statement, or tax certificate)\n\nResidence permit (if applicable)",
      },
    ],
  },
  {
    id: "inactivity-validity",
    title: "Inactivity & Account Validity",
    items: [
      {
        question: "What happens if I’m inactive?",
        answer:
          "If you don’t open any trades within 30 days, your account will be marked as failed.",
      },
      {
        question: "What happens if my account becomes invalid?",
        answer:
          "You’ll be able to re-enroll in the skills assessment per program terms. Balances cannot be transferred between evaluation accounts.",
      },
    ],
  },
  {
    id: "bonuses-rewards",
    title: "Bonuses & Rewards",
    items: [
      {
        question: "Do you offer discount codes?",
        answer:
          "Yes:\n\nFLAME20 → 20% discount (for $3k–$25k accounts)\n\nVIP65 → 65% discount (for all accounts)",
      },
      {
        question: "What is the Dragon Club Rewards program?",
        answer:
          "Earn Dragon Points for completing activities.\n\n50 Points = $5 discount\n\n100 Points = $10 discount\n\nPoints can only be used for purchases (not refundable or exchangeable for cash).",
      },
      {
        question: "How can I earn Dragon Points?",
        answer:
          "Trustpilot Review = 50 Points ($5)\n\nVideo Review (30+ sec) = 100 Points ($10)\n\nReferrals & affiliate promotions also reward points.",
      },
    ],
  },
  {
    id: "affiliates",
    title: "Affiliates",
    items: [
      {
        question: "How does the affiliate program work?",
        answer:
          "Affiliates earn up to 20% commission per challenge purchase (including repeat customers).",
      },
      {
        question: "How do I become an affiliate?",
        answer:
          "Sign up via the Affiliate Program Page. Commissions are credited after each successful referral purchase.",
      },
    ],
  },
]

interface FAQItemProps {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}

const FAQItem = ({ question, answer, isOpen, onToggle }: FAQItemProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    onToggle()
  }
  return (
    <div
      className={`w-full bg-[rgba(231,236,235,0.08)] shadow-[0px_2px_4px_rgba(0,0,0,0.16)] overflow-hidden rounded-[10px] outline outline-1 outline-border outline-offset-[-1px] transition-all duration-300 ease-out cursor-pointer`}
      onClick={handleClick}
    >
      <div className="w-full px-5 py-[18px] pr-4 flex justify-between items-center gap-5 text-left transition-all duration-300 ease-out">
        <div className="flex-1 text-foreground text-base font-medium leading-6 break-words">{question}</div>
        <div className="flex justify-center items-center">
          <ChevronDownIcon
            className={`w-6 h-6 text-muted-foreground-dark transition-all duration-500 ease-out ${isOpen ? "rotate-180 scale-110" : "rotate-0 scale-100"}`}
          />
        </div>
      </div>
      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}
        style={{
          transitionProperty: "max-height, opacity, padding",
          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div
          className={`px-5 transition-all duration-300 ease-out ${isOpen ? "pb-[18px] pt-2 translate-y-0" : "pb-0 pt-0 -translate-y-2"}`}
        >
          <div className="text-foreground/80 text-sm font-normal leading-6 break-words">{answer}</div>
        </div>
      </div>
    </div>
  )
}

export function FAQSection() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())
  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id)
    } else {
      newOpenItems.add(id)
    }
    setOpenItems(newOpenItems)
  }
  return (
    <section className="w-full pt-[calc(66px+var(--promo-ticker-height))] pb-20 md:pb-40 px-5 relative flex flex-col justify-center items-center">
      <div className="w-[300px] h-[500px] absolute top-[150px] left-1/2 -translate-x-1/2 origin-top-left rotate-[-33.39deg] bg-primary/10 blur-[100px] z-0" />
      <div className="self-stretch pt-8 pb-8 md:pt-14 md:pb-14 flex flex-col justify-center items-center gap-2 relative z-10">
        <div className="flex flex-col justify-start items-center gap-4">
          <h2 className="w-full max-w-[700px] text-center text-foreground text-4xl font-semibold leading-10 break-words">
            Frequently Asked Questions
          </h2>
          <p className="self-stretch text-center text-muted-foreground text-sm font-medium leading-[18.20px] break-words">
            Organized by topic for clarity: General, Accounts & Programs, Trading Rules, Payouts, KYC, Inactivity, Rewards, Affiliates
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {faqCategories.map((cat) => (
              <a key={cat.id} href={`#${cat.id}`} className="text-xs px-3 py-1 rounded-full border border-border hover:border-foreground/30 transition-colors" style={{ color: '#DEBF74', borderColor: '#DEBF74' }}>
                {cat.title}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="w-full max-w-[900px] pt-0.5 pb-10 flex flex-col justify-start items-stretch gap-10 relative z-10">
        {faqCategories.map((category) => (
          <div key={category.id} id={category.id} className="space-y-4">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-semibold text-foreground">{category.title}</h3>
              <div className="h-[2px] flex-1" style={{ background: '#DEBF74' }} />
            </div>
            <div className="space-y-3">
              {category.items.map((faq, i) => {
                const id = `${category.id}-${i}`
                return (
                  <FAQItem key={id} {...faq} isOpen={openItems.has(id)} onToggle={() => toggleItem(id)} />
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
