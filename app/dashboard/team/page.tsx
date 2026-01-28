import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { TeamContent } from "@/components/team/team-content"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"

export default function TeamPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <main className="min-w-0 flex-1 flex flex-col overflow-x-hidden p-3 md:p-4 lg:p-5 lg:ml-64">
        <div className="mx-auto w-full max-w-[1200px] flex flex-col flex-1">
          <Header
            title="Traders"
            description="Manage your trading team, account managers, and their performance."
            actions={
              <Button className="w-full sm:w-auto h-9 text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:shadow-md gap-2">
                + Add Trader
              </Button>
            }
          />

          <div className="mt-5 flex-1">
            <TeamContent />
          </div>

          <div className="mt-8">
            <Footer />
          </div>
        </div>
      </main>
    </div>
  )
}
