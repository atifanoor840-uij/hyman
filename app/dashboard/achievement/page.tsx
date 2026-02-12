import Link from "next/link"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { AchievementContent } from "@/components/achievement/achievement-content"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export default function AchievementPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <main className="min-w-0 flex-1 flex flex-col overflow-x-hidden p-3 md:p-4 lg:p-5 lg:ml-64">
        <div className="mx-auto w-full max-w-[1200px] flex flex-col flex-1">
          <Header />

          {/* Certificate-style title bar: Back, title, subtitle, actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex flex-col gap-1">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-fit"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Link>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Achievements
              </h1>
              <p className="text-sm text-muted-foreground">
                Your certificates and achievements. View or download as PDF.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" className="border-border">
                Done
              </Button>
              <Button size="sm" className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white">
                Publish
              </Button>
            </div>
          </div>

          <div className="flex-1">
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
