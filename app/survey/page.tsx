"use client"

import { useState, useEffect, useMemo } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { useLicenses } from "@/contexts/license-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ClipboardList, CheckCircle, Clock, MapPin, Calendar,
  Search, AlertCircle, FileText, Send, Bell, Eye, XCircle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useNotifications } from "@/contexts/notification-context"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminHeader } from "@/components/layout/admin-header"

interface SurveyData {
  id: string
  licenseId: string
  trackingCode: string
  namaIzin: string
  jenisIzin: string
  pemohonNama: string
  lokasi: string
  tanggalSurvey: string
  waktuSurvey: string
  petugas: string
  status: "dijadwalkan" | "sedang_survey" | "selesai" | "dibatalkan"
  catatan: string
  createdAt: string
  updatedAt: string
}

function SurveyTeamContent() {
  const { user } = useAuth()
  const { licenses, updateLicense } = useLicenses()
  const { toast } = useToast()
  const { refreshNotifications } = useNotifications()
  const [activeTab, setActiveTab] = useState("semua")
  const [searchTerm, setSearchTerm] = useState("")
  const [surveys, setSurveys] = useState<SurveyData[]>([])
  const [selectedSurvey, setSelectedSurvey] = useState<SurveyData | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [confirmNote, setConfirmNote] = useState("")

  // Load surveys from localStorage or generate from licenses
  useEffect(() => {
    const stored = localStorage.getItem("surveyData")
    if (stored) {
      try {
        setSurveys(JSON.parse(stored))
      } catch {}
    }
  }, [])

  // Save surveys to localStorage
  const saveSurveys = (data: SurveyData[]) => {
    setSurveys(data)
    localStorage.setItem("surveyData", JSON.stringify(data))
  }

  // Generate surveys from licenses that are in "proses" or "rekomendasi" status
  const generateSurveysFromLicenses = () => {
    const eligibleLicenses = licenses.filter(
      l => (l.status === "proses" || l.status === "rekomendasi" || l.status === "dikirim" || l.status === "terlambat") && l.lokasiIzin
    )
    
    const existingIds = new Set(surveys.map(s => s.licenseId))
    const newSurveys: SurveyData[] = []
    
    for (const license of eligibleLicenses) {
      if (!existingIds.has(license.id)) {
        const survey: SurveyData = {
          id: `survey-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          licenseId: license.id,
          trackingCode: license.trackingCode || "",
          namaIzin: license.namaIzin,
          jenisIzin: license.jenisIzin,
          pemohonNama: license.pemohonNama || "-",
          lokasi: license.lokasiIzin,
          tanggalSurvey: "",
          waktuSurvey: "",
          petugas: user?.name || "",
          status: "dijadwalkan",
          catatan: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        newSurveys.push(survey)
      }
    }
    
    if (newSurveys.length > 0) {
      const updated = [...surveys, ...newSurveys]
      saveSurveys(updated)
      toast({ title: "Berhasil", description: `${newSurveys.length} data survei baru ditambahkan` })
    } else {
      toast({ title: "Info", description: "Tidak ada data survei baru" })
    }
  }

  // Filter surveys
  const filteredSurveys = useMemo(() => {
    let filtered = surveys
    
    if (activeTab !== "semua") {
      filtered = filtered.filter(s => s.status === activeTab)
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(s =>
        s.namaIzin.toLowerCase().includes(term) ||
        s.trackingCode.toLowerCase().includes(term) ||
        s.pemohonNama.toLowerCase().includes(term) ||
        s.lokasi.toLowerCase().includes(term)
      )
    }
    
    return filtered
  }, [surveys, activeTab, searchTerm])

  // Status counts
  const statusCounts = useMemo(() => ({
    semua: surveys.length,
    dijadwalkan: surveys.filter(s => s.status === "dijadwalkan").length,
    sedang_survey: surveys.filter(s => s.status === "sedang_survey").length,
    selesai: surveys.filter(s => s.status === "selesai").length,
    dibatalkan: surveys.filter(s => s.status === "dibatalkan").length,
  }), [surveys])

  // Update survey status
  const updateSurveyStatus = (surveyId: string, newStatus: SurveyData["status"]) => {
    const updated = surveys.map(s => {
      if (s.id === surveyId) {
        return { ...s, status: newStatus, updatedAt: new Date().toISOString() }
      }
      return s
    })
    saveSurveys(updated)
    toast({ title: "Berhasil", description: "Status survei diperbarui" })
  }

  // Confirm survey to admin (creates notification)
  const handleConfirmToAdmin = async () => {
    if (!selectedSurvey) return
    
    // Update survey status to selesai
    const updated = surveys.map(s => {
      if (s.id === selectedSurvey.id) {
        return { ...s, status: "selesai" as const, catatan: confirmNote, updatedAt: new Date().toISOString() }
      }
      return s
    })
    saveSurveys(updated)
    
    // Create notification for admin
    try {
      const notifId = `notif-${Date.now()}`
      await fetch("/api/mysql/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: notifId,
          title: "Survei Dikonfirmasi",
          message: `Tim survei mengonfirmasi bahwa data survei untuk "${selectedSurvey.namaIzin}" (${selectedSurvey.trackingCode}) sudah sesuai. Pemohon: ${selectedSurvey.pemohonNama}. Lokasi: ${selectedSurvey.lokasi}. ${confirmNote ? "Catatan: " + confirmNote : ""}`,
          type: "survey_confirmed",
          reference_id: selectedSurvey.licenseId,
        }),
      })
      refreshNotifications()
    } catch {}
    
    setIsConfirmOpen(false)
    setConfirmNote("")
    setSelectedSurvey(null)
    toast({ title: "Berhasil", description: "Konfirmasi survei telah dikirim ke admin" })
  }

  // Update schedule for survey
  const handleScheduleSurvey = (surveyId: string, tanggal: string, waktu: string) => {
    const updated = surveys.map(s => {
      if (s.id === surveyId) {
        return { ...s, tanggalSurvey: tanggal, waktuSurvey: waktu, status: "sedang_survey" as const, updatedAt: new Date().toISOString() }
      }
      return s
    })
    saveSurveys(updated)
    toast({ title: "Berhasil", description: "Jadwal survei telah diupdate" })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "dijadwalkan":
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />Dijadwalkan</Badge>
      case "sedang_survey":
        return <Badge className="bg-yellow-100 text-yellow-800"><MapPin className="h-3 w-3 mr-1" />Sedang Survei</Badge>
      case "selesai":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Selesai</Badge>
      case "dibatalkan":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Dibatalkan</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AdminSidebar />
      <AdminHeader />
      <main className="lg:pl-64 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Tim Survei</h2>
                <p className="text-gray-600">Kelola dan konfirmasi data survei lokasi</p>
              </div>
            </div>
            <Button onClick={generateSurveysFromLicenses} className="bg-emerald-600 hover:bg-emerald-700">
              <Bell className="h-4 w-4 mr-2" />
              Ambil Data Survei
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{statusCounts.dijadwalkan}</div>
                <p className="text-xs text-gray-600">Dijadwalkan</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">{statusCounts.sedang_survey}</div>
                <p className="text-xs text-gray-600">Sedang Survei</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{statusCounts.selesai}</div>
                <p className="text-xs text-gray-600">Selesai</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">{statusCounts.dibatalkan}</div>
                <p className="text-xs text-gray-600">Dibatalkan</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">{statusCounts.semua}</div>
                <p className="text-xs text-gray-600">Total</p>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="relative max-w-md mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cari berdasarkan nama izin, tracking code, pemohon..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="semua">Semua ({statusCounts.semua})</TabsTrigger>
              <TabsTrigger value="dijadwalkan">Dijadwalkan ({statusCounts.dijadwalkan})</TabsTrigger>
              <TabsTrigger value="sedang_survey">Sedang Survei ({statusCounts.sedang_survey})</TabsTrigger>
              <TabsTrigger value="selesai">Selesai ({statusCounts.selesai})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left py-3 px-3 font-semibold">No</th>
                          <th className="text-left py-3 px-3 font-semibold">Kode Tracking</th>
                          <th className="text-left py-3 px-3 font-semibold">Nama Izin</th>
                          <th className="text-left py-3 px-3 font-semibold">Pemohon</th>
                          <th className="text-left py-3 px-3 font-semibold">Lokasi</th>
                          <th className="text-left py-3 px-3 font-semibold">Jadwal</th>
                          <th className="text-center py-3 px-3 font-semibold">Status</th>
                          <th className="text-center py-3 px-3 font-semibold">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSurveys.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="text-center py-12 text-gray-500">
                              <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                              <p>Belum ada data survei</p>
                              <p className="text-sm mt-1">Klik &quot;Ambil Data Survei&quot; untuk memuat data dari permohonan</p>
                            </td>
                          </tr>
                        ) : (
                          filteredSurveys.map((survey, index) => (
                            <tr key={survey.id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-3">{index + 1}</td>
                              <td className="py-3 px-3 font-mono text-xs font-semibold text-emerald-700">
                                {survey.trackingCode || "-"}
                              </td>
                              <td className="py-3 px-3">
                                <div className="font-medium">{survey.namaIzin}</div>
                                <div className="text-xs text-gray-500">{survey.jenisIzin}</div>
                              </td>
                              <td className="py-3 px-3">{survey.pemohonNama}</td>
                              <td className="py-3 px-3 max-w-[200px] truncate text-gray-600">{survey.lokasi}</td>
                              <td className="py-3 px-3">
                                {survey.tanggalSurvey ? (
                                  <div>
                                    <div className="text-sm">{new Date(survey.tanggalSurvey).toLocaleDateString("id-ID")}</div>
                                    {survey.waktuSurvey && <div className="text-xs text-gray-500">{survey.waktuSurvey}</div>}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">Belum dijadwalkan</span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-center">{getStatusBadge(survey.status)}</td>
                              <td className="py-3 px-3 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <Button variant="ghost" size="sm" onClick={() => {
                                    setSelectedSurvey(survey)
                                    setIsDetailOpen(true)
                                  }}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {survey.status === "dijadwalkan" && (
                                    <Button variant="ghost" size="sm" onClick={() => {
                                      setSelectedSurvey(survey)
                                      // Quick start survey
                                      updateSurveyStatus(survey.id, "sedang_survey")
                                    }}>
                                      <MapPin className="h-4 w-4 text-yellow-600" />
                                    </Button>
                                  )}
                                  {(survey.status === "sedang_survey") && (
                                    <Button variant="ghost" size="sm" onClick={() => {
                                      setSelectedSurvey(survey)
                                      setIsConfirmOpen(true)
                                    }}>
                                      <Send className="h-4 w-4 text-green-600" />
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Detail Survey Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={(open) => { if (!open) { setIsDetailOpen(false); setSelectedSurvey(null) } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Detail Survei
            </DialogTitle>
          </DialogHeader>
          {selectedSurvey && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="font-medium text-gray-600">Kode Tracking:</span></div>
                <div className="font-mono font-semibold">{selectedSurvey.trackingCode || "-"}</div>
                
                <div><span className="font-medium text-gray-600">Nama Izin:</span></div>
                <div>{selectedSurvey.namaIzin}</div>
                
                <div><span className="font-medium text-gray-600">Jenis Izin:</span></div>
                <div>{selectedSurvey.jenisIzin}</div>
                
                <div><span className="font-medium text-gray-600">Pemohon:</span></div>
                <div>{selectedSurvey.pemohonNama}</div>
                
                <div><span className="font-medium text-gray-600">Lokasi:</span></div>
                <div className="col-span-1">{selectedSurvey.lokasi}</div>
                
                <div><span className="font-medium text-gray-600">Status:</span></div>
                <div>{getStatusBadge(selectedSurvey.status)}</div>
                
                <div><span className="font-medium text-gray-600">Tanggal Survei:</span></div>
                <div>{selectedSurvey.tanggalSurvey ? new Date(selectedSurvey.tanggalSurvey).toLocaleDateString("id-ID") : "-"}</div>
                
                <div><span className="font-medium text-gray-600">Waktu:</span></div>
                <div>{selectedSurvey.waktuSurvey || "-"}</div>
                
                <div><span className="font-medium text-gray-600">Petugas:</span></div>
                <div>{selectedSurvey.petugas || "-"}</div>
              </div>
              
              {selectedSurvey.catatan && (
                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                  <span className="font-medium">Catatan: </span>{selectedSurvey.catatan}
                </div>
              )}
              
              <div className="flex justify-end gap-2 pt-2">
                {selectedSurvey.status === "sedang_survey" && (
                  <Button onClick={() => {
                    setIsDetailOpen(false)
                    setIsConfirmOpen(true)
                  }} className="bg-green-600 hover:bg-green-700">
                    <Send className="h-4 w-4 mr-2" />
                    Konfirmasi ke Admin
                  </Button>
                )}
                <Button variant="outline" onClick={() => { setIsDetailOpen(false); setSelectedSurvey(null) }}>
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={(open) => { if (!open) { setIsConfirmOpen(false); setConfirmNote("") } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Konfirmasi Survei ke Admin
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Anda akan mengonfirmasi bahwa data survei untuk <strong>{selectedSurvey?.namaIzin}</strong> sudah sesuai dan benar.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
              Admin akan menerima notifikasi bahwa survei ini telah dikonfirmasi.
            </div>
            <div className="space-y-2">
              <Label>Catatan (opsional)</Label>
              <Textarea
                value={confirmNote}
                onChange={(e) => setConfirmNote(e.target.value)}
                placeholder="Tambahkan catatan jika diperlukan..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setIsConfirmOpen(false); setConfirmNote("") }}>Batal</Button>
              <Button onClick={handleConfirmToAdmin} className="bg-green-600 hover:bg-green-700">
                <Send className="h-4 w-4 mr-2" />
                Kirim Konfirmasi
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function SurveyPage() {
  return (
    <ProtectedRoute>
      <SurveyTeamContent />
    </ProtectedRoute>
  )
}
