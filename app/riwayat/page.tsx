"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search, FileText, MessageSquare, Clock, CheckCircle, AlertCircle,
  LogIn, ArrowLeft, Copy, Eye, Calendar
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useLicenses } from "@/contexts/license-context"
import type { License } from "@/contexts/license-context"

interface Complaint {
  id: string
  licenseId?: string
  trackingCode?: string
  nama: string
  email: string
  telepon?: string
  kategori: string
  pesan: string
  status: string
  tanggapan?: string
  created_at: string
  updated_at: string
}

export default function RiwayatPage() {
  const { toast } = useToast()
  const { licenses } = useLicenses()
  const [activeTab, setActiveTab] = useState("permohonan")
  const [trackingSearch, setTrackingSearch] = useState("")
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [isVerified, setIsVerified] = useState(false)
  const [searchInput, setSearchInput] = useState("")

  // Load complaints
  useEffect(() => {
    const loadComplaints = async () => {
      try {
        const res = await fetch("/api/mysql/complaints")
        const result = await res.json()
        if (result.success && Array.isArray(result.data)) {
          setComplaints(result.data)
        }
      } catch {
        // Fallback to localStorage
        const stored = localStorage.getItem("complaints")
        if (stored) {
          try { setComplaints(JSON.parse(stored)) } catch {}
        }
      }
    }
    loadComplaints()
  }, [])

  // Verify tracking code
  const handleVerify = () => {
    if (!trackingSearch.trim()) {
      toast({ title: "Error", description: "Masukkan kode tracking terlebih dahulu", variant: "destructive" })
      return
    }

    // Find matching license
    const matchedLicense = licenses.find(
      l => l.trackingCode?.toLowerCase() === trackingSearch.trim().toLowerCase()
    )
    // Find matching complaint
    const matchedComplaint = complaints.find(
      c => c.trackingCode?.toLowerCase() === trackingSearch.trim().toLowerCase()
    )

    if (matchedLicense || matchedComplaint) {
      setIsVerified(true)
      setSearchInput(trackingSearch.trim().toUpperCase())
      toast({ title: "Berhasil", description: "Kode tracking valid. Menampilkan riwayat Anda." })
    } else {
      toast({ title: "Tidak Ditemukan", description: "Kode tracking tidak ditemukan dalam sistem", variant: "destructive" })
    }
  }

  // Filter licenses by tracking code
  const myLicenses = useMemo(() => {
    if (!isVerified || !searchInput) return []
    return licenses.filter(
      l => l.trackingCode?.toUpperCase() === searchInput
    )
  }, [licenses, isVerified, searchInput])

  // Filter complaints by tracking code
  const myComplaints = useMemo(() => {
    if (!isVerified || !searchInput) return []
    return complaints.filter(
      c => c.trackingCode?.toUpperCase() === searchInput
    )
  }, [complaints, isVerified, searchInput])

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; color: string }> = {
      draft: { label: "Draft", color: "bg-gray-100 text-gray-800" },
      dikirim: { label: "Dikirim", color: "bg-blue-100 text-blue-800" },
      proses: { label: "Diproses", color: "bg-yellow-100 text-yellow-800" },
      rekomendasi: { label: "Rekomendasi", color: "bg-orange-100 text-orange-800" },
      disetujui: { label: "Disetujui", color: "bg-green-100 text-green-800" },
      selesai: { label: "Selesai", color: "bg-green-100 text-green-800" },
      terlambat: { label: "Terlambat", color: "bg-red-100 text-red-800" },
      ditolak: { label: "Ditolak", color: "bg-red-100 text-red-800" },
      baru: { label: "Baru", color: "bg-blue-100 text-blue-800" },
      dibaca: { label: "Dibaca", color: "bg-yellow-100 text-yellow-800" },
      ditindaklanjuti: { label: "Ditindaklanjuti", color: "bg-purple-100 text-purple-800" },
    }
    const config = map[status] || { label: status, color: "bg-gray-100 text-gray-800" }
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({ title: "Berhasil", description: "Kode tracking disalin" })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 text-slate-700 hover:text-slate-900">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-semibold">Kembali ke Beranda</span>
            </Link>
            <h1 className="text-lg font-bold text-slate-900">Riwayat Saya</h1>
            <Link href="/login">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        {/* Verification Section */}
        {!isVerified ? (
          <Card className="max-w-xl mx-auto">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle>Cek Riwayat Permohonan & Pengaduan</CardTitle>
              <CardDescription>
                Masukkan kode tracking Anda untuk melihat riwayat permohonan perizinan dan pengaduan yang pernah Anda buat.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input
                  placeholder="Masukkan kode tracking (contoh: ABC12345)"
                  value={trackingSearch}
                  onChange={(e) => setTrackingSearch(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                  className="font-mono text-lg tracking-wider"
                  maxLength={8}
                />
                <Button onClick={handleVerify} className="bg-blue-600 hover:bg-blue-700">
                  <Search className="h-4 w-4 mr-2" />
                  Cari
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">
                Kode tracking diperoleh saat Anda mengajukan permohonan atau pengaduan
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Verified Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Riwayat untuk: <span className="font-mono text-blue-600">{searchInput}</span></h2>
                <p className="text-gray-600">Menampilkan data permohonan dan pengaduan dengan kode tracking ini</p>
              </div>
              <Button variant="outline" onClick={() => { setIsVerified(false); setTrackingSearch(""); setSearchInput("") }}>
                <Search className="h-4 w-4 mr-2" />
                Cari Lagi
              </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4 flex items-center gap-4">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-blue-700">{myLicenses.length}</p>
                    <p className="text-sm text-gray-600">Permohonan Perizinan</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-amber-500">
                <CardContent className="p-4 flex items-center gap-4">
                  <MessageSquare className="h-8 w-8 text-amber-600" />
                  <div>
                    <p className="text-2xl font-bold text-amber-700">{myComplaints.length}</p>
                    <p className="text-sm text-gray-600">Pengaduan / Saran</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4 flex items-center gap-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-green-700">
                      {myLicenses.filter(l => l.status === "selesai").length + myComplaints.filter(c => c.status === "selesai").length}
                    </p>
                    <p className="text-sm text-gray-600">Selesai</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="permohonan" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Permohonan ({myLicenses.length})
                </TabsTrigger>
                <TabsTrigger value="pengaduan" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Pengaduan ({myComplaints.length})
                </TabsTrigger>
              </TabsList>

              {/* Permohonan Tab */}
              <TabsContent value="permohonan">
                {myLicenses.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">Tidak ada permohonan perizinan dengan kode tracking ini.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {myLicenses.map((license) => (
                      <Card key={license.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold">{license.namaIzin}</h3>
                                {getStatusBadge(license.status)}
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                <div><span className="font-medium">Nama Izin:</span> {license.namaIzin}</div>
                                <div><span className="font-medium">Jenis:</span> {license.jenisIzin}</div>
                                <div><span className="font-medium">Sektor:</span> {license.sektor}</div>
                                <div><span className="font-medium">Pemohon:</span> {license.pemohonNama || "-"}</div>
                                <div><span className="font-medium">Tracking Code:</span> 
                                  <code className="ml-1 bg-gray-100 px-2 py-0.5 rounded font-mono text-xs">
                                    {license.trackingCode}
                                  </code>
                                  <Button variant="ghost" size="sm" className="ml-1 h-6 w-6 p-0" onClick={() => copyCode(license.trackingCode!)}>
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                                <div><span className="font-medium">Tanggal Masuk:</span> {new Date(license.permohonanMasuk).toLocaleDateString("id-ID")}</div>
                                {license.tglPenyerahanIzin && (
                                  <div><span className="font-medium">Tanggal Selesai:</span> {new Date(license.tglPenyerahanIzin).toLocaleDateString("id-ID")}</div>
                                )}
                                <div><span className="font-medium">Total SLA:</span> {license.totalSLA} hari</div>
                              </div>
                              {license.keterangan && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
                                  <span className="font-medium">Keterangan:</span> {license.keterangan}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Pengaduan Tab */}
              <TabsContent value="pengaduan">
                {myComplaints.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">Tidak ada pengaduan dengan kode tracking ini.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {myComplaints.map((complaint) => (
                      <Card key={complaint.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Badge className="bg-purple-100 text-purple-800">{complaint.kategori}</Badge>
                                {getStatusBadge(complaint.status)}
                              </div>
                              <p className="text-gray-700 mb-3">{complaint.pesan}</p>
                              {complaint.tanggapan && (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
                                  <span className="font-medium text-green-800">Tanggapan:</span>
                                  <p className="text-green-700 mt-1">{complaint.tanggapan}</p>
                                </div>
                              )}
                              <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(complaint.created_at).toLocaleDateString("id-ID")}
                                </span>
                                {complaint.trackingCode && (
                                  <span className="font-mono">Tracking: {complaint.trackingCode}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  )
}
