"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { signoutRequest } from "@/lib/api/auth-client"
import { clearAuth } from "@/lib/auth-utils"

export default function LogoutPage() {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signoutRequest()
    } catch {
      // Cookie clearing is best-effort — still send the user home.
    }
    clearAuth()
    router.push("/")
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="min-w-0 flex-1 flex flex-col overflow-x-hidden p-3 sm:p-4 md:p-5 lg:ml-64 pb-8">
        <div className="mx-auto w-full max-w-[1600px] flex flex-col flex-1 min-w-0">
        <Header />

        <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
          <Card className="p-8 max-w-md w-full text-center space-y-6 animate-fade-in">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <LogOut className="w-8 h-8 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Logout</h1>
              <p className="text-muted-foreground">Are you sure you want to logout?</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => router.back()} disabled={isLoggingOut}>
                Cancel
              </Button>
              <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={handleLogout} disabled={isLoggingOut}>
                {isLoggingOut ? "Logging out..." : "Logout"}
              </Button>
            </div>
          </Card>
        </div>
        </div>
      </main>
    </div>
  )
}
