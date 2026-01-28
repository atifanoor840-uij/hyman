import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { TradingContent } from "@/components/trading/trading-content"
import { Button } from "@/components/ui/button"

export default function TradingPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-4 lg:p-6 lg:ml-64">
        <Header
          title="Active Trades"
          description="Monitor and manage your open trading positions and pending orders."
          actions={
            <Button className="w-full sm:w-auto h-9 text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 hover:scale-105">
              + New Trade
            </Button>
          }
        />

        <div className="mt-6">
          <TradingContent />
        </div>
      </main>
    </div>
  )
}
