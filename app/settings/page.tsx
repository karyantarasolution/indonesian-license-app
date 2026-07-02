"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { NewsManagement } from "@/components/news-management"
import { GalleryManagement } from "@/components/gallery-management"
import { useAuth } from "@/contexts/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Settings, Newspaper, Image as ImageIcon } from "lucide-react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminHeader } from "@/components/layout/admin-header"

function SettingsPageContent() {
  const { user, logout } = useAuth()

  // Cek apakah user adalah admin
  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Akses Ditolak</h1>
          <p className="text-slate-600 mb-4">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
          <Button onClick={() => window.location.href = "/dashboard"}>
            Kembali ke Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Header */}
      <AdminHeader />

      {/* Main Content */}
      <main className="lg:pl-64 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Pengaturan</h2>
              <p className="text-gray-600">Kelola Berita dan Galeri</p>
            </div>
          </div>

          <Tabs defaultValue="news" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
              <TabsTrigger value="news" className="flex items-center gap-2">
                <Newspaper className="h-4 w-4" />
                Manajemen Berita
              </TabsTrigger>
              <TabsTrigger value="gallery" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Manajemen Galeri
              </TabsTrigger>
            </TabsList>

            <TabsContent value="news" className="space-y-6">
              <NewsManagement />
            </TabsContent>

            <TabsContent value="gallery" className="space-y-6">
              <GalleryManagement />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsPageContent />
    </ProtectedRoute>
  )
}
