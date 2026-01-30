"use client"

import { useEffect, useState } from "react"
import { Search, Mail, Bell, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MobileNav } from "./mobile-nav"
import { getMyAccount, type Order } from "@/lib/api/auth"
import { getUser } from "@/lib/auth-utils"
import type { ReactNode } from "react"

interface HeaderProps {
  title?: string
  description?: string
  actions?: ReactNode
  useOrderIdSelect?: boolean
}

const saleTickerText = "🔥 Sale — 20% off challenges • Use code WELCOME20 • Limited time • "

export function Header({ title, description, actions, useOrderIdSelect }: HeaderProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string>("")
  const [userData, setUserData] = useState<{ name: string; email: string } | null>(null)

  useEffect(() => {
    // Get user data from storage
    const user = getUser()
    if (user) {
      setUserData({
        name: user.name || user.username || 'User',
        email: user.email || ''
      })
    }

    // Fetch orders if order select is enabled
    if (useOrderIdSelect) {
      fetchOrders()
    }
  }, [useOrderIdSelect])

  const fetchOrders = async () => {
    setIsLoadingOrders(true)
    try {
      const response = await getMyAccount()
      setOrders(response.orders || [])
      
      // Auto-select first order if available
      if (response.orders && response.orders.length > 0) {
        setSelectedOrderId(response.orders[0].order_id)
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      setOrders([])
    } finally {
      setIsLoadingOrders(false)
    }
  }

  const getUserInitials = () => {
    if (!userData?.name) return 'U'
    const names = userData.name.split(' ')
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return userData.name.substring(0, 2).toUpperCase()
  }

  return (
    <header className="space-y-3 md:space-y-4 animate-slide-in-up">
      <div className="relative -mx-3 -mt-3 overflow-hidden border-b border-border bg-primary py-2.5 md:-mx-4 md:-mt-4 lg:-mx-5 lg:-mt-5">
        <div className="flex w-max animate-ticker whitespace-nowrap text-sm font-semibold text-primary-foreground">
          <span>{saleTickerText.repeat(6)}</span>
          <span aria-hidden="true">{saleTickerText.repeat(6)}</span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <MobileNav />

          <div className="relative flex-1 max-w-md">
            {useOrderIdSelect ? (
              <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                <SelectTrigger className="w-full h-9 text-sm font-bold bg-card border-border transition-all duration-300 focus:shadow-lg focus:shadow-primary/10 [&_[data-slot=select-value]]:font-bold" disabled={isLoadingOrders}>
                  {isLoadingOrders ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Loading orders...</span>
                    </div>
                  ) : (
                    <SelectValue placeholder={orders.length === 0 ? "No orders found" : "Select Order ID"} />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {orders.length === 0 && !isLoadingOrders ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                      No orders available
                    </div>
                  ) : (
                    orders.map((order) => (
                      <SelectItem key={order.order_id} value={order.order_id} className="font-bold">
                        <div className="flex flex-col">
                          <span>{order.order_id}</span>
                          <span className="text-xs font-normal text-muted-foreground">
                            {order.challenge_type} • ${order.account_size}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            ) : (
              <>
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search trades, pairs..."
                  className="pl-9 pr-3 md:pr-16 h-9 text-sm bg-card border-border transition-all duration-300 focus:shadow-lg focus:shadow-primary/10"
                />
                <kbd className="hidden md:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground bg-muted rounded border border-border">
                  ⌘F
                </kbd>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 md:gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-secondary transition-all duration-300 hover:scale-110 h-8 w-8"
          >
            <Mail className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-secondary transition-all duration-300 hover:scale-110 h-8 w-8"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-destructive rounded-full animate-pulse" />
          </Button>

          <div className="flex items-center gap-2 pl-2 md:pl-3 border-l border-border">
            <Avatar className="w-7 h-7 md:w-8 md:h-8 ring-2 ring-primary/20 transition-all duration-300 hover:ring-primary/40">
              <AvatarImage src="/profile.jpg" alt={userData?.name || 'User'} />
              <AvatarFallback className="text-xs">{getUserInitials()}</AvatarFallback>
            </Avatar>
            <div className="text-xs hidden sm:block">
              <p className="font-semibold text-foreground">{userData?.name || 'User'}</p>
              <p className="text-muted-foreground text-[10px]">{userData?.email || ''}</p>
            </div>
          </div>
        </div>
      </div>

      {title != null && (
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-1">{title}</h1>
          {description != null && (
            <p className="text-xs md:text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      {actions && <div className="flex flex-col sm:flex-row gap-2">{actions}</div>}
    </header>
  )
}
