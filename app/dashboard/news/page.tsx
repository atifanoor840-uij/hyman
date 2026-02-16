import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Footer } from "@/components/footer"
import { TimelineWidget } from "@/components/trading-view/timeline-widget"
import { NewsContent } from "@/components/news/news-content"

export default function NewsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <main className="min-w-0 flex-1 flex flex-col overflow-x-hidden p-3 sm:p-4 md:p-5 lg:ml-64 pb-8">
        <div className="mx-auto w-full max-w-[1200px] flex flex-col flex-1 min-w-0">
          <Header
            title="Market News"
            description="Real-time trading and market news from TradingView."
          />

          <div className="mt-5 flex-1 min-h-0">
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
              <TimelineWidget height={550} className="w-full" />
            </div>
          </div>

          <div className="mt-6">
            <NewsContent />
          </div>

          <div className="mt-8">
            <Footer />
          </div>
        </div>
      </main>
    </div>
  )
}
