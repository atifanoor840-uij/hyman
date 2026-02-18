"use client"
import { useEffect, useState } from "react"
import AdminLayout from "@/components/admin-layout"
import SectionCard from "@/components/ui/section-card"
import { 
  StarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  GiftIcon,
  TrophyIcon,
  CurrencyDollarIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline"

interface DragonClubMember {
  id: string
  userId: string
  userName: string
  userEmail: string
  tier: "bronze" | "silver" | "gold" | "platinum" | "diamond"
  points: number
  level: number
  joinDate: string
  lastActivity: string
  totalRewards: number
  status: "active" | "inactive" | "suspended"
  achievements: string[]
}

export default function AdminDragonClubPage() {
  const [members, setMembers] = useState<DragonClubMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [tierFilter, setTierFilter] = useState("all")

  useEffect(() => {
    const loadDragonClubMembers = async () => {
      try {
        setIsLoading(true)
        const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
        if (!token) return
        
        // Simulate API call - replace with actual admin API endpoints
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setMembers([
          {
            id: "DC-001",
            userId: "1",
            userName: "John Doe",
            userEmail: "john.doe@example.com",
            tier: "diamond",
            points: 15420,
            level: 15,
            joinDate: "2024-01-01",
            lastActivity: "2024-01-20",
            totalRewards: 2500,
            status: "active",
            achievements: ["First Trade", "Profit Master", "Loyalty Champion"]
          },
          {
            id: "DC-002",
            userId: "2",
            userName: "Jane Smith",
            userEmail: "jane.smith@example.com",
            tier: "gold",
            points: 8750,
            level: 8,
            joinDate: "2024-01-05",
            lastActivity: "2024-01-19",
            totalRewards: 1200,
            status: "active",
            achievements: ["First Trade", "Consistent Trader"]
          },
          {
            id: "DC-003",
            userId: "3",
            userName: "Mike Wilson",
            userEmail: "mike.wilson@example.com",
            tier: "silver",
            points: 4200,
            level: 4,
            joinDate: "2024-01-10",
            lastActivity: "2024-01-18",
            totalRewards: 500,
            status: "active",
            achievements: ["First Trade"]
          },
          {
            id: "DC-004",
            userId: "4",
            userName: "Sarah Johnson",
            userEmail: "sarah.johnson@example.com",
            tier: "bronze",
            points: 1200,
            level: 1,
            joinDate: "2024-01-15",
            lastActivity: "2024-01-17",
            totalRewards: 100,
            status: "inactive",
            achievements: []
          }
        ])
      } catch (error) {
        console.error("Failed to load Dragon Club members:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadDragonClubMembers()
  }, [])

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTier = tierFilter === "all" || member.tier === tierFilter
    return matchesSearch && matchesTier
  })

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "bronze": return "bg-orange-500/20 text-orange-400"
      case "silver": return "bg-gray-500/20 text-gray-400"
      case "gold": return "bg-yellow-500/20 text-yellow-400"
      case "platinum": return "bg-blue-500/20 text-blue-400"
      case "diamond": return "bg-purple-500/20 text-purple-400"
      default: return "bg-gray-500/20 text-gray-400"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/20 text-green-400"
      case "inactive": return "bg-yellow-500/20 text-yellow-400"
      case "suspended": return "bg-red-500/20 text-red-400"
      default: return "bg-gray-500/20 text-gray-400"
    }
  }

  const totalMembers = members.length
  const activeMembers = members.filter(m => m.status === "active").length
  const totalRewards = members.reduce((sum, m) => sum + m.totalRewards, 0)

  return (
    <AdminLayout
      title="Dragon Club Management"
      subtitle="Manage loyalty program members and rewards"
    >
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <SectionCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Members</p>
              <p className="text-2xl font-bold text-white">{totalMembers}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <UserGroupIcon className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </SectionCard>
        <SectionCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Active Members</p>
              <p className="text-2xl font-bold text-white">{activeMembers}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
              <StarIcon className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </SectionCard>
        <SectionCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Rewards</p>
              <p className="text-2xl font-bold text-white">${totalRewards.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-[#DEBF74]/10 border border-[#DEBF74]/30">
              <CurrencyDollarIcon className="w-6 h-6 text-[#DEBF74]" />
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Tier Distribution */}
      <SectionCard>
        <h3 className="text-lg font-semibold text-white mb-4">Tier Distribution</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {["bronze", "silver", "gold", "platinum", "diamond"].map((tier) => {
            const count = members.filter(m => m.tier === tier).length
            return (
              <div key={tier} className="text-center">
                <div className={`p-3 rounded-lg ${getTierColor(tier)} mb-2`}>
                  <TrophyIcon className="w-6 h-6 mx-auto" />
                </div>
                <p className="text-white font-medium capitalize">{tier}</p>
                <p className="text-gray-400 text-sm">{count} members</p>
              </div>
            )
          })}
        </div>
      </SectionCard>

      {/* Filters */}
      <SectionCard>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
            >
              <option value="all">All Tiers</option>
              <option value="bronze">Bronze</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
              <option value="platinum">Platinum</option>
              <option value="diamond">Diamond</option>
            </select>
            <button className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white hover:bg-gray-600 transition-colors flex items-center gap-2">
              <FunnelIcon className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>
      </SectionCard>

      {/* Members Table */}
      <SectionCard padded={false}>
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading members...</p>
          </div>
        ) : filteredMembers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-700">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 uppercase tracking-wider">Member ID</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 uppercase tracking-wider">User</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 uppercase tracking-wider">Tier</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 uppercase tracking-wider">Level</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 uppercase tracking-wider">Points</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 uppercase tracking-wider">Rewards</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 uppercase tracking-wider">Join Date</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-800/30">
                    <td className="py-4 px-6">
                      <div className="text-white font-medium">{member.id}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="text-white font-medium">{member.userName}</div>
                        <div className="text-gray-400 text-sm">{member.userEmail}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(member.tier)}`}>
                        {member.tier}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-white font-medium">Level {member.level}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-white">{member.points.toLocaleString()}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-[#DEBF74] font-medium">${member.totalRewards.toLocaleString()}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-400 text-sm">{member.joinDate}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-blue-400 transition-colors">
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-[#DEBF74] transition-colors">
                          <GiftIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <StarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No members found</p>
          </div>
        )}
      </SectionCard>
    </AdminLayout>
  )
}



