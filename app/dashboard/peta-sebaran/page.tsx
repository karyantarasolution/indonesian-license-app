"use client";

import { useLicenses } from "@/contexts/license-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Search } from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminHeader } from "@/components/layout/admin-header";

// Load Map component dynamically to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-100 animate-pulse rounded-lg flex items-center justify-center">Memuat Peta...</div>,
});

export default function PetaSebaranPage() {
  const { licenses } = useLicenses();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredLicenses = useMemo(() => {
    return licenses.filter((license) => {
      const matchesSearch =
        (license.namaIzin || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (license.jenisIzin || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (license.lokasiIzin || "").toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || license.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [licenses, searchTerm, statusFilter]);

  const totalWithCoords = filteredLicenses.filter(l => l.latitude && l.longitude).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AdminSidebar />
      <AdminHeader />
      <main className="lg:pl-64 pb-8">
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <MapPin className="h-8 w-8 text-primary" />
              Peta Sebaran Izin
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-12 h-[calc(100vh-200px)] min-h-[600px]">
            {/* Sidebar Filters */}
            <div className="md:col-span-3 space-y-4 flex flex-col">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Filter Peta</CardTitle>
                  <CardDescription>
                    Temukan perizinan di area tertentu
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Pencarian</label>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Cari nama izin..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status Izin</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Status</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="proses">Proses</SelectItem>
                        <SelectItem value="selesai">Selesai</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="flex-1">
                <CardHeader className="pb-3">
                  <CardTitle>Statistik</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Izin Ditampilkan</p>
                      <p className="text-2xl font-bold">{filteredLicenses.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Izin Dengan Koordinat</p>
                      <p className="text-2xl font-bold text-green-600">{totalWithCoords}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Map Container */}
            <div className="md:col-span-9 h-full relative border rounded-xl overflow-hidden shadow-sm bg-white">
              <MapComponent licenses={filteredLicenses} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
