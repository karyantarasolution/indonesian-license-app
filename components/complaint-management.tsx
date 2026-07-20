"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Plus, Trash2, Search, MessageSquare, Eye, Reply, Star } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Complaint {
  id: string
  license_id?: string
  tracking_code?: string
  nama: string
  email: string
  telepon?: string
  kategori: string
  pesan: string
  status: string
  tanggapan?: string
  rating?: number
  created_at: string
  updated_at: string
}

function statusBadge(status: string) {
  const colors: Record<string, string> = {
    baru: "bg-blue-100 text-blue-800",
    dibaca: "bg-yellow-100 text-yellow-800",
    ditindaklanjuti: "bg-purple-100 text-purple-800",
    selesai: "bg-green-100 text-green-800",
  }
  return colors[status] || "bg-gray-100 text-gray-800"
}

function kategoriBadge(kategori: string) {
  const colors: Record<string, string> = {
    pengaduan: "bg-red-100 text-red-800",
    saran: "bg-blue-100 text-blue-800",
    pertanyaan: "bg-green-100 text-green-800",
    testimoni: "bg-yellow-100 text-yellow-800",
  }
  return colors[kategori] || "bg-gray-100 text-gray-800"
}

export function ComplaintManagement() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isResponseOpen, setIsResponseOpen] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [responseText, setResponseText] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadComplaints()
  }, [])

  const loadComplaints = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/mysql/complaints")
      const data = await res.json()
      if (data.success) {
        setComplaints(data.data || [])
      }
    } catch (error) {
      console.error("Error loading complaints:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/mysql/complaints/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      toast({ title: "Berhasil", description: "Status berhasil diperbarui" })
      loadComplaints()
    } catch (error) {
      toast({ title: "Error", description: "Gagal memperbarui status", variant: "destructive" })
    }
  }

  const handleSendResponse = async () => {
    if (!selectedComplaint || !responseText.trim()) return
    try {
      const res = await fetch(`/api/mysql/complaints/${selectedComplaint.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tanggapan: responseText, status: "ditindaklanjuti" }),
      })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      toast({ title: "Berhasil", description: "Tanggapan berhasil dikirim" })
      setIsResponseOpen(false)
      setSelectedComplaint(null)
      setResponseText("")
      loadComplaints()
    } catch (error) {
      toast({ title: "Error", description: "Gagal mengirim tanggapan", variant: "destructive" })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/mysql/complaints/${id}`, { method: "DELETE" })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      toast({ title: "Berhasil", description: "Pengaduan berhasil dihapus" })
      loadComplaints()
    } catch (error) {
      toast({ title: "Error", description: "Gagal menghapus pengaduan", variant: "destructive" })
    }
  }

  const filteredComplaints = complaints.filter(
    (c) =>
      c.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.pesan?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const baruCount = complaints.filter((c) => c.status === "baru").length
  const ditindaklanjutiCount = complaints.filter((c) => c.status === "ditindaklanjuti").length
  const selesaiCount = complaints.filter((c) => c.status === "selesai").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Manajemen Pengaduan</h3>
          <p className="text-sm text-gray-600">Kelola pengaduan, saran, dan pertanyaan masyarakat</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengaduan</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complaints.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Baru / Ditindaklanjuti</CardTitle>
            <MessageSquare className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className="text-blue-600">{baruCount}</span> / <span className="text-purple-600">{ditindaklanjutiCount}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selesai</CardTitle>
            <MessageSquare className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{selesaiCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Cari berdasarkan nama, email, atau pesan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Pesan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">Memuat data...</TableCell>
                </TableRow>
              ) : filteredComplaints.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">Tidak ada data pengaduan</TableCell>
                </TableRow>
              ) : (
                filteredComplaints.map((complaint, index) => (
                  <TableRow key={complaint.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{complaint.nama}</TableCell>
                    <TableCell>
                      <Badge className={kategoriBadge(complaint.kategori)}>
                        {complaint.kategori}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{complaint.pesan}</TableCell>
                    <TableCell>
                      <Badge className={statusBadge(complaint.status)}>
                        {complaint.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {complaint.created_at
                        ? new Date(complaint.created_at).toLocaleDateString("id-ID", {
                            day: "numeric", month: "short", year: "numeric"
                          })
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedComplaint(complaint)
                            setIsDetailOpen(true)
                            if (complaint.status === "baru") handleUpdateStatus(complaint.id, "dibaca")
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedComplaint(complaint)
                            setResponseText(complaint.tanggapan || "")
                            setIsResponseOpen(true)
                          }}
                        >
                          <Reply className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Pengaduan?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus pengaduan dari &quot;{complaint.nama}&quot;?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(complaint.id)} className="bg-red-600 hover:bg-red-700">
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detail Pengaduan</DialogTitle>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-3 text-sm">
              <div><span className="font-medium">Nama:</span> {selectedComplaint.nama}</div>
              <div><span className="font-medium">Email:</span> {selectedComplaint.email}</div>
              {selectedComplaint.telepon && <div><span className="font-medium">Telepon:</span> {selectedComplaint.telepon}</div>}
              <div><span className="font-medium">Kategori:</span> <Badge className={kategoriBadge(selectedComplaint.kategori)}>{selectedComplaint.kategori}</Badge></div>
              {selectedComplaint.kategori === "testimoni" && selectedComplaint.rating && (
                <div><span className="font-medium">Rating:</span> <span className="inline-flex items-center gap-0.5 ml-1">{[1,2,3,4,5].map(s => <Star key={s} className={`h-4 w-4 ${s <= (selectedComplaint.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-slate-300"}`} />)}</span></div>
              )}
              {selectedComplaint.tracking_code && <div><span className="font-medium">Kode Tracking:</span> {selectedComplaint.tracking_code}</div>}
              <div><span className="font-medium">Status:</span> <Badge className={statusBadge(selectedComplaint.status)}>{selectedComplaint.status}</Badge></div>
              <div><span className="font-medium">Pesan:</span></div>
              <p className="bg-slate-50 p-3 rounded-lg whitespace-pre-wrap">{selectedComplaint.pesan}</p>
              {selectedComplaint.tanggapan && (
                <>
                  <div><span className="font-medium">Tanggapan:</span></div>
                  <p className="bg-blue-50 p-3 rounded-lg whitespace-pre-wrap">{selectedComplaint.tanggapan}</p>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Response Dialog */}
      <Dialog open={isResponseOpen} onOpenChange={setIsResponseOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Tanggapi Pengaduan</DialogTitle>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg text-sm">
                <span className="font-medium">{selectedComplaint.nama}:</span> {selectedComplaint.pesan}
              </div>
              <div className="space-y-2">
                <Label htmlFor="response">Tanggapan</Label>
                <Textarea
                  id="response"
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={5}
                  placeholder="Tulis tanggapan Anda..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsResponseOpen(false)}>Batal</Button>
                <Button onClick={handleSendResponse} disabled={!responseText.trim()}>Kirim Tanggapan</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
