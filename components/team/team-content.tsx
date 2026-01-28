"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, MoreHorizontal } from "lucide-react"

const teamMembers = [
  {
    name: "Alexandra Deff",
    role: "Senior Forex Trader",
    email: "alexandra@forexpro.com",
    status: "active",
    trades: 247,
    profit: "+$12,450",
    avatar: "/avatars/avatar-1.jpg",
    initials: "AD",
  },
  {
    name: "Edwin Adenike",
    role: "Account Manager",
    email: "edwin@forexpro.com",
    status: "active",
    trades: 189,
    profit: "+$8,920",
    avatar: "/avatars/avatar-2.jpg",
    initials: "EA",
  },
  {
    name: "Isaac Oluwatemilorun",
    role: "Forex Analyst",
    email: "isaac@forexpro.com",
    status: "away",
    trades: 156,
    profit: "+$9,340",
    avatar: "/avatars/avatar-3.jpg",
    initials: "IO",
  },
  {
    name: "David Oshodi",
    role: "Trading Specialist",
    email: "david@forexpro.com",
    status: "active",
    trades: 203,
    profit: "+$11,280",
    avatar: "/avatars/avatar-4.jpg",
    initials: "DO",
  },
]

export function TeamContent() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member, index) => (
          <Card
            key={member.email}
            className="p-6 hover:shadow-lg transition-all duration-300 animate-slide-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <Avatar className="w-16 h-16 border-2 border-primary/20">
                <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                <AvatarFallback>{member.initials}</AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-lg">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </div>

              <Badge variant={member.status === "active" ? "default" : "secondary"}>
                {member.status === "active" ? "Active" : "Away"}
              </Badge>

              <div className="pt-2 border-t border-border space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Trades</span>
                  <span className="font-semibold">{member.trades}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Profit/Loss</span>
                  <span className="font-semibold text-black dark:text-foreground">{member.profit}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Mail className="w-4 h-4 mr-1" />
                  Email
                </Button>
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Phone className="w-4 h-4 mr-1" />
                  Call
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
