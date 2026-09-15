"use client"

import type { ReactNode } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "./sidebar"

export function MobileNav({ sidebar }: { sidebar?: ReactNode }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 rounded-xl border-border bg-card lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 border-0 bg-[#0b1020] p-0 [&>button]:z-40 [&>button]:text-white">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        {sidebar ?? <Sidebar />}
      </SheetContent>
    </Sheet>
  )
}
