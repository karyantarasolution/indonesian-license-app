"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { useLicenses } from "@/contexts/license-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, Search, FileText, CheckCircle, Clock, XCircle, Copy, Check } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { LicenseService } from "@/lib/license-service"
import { useToast } from "@/hooks/use-toast"
import { License } from "@/contexts/license-context"

// Generate tracking code
function generateTrackingCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

function PemohonDashboardContent() {
  const { user, logout } = useAuth()
  const { licenses, refreshLicenses } = useLicenses()
  const { toast } = useToast()
  
  // Filter hanya perizinan milik pemohon ini
  const myLicenses = licenses.filter(
    (license) => license.pemohonId === user?.id || license.createdBy === user?.username
  )

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [trackingCode, setTrackingCode] = useState("")
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Form state
  const [formData, setFormData] = useState({
    jenisIzin: "",
    namaIzin: "",
    lokasiIzin: "",
    permohonanMasuk: new Date().toISOString().split('T')[0],
    perizinan: "",
    sektor: "",
    keterangan: "",
    pemohonNama: user?.name || "",
    pemohonEmail: user?.email || "",
    pemohonTelepon: user?.phone || "",
  })

  const handleSubmit = async () => {
    try {
      const tracking = generateTrackingCode()
      
      const newLicense = await LicenseService.addLicense({
        jenisIzin: formData.jenisIzin,
        namaIzin: formData.namaIzin,
        lokasiIzin: formData.lokasiIzin,
        permohonanMasuk: formData.permohonanMasuk,
        perizinan: formData.perizinan,
        sektor: formData.sektor,
        pemohonId: user?.id || "",
        pemohonNama: formData.pemohonNama,
        pemohonEmail: formData.pemohonEmail,
        pemohonTelepon: formData.pemohonTelepon,
        trackingCode: tracking,
        status: "dikirim",
        createdBy: user?.username || "pemohon",
        keterangan: "", // Keterangan kosong untuk permohonan baru, akan diisi admin nanti
      })

      toast({
        title: "Pengajuan Berhasil!",
        description: `Permohonan Anda telah dikirim. Kode Tracking: ${tracking}`,
      })

      setIsAddDialogOpen(false)
      setFormData({
        jenisIzin: "",
        namaIzin: "",
        lokasiIzin: "",
        permohonanMasuk: new Date().toISOString().split('T')[0],
        perizinan: "",
        sektor: "",
        keterangan: "",
        pemohonNama: user?.name || "",
        pemohonEmail: user?.email || "",
        pemohonTelepon: user?.phone || "",
      })
      refreshLicenses()
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mengajukan permohonan. Silakan coba lagi.",
        variant: "destructive",
      })
    }
  }

  const filteredLicenses = myLicenses.filter((license) =>
    license.namaIzin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    license.trackingCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    license.jenisIzin.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: "Draft", variant: "secondary" as const },
      dikirim: { label: "Dikirim", variant: "default" as const },
      proses: { label: "Diproses", variant: "default" as const },
      rekomendasi: { label: "Rekomendasi", variant: "default" as const },
      disetujui: { label: "Disetujui", variant: "default" as const },
      selesai: { label: "Selesai", variant: "default" as const },
      terlambat: { label: "Terlambat", variant: "destructive" as const },
      ditolak: { label: "Ditolak", variant: "destructive" as const },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const copyTrackingCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      title: "Berhasil",
      description: "Kode tracking telah disalin",
    })
  }

  // Redirect jika bukan pemohon
  if (user?.role !== "pemohon") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">
              Halaman ini hanya untuk Pemohon. Silakan login sebagai Pemohon.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Dashboard Pemohon</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <span className="text-gray-600">Selamat datang, </span>
                <span className="font-medium">{user?.name}</span>
                <Badge variant="secondary" className="ml-2">Pemohon</Badge>
              </div>
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pengajuan</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myLicenses.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Diproses</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {myLicenses.filter((l) => l.status === "proses" || l.status === "rekomendasi").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disetujui</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {myLicenses.filter((l) => l.status === "disetujui" || l.status === "selesai").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ditolak</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {myLicenses.filter((l) => l.status === "ditolak").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari berdasarkan nama izin, tracking code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ajukan Permohonan Baru
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Ajukan Permohonan Perizinan</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Jenis Izin *</Label>
                    <Input
                      value={formData.jenisIzin}
                      onChange={(e) => setFormData({ ...formData, jenisIzin: e.target.value })}
                      placeholder="Contoh: Izin Perdagangan"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nama Izin *</Label>
                    <Input
                      value={formData.namaIzin}
                      onChange={(e) => setFormData({ ...formData, namaIzin: e.target.value })}
                      placeholder="Contoh: Izin Toko Elektronik"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Lokasi Izin *</Label>
                  <Textarea
                    value={formData.lokasiIzin}
                    onChange={(e) => setFormData({ ...formData, lokasiIzin: e.target.value })}
                    placeholder="Alamat lengkap lokasi izin"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tanggal Permohonan *</Label>
                    <Input
                      type="date"
                      value={formData.permohonanMasuk}
                      onChange={(e) => setFormData({ ...formData, permohonanMasuk: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sektor *</Label>
                    <Select
                      value={formData.sektor}
                      onValueChange={(value) => setFormData({ ...formData, sektor: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih sektor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Perdagangan">Perdagangan</SelectItem>
                        <SelectItem value="Pariwisata">Pariwisata</SelectItem>
                        <SelectItem value="Kesehatan">Kesehatan</SelectItem>
                        <SelectItem value="Pendidikan">Pendidikan</SelectItem>
                        <SelectItem value="Pertanian">Pertanian</SelectItem>
                        <SelectItem value="Perikanan">Perikanan</SelectItem>
                        <SelectItem value="Konstruksi">Konstruksi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Perizinan *</Label>
                  <Input
                    value={formData.perizinan}
                    onChange={(e) => setFormData({ ...formData, perizinan: e.target.value })}
                    placeholder="Contoh: Dinas Perdagangan"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Keterangan</Label>
                  <Textarea
                    value={formData.keterangan}
                    onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                    placeholder="Informasi tambahan (opsional)"
                  />
                </div>
                <div className="border-t pt-4 space-y-4">
                  <h4 className="font-semibold">Data Pemohon</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nama Lengkap *</Label>
                      <Input
                        value={formData.pemohonNama}
                        onChange={(e) => setFormData({ ...formData, pemohonNama: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        value={formData.pemohonEmail}
                        onChange={(e) => setFormData({ ...formData, pemohonEmail: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>No. Telepon *</Label>
                    <Input
                      value={formData.pemohonTelepon}
                      onChange={(e) => setFormData({ ...formData, pemohonTelepon: e.target.value })}
                      placeholder="081234567890"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button onClick={handleSubmit}>Kirim Permohonan</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Permohonan List */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Permohonan Saya</CardTitle>
            <CardDescription>Semua permohonan perizinan yang telah Anda ajukan</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredLicenses.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Belum ada permohonan. Ajukan permohonan baru untuk memulai.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLicenses.map((license) => (
                  <Card key={license.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{license.namaIzin}</h3>
                            {getStatusBadge(license.status)}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                            <div>
                              <span className="font-medium">Jenis:</span> {license.jenisIzin}
                            </div>
                            <div>
                              <span className="font-medium">Sektor:</span> {license.sektor}
                            </div>
                            <div>
                              <span className="font-medium">Tanggal Pengajuan:</span>{" "}
                              {new Date(license.permohonanMasuk).toLocaleDateString("id-ID")}
                            </div>
                            {license.trackingCode && (
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Tracking Code:</span>
                                <code className="bg-gray-100 px-2 py-1 rounded font-mono">
                                  {license.trackingCode}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyTrackingCode(license.trackingCode!)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/pemohon/tracking/${license.trackingCode || license.id}`}>
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-2" />
                              Lihat Detail
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function PemohonDashboardPage() {
  return (
    <ProtectedRoute>
      <PemohonDashboardContent />
    </ProtectedRoute>
  )
}

