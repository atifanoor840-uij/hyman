"use client"

import { AdminSidebar } from "./sidebar"
import { AdminHeader } from "./header"
import type { ReactNode } from "react"

interface PageContainerProps {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
}

export function AdminPageContainer({ title, description, actions, children }: PageContainerProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>
      <main className="min-w-0 flex-1 flex flex-col overflow-x-hidden p-3 md:p-4 lg:p-5 lg:ml-64">
        <div className="mx-auto w-full max-w-[1400px] flex flex-col flex-1">
          <AdminHeader title={title} description={description} actions={actions} />
          <div className="mt-4 md:mt-5 flex-1 min-w-0">{children}</div>
        </div>
      </main>
    </div>
  )
}
