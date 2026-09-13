import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Footer } from "@/components/footer"
import { DownloadContent } from "@/components/download/download-content"

export default function DownloadPage() {
  return (
    <div className="flex min-h-screen bg-background font-sans">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <main className="min-w-0 flex-1 flex flex-col overflow-x-hidden p-3 sm:p-4 md:p-5 lg:ml-64 font-sans pb-8">
        <div className="mx-auto w-full max-w-[1600px] flex flex-col flex-1 min-w-0">
          <Header
            title="Downloads"
            description="Download MetaTrader 5 (MT5) and MetaTrader 4 (MT4) for your evaluation."
            variant="dashboard-hero"
            backHref="/dashboard"
            backLabel="Back"
            badge="Downloads"
          />

          <div className="mt-5 flex-1">
            <DownloadContent />
          </div>

          <div className="mt-8">
            <Footer />
          </div>
        </div>
      </main>
    </div>
  )
}
