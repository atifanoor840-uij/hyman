import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { TradingContent } from "@/components/trading/trading-content"
import { Button } from "@/components/ui/button"

export default function TradingPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="min-w-0 flex-1 flex flex-col overflow-x-hidden p-3 sm:p-4 md:p-5 lg:ml-64 pb-8">
        <div className="mx-auto w-full max-w-[1600px] flex flex-col flex-1 min-w-0">
        <Header
          title="Active Trades"
          description="Monitor and manage your open trading positions and pending orders."
          variant="dashboard-hero"
          backHref="/dashboard"
          backLabel="Back"
          badge="Active Trades"
          actions={
            <Button className="w-full sm:w-auto h-9 rounded-lg text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 hover:scale-105">
              + New Trade
            </Button>
          }
        />

        <div className="mt-6">
          <TradingContent />
        </div>
        </div>
      </main>
    </div>
  )
}
