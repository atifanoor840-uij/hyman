import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { AchievementContent } from "@/components/achievement/achievement-content"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"

export default function AchievementPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <main className="min-w-0 flex-1 flex flex-col overflow-x-hidden p-3 sm:p-4 md:p-5 lg:ml-64 pb-8">
        <div className="mx-auto w-full max-w-[1600px] flex flex-col flex-1 min-w-0">
          <Header
            title="Achievements"
            description="Your certificates and achievements. View or download as PDF."
            variant="dashboard-hero"
            backHref="/dashboard"
            backLabel="Back"
            badge="Achievements"
            actions={
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" className="rounded-lg border-border h-9 px-4">
                  Done
                </Button>
                <Button size="sm" className="rounded-lg bg-[#7c3aed] hover:bg-[#6d28d9] text-white h-9 px-4">
                  Publish
                </Button>
              </div>
            }
          />

          <div className="flex-1 mt-5">
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
