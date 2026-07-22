"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Home,
  FileText,
  Settings,
  BarChart3,
  FileBarChart,
  Menu,
  X,
  MapPin,
  AlertCircle,
  Bell,
  MessageSquare,
  CreditCard,
  ClipboardList,
  Database,
} from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { useNotifications } from "@/contexts/notification-context"

interface MenuItem {
  id: string
  label: string
  icon: React.ElementType
  href: string
  badge?: number
}

export function AdminSidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()
  const { unreadCount } = useNotifications()

  // Menu items - filter berdasarkan role
  const allMenuItems: MenuItem[] = [
    { id: "licenses", label: "Kelola Perizinan", icon: FileText, href: "/licenses" },
    { id: "notifications", label: "Notifikasi", icon: Bell, href: "/notifications", badge: unreadCount },
    { id: "peta", label: "Peta Sebaran", icon: MapPin, href: "/dashboard/peta-sebaran" },
    { id: "expired", label: "Izin Expired", icon: AlertCircle, href: "/dashboard/izin-expired" },
    { id: "payments", label: "Pembayaran", icon: CreditCard, href: "/payments" },
    { id: "complaints", label: "Pengaduan", icon: MessageSquare, href: "/complaints" },
    { id: "survey", label: "Tim Survei", icon: ClipboardList, href: "/survey" },
    { id: "analytics", label: "Analytics", icon: BarChart3, href: "/analytics" },
    { id: "report", label: "Laporan", icon: FileBarChart, href: "/laporan" },
    { id: "master-data", label: "Master Data", icon: Database, href: "/master-data" },
    { id: "settings", label: "Pengaturan", icon: Settings, href: "/settings" },
  ]

  // Filter menu items berdasarkan role
  // Hanya admin yang bisa melihat menu Pengaturan
  const menuItems = allMenuItems.filter((item) => {
    if (item.id === "settings") {
      return user?.role === "admin"
    }
    return true
  })

  const isActive = (href: string) => {
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="bg-white shadow-md"
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 flex items-center justify-center">
                {/* <Image
                  src="/logo2.png"
                  alt="Logo"
                  width={112}
                  height={112}
                  className="w-12 h-12 object-contain"
                /> */}
              </div>
              <div className="flex-1 min-w-0">
                {/* <h2 className="text-sm font-bold text-slate-900 truncate">
                  PERIZINAN NON ELEKTRONIK
                </h2>
                <p className="text-xs text-slate-600 truncate">
                  DPMPTSP Rantau
                </p> */}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link key={item.id} href={item.href} onClick={() => setIsMobileOpen(false)}>
                  <Button
                    variant={active ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start h-11",
                      active
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-2">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              )
            })}
          </nav>

          {/* Footer - Hidden */}
          {/* <div className="p-4 border-t border-slate-200">
            <Link href="/">
              <Button
                variant="ghost"
                className="w-full justify-start text-slate-700 hover:bg-slate-100"
              >
                <Home className="mr-3 h-5 w-5" />
                Beranda
              </Button>
            </Link>
          </div> */}
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  )
}

