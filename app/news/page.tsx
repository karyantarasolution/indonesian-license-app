"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { NewsManagement } from "@/components/news-management"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminHeader } from "@/components/layout/admin-header"

function NewsPageContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AdminSidebar />
      <AdminHeader />
      <main className="lg:pl-64 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <NewsManagement />
        </div>
      </main>
    </div>
  )
}

export default function NewsPage() {
  return (
    <ProtectedRoute>
      <NewsPageContent />
    </ProtectedRoute>
  )
}
