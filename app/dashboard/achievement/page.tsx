import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { AchievementContent } from "@/components/achievement/achievement-content"
import { Footer } from "@/components/footer"

export default function AchievementPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <main className="min-w-0 flex-1 flex flex-col overflow-x-hidden p-3 md:p-4 lg:p-5 lg:ml-64">
        <div className="mx-auto w-full max-w-[1200px] flex flex-col flex-1">
          <Header
            title="Achievement"
            description="Your certificates and achievements. View or download as PDF."
          />

          <div className="mt-5 flex-1">
            <AchievementContent />
          </div>

          <div className="mt-8">
            <Footer />
          </div>
        </div>
      </main>
    </div>
  )
}
