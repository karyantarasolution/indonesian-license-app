"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Home, FileText, Users, Settings, Download, CheckCircle } from "lucide-react"

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "perizinan", label: "Data Perizinan", icon: FileText },
    { id: "users", label: "Manajemen User", icon: Users },
    { id: "verifikasi", label: "Form Verifikasi", icon: CheckCircle },
    { id: "export", label: "Export Data", icon: Download },
    { id: "settings", label: "Pengaturan", icon: Settings },
  ]

  return (
    <aside className="w-64 bg-gray-50 border-r min-h-screen">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start",
                activeTab === item.id && "bg-blue-600 text-white hover:bg-blue-700",
              )}
              onClick={() => onTabChange(item.id)}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          )
        })}
      </nav>
    </aside>
  )
}
