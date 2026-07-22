"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { Perizinan } from "@/lib/types"

interface PerizinanFormProps {
  onSubmit: (data: Omit<Perizinan, "id" | "createdAt" | "updatedAt">) => void
  initialData?: Perizinan
  onCancel?: () => void
}

export function PerizinanForm({ onSubmit, initialData, onCancel }: PerizinanFormProps) {
  const [formData, setFormData] = useState({
    jenisIzin: initialData?.jenisIzin || "",
    namaIzin: initialData?.namaIzin || "",
    lokasiIzin: initialData?.lokasiIzin || "",
    permohonanMasuk: initialData?.permohonanMasuk || new Date(),
    tglPermintaanRekomendasi: initialData?.tglPermintaanRekomendasi || null,
    tglRekomendasi: initialData?.tglRekomendasi || null,
    tglTerbitIzin: initialData?.tglTerbitIzin || null,
    tglPenyerahanIzin: initialData?.tglPenyerahanIzin || null,
    rekomendasiHari: initialData?.rekomendasiHari || 0,
    perizinan: initialData?.perizinan || "",
    totalSLA: initialData?.totalSLA || 0,
    sektor: initialData?.sektor || "",
    keterangan: initialData?.keterangan || "",
    status: initialData?.status || ("pending" as const),
    userId: initialData?.userId || "1",
    phoneNumber: initialData?.phoneNumber || "",
    applicantName: initialData?.applicantName || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const DatePicker = ({
    date,
    onDateChange,
    placeholder,
  }: { date: Date | null; onDateChange: (date: Date | null) => void; placeholder: string }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "dd MMMM yyyy", { locale: id }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={date || undefined} onSelect={onDateChange} initialFocus required />
      </PopoverContent>
    </Popover>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit Perizinan" : "Tambah Perizinan Baru"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="applicantName">Nama Pemohon</Label>
              <Input
                id="applicantName"
                value={formData.applicantName}
                onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                placeholder="Masukkan nama pemohon"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Nomor HP (WhatsApp)</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="Contoh: 081234567890"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jenisIzin">Jenis Izin</Label>
              <Select
                value={formData.jenisIzin}
                onValueChange={(value) => setFormData({ ...formData, jenisIzin: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis izin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Izin Perdagangan">Izin Perdagangan</SelectItem>
                  <SelectItem value="Izin Pariwisata">Izin Pariwisata</SelectItem>
                  <SelectItem value="Izin Kesehatan">Izin Kesehatan</SelectItem>
                  <SelectItem value="Izin Pendidikan">Izin Pendidikan</SelectItem>
                  <SelectItem value="Izin Pertanian">Izin Pertanian</SelectItem>
                  <SelectItem value="Izin Perikanan">Izin Perikanan</SelectItem>
                  <SelectItem value="Izin Mendirikan Bangunan (IMB)">Izin Mendirikan Bangunan (IMB)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="namaIzin">Nama Izin</Label>
              <Input
                id="namaIzin"
                value={formData.namaIzin}
                onChange={(e) => setFormData({ ...formData, namaIzin: e.target.value })}
                placeholder="Masukkan nama izin"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lokasiIzin">Lokasi Izin</Label>
              <Input
                id="lokasiIzin"
                value={formData.lokasiIzin}
                onChange={(e) => setFormData({ ...formData, lokasiIzin: e.target.value })}
                placeholder="Masukkan lokasi izin"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Permohonan Masuk</Label>
              <DatePicker
                date={formData.permohonanMasuk}
                onDateChange={(date) => setFormData({ ...formData, permohonanMasuk: date || new Date() })}
                placeholder="Pilih tanggal permohonan"
              />
            </div>

            <div className="space-y-2">
              <Label>Tanggal Permintaan Rekomendasi</Label>
              <DatePicker
                date={formData.tglPermintaanRekomendasi}
                onDateChange={(date) => setFormData({ ...formData, tglPermintaanRekomendasi: date })}
                placeholder="Pilih tanggal permintaan"
              />
            </div>

            <div className="space-y-2">
              <Label>Tanggal Rekomendasi</Label>
              <DatePicker
                date={formData.tglRekomendasi}
                onDateChange={(date) => setFormData({ ...formData, tglRekomendasi: date })}
                placeholder="Pilih tanggal rekomendasi"
              />
            </div>

            <div className="space-y-2">
              <Label>Tanggal Terbit Izin</Label>
              <DatePicker
                date={formData.tglTerbitIzin}
                onDateChange={(date) => setFormData({ ...formData, tglTerbitIzin: date })}
                placeholder="Pilih tanggal terbit"
              />
            </div>

            <div className="space-y-2">
              <Label>Tanggal Penyerahan Izin</Label>
              <DatePicker
                date={formData.tglPenyerahanIzin}
                onDateChange={(date) => setFormData({ ...formData, tglPenyerahanIzin: date })}
                placeholder="Pilih tanggal penyerahan"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rekomendasiHari">Rekomendasi Hari</Label>
              <Input
                id="rekomendasiHari"
                type="number"
                value={formData.rekomendasiHari || ""}
                onChange={(e) => setFormData({ ...formData, rekomendasiHari: Number.parseInt(e.target.value) || 0 })}
                placeholder="Jumlah hari rekomendasi"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="perizinan">Perizinan</Label>
              <Input
                id="perizinan"
                value={formData.perizinan}
                onChange={(e) => setFormData({ ...formData, perizinan: e.target.value })}
                placeholder="Instansi perizinan"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalSLA">Total SLA (Hari)</Label>
              <Input
                id="totalSLA"
                type="number"
                value={formData.totalSLA}
                onChange={(e) => setFormData({ ...formData, totalSLA: Number.parseInt(e.target.value) || 0 })}
                placeholder="Total SLA dalam hari"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sektor">Sektor</Label>
              <Select value={formData.sektor} onValueChange={(value) => setFormData({ ...formData, sektor: value })}>
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
            <Label htmlFor="keterangan">Keterangan</Label>
            <Textarea
              id="keterangan"
              value={formData.keterangan}
              onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
              placeholder="Masukkan keterangan tambahan"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="proses">Proses</SelectItem>
                <SelectItem value="selesai">Selesai</SelectItem>
                <SelectItem value="ditolak">Ditolak</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              {initialData ? "Update" : "Simpan"} Perizinan
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Batal
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
