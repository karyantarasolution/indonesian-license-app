"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, FileSpreadsheet, FileText, Cloud } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { Perizinan } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

interface ExportPanelProps {
  data: Perizinan[]
}

export function ExportPanel({ data }: ExportPanelProps) {
  const [exportFormat, setExportFormat] = useState<"excel" | "pdf">("excel")
  const [selectedFields, setSelectedFields] = useState<string[]>([
    "namaIzin",
    "jenisIzin",
    "lokasiIzin",
    "status",
    "permohonanMasuk",
    "totalSLA",
  ])
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({
    from: null,
    to: null,
  })
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sektorFilter, setSektorFilter] = useState<string>("all")
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const availableFields = [
    { id: "namaIzin", label: "Nama Izin" },
    { id: "jenisIzin", label: "Jenis Izin" },
    { id: "lokasiIzin", label: "Lokasi Izin" },
    { id: "permohonanMasuk", label: "Permohonan Masuk" },
    { id: "tglPermintaanRekomendasi", label: "Tgl Permintaan Rekomendasi" },
    { id: "tglRekomendasi", label: "Tgl Rekomendasi" },
    { id: "tglTerbitIzin", label: "Tgl Terbit Izin" },
    { id: "tglPenyerahanIzin", label: "Tgl Penyerahan Izin" },
    { id: "rekomendasiHari", label: "Rekomendasi Hari" },
    { id: "perizinan", label: "Perizinan" },
    { id: "totalSLA", label: "Total SLA" },
    { id: "sektor", label: "Sektor" },
    { id: "status", label: "Status" },
    { id: "keterangan", label: "Keterangan" },
  ]

  const handleFieldToggle = (fieldId: string) => {
    setSelectedFields((prev) => (prev.includes(fieldId) ? prev.filter((id) => id !== fieldId) : [...prev, fieldId]))
  }

  const getFilteredData = () => {
    let filtered = data

    // Filter by date range
    if (dateRange.from && dateRange.to) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.permohonanMasuk)
        return itemDate >= dateRange.from! && itemDate <= dateRange.to!
      })
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter)
    }

    // Filter by sektor
    if (sektorFilter !== "all") {
      filtered = filtered.filter((item) => item.sektor === sektorFilter)
    }

    return filtered
  }

  const exportToExcel = async () => {
    setIsExporting(true)
    try {
      const filteredData = getFilteredData()

      // Simulate Excel export
      const csvContent = generateCSV(filteredData)
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `perizinan_export_${format(new Date(), "yyyy-MM-dd")}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Export Berhasil",
        description: `Data berhasil di-export ke Excel (${filteredData.length} records)`,
      })
    } catch (error) {
      toast({
        title: "Export Gagal",
        description: "Terjadi kesalahan saat export data",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const exportToPDF = async () => {
    setIsExporting(true)
    try {
      const filteredData = getFilteredData()

      // Simulate PDF export
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Export Berhasil",
        description: `Data berhasil di-export ke PDF (${filteredData.length} records)`,
      })
    } catch (error) {
      toast({
        title: "Export Gagal",
        description: "Terjadi kesalahan saat export data",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const uploadToGoogleDrive = async () => {
    setIsExporting(true)
    try {
      // Simulate Google Drive upload
      await new Promise((resolve) => setTimeout(resolve, 3000))

      toast({
        title: "Upload Berhasil",
        description: "File berhasil di-upload ke Google Drive",
      })
    } catch (error) {
      toast({
        title: "Upload Gagal",
        description: "Terjadi kesalahan saat upload ke Google Drive",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const generateCSV = (data: Perizinan[]) => {
    const headers = selectedFields.map((field) => {
      const fieldInfo = availableFields.find((f) => f.id === field)
      return fieldInfo?.label || field
    })

    const rows = data.map((item) => {
      return selectedFields.map((field) => {
        const value = item[field as keyof Perizinan]
        if (value instanceof Date) {
          return format(value, "dd/MM/yyyy")
        }
        return value?.toString() || ""
      })
    })

    return [headers, ...rows].map((row) => row.join(",")).join("\n")
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

  const filteredData = getFilteredData()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Export Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Pengaturan Export</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Format Selection */}
            <div className="space-y-2">
              <Label>Format Export</Label>
              <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excel">Excel (.csv)</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <Label>Filter Tanggal</Label>
              <div className="grid grid-cols-2 gap-2">
                <DatePicker
                  date={dateRange.from}
                  onDateChange={(date) => setDateRange({ ...dateRange, from: date })}
                  placeholder="Dari tanggal"
                />
                <DatePicker
                  date={dateRange.to}
                  onDateChange={(date) => setDateRange({ ...dateRange, to: date })}
                  placeholder="Sampai tanggal"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Filter Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="proses">Proses</SelectItem>
                  <SelectItem value="selesai">Selesai</SelectItem>
                  <SelectItem value="ditolak">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sektor Filter */}
            <div className="space-y-2">
              <Label>Filter Sektor</Label>
              <Select value={sektorFilter} onValueChange={setSektorFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Sektor</SelectItem>
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

            {/* Field Selection */}
            <div className="space-y-2">
              <Label>Pilih Field yang akan di-export</Label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {availableFields.map((field) => (
                  <div key={field.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={field.id}
                      checked={selectedFields.includes(field.id)}
                      onCheckedChange={() => handleFieldToggle(field.id)}
                    />
                    <Label htmlFor={field.id} className="text-sm">
                      {field.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Export Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600">
              <p>
                Data yang akan di-export: <strong>{filteredData.length}</strong> records
              </p>
              <p>
                Field yang dipilih: <strong>{selectedFields.length}</strong> field
              </p>
            </div>

            <div className="space-y-2">
              {exportFormat === "excel" ? (
                <Button
                  onClick={exportToExcel}
                  disabled={isExporting || selectedFields.length === 0}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  {isExporting ? "Exporting..." : "Export ke Excel"}
                </Button>
              ) : (
                <Button
                  onClick={exportToPDF}
                  disabled={isExporting || selectedFields.length === 0}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {isExporting ? "Exporting..." : "Export ke PDF"}
                </Button>
              )}

              <Button
                onClick={uploadToGoogleDrive}
                disabled={isExporting || selectedFields.length === 0}
                variant="outline"
                className="w-full bg-transparent"
              >
                <Cloud className="mr-2 h-4 w-4" />
                {isExporting ? "Uploading..." : "Upload ke Google Drive"}
              </Button>
            </div>

            <div className="text-xs text-gray-500">
              <p>* Export Excel menggunakan format CSV</p>
              <p>* PDF export akan menghasilkan laporan terformat</p>
              <p>* Google Drive memerlukan autentikasi</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Data */}
      <Card>
        <CardHeader>
          <CardTitle>Preview Data ({filteredData.length} records)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {selectedFields.slice(0, 6).map((field) => {
                    const fieldInfo = availableFields.find((f) => f.id === field)
                    return (
                      <th key={field} className="text-left p-2 font-medium">
                        {fieldInfo?.label}
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {filteredData.slice(0, 5).map((item) => (
                  <tr key={item.id} className="border-b">
                    {selectedFields.slice(0, 6).map((field) => {
                      const value = item[field as keyof Perizinan]
                      return (
                        <td key={field} className="p-2">
                          {value instanceof Date ? format(value, "dd/MM/yyyy") : value?.toString() || "-"}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredData.length > 5 && (
              <p className="text-center text-gray-500 py-2">... dan {filteredData.length - 5} data lainnya</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
