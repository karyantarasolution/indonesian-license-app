"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Download, FileSpreadsheet, FileText, Calendar, AlertTriangle } from "lucide-react"
import { exportToExcel, exportToPDF } from "@/lib/export-utils"
import type { License } from "@/contexts/license-context"
import { useToast } from "@/hooks/use-toast"

interface ExportDialogProps {
  data: License[]
  title: string
  children: React.ReactNode
}

export function ExportDialog({ data, title, children }: ExportDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filename, setFilename] = useState("perizinan-data")
  const [exportFormat, setExportFormat] = useState<"excel" | "pdf">("excel")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sectorFilter, setSectorFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const { toast } = useToast()

  const filteredData = data.filter((item) => {
    // Status filter
    if (statusFilter !== "all" && item.status !== statusFilter) return false

    // Sector filter
    if (sectorFilter !== "all" && item.sektor !== sectorFilter) return false

    // Date filter
    if (dateFilter !== "all") {
      const itemDate = new Date(item.createdAt)
      const today = new Date()
      const daysDiff = Math.floor((today.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24))

      switch (dateFilter) {
        case "today":
          return daysDiff === 0
        case "week":
          return daysDiff <= 7
        case "month":
          return daysDiff <= 30
        case "quarter":
          return daysDiff <= 90
        default:
          return true
      }
    }

    return true
  })

  const handleExport = async () => {
    setExportError(null)

    if (filteredData.length === 0) {
      setExportError("Tidak ada data yang dapat diekspor dengan filter yang dipilih.")
      toast({
        title: "Tidak ada data",
        description: "Tidak ada data yang dapat diekspor dengan filter yang dipilih.",
        variant: "destructive",
      })
      return
    }

    setIsExporting(true)

    try {
      const timestamp = new Date().toISOString().split("T")[0]
      const finalFilename = `${filename}-${timestamp}`

      if (exportFormat === "excel") {
        const { blob, filename: excelFilename } = await exportToExcel(filteredData, finalFilename)
        downloadFile(blob, excelFilename)
      } else {
        const { blob, filename: pdfFilename } = await exportToPDF(filteredData, finalFilename)
        downloadFile(blob, pdfFilename)
      }

      toast({
        title: "Export berhasil",
        description: `File ${finalFilename}.${exportFormat === "excel" ? "xlsx" : "pdf"} telah diunduh.`,
      })

      setExportError(null)
    } catch (error) {
      console.error("Export error:", error)
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan saat mengekspor data."
      setExportError(errorMessage)

      toast({
        title: "Export gagal",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const statusOptions = [
    { value: "all", label: "Semua Status", count: data.length },
    { value: "draft", label: "Draft", count: data.filter((d) => d.status === "draft").length },
    { value: "proses", label: "Dalam Proses", count: data.filter((d) => d.status === "proses").length },
    {
      value: "rekomendasi",
      label: "Menunggu Rekomendasi",
      count: data.filter((d) => d.status === "rekomendasi").length,
    },
  ]

  const uniqueSectors = Array.from(new Set(data.map((d) => d.sektor).filter(Boolean)))
  const sectorOptions = [
    { value: "all", label: "Semua Sektor", count: data.length },
    ...uniqueSectors.map((sector) => ({
      value: sector,
      label: sector,
      count: data.filter((d) => d.sektor === sector).length,
    })),
  ]

  const dateOptions = [
    { value: "all", label: "Semua Periode" },
    { value: "today", label: "Hari Ini" },
    { value: "week", label: "7 Hari Terakhir" },
    { value: "month", label: "30 Hari Terakhir" },
    { value: "quarter", label: "3 Bulan Terakhir" },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Export {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="filename">Nama File</Label>
            <Input
              id="filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Masukkan nama file"
            />
            <p className="text-xs text-slate-500">Tanggal akan ditambahkan otomatis</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="format">Format Export</Label>
              <Select value={exportFormat} onValueChange={(value: "excel" | "pdf") => setExportFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excel">
                    <div className="flex items-center">
                      <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
                      Excel (.xlsx)
                    </div>
                  </SelectItem>
                  <SelectItem value="pdf">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-red-600" />
                      PDF (.pdf)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Periode</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dateOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-slate-500" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Filter Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{option.label}</span>
                        <Badge variant="secondary" className="ml-2">
                          {option.count}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sector">Filter Sektor</Label>
              <Select value={sectorFilter} onValueChange={setSectorFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sectorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{option.label}</span>
                        <Badge variant="secondary" className="ml-2">
                          {option.count}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {exportError && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
              <div className="flex items-center text-red-800">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Export Error</span>
              </div>
              <p className="text-sm text-red-700 mt-1">{exportError}</p>
            </div>
          )}

          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg">
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="font-medium text-emerald-800">Preview Export:</span>
              <Badge variant="default" className="bg-emerald-600">
                {filteredData.length} item
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-emerald-700">
              <div>Format: {exportFormat.toUpperCase()}</div>
              <div>
                Status: {statusFilter === "all" ? "Semua" : statusOptions.find((s) => s.value === statusFilter)?.label}
              </div>
              <div>Periode: {dateOptions.find((d) => d.value === dateFilter)?.label}</div>
              <div>
                Sektor: {sectorFilter === "all" ? "Semua" : sectorOptions.find((s) => s.value === sectorFilter)?.label}
              </div>
              <div>Download: Lokal</div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isExporting}>
              Batal
            </Button>
            <Button onClick={handleExport} disabled={isExporting || !filename.trim() || filteredData.length === 0}>
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Mengekspor...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export ({filteredData.length})
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
