import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { TradingContent } from "@/components/trading/trading-content"
import { AdvancedChartWidget } from "@/components/trading-view/advanced-chart-widget"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"

export default function TradingPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <main className="min-w-0 flex-1 flex flex-col overflow-x-hidden p-3 sm:p-4 md:p-5 lg:ml-64 pb-8">
        <div className="mx-auto w-full max-w-[1200px] flex flex-col flex-1 min-w-0">
          <Header
            title="Active Trades"
            description="Monitor and manage your open trading positions and pending orders."
            variant="dashboard-hero"
            backHref="/dashboard"
            backLabel="Back"
            badge="Active Trades"
            actions={
              <Button className="w-full sm:w-auto h-9 rounded-lg text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:shadow-md gap-2">
                + New Trade
              </Button>
            }
          />

          <div className="mt-5 flex-1 space-y-4">
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
              <AdvancedChartWidget symbol="FX:EURUSD" height={380} />
            </div>
            <TradingContent />
          </div>

          <div className="mt-8">
            <Footer />
          </div>
        </div>
      </main>
    </div>
  )
}
