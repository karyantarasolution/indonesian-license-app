"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut, Bell, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  reference_id: string;
  is_read: boolean;
  created_at: string;
}

export function AdminHeader() {
  const { user, logout } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  
  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/mysql/notifications')
      const data = await res.json()
      if (data.success) {
        setNotifications(data.data)
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000) // Poll every 30s
    return () => clearInterval(interval)
  }, [])

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await fetch(`/api/mysql/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: true })
      })
      fetchNotifications()
    } catch (err) {
      console.error("Failed to mark as read", err)
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <header className="lg:pl-64 bg-white shadow-lg border-b border-slate-200 pt-16 lg:pt-0 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Left Section - Logo and System Title */}
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 flex items-center justify-center flex-shrink-0">
              <Image 
                src="/logo2.png" 
                alt="Logo DPMPTSP" 
                width={80} 
                height={80} 
                className="w-20 h-20 object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 hidden sm:block">
                Sistem Pelayanan Perizinan DPMPTSP Kabupaten Tapin
              </h1>
              <h1 className="text-xl font-bold text-slate-900 block sm:hidden">
                SIMPEL
              </h1>
              <p className="text-sm text-slate-600">
                SIP(Sistem Informasi Perizinan Tapin)
              </p>
            </div>
          </div>

          {/* Right Section - User Info and Logout */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-slate-100 hover:bg-slate-200 flex-shrink-0" size="icon">
                  <Bell className="h-5 w-5 text-slate-600" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80" align="end" forceMount>
                <DropdownMenuLabel className="font-normal border-b pb-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Notifikasi</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      Anda memiliki {unreadCount} pesan belum dibaca
                    </p>
                  </div>
                </DropdownMenuLabel>
                <div className="max-h-[350px] overflow-y-auto py-1">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-500">
                      Tidak ada notifikasi
                    </div>
                  ) : (
                    notifications.map(notification => (
                      <DropdownMenuItem key={notification.id} className={`flex flex-col items-start p-3 gap-1 cursor-default border-b border-slate-50 last:border-0 ${!notification.is_read ? 'bg-slate-50/80' : ''}`}>
                        <div className="flex justify-between w-full">
                          <span className={`font-semibold text-sm ${!notification.is_read ? 'text-slate-900' : 'text-slate-600'}`}>{notification.title}</span>
                          {!notification.is_read && (
                            <button onClick={(e) => handleMarkAsRead(notification.id, e)} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-1 rounded-full flex-shrink-0" title="Tandai sudah dibaca">
                              <Check className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                        <span className="text-xs text-slate-600 leading-snug">{notification.message}</span>
                        <span className="text-[10px] text-slate-400 mt-1">
                          {new Date(notification.created_at).toLocaleString('id-ID', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </span>
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="text-right hidden sm:block">
              <div className="text-sm text-slate-600">Selamat datang,</div>
              <div className="font-semibold text-slate-900 truncate max-w-[120px]">{user?.name}</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="hover:bg-slate-50 bg-transparent hidden sm:flex"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Keluar
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={logout}
              className="hover:bg-slate-50 bg-transparent flex sm:hidden"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

