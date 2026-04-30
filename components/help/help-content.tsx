"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, BookOpen, Video, MessageCircle, Mail } from "lucide-react"

const helpCategories = [
  {
    icon: BookOpen,
    title: "Documentation",
    description: "Browse our comprehensive guides and tutorials",
    color: "bg-purple-600",
  },
  { icon: Video, title: "Video Tutorials", description: "Watch step-by-step video guides", color: "bg-purple-500" },
  {
    icon: MessageCircle,
    title: "Community Forum",
    description: "Connect with other users and get answers",
    color: "bg-black",
  },
  { icon: Mail, title: "Contact Support", description: "Get help from our support team", color: "bg-amber-500" },
]

const faqs = [
  {
    question: "How do I open a new trade?",
    answer: "Click the 'New Trade' button on the dashboard or Trading page to open a new trading position.",
  },
  {
    question: "Can I add more traders to my account?",
    answer: "Yes, go to the Traders page and click 'Add Trader' to add new trading team members.",
  },
  {
    question: "How do I monitor market hours?",
    answer: "Use the Market Hours widget on the dashboard to see current trading session times and market status.",
  },
  {
    question: "Can I export my trading reports?",
    answer: "Yes, you can export your trading data and reports from the Analytics page using the Export Report button.",
  },
]

export function HelpContent() {
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search for help..." className="pl-10 h-12" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {helpCategories.map((category, index) => (
          <Card
            key={category.title}
            className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer animate-slide-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${category.color}`}>
                <category.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">{category.title}</h3>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-6">Frequently Asked Questions</h3>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={faq.question}
              className="p-4 rounded-lg border border-border hover:bg-secondary transition-all duration-300 animate-slide-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <h4 className="font-medium mb-2">{faq.question}</h4>
              <p className="text-sm text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
