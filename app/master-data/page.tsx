"use client"

import { useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { useLicenses } from "@/contexts/license-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Database, Plus, Search, Edit2, Trash2, FileText, 
  User, Hash, ClipboardList, Save, X 
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminHeader } from "@/components/layout/admin-header"

interface JenisPelayanan {
  id: string
  nama: string
  deskripsi: string
  sektor: string
  biaya: number
  estimasiHari: number
  status: "aktif" | "nonaktif"
}

interface DataPemohon {
  id: string
  nama: string
  email: string
  telepon: string
  alamat: string
  jenisIdentitas: string
  noIdentitas: string
  totalPermohonan: number
}

function MasterDataContent() {
  const { user } = useAuth()
  const { licenses } = useLicenses()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("jenis-pelayanan")
  const [searchTerm, setSearchTerm] = useState("")

  // State untuk Jenis Pelayanan
  const [jenisPelayananList, setJenisPelayananList] = useState<JenisPelayanan[]>([
    { id: "1", nama: "Izin Usaha Perdagangan", deskripsi: "Izin untuk usaha perdagangan barang", sektor: "Perdagangan", biaya: 50000, estimasiHari: 7, status: "aktif" },
    { id: "2", nama: "Izin Mendirikan Bangunan", deskripsi: "Izin untuk mendirikan bangunan baru", sektor: "Konstruksi", biaya: 100000, estimasiHari: 14, status: "aktif" },
    { id: "3", nama: "Izin Usaha Pariwisata", deskripsi: "Izin untuk usaha di bidang pariwisata", sektor: "Pariwisata", biaya: 75000, estimasiHari: 10, status: "aktif" },
    { id: "4", nama: "Izin Kesehatan", deskripsi: "Izin untuk fasilitas kesehatan", sektor: "Kesehatan", biaya: 80000, estimasiHari: 12, status: "aktif" },
    { id: "5", nama: "Izin Pendidikan", deskripsi: "Izin untuk lembaga pendidikan", sektor: "Pendidikan", biaya: 60000, estimasiHari: 8, status: "aktif" },
  ])
  const [isJenisDialogOpen, setIsJenisDialogOpen] = useState(false)
  const [editingJenis, setEditingJenis] = useState<JenisPelayanan | null>(null)
  const [jenisForm, setJenisForm] = useState({ nama: "", deskripsi: "", sektor: "", biaya: 0, estimasiHari: 7 })

  // State untuk Data Pemohon (dari licenses)
  const [selectedPemohon, setSelectedPemohon] = useState<DataPemohon | null>(null)

  // Extract unique pemohon dari licenses
  const dataPemohonList: DataPemohon[] = licenses.reduce((acc: DataPemohon[], license) => {
    const nama = license.pemohonNama || "-"
    if (nama === "-") return acc
    const existing = acc.find(p => p.nama === nama)
    if (existing) {
      existing.totalPermohonan++
      if (license.pemohonEmail && !existing.email) existing.email = license.pemohonEmail
      if (license.pemohonTelepon && !existing.telepon) existing.telepon = license.pemohonTelepon
      if (license.alamat && !existing.alamat) existing.alamat = license.alamat
    } else {
      acc.push({
        id: license.pemohonId || license.id,
        nama,
        email: license.pemohonEmail || "",
        telepon: license.pemohonTelepon || "",
        alamat: license.alamat || license.lokasiIzin || "",
        jenisIdentitas: "KTP",
        noIdentitas: "-",
        totalPermohonan: 1,
      })
    }
    return acc
  }, [])

  // Filtered lists
  const filteredJenis = jenisPelayananList.filter(j =>
    j.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.sektor.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredPemohon = dataPemohonList.filter(p =>
    p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.telepon.includes(searchTerm)
  )

  // Jenis Pelayanan CRUD
  const handleSaveJenis = () => {
    if (!jenisForm.nama || !jenisForm.sektor) {
      toast({ title: "Error", description: "Nama dan sektor wajib diisi", variant: "destructive" })
      return
    }
    if (editingJenis) {
      setJenisPelayananList(prev => prev.map(j => 
        j.id === editingJenis.id ? { ...j, ...jenisForm } : j
      ))
      toast({ title: "Berhasil", description: "Jenis pelayanan berhasil diperbarui" })
    } else {
      const newJenis: JenisPelayanan = {
        id: Date.now().toString(),
        ...jenisForm,
        status: "aktif"
      }
      setJenisPelayananList(prev => [...prev, newJenis])
      toast({ title: "Berhasil", description: "Jenis pelayanan berhasil ditambahkan" })
    }
    setIsJenisDialogOpen(false)
    setEditingJenis(null)
    setJenisForm({ nama: "", deskripsi: "", sektor: "", biaya: 0, estimasiHari: 7 })
  }

  const handleDeleteJenis = (id: string) => {
    setJenisPelayananList(prev => prev.filter(j => j.id !== id))
    toast({ title: "Berhasil", description: "Jenis pelayanan berhasil dihapus" })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AdminSidebar />
      <AdminHeader />
      <main className="lg:pl-64 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Master Data</h2>
              <p className="text-gray-600">Kelola jenis pelayanan, data pemohon, dan ID pemohon</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
              <TabsTrigger value="jenis-pelayanan" className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                Jenis Pelayanan
              </TabsTrigger>
              <TabsTrigger value="data-pemohon" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Data Pemohon
              </TabsTrigger>
              <TabsTrigger value="id-pemohon" className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                ID Pemohon
              </TabsTrigger>
            </TabsList>

            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Tab: Jenis Pelayanan */}
            <TabsContent value="jenis-pelayanan" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardList className="h-5 w-5 text-blue-600" />
                      Daftar Jenis Pelayanan
                    </CardTitle>
                    <CardDescription>Kelola daftar jenis pelayanan perizinan</CardDescription>
                  </div>
                  <Dialog open={isJenisDialogOpen} onOpenChange={(open) => {
                    setIsJenisDialogOpen(open)
                    if (!open) {
                      setEditingJenis(null)
                      setJenisForm({ nama: "", deskripsi: "", sektor: "", biaya: 0, estimasiHari: 7 })
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Jenis
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingJenis ? "Edit" : "Tambah"} Jenis Pelayanan</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Nama Jenis Pelayanan *</Label>
                          <Input
                            value={jenisForm.nama}
                            onChange={(e) => setJenisForm({ ...jenisForm, nama: e.target.value })}
                            placeholder="Contoh: Izin Usaha Perdagangan"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Deskripsi</Label>
                          <Textarea
                            value={jenisForm.deskripsi}
                            onChange={(e) => setJenisForm({ ...jenisForm, deskripsi: e.target.value })}
                            placeholder="Deskripsi jenis pelayanan"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Sektor *</Label>
                            <Select value={jenisForm.sektor} onValueChange={(v) => setJenisForm({ ...jenisForm, sektor: v })}>
                              <SelectTrigger><SelectValue placeholder="Pilih sektor" /></SelectTrigger>
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
                          <div className="space-y-2">
                            <Label>Biaya (Rp)</Label>
                            <Input
                              type="number"
                              value={jenisForm.biaya}
                              onChange={(e) => setJenisForm({ ...jenisForm, biaya: Number(e.target.value) })}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Estimasi Waktu (hari)</Label>
                          <Input
                            type="number"
                            value={jenisForm.estimasiHari}
                            onChange={(e) => setJenisForm({ ...jenisForm, estimasiHari: Number(e.target.value) })}
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                          <Button variant="outline" onClick={() => setIsJenisDialogOpen(false)}>Batal</Button>
                          <Button onClick={handleSaveJenis}>
                            <Save className="h-4 w-4 mr-2" />
                            Simpan
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left py-3 px-2 font-semibold">No</th>
                          <th className="text-left py-3 px-2 font-semibold">Nama Jenis</th>
                          <th className="text-left py-3 px-2 font-semibold">Deskripsi</th>
                          <th className="text-left py-3 px-2 font-semibold">Sektor</th>
                          <th className="text-right py-3 px-2 font-semibold">Biaya</th>
                          <th className="text-center py-3 px-2 font-semibold">Estimasi</th>
                          <th className="text-center py-3 px-2 font-semibold">Status</th>
                          <th className="text-center py-3 px-2 font-semibold">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredJenis.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="text-center py-8 text-gray-500">
                              Tidak ada data jenis pelayanan
                            </td>
                          </tr>
                        ) : (
                          filteredJenis.map((jenis, index) => (
                            <tr key={jenis.id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-2">{index + 1}</td>
                              <td className="py-3 px-2 font-medium">{jenis.nama}</td>
                              <td className="py-3 px-2 text-gray-600 max-w-xs truncate">{jenis.deskripsi}</td>
                              <td className="py-3 px-2">{jenis.sektor}</td>
                              <td className="py-3 px-2 text-right">Rp {jenis.biaya.toLocaleString("id-ID")}</td>
                              <td className="py-3 px-2 text-center">{jenis.estimasiHari} hari</td>
                              <td className="py-3 px-2 text-center">
                                <Badge className={jenis.status === "aktif" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                                  {jenis.status}
                                </Badge>
                              </td>
                              <td className="py-3 px-2 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <Button variant="ghost" size="sm" onClick={() => {
                                    setEditingJenis(jenis)
                                    setJenisForm({ nama: jenis.nama, deskripsi: jenis.deskripsi, sektor: jenis.sektor, biaya: jenis.biaya, estimasiHari: jenis.estimasiHari })
                                    setIsJenisDialogOpen(true)
                                  }}>
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => handleDeleteJenis(jenis.id)}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
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

            {/* Tab: Data Pemohon */}
            <TabsContent value="data-pemohon" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Data Pemohon
                  </CardTitle>
                  <CardDescription>Daftar pemohon berdasarkan data permohonan perizinan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left py-3 px-2 font-semibold">No</th>
                          <th className="text-left py-3 px-2 font-semibold">Nama Pemohon</th>
                          <th className="text-left py-3 px-2 font-semibold">Email</th>
                          <th className="text-left py-3 px-2 font-semibold">Telepon</th>
                          <th className="text-left py-3 px-2 font-semibold">Alamat</th>
                          <th className="text-center py-3 px-2 font-semibold">Total Permohonan</th>
                          <th className="text-center py-3 px-2 font-semibold">Detail</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPemohon.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-8 text-gray-500">
                              Tidak ada data pemohon
                            </td>
                          </tr>
                        ) : (
                          filteredPemohon.map((pemohon, index) => (
                            <tr key={pemohon.id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-2">{index + 1}</td>
                              <td className="py-3 px-2 font-medium">{pemohon.nama}</td>
                              <td className="py-3 px-2">{pemohon.email || "-"}</td>
                              <td className="py-3 px-2">{pemohon.telepon || "-"}</td>
                              <td className="py-3 px-2 max-w-xs truncate">{pemohon.alamat || "-"}</td>
                              <td className="py-3 px-2 text-center">
                                <Badge variant="secondary">{pemohon.totalPermohonan}</Badge>
                              </td>
                              <td className="py-3 px-2 text-center">
                                <Button variant="ghost" size="sm" onClick={() => setSelectedPemohon(pemohon)}>
                                  <FileText className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Detail Pemohon Dialog */}
              {selectedPemohon && (
                <Dialog open={!!selectedPemohon} onOpenChange={(open) => { if (!open) setSelectedPemohon(null) }}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Detail Pemohon</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      <div><span className="font-medium">Nama:</span> {selectedPemohon.nama}</div>
                      <div><span className="font-medium">Email:</span> {selectedPemohon.email || "-"}</div>
                      <div><span className="font-medium">Telepon:</span> {selectedPemohon.telepon || "-"}</div>
                      <div><span className="font-medium">Alamat:</span> {selectedPemohon.alamat || "-"}</div>
                      <div><span className="font-medium">Jenis Identitas:</span> {selectedPemohon.jenisIdentitas}</div>
                      <div><span className="font-medium">No. Identitas:</span> {selectedPemohon.noIdentitas}</div>
                      <div><span className="font-medium">Total Permohonan:</span> {selectedPemohon.totalPermohonan}</div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </TabsContent>

            {/* Tab: ID Pemohon */}
            <TabsContent value="id-pemohon" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hash className="h-5 w-5 text-blue-600" />
                    ID Pemohon
                  </CardTitle>
                  <CardDescription>Daftar ID unik pemohon beserta riwayat permohonan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left py-3 px-2 font-semibold">No</th>
                          <th className="text-left py-3 px-2 font-semibold">ID Pemohon</th>
                          <th className="text-left py-3 px-2 font-semibold">Nama Pemohon</th>
                          <th className="text-left py-3 px-2 font-semibold">Email</th>
                          <th className="text-left py-3 px-2 font-semibold">Telepon</th>
                          <th className="text-center py-3 px-2 font-semibold">Jumlah Permohonan</th>
                          <th className="text-left py-3 px-2 font-semibold">Jenis Izin Terakhir</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPemohon.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-8 text-gray-500">
                              Tidak ada data ID pemohon
                            </td>
                          </tr>
                        ) : (
                          filteredPemohon.map((pemohon, index) => {
                            const lastLicense = licenses.find(l => l.pemohonNama === pemohon.nama)
                            return (
                              <tr key={pemohon.id} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-2">{index + 1}</td>
                                <td className="py-3 px-2 font-mono text-xs font-semibold text-blue-700">{pemohon.id}</td>
                                <td className="py-3 px-2 font-medium">{pemohon.nama}</td>
                                <td className="py-3 px-2">{pemohon.email || "-"}</td>
                                <td className="py-3 px-2">{pemohon.telepon || "-"}</td>
                                <td className="py-3 px-2 text-center">
                                  <Badge variant="secondary">{pemohon.totalPermohonan}</Badge>
                                </td>
                                <td className="py-3 px-2 text-gray-600">{lastLicense?.jenisIzin || "-"}</td>
                              </tr>
                            )
                          })
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
    </div>
  )
}

export default function MasterDataPage() {
  return (
    <ProtectedRoute>
      <MasterDataContent />
    </ProtectedRoute>
  )
}
