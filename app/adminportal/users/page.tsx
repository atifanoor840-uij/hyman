"use client"

import { useState } from "react"
import { AdminPageContainer } from "@/components/admin/page-container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MagnifyingGlass, Export, UserPlus, Eye } from "@phosphor-icons/react"

// Country name/code -> ISO 3166-1 alpha-2 for flag emoji
const countryToCode: Record<string, string> = {
  Egypt: "EG",
  "United Kingdom": "GB",
  "United States": "US",
  UK: "GB",
  USA: "US",
  Germany: "DE",
  France: "FR",
  India: "IN",
  Pakistan: "PK",
  Bangladesh: "BD",
  Nigeria: "NG",
  "Saudi Arabia": "SA",
  UAE: "AE",
  "United Arab Emirates": "AE",
  Canada: "CA",
  Australia: "AU",
  Brazil: "BR",
  Turkey: "TR",
  Indonesia: "ID",
  Malaysia: "MY",
  Philippines: "PH",
  Kenya: "KE",
  "South Africa": "ZA",
  Morocco: "MA",
  Algeria: "DZ",
  Tunisia: "TN",
  Iraq: "IQ",
  Jordan: "JO",
  Lebanon: "LB",
  Kuwait: "KW",
  Qatar: "QA",
  Oman: "OM",
  Yemen: "YE",
  Syria: "SY",
  Libya: "LY",
  Sudan: "SD",
  Ghana: "GH",
  Ethiopia: "ET",
  Tanzania: "TZ",
  Uganda: "UG",
  Vietnam: "VN",
  Thailand: "TH",
  Singapore: "SG",
  Spain: "ES",
  Italy: "IT",
  Netherlands: "NL",
  Poland: "PL",
  Russia: "RU",
  China: "CN",
  Japan: "JP",
  "South Korea": "KR",
  Mexico: "MX",
  Argentina: "AR",
  Colombia: "CO",
  Peru: "PE",
  Chile: "CL",
  Greece: "GR",
  Portugal: "PT",
  Sweden: "SE",
  Norway: "NO",
  Finland: "FI",
  Denmark: "DK",
  Belgium: "BE",
  Austria: "AT",
  Switzerland: "CH",
  Ireland: "IE",
  "New Zealand": "NZ",
  Israel: "IL",
  Iran: "IR",
}

function getCountryFlag(country: string): string {
  if (!country) return ""
  const code = countryToCode[country] ?? (country.length === 2 ? country.toUpperCase() : null)
  if (!code || code.length !== 2) return ""
  return String.fromCodePoint(
    0x1f1e6 - 65 + code.charCodeAt(0),
    0x1f1e6 - 65 + code.charCodeAt(1)
  )
}

function CountryWithFlag({ country }: { country: string }) {
  const flag = getCountryFlag(country)
  return (
    <span className="inline-flex items-center gap-2">
      {flag && <span className="text-lg leading-none" title={country} aria-hidden>{flag}</span>}
      <span>{country}</span>
    </span>
  )
}

export type AdminUser = {
  id: number
  user_code: string
  username: string
  email: string
  name: string
  country: string
  phone_no: string
  address: string
  referral_code: string | null
  referral_code_access_enabled: boolean
  points_balance: number
  profile_picture_url: string | null
  created_at: string
  is_verified: boolean
  total_orders: number
  admin_access_password: string
  admin_access_password_plain: string
}

const mockUsers: AdminUser[] = [
  {
    id: 1737,
    user_code: "DRU#01737",
    username: "moobizoone555",
    email: "moobizoone555@gmail.com",
    name: "Mohamed Arafa Mohamed",
    country: "Egypt",
    phone_no: "",
    address: "",
    referral_code: null,
    referral_code_access_enabled: false,
    points_balance: 0,
    profile_picture_url: null,
    created_at: "2026-01-10T09:00:12.301140",
    is_verified: true,
    total_orders: 0,
    admin_access_password: "$2b$12$WVIkdL/DmiM5qZRm3KbhXOgDFw4AgE4oCdQJeJG2pulWVZBhdjU4i",
    admin_access_password_plain: "3FPDGyJq4QI7",
  },
  {
    id: 1736,
    user_code: "DRU#01736",
    username: "jane_trader",
    email: "jane@example.com",
    name: "Jane Smith",
    country: "United Kingdom",
    phone_no: "+44 7700 900000",
    address: "London, UK",
    referral_code: "JANE20",
    referral_code_access_enabled: true,
    points_balance: 150,
    profile_picture_url: null,
    created_at: "2026-01-09T14:22:00.000000",
    is_verified: true,
    total_orders: 3,
    admin_access_password: "$2b$12$xxx",
    admin_access_password_plain: "AdminPass2",
  },
  {
    id: 1735,
    user_code: "DRU#01735",
    username: "mike_fx",
    email: "mike@example.com",
    name: "Mike Johnson",
    country: "United States",
    phone_no: "",
    address: "",
    referral_code: null,
    referral_code_access_enabled: false,
    points_balance: 0,
    profile_picture_url: null,
    created_at: "2026-01-08T11:15:00.000000",
    is_verified: false,
    total_orders: 1,
    admin_access_password: "$2b$12$yyy",
    admin_access_password_plain: "TempAdmin1",
  },
]

function formatDate(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, { dateStyle: "medium" }) + " " + d.toLocaleTimeString(undefined, { timeStyle: "short" })
  } catch {
    return iso
  }
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState("")
  const [viewUser, setViewUser] = useState<AdminUser | null>(null)

  const filtered = mockUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.user_code.toLowerCase().includes(search.toLowerCase()) ||
      u.country.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminPageContainer
      title="Users"
      description="Manage registered users, status, and KYC."
      actions={
        <>
          <Button variant="outline" size="sm" className="gap-2">
            <Export size={16} weight="duotone" />
            Export
          </Button>
          <Button size="sm" className="gap-2">
            <UserPlus size={16} weight="duotone" />
            Add User
          </Button>
        </>
      }
    >
      <Card className="rounded-xl border-2 border-border bg-card shadow-sm animate-slide-in-up">
        <CardHeader className="pb-4 border-b border-border bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-lg font-bold tracking-tight">All Users</CardTitle>
            <div className="relative w-full sm:w-64">
              <MagnifyingGlass
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                size={16}
                weight="duotone"
              />
              <Input
                placeholder="Search users..."
                className="pl-9 h-9 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b-2 border-border">
                <TableHead className="font-semibold text-foreground">ID</TableHead>
                <TableHead className="font-semibold text-foreground">Name</TableHead>
                <TableHead className="font-semibold text-foreground">Country</TableHead>
                <TableHead className="font-semibold text-foreground">Admin access password</TableHead>
                <TableHead className="font-semibold text-foreground">Total orders</TableHead>
                <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-xs font-semibold text-foreground">{user.user_code}</TableCell>
                  <TableCell className="font-semibold">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    <CountryWithFlag country={user.country} />
                  </TableCell>
                  <TableCell className="font-mono text-xs font-semibold bg-muted/40 px-2 py-1 rounded">{user.admin_access_password_plain}</TableCell>
                  <TableCell className="font-bold text-foreground">{user.total_orders}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5"
                      onClick={() => setViewUser(user)}
                    >
                      <Eye size={14} weight="duotone" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!viewUser} onOpenChange={(open) => !open && setViewUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="border-b border-border bg-muted/20">
            <DialogTitle className="flex items-center gap-2 font-bold text-lg">
              <Eye size={20} weight="duotone" />
              User details
            </DialogTitle>
          </DialogHeader>
          {viewUser && (
            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-[100px_1fr] gap-x-4 gap-y-3 text-sm">
                <span className="text-muted-foreground font-semibold">ID</span>
                <span className="font-mono font-semibold">{viewUser.id}</span>
                <span className="text-muted-foreground font-semibold">User code</span>
                <span className="font-mono font-semibold">{viewUser.user_code}</span>
                <span className="text-muted-foreground font-semibold">Username</span>
                <span className="font-medium">{viewUser.username}</span>
                <span className="text-muted-foreground font-semibold">Name</span>
                <span className="font-bold">{viewUser.name}</span>
                <span className="text-muted-foreground">Email</span>
                <span>{viewUser.email}</span>
                <span className="text-muted-foreground">Country</span>
                <span>
                  <CountryWithFlag country={viewUser.country} />
                </span>
                <span className="text-muted-foreground">Phone</span>
                <span>{viewUser.phone_no || "—"}</span>
                <span className="text-muted-foreground">Address</span>
                <span>{viewUser.address || "—"}</span>
                <span className="text-muted-foreground">Admin access password</span>
                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{viewUser.admin_access_password_plain}</span>
                <span className="text-muted-foreground">Total orders</span>
                <span>{viewUser.total_orders}</span>
                <span className="text-muted-foreground">Points balance</span>
                <span>{viewUser.points_balance}</span>
                <span className="text-muted-foreground">Referral code</span>
                <span>{viewUser.referral_code || "—"}</span>
                <span className="text-muted-foreground">Verified</span>
                <span>
                  <Badge variant={viewUser.is_verified ? "default" : "secondary"}>
                    {viewUser.is_verified ? "Yes" : "No"}
                  </Badge>
                </span>
                <span className="text-muted-foreground">Created at</span>
                <span className="text-muted-foreground">{formatDate(viewUser.created_at)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminPageContainer>
  )
}
