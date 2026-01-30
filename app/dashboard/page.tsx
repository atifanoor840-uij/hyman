import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { ProjectAnalytics } from "@/components/dashboard/project-analytics"
import { ChallengeStatsCards } from "@/components/dashboard/challenge-stats-cards"
import { ProjectProgress } from "@/components/dashboard/project-progress"
import { MT5PlatformCard } from "@/components/dashboard/mt5-platform-card"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <main className="min-w-0 flex-1 flex flex-col overflow-x-hidden p-3 md:p-4 lg:p-5 lg:ml-64">
        <div className="mx-auto w-full max-w-[1400px] flex flex-col flex-1">
          <Header
            title="Forex Trading Dashboard"
            description="Monitor your trading performance, analyze market trends, and manage your positions."
            useOrderIdSelect
            actions={
              <div className="flex w-full justify-end">
                <Button asChild className="h-9 text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:shadow-md gap-2">
                  <Link href="/buys">
                    <ShoppingCart className="h-4 w-4" />
                    Buy Challenge
                  </Link>
                </Button>
              </div>
            }
          />

          <div className="mt-4 md:mt-5 space-y-3 md:space-y-4 flex-1 min-w-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4 min-w-0">
              <div className="lg:col-span-2 space-y-3 md:space-y-4 min-w-0">
                <ProjectAnalytics />
                <ChallengeStatsCards />
              </div>

              <div className="space-y-3 md:space-y-4 min-w-0">
                <div className="rounded-xl overflow-hidden border border-border bg-card shadow-sm animate-slide-in-up" style={{ animationDelay: "500ms" }}>
                  <img
                    src="https://res.cloudinary.com/dqzibxdtn/image/upload/v1769775710/Black_White_Grunge_Modern_Buy_One_Get_One_Black_Friday_Instagram_Post_plnvf9.png"
                    alt="Account Performance"
                    className="w-full h-auto max-h-[320px] object-cover object-center"
                  />
                </div>
                <ProjectProgress />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 min-w-0">
              <MT5PlatformCard variant="timer" />
              <MT5PlatformCard />
              <MT5PlatformCard variant="discord" />
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






















