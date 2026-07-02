"use client";

import React, { useEffect } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/contexts/auth-context";
import { useUsers } from "@/contexts/user-context";
import { useLicenses } from "@/contexts/license-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  FileClock,
  FileX,
} from "lucide-react";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminHeader } from "@/components/layout/admin-header";

function Dashboard() {
  const { user } = useAuth();
  const { users } = useUsers();
  const { licenses, getOverdueLicenses } = useLicenses();

  // Ensure default data is available
  useEffect(() => {
    console.log("Dashboard mounted, current user:", user);
    console.log("Available users:", users);
  }, [user, users]);

  const overdueLicenses = getOverdueLicenses();
  const pendingLicenses = licenses.filter(
    (l) => l.status === "proses" || l.status === "rekomendasi"
  );
  const completedToday = licenses.filter((l) => {
    const today = new Date().toISOString().split("T")[0];
    return l.status === "selesai" && l.updatedAt === today;
  });

  const statusCounts = {
    total: licenses.length,
    draft: licenses.filter((l) => l.status === "draft").length,
    proses: licenses.filter((l) => l.status === "proses").length,
    rekomendasi: licenses.filter((l) => l.status === "rekomendasi").length,
    selesai: licenses.filter((l) => l.status === "selesai").length,
    terlambat: overdueLicenses.length,
  };

  const completionRate =
    licenses.length > 0
      ? Math.round(
          (licenses.filter((l) => l.status === "selesai").length /
            licenses.length) *
            100
        )
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Header */}
      <AdminHeader />

      {/* Main Content */}
      <main className="lg:pl-64 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              Sistem Manajemen Pelayanan Perizinan SLA
            </h2>
            <p className="text-slate-600">
              Dashboard utama untuk mengelola perizinan
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <Card
            className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105"
            onClick={() => (window.location.href = "/licenses")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">
                Total
              </CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {statusCounts.total}
              </div>
              <p className="text-xs text-slate-600 mt-1">Perizinan</p>
            </CardContent>
          </Card>

          <Card
            className="border-l-4 border-l-gray-500 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105"
            onClick={() => (window.location.href = "/licenses?status=draft")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">
                Draft
              </CardTitle>
              <div className="p-2 bg-gray-100 rounded-lg">
                <FileX className="h-4 w-4 text-gray-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">
                {statusCounts.draft}
              </div>
              <p className="text-xs text-slate-600 mt-1">Belum diproses</p>
            </CardContent>
          </Card>

          <Card
            className="border-l-4 border-l-yellow-500 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105"
            onClick={() => (window.location.href = "/licenses?status=proses")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">
                Dalam Proses
              </CardTitle>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {statusCounts.proses}
              </div>
              <p className="text-xs text-slate-600 mt-1">Sedang diproses</p>
            </CardContent>
          </Card>

          <Card
            className="border-l-4 border-l-orange-500 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105"
            onClick={() =>
              (window.location.href = "/licenses?status=rekomendasi")
            }
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">
                Menunggu Rekomendasi
              </CardTitle>
              <div className="p-2 bg-orange-100 rounded-lg">
                <FileClock className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {statusCounts.rekomendasi}
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Menunggu rekomendasi
              </p>
            </CardContent>
          </Card>

          <Card
            className="border-l-4 border-l-emerald-500 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105"
            onClick={() => (window.location.href = "/licenses?status=selesai")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">
                Selesai
              </CardTitle>
              <div className="p-2 bg-emerald-100 rounded-lg">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {statusCounts.selesai}
              </div>
              <p className="text-xs text-slate-600 mt-1">Diserahkan</p>
            </CardContent>
          </Card>

          <Card
            className="border-l-4 border-l-red-500 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105"
            onClick={() =>
              (window.location.href = "/licenses?status=terlambat")
            }
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">
                Terlambat
              </CardTitle>
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {statusCounts.terlambat}
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {statusCounts.terlambat > 0
                  ? "Perlu perhatian segera"
                  : "Semua on track"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity - Perizinan Terlambat */}
        {overdueLicenses.length > 0 && (
          <Card
            className="cursor-pointer hover:shadow-xl transition-all duration-300 group border-2 border-transparent hover:border-red-200 mt-6"
            onClick={() =>
              (window.location.href = "/licenses?status=terlambat")
            }
          >
            <CardHeader>
              <CardTitle className="flex items-center text-red-600 group-hover:text-red-700 transition-colors">
                <AlertCircle className="h-5 w-5 mr-2" />
                Perizinan Terlambat - Perlu Perhatian
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {overdueLicenses.slice(0, 3).map((license) => (
                  <div
                    key={license.id}
                    className="flex justify-between items-center p-4 bg-red-50 rounded-lg border border-red-100 group-hover:bg-red-100 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {license.namaIzin}
                      </p>
                      <p className="text-sm text-slate-600">
                        {license.jenisIzin} • {license.sektor}
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        Target: {license.tglTerbitIzin}
                      </p>
                    </div>
                    <Badge variant="destructive" className="animate-pulse">
                      Terlambat
                    </Badge>
                  </div>
                ))}
              </div>
              {overdueLicenses.length > 3 && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    className="w-full border-red-200 hover:bg-red-50 bg-transparent"
                  >
                    Lihat Semua ({overdueLicenses.length})
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}



