import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { BillingContent } from "@/components/billing/billing-content"
import { Footer } from "@/components/footer"

export default function BillingPage() {
  return (
    <div className="flex min-h-screen bg-background font-sans">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <main className="min-w-0 flex-1 flex flex-col overflow-x-hidden p-3 sm:p-4 md:p-5 lg:ml-64 font-sans pb-8">
        <div className="mx-auto w-full max-w-[1200px] flex flex-col flex-1 min-w-0">
          <Header
            title="Billing"
            description="View your account orders, payment history, and billing information."
            variant="dashboard-hero"
            backHref="/dashboard"
            backLabel="Back"
            badge="Billing"
          />

          <div className="mt-5 flex-1">
            <BillingContent />
          </div>

          <div className="mt-8">
            <Footer />
          </div>
        </div>
      </main>
    </div>
  )
}
