"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, CheckCheck, Trash2, RefreshCw } from "lucide-react"
import { useNotifications } from "@/contexts/notification-context"
import { format } from "date-fns"
import { id } from "date-fns/locale"

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, refreshNotifications } = useNotifications()
  const [loading, setLoading] = useState<string | null>(null)

  const handleMarkAsRead = async (id: string) => {
    setLoading(id)
    await markAsRead(id)
    setLoading(null)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Bell className="h-8 w-8 text-blue-600" />
              Notifikasi
            </h1>
            <p className="text-slate-600 mt-1">
              {unreadCount} notifikasi belum dibaca
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={refreshNotifications}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            {unreadCount > 0 && (
              <Button variant="default" size="sm" onClick={markAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Tandai Semua Dibaca
              </Button>
            )}
          </div>
        </div>

        {notifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="h-12 w-12 text-slate-300 mb-4" />
              <p className="text-slate-500">Belum ada notifikasi</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <Card
                key={notif.id}
                className={`hover:shadow-md transition-shadow ${!notif.is_read ? "border-l-4 border-l-blue-500 bg-blue-50/50" : ""}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`text-sm ${!notif.is_read ? "font-bold" : "font-medium"} text-slate-900`}>
                          {notif.title}
                        </h3>
                        {!notif.is_read && (
                          <Badge variant="default" className="bg-blue-500 text-xs">Baru</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">{notif.message}</p>
                      <p className="text-xs text-slate-400 mt-2">
                        {format(new Date(notif.created_at), "dd MMMM yyyy HH:mm", { locale: id })}
                      </p>
                    </div>
                    {!notif.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notif.id)}
                        disabled={loading === notif.id}
                        className="flex-shrink-0"
                      >
                        <CheckCheck className="h-4 w-4 text-blue-600" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
