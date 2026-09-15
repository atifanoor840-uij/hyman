"use client"

import type { ReactNode } from "react"
import { AdminSidebar } from "./admin-sidebar"
import { AdminTopbar } from "./admin-topbar"
import { Footer } from "@/components/footer"

export function AdminShell({
  title,
  description,
  actions,
  children,
}: {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      <main className="min-w-0 flex-1 flex flex-col overflow-x-hidden px-4 py-5 sm:px-6 lg:ml-64 lg:px-8 lg:py-6 pb-8">
        <div className="mx-auto w-full max-w-[1600px] flex flex-col flex-1 min-w-0">
          <AdminTopbar title={title} description={description} actions={actions} />
          <div className="mt-6 flex-1 min-w-0">{children}</div>
          <div className="mt-8">
            <Footer />
          </div>
        </div>
      </main>
    </div>
  )
}

