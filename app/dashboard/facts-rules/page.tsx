import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { FactsRulesContent } from "@/components/facts-rules/facts-rules-content"
import { Footer } from "@/components/footer"

export default function FactsRulesPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <main className="min-w-0 flex-1 flex flex-col overflow-x-hidden p-3 sm:p-4 md:p-5 lg:ml-64 pb-8">
        <div className="mx-auto w-full max-w-[1200px] flex flex-col flex-1 min-w-0">
          <Header
            title="Rules"
            description="Trading rules you must follow."
          />

          <div className="mt-5 flex-1">
            <FactsRulesContent />
          </div>

          <div className="mt-8">
            <Footer />
          </div>
        </div>
      </main>
    </div>
  )
}
