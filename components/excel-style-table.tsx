"use client"

import { useState, useMemo } from "react"
import { useLicenses } from "@/contexts/license-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Download, 
  Upload, 
  Search, 
  Filter,
  FileSpreadsheet
} from "lucide-react"
import { calculateRekomendasiHari, calculatePerizinanHari } from "@/lib/utils"

export default function ExcelStyleTable() {
  const { licenses } = useLicenses()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Filter licenses based on search and status
  const filteredLicenses = useMemo(() => {
    return licenses.filter(license => {
      const matchesSearch = 
        license.namaIzin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        license.jenisIzin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        license.sektor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        license.lokasiIzin.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === "all" || license.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
  }, [licenses, searchTerm, statusFilter])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: "bg-gray-100 text-gray-800", label: "Draft" },
      proses: { color: "bg-blue-100 text-blue-800", label: "Proses" },
      rekomendasi: { color: "bg-orange-100 text-orange-800", label: "Rekomendasi" },
      selesai: { color: "bg-green-100 text-green-800", label: "Selesai" },
      terlambat: { color: "bg-red-100 text-red-800", label: "Terlambat" },
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit", 
      year: "numeric"
    })
  }

  const exportToExcel = () => {
    // Create workbook and worksheet
    const XLSX = require('xlsx')
    const workbook = XLSX.utils.book_new()
    
    // Create empty worksheet first
    const worksheet = XLSX.utils.aoa_to_sheet([])
    
    // Add header rows with proper centering
    const headerRows = [
      ['WAKTU LAYANAN (SERVICE LEVEL AGREEMENT)'],
      ['PERIZINAN NON ELEKTRONIK'],
      ['DPMPTSP KABUPATEN TAPIN'],
      [new Date().getFullYear().toString()]
    ]

    // Insert header rows at the beginning
    XLSX.utils.sheet_add_aoa(worksheet, headerRows, { origin: 'A1' })

    // Add empty rows after header
    XLSX.utils.sheet_add_aoa(worksheet, [[''], [''], [''], ['']], { origin: 'A5' })

    // Add table headers at row 6
    const tableHeaders = [
      'NO', 'JENIS IZIN', 'NAMA IZIN', 'ALAMAT', 'SEKTOR',
      'TANGGAL PEMOHON MASUK', 'TANGGAL PERMINTAAN REKOMENDASI',
      'TANGGAL PERMINTAAN REKOMENDASI DI SERAHKAN', 'TANGGAL REKOMENDASI',
      'TANGGAL REKOMENDASI IZIN DITERIMA', 'TANGGAL TERBIT IZIN',
      'TANGGAL PENYERAHAN IZIN', 'REKOMENDASI HARI', 'PERIZINAN (HARI) - Masuk ke Terbit',
      'TOTAL SLA', 'STATUS', 'KETERANGAN'
    ]
    XLSX.utils.sheet_add_aoa(worksheet, [tableHeaders], { origin: 'A6' })

    // Add data rows starting from row 7
    const dataRows = filteredLicenses.map((license, index) => [
      index + 1,
      license.jenisIzin,
      license.namaIzin,
      license.lokasiIzin,
      license.sektor,
      license.permohonanMasuk ? formatDate(license.permohonanMasuk) : '',
      license.tglPermintaanRekomendasi ? formatDate(license.tglPermintaanRekomendasi) : '',
      license.tglPermintaanRekomendasiDiserahkan ? formatDate(license.tglPermintaanRekomendasiDiserahkan) : '',
      license.tglRekomendasi ? formatDate(license.tglRekomendasi) : '',
      license.tglRekomendasiIzinDiterima ? formatDate(license.tglRekomendasiIzinDiterima) : '',
      license.tglTerbitIzin ? formatDate(license.tglTerbitIzin) : '',
      license.tglPenyerahanIzin ? formatDate(license.tglPenyerahanIzin) : '',
      calculateRekomendasiHari(license), // Rekomendasi Hari otomatis
      calculatePerizinanHari(license), // Perizinan Hari otomatis
      license.totalSLA,
      license.status === 'draft' ? 'Draft' : 
      license.status === 'proses' ? 'Proses' : 
      license.status === 'rekomendasi' ? 'Rekomendasi' : 
      license.status === 'selesai' ? 'Selesai' : 
      license.status === 'terlambat' ? 'Terlambat' : license.status,
      license.keterangan
    ])

    if (dataRows.length > 0) {
      XLSX.utils.sheet_add_aoa(worksheet, dataRows, { origin: 'A7' })
    }

    // Set column widths
    const columnWidths = [
      { wch: 5 },   // NO
      { wch: 25 },  // JENIS IZIN
      { wch: 30 },  // NAMA IZIN
      { wch: 35 },  // ALAMAT
      { wch: 15 },  // SEKTOR
      { wch: 20 },  // TANGGAL PEMOHON MASUK
      { wch: 25 },  // TANGGAL PERMINTAAN REKOMENDASI
      { wch: 30 },  // TANGGAL PERMINTAAN REKOMENDASI DI SERAHKAN
      { wch: 20 },  // TANGGAL REKOMENDASI
      { wch: 25 },  // TANGGAL REKOMENDASI IZIN DITERIMA
      { wch: 20 },  // TANGGAL TERBIT IZIN
      { wch: 20 },  // TANGGAL PENYERAHAN IZIN
      { wch: 15 },  // REKOMENDASI HARI
      { wch: 15 },  // PERIZINAN (HARI)
      { wch: 10 },  // TOTAL SLA
      { wch: 12 },  // STATUS
      { wch: 30 },  // KETERANGAN
    ]
    worksheet['!cols'] = columnWidths

    // Style header cells (Rows 1-4) - Center aligned and bold
    for (let i = 1; i <= 4; i++) {
      const cellRef = `A${i}`
      if (worksheet[cellRef]) {
        worksheet[cellRef].s = {
          font: { 
            bold: true, 
            size: i === 2 ? 14 : i === 4 ? 14 : 12 
          },
          alignment: { 
            horizontal: 'center', 
            vertical: 'center' 
          }
        }
      }
    }

    // Style table headers (Row 6) - Center aligned, bold, gray background
    for (let col = 0; col < tableHeaders.length; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: 5, c: col })
      if (worksheet[cellRef]) {
        worksheet[cellRef].s = {
          font: { bold: true, size: 11 },
          fill: { fgColor: { rgb: "CCCCCC" } },
          alignment: { horizontal: 'center', vertical: 'center' },
          border: {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' }
          }
        }
      }
    }

    // Add borders to all data cells and style them
    const dataRange = XLSX.utils.decode_range(worksheet['!ref'])
    for (let R = dataRange.s.r; R <= dataRange.e.r; R++) {
      for (let C = dataRange.s.c; C <= dataRange.e.c; C++) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C })
        if (worksheet[cellRef]) {
          if (!worksheet[cellRef].s) worksheet[cellRef].s = {}
          
          // Add borders to all cells
          worksheet[cellRef].s.border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' }
          }

          // Center align specific columns
          if (C === 0 || C === 12 || C === 13 || C === 14 || C === 15) { // NO, REKOMENDASI HARI, PERIZINAN HARI, TOTAL SLA, STATUS
            worksheet[cellRef].s.alignment = { horizontal: 'center', vertical: 'center' }
          }

          // Style negative values with red color (for Rekomendasi Hari and Perizinan Hari columns)
          if ((C === 12 || C === 13) && typeof worksheet[cellRef].v === 'number' && worksheet[cellRef].v < 0) {
            worksheet[cellRef].s.font = { 
              ...worksheet[cellRef].s.font,
              color: { rgb: "FF0000" } // Red color for negative values
            }
          }
        }
      }
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Perizinan')

    // Generate filename with current date
    const today = new Date()
    const dateStr = today.toISOString().split('T')[0]
    const filename = `perizinan-data-${dateStr}.xlsx`

    // Save file
    XLSX.writeFile(workbook, filename)
  }

  return (
    <div className="space-y-4">
      {/* Header Excel Style - Center Aligned like Excel */}
      <div className="bg-white border-b border-gray-300">
        <div className="text-center py-6">
          <h1 className="text-3xl font-black text-gray-900 mb-4">
            WAKTU LAYANAN (SERVICE LEVEL AGREEMENT)
          </h1>
          <div className="border-t border-gray-300 pt-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              PERIZINAN NON ELEKTRONIK
            </h2>
            <div className="border-t border-gray-300 pt-3">
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                DPMPTSP KABUPATEN TAPIN
              </h3>
              <div className="border-t border-gray-300 pt-3">
                <h4 className="text-3xl font-black text-gray-900">
                  {new Date().getFullYear()}
                </h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 border border-gray-200">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cari perizinan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Status</option>
            <option value="draft">Draft</option>
            <option value="proses">Proses</option>
            <option value="rekomendasi">Rekomendasi</option>
            <option value="selesai">Selesai</option>
            <option value="terlambat">Terlambat</option>
          </select>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Excel Style Table */}
      <div className="bg-white border border-gray-300 overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              <th className="border border-gray-300 bg-gray-100 font-bold text-center text-sm p-2">
                NO
              </th>
              <th className="border border-gray-300 bg-gray-100 font-bold text-sm p-2">
                JENIS IZIN
              </th>
              <th className="border border-gray-300 bg-gray-100 font-bold text-sm p-2">
                NAMA IZIN
              </th>
              <th className="border border-gray-300 bg-gray-100 font-bold text-sm p-2">
                ALAMAT
              </th>
              <th className="border border-gray-300 bg-gray-100 font-bold text-sm p-2">
                SEKTOR
              </th>
              <th className="border border-gray-300 bg-gray-100 font-bold text-sm p-2">
                TANGGAL PEMOHON MASUK
              </th>
              <th className="border border-gray-300 bg-gray-100 font-bold text-sm p-2">
                TANGGAL PERMINTAAN REKOMENDASI
              </th>
              <th className="border border-gray-300 bg-gray-100 font-bold text-sm p-2">
                TANGGAL PERMINTAAN REKOMENDASI DI SERAHKAN
              </th>
              <th className="border border-gray-300 bg-gray-100 font-bold text-sm p-2">
                TANGGAL REKOMENDASI
              </th>
              <th className="border border-gray-300 bg-gray-100 font-bold text-sm p-2">
                TANGGAL REKOMENDASI IZIN DITERIMA
              </th>
              <th className="border border-gray-300 bg-gray-100 font-bold text-sm p-2">
                TANGGAL TERBIT IZIN
              </th>
              <th className="border border-gray-300 bg-gray-100 font-bold text-sm p-2">
                TANGGAL PENYERAHAN IZIN
              </th>
              <th className="border border-gray-300 bg-gray-100 font-bold text-center text-sm p-2">
                REKOMENDASI HARI
              </th>
              <th className="border border-gray-300 bg-gray-100 font-bold text-center text-sm p-2">
                PERIZINAN (HARI)<br/><span className="text-xs font-normal"></span>
              </th>
              <th className="border border-gray-300 bg-gray-100 font-bold text-center text-sm p-2">
                TOTAL SLA
              </th>
              <th className="border border-gray-300 bg-gray-100 font-bold text-center text-sm p-2">
                STATUS
              </th>
              <th className="border border-gray-300 bg-gray-100 font-bold text-sm p-2">
                KETERANGAN
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredLicenses.map((license, index) => (
              <tr key={license.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 text-center font-medium p-2">
                  {index + 1}
                </td>
                <td className="border border-gray-300 text-sm p-2">
                  {license.jenisIzin}
                </td>
                <td className="border border-gray-300 text-sm font-medium p-2">
                  {license.namaIzin}
                </td>
                <td className="border border-gray-300 text-sm p-2">
                  {license.lokasiIzin}
                </td>
                <td className="border border-gray-300 text-sm p-2">
                  {license.sektor}
                </td>
                <td className="border border-gray-300 text-sm text-center p-2">
                  {formatDate(license.permohonanMasuk)}
                </td>
                <td className="border border-gray-300 text-sm text-center p-2">
                  {formatDate(license.tglPermintaanRekomendasi)}
                </td>
                <td className="border border-gray-300 text-sm text-center p-2">
                  {formatDate(license.tglPermintaanRekomendasiDiserahkan)}
                </td>
                <td className="border border-gray-300 text-sm text-center p-2">
                  {formatDate(license.tglRekomendasi)}
                </td>
                <td className="border border-gray-300 text-sm text-center p-2">
                  {formatDate(license.tglRekomendasiIzinDiterima)}
                </td>
                <td className="border border-gray-300 text-sm text-center p-2">
                  {formatDate(license.tglTerbitIzin)}
                </td>
                <td className="border border-gray-300 text-sm text-center p-2">
                  {formatDate(license.tglPenyerahanIzin)}
                </td>
                <td className="border border-gray-300 text-center p-2">
                  <span className={calculateRekomendasiHari(license) < 0 ? 'text-red-600 font-medium' : ''}>
                    {calculateRekomendasiHari(license)}
                  </span>
                </td>
                <td className="border border-gray-300 text-center p-2">
                  <span className={calculatePerizinanHari(license) < 0 ? 'text-red-600 font-medium' : ''}>
                    {calculatePerizinanHari(license)}
                  </span>
                </td>
                <td className="border border-gray-300 text-center font-medium p-2">
                  {license.totalSLA}
                </td>
                <td className="border border-gray-300 text-center p-2">
                  {getStatusBadge(license.status)}
                </td>
                <td className="border border-gray-300 text-sm p-2">
                  {license.keterangan}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Export Buttons */}
      <div className="flex justify-end gap-4 bg-white p-4 border border-gray-200">
        <Button variant="outline" onClick={exportToExcel}>
          <Download className="h-4 w-4 mr-2" />
          Export Excel
        </Button>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Import Data
        </Button>
      </div>
    </div>
  )
}
