"use client"

import { ProtectedRoute } from "@/components/protected-route"
import ReportDashboard from "@/components/report-dashboard"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminHeader } from "@/components/layout/admin-header"

function LaporanPageContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Header */}
      <AdminHeader />

      {/* Main Content */}
      <main className="lg:pl-64 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <ReportDashboard />
        </div>
      </main>
    </div>
  )
}

export default function LaporanPage() {
  return (
    <ProtectedRoute>
      <LaporanPageContent />
    </ProtectedRoute>
  )
}









