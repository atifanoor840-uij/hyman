import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { HelpContent } from "@/components/help/help-content"
import { Footer } from "@/components/footer"

export default function HelpPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 flex flex-col p-4 lg:p-6 lg:ml-64">
        <Header title="Help & Support" description="Get help with using Forex Pro and find answers to common questions." />

        <div className="mt-6 flex-1">
          <HelpContent />
        </div>

        <div className="mt-8">
          <Footer />
        </div>
      </main>
    </div>
  )
}
