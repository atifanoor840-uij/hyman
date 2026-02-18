import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { EconomicCalendarWidget } from "@/components/trading-view/economic-calendar-widget"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"

export default function CalendarPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <main className="min-w-0 flex-1 flex flex-col overflow-x-hidden p-3 sm:p-4 md:p-5 lg:ml-64 pb-8">
        <div className="mx-auto w-full max-w-[1200px] flex flex-col flex-1 min-w-0">
          <Header
            title="Economic Calendar"
            description="Track important economic events, news releases, and market announcements."
            variant="dashboard-hero"
            backHref="/dashboard"
            backLabel="Back"
            badge="Economic Calendar"
            actions={
              <Button className="w-full sm:w-auto h-9 rounded-lg text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:shadow-md gap-2">
                + Add Alert
              </Button>
            }
          />

          <div className="mt-5 flex-1 min-h-0">
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
              <EconomicCalendarWidget height={580} />
            </div>
          </div>

          <div className="mt-8">
            <Footer />
          </div>
        </div>
      </main>
    </div>
  )
}
