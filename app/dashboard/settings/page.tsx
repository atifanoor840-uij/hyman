import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { SettingsContent } from "@/components/settings/settings-content"
import { Footer } from "@/components/footer"

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 flex flex-col p-4 lg:p-6 lg:ml-64">
        <Header title="Settings" description="Manage your account preferences and application settings." />

        <div className="mt-6 flex-1">
          <SettingsContent />
        </div>

        <div className="mt-8">
          <Footer />
        </div>
      </main>
    </div>
  )
}
