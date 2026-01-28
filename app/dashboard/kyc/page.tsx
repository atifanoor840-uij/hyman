import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { KycContent } from "@/components/kyc/kyc-content"
import { Footer } from "@/components/footer"

export default function KycPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <main className="min-w-0 flex-1 flex flex-col overflow-x-hidden p-3 md:p-4 lg:p-5 lg:ml-64">
        <div className="mx-auto w-full max-w-[1200px] flex flex-col flex-1">
          <Header
            title="KYC"
            description="Complete identity verification to enable withdrawals and full account access."
          />

          <div className="mt-5 flex-1">
            <KycContent />
          </div>

          <div className="mt-8">
            <Footer />
          </div>
        </div>
      </main>
    </div>
  )
}
