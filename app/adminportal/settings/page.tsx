"use client"

import { AdminPageContainer } from "@/components/admin/page-container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Gear } from "@phosphor-icons/react"

export default function AdminSettingsPage() {
  return (
    <AdminPageContainer
      title="Settings"
      description="Admin portal and notification preferences."
    >
      <Card className="rounded-xl border-2 border-border bg-card shadow-sm animate-slide-in-up max-w-2xl">
        <CardHeader className="border-b border-border bg-muted/20">
          <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
            <Gear size={20} weight="duotone" />
            Portal settings
          </CardTitle>
          <p className="text-sm font-medium text-muted-foreground">
            Configure admin notifications and security.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between py-2">
            <div>
              <Label className="font-semibold">Email on new KYC</Label>
              <p className="text-xs font-medium text-muted-foreground mt-0.5">Notify admins when a user submits KYC.</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <Label className="font-semibold">Email on withdrawal request</Label>
              <p className="text-xs font-medium text-muted-foreground mt-0.5">Notify when a withdrawal is requested.</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-email">Admin notification email</Label>
            <Input id="admin-email" type="email" placeholder="admin@fxgenz.com" className="h-9" />
          </div>
          <Button>Save changes</Button>
        </CardContent>
      </Card>
    </AdminPageContainer>
  )
}
