"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { LicenseManagement } from "@/components/license-management"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminHeader } from "@/components/layout/admin-header"

function LicensesPageContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Header */}
      <AdminHeader />

      {/* Main Content */}
      <main className="lg:pl-64 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <LicenseManagement />
        </div>
      </main>
    </div>
  )
}

export default function LicensesPage() {
  return (
    <ProtectedRoute>
      <LicensesPageContent />
    </ProtectedRoute>
  )
}
