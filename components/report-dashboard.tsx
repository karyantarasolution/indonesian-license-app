"use client";

import React, { useState, useMemo } from "react";
import { useLicenses } from "../contexts/license-context";
import type { License } from "../contexts/license-context";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  FileBarChart,
  Download,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  BarChart3,
  Printer,
  XCircle,
} from "lucide-react";
import { ExportDialog } from "./export-dialog";
import { 
  exportToPDF, 
  exportPeriodeWaktuToPDF,
  exportKeterlambatanRisikoToPDF
} from "../lib/export-utils";
import {
  exportSLAPerformanceHtml,
  exportStatusPerizinanHtml,
  exportAnalisisSektorHtml,
  exportIzinExpiredHtml,
  exportDaftarPemohonHtml,
  exportPermohonanDitolakHtml
} from "../lib/html2pdf-export";
import { useToast } from "@/hooks/use-toast";

export default function ReportDashboard() {
  const { licenses, getOverdueLicenses } = useLicenses();
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [selectedSector, setSelectedSector] = useState("all");
  const [activeTab, setActiveTab] = useState("sla-performance");
  const [isPrinting, setIsPrinting] = useState(false);
  const [isExportingSLAPDF, setIsExportingSLAPDF] = useState(false);
  const [isExportingStatusPDF, setIsExportingStatusPDF] = useState(false);
  const [isExportingSektorPDF, setIsExportingSektorPDF] = useState(false);
  const [isExportingPeriodePDF, setIsExportingPeriodePDF] = useState(false);
  const [isExportingRisikoPDF, setIsExportingRisikoPDF] = useState(false);
  const [isExportingIzinExpiredPDF, setIsExportingIzinExpiredPDF] = useState(false);
  const [isExportingDaftarPemohonPDF, setIsExportingDaftarPemohonPDF] = useState(false);
  const [isExportingDitolakPDF, setIsExportingDitolakPDF] = useState(false);

  const overdueLicenses = getOverdueLicenses();

  // Filter data berdasarkan periode dan sektor
  const filteredLicenses = useMemo(() => {
    let filtered = licenses;

    // Filter berdasarkan periode
    if (selectedPeriod !== "all") {
      const now = new Date();
      const filterDate = new Date();
      
      switch (selectedPeriod) {
        case "week":
          filterDate.setDate(now.getDate() - 7);
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case "quarter":
          filterDate.setMonth(now.getMonth() - 3);
          break;
        case "year":
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(license => {
        // Gunakan permohonanMasuk sebagai tanggal referensi, fallback ke createdAt jika tidak ada
        const licenseDateStr = license.permohonanMasuk || license.createdAt;
        if (!licenseDateStr) return false;
        
        const licenseDate = new Date(licenseDateStr);
        return licenseDate >= filterDate;
      });
    }

    // Filter berdasarkan sektor
    if (selectedSector !== "all") {
      filtered = filtered.filter(license => license.sektor === selectedSector);
    }

    return filtered;
  }, [licenses, selectedPeriod, selectedSector]);

  // Statistik laporan
  const reportStats = useMemo(() => {
    const total = filteredLicenses.length;
    const draft = filteredLicenses.filter(l => l.status === "draft").length;
    const proses = filteredLicenses.filter(l => l.status === "proses").length;
    const rekomendasi = filteredLicenses.filter(l => l.status === "rekomendasi").length;
    const selesai = filteredLicenses.filter(l => l.status === "selesai").length;
    const terlambat = filteredLicenses.filter(l => 
      overdueLicenses.some(ol => ol.id === l.id)
    ).length;

    // Hitung rata-rata SLA
    const licensesWithSLA = filteredLicenses.filter(l => l.totalSLA > 0);
    const avgSLA = licensesWithSLA.length > 0 
      ? licensesWithSLA.reduce((sum, l) => sum + l.totalSLA, 0) / licensesWithSLA.length 
      : 0;

    return {
      total,
      draft,
      proses,
      rekomendasi,
      selesai,
      terlambat,
      avgSLA: Math.round(avgSLA * 10) / 10,
    };
  }, [filteredLicenses, overdueLicenses]);

  // Data untuk chart sektor
  const sectorData = useMemo(() => {
    const sectorCount: Record<string, number> = {};
    filteredLicenses.forEach(license => {
      const sector = license.sektor || "Tidak Diketahui";
      sectorCount[sector] = (sectorCount[sector] || 0) + 1;
    });
    
    return Object.entries(sectorCount)
      .map(([sector, count]) => ({ sector, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredLicenses]);

  // Helper format tanggal
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("id-ID");
    } catch {
      return "-";
    }
  };

  // Data izin expired
  const expiredLicenseData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return filteredLicenses
      .filter(l => l.berlakuSampai)
      .map(license => {
        const validUntil = new Date(license.berlakuSampai!);
        validUntil.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((validUntil.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return { ...license, diffDays, isExpired: diffDays < 0 };
      })
      .filter(l => l.diffDays <= 30)
      .sort((a, b) => a.diffDays - b.diffDays);
  }, [filteredLicenses]);

  const expiredCount = expiredLicenseData.filter(l => l.isExpired).length;
  const expiringSoonCount = expiredLicenseData.filter(l => !l.isExpired).length;
  const validCount = filteredLicenses.filter(l => l.status === "selesai" && l.berlakuSampai && !expiredLicenseData.some(el => el.id === l.id)).length;

  // Fungsi untuk download PDF tabel SLA Performance
  const handleDownloadSLAPDF = async () => {
    if (filteredLicenses.length === 0) {
      toast({
        title: "Tidak ada data",
        description: "Tidak ada data yang dapat diekspor dengan filter yang dipilih.",
        variant: "destructive",
      });
      return;
    }

    setIsExportingSLAPDF(true);

    try {
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `laporan-performa-sla-${timestamp}`;
      
      await exportSLAPerformanceHtml(filteredLicenses, filename);

      toast({
        title: "Berhasil",
        description: "PDF laporan performa SLA berhasil diunduh.",
      });
    } catch (error) {
      console.error("Export SLA PDF error:", error);
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan saat mengekspor PDF.";
      
      toast({
        title: "Ekspor gagal",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsExportingSLAPDF(false);
    }
  };

  // Fungsi untuk download PDF tabel Status Perizinan
  const handleDownloadStatusPDF = async () => {
    if (filteredLicenses.length === 0) {
      toast({
        title: "Tidak ada data",
        description: "Tidak ada data yang dapat diekspor dengan filter yang dipilih.",
        variant: "destructive",
      });
      return;
    }

    setIsExportingStatusPDF(true);

    try {
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `laporan-status-perizinan-${timestamp}`;
      
      await exportStatusPerizinanHtml(filteredLicenses, overdueLicenses, filename);

      toast({
        title: "Berhasil",
        description: "PDF laporan status perizinan berhasil diunduh.",
      });
    } catch (error) {
      console.error("Export Status PDF error:", error);
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan saat mengekspor PDF.";
      
      toast({
        title: "Ekspor gagal",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsExportingStatusPDF(false);
    }
  };

  // Fungsi untuk download PDF tabel Analisis Sektor
  const handleDownloadSektorPDF = async () => {
    if (sectorData.length === 0) {
      toast({
        title: "Tidak ada data",
        description: "Tidak ada data yang dapat diekspor dengan filter yang dipilih.",
        variant: "destructive",
      });
      return;
    }

    setIsExportingSektorPDF(true);

    try {
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `laporan-analisis-sektor-${timestamp}`;
      
      await exportAnalisisSektorHtml(filteredLicenses, sectorData, overdueLicenses, filename);

      toast({
        title: "Berhasil",
        description: "PDF laporan analisis sektor berhasil diunduh.",
      });
    } catch (error) {
      console.error("Export Sektor PDF error:", error);
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan saat mengekspor PDF.";
      
      toast({
        title: "Ekspor gagal",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsExportingSektorPDF(false);
    }
  };

  // Fungsi untuk download PDF tabel Periode Waktu
  const handleDownloadPeriodePDF = async () => {
    // Generate period data (same logic as in component)
    const generatePeriodData = () => {
      const periods: Array<{ period: string; date: Date; licenses: typeof licenses }> = [];
      const now = new Date();
      
      if (selectedPeriod === "all") {
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthName = date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
          periods.push({
            period: monthName,
            date: date,
            licenses: licenses.filter(l => {
              // Gunakan permohonanMasuk sebagai tanggal referensi, fallback ke createdAt jika tidak ada
              const licenseDateStr = l.permohonanMasuk || l.createdAt;
              if (!licenseDateStr) return false;
              
              const licenseDate = new Date(licenseDateStr);
              return licenseDate.getMonth() === date.getMonth() && 
                     licenseDate.getFullYear() === date.getFullYear();
            })
          });
        }
      } else {
        const periodNames: Record<string, string> = {
          "week": "1 Minggu Terakhir",
          "month": "1 Bulan Terakhir", 
          "quarter": "3 Bulan Terakhir",
          "year": "1 Tahun Terakhir"
        };
        
        periods.push({
          period: periodNames[selectedPeriod] || selectedPeriod,
          date: now,
          licenses: filteredLicenses
        });
      }
      
      return periods;
    };

    const periodData = generatePeriodData();

    if (periodData.length === 0) {
      toast({
        title: "Tidak ada data",
        description: "Tidak ada data yang dapat diekspor dengan filter yang dipilih.",
        variant: "destructive",
      });
      return;
    }

    setIsExportingPeriodePDF(true);

    try {
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `laporan-periode-waktu-${timestamp}`;
      
      const { blob, filename: pdfFilename } = await exportPeriodeWaktuToPDF(periodData, overdueLicenses, filename);
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = pdfFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Berhasil",
        description: "PDF laporan periode waktu berhasil diunduh.",
      });
    } catch (error) {
      console.error("Export Periode PDF error:", error);
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan saat mengekspor PDF.";
      
      toast({
        title: "Ekspor gagal",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsExportingPeriodePDF(false);
    }
  };

  // Fungsi untuk download PDF tabel Keterlambatan & Risiko
  const handleDownloadRisikoPDF = async () => {
    if (filteredLicenses.length === 0) {
      toast({
        title: "Tidak ada data",
        description: "Tidak ada data permohonan perizinan yang dapat diekspor.",
        variant: "destructive",
      });
      return;
    }

    setIsExportingRisikoPDF(true);

    try {
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `laporan-keseluruhan-permohonan-perizinan-${timestamp}`;
      
      const { blob, filename: pdfFilename } = await exportToPDF(filteredLicenses, filename);
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = pdfFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Berhasil",
        description: "PDF laporan permohonan perizinan berhasil diunduh.",
      });
    } catch (error) {
      console.error("Export PDF error:", error);
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan saat mengekspor PDF.";
      
      toast({
        title: "Ekspor gagal",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsExportingRisikoPDF(false);
    }
  };

  const handleDownloadIzinExpiredPDF = async () => {
    setIsExportingIzinExpiredPDF(true);
    try {
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `laporan-izin-expired-${timestamp}`;
      await exportIzinExpiredHtml(filteredLicenses, filename);
      toast({ title: "Berhasil", description: "PDF laporan izin expired berhasil diunduh." });
    } catch (error) {
      toast({ title: "Ekspor gagal", variant: "destructive" });
    } finally {
      setIsExportingIzinExpiredPDF(false);
    }
  };

  const handleDownloadDaftarPemohonPDF = async () => {
    setIsExportingDaftarPemohonPDF(true);
    try {
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `laporan-daftar-pemohon-${timestamp}`;
      await exportDaftarPemohonHtml(filteredLicenses, filename);
      toast({ title: "Berhasil", description: "PDF laporan daftar pemohon berhasil diunduh." });
    } catch (error) {
      toast({ title: "Ekspor gagal", variant: "destructive" });
    } finally {
      setIsExportingDaftarPemohonPDF(false);
    }
  };

  const handleDownloadDitolakPDF = async () => {
    const rejectedLicenses = filteredLicenses.filter(l => l.verificationStatus === "rejected");
    if (rejectedLicenses.length === 0) {
      toast({ title: "Tidak ada data", description: "Tidak ada permohonan yang ditolak.", variant: "destructive" });
      return;
    }
    setIsExportingDitolakPDF(true);
    try {
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `laporan-permohonan-ditolak-${timestamp}`;
      await exportPermohonanDitolakHtml(filteredLicenses, filename);
      toast({ title: "Berhasil", description: "PDF laporan permohonan ditolak berhasil diunduh." });
    } catch (error) {
      toast({ title: "Ekspor gagal", variant: "destructive" });
    } finally {
      setIsExportingDitolakPDF(false);
    }
  };

  // Fungsi untuk cetak PDF
  const handlePrintPDF = async () => {
    if (filteredLicenses.length === 0) {
      toast({
        title: "Tidak ada data",
        description: "Tidak ada data yang dapat dicetak dengan filter yang dipilih.",
        variant: "destructive",
      });
      return;
    }

    setIsPrinting(true);

    try {
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `laporan-perizinan-${timestamp}`;
      
      const { blob } = await exportToPDF(filteredLicenses, filename);
      
      // Buat URL untuk PDF
      const pdfUrl = URL.createObjectURL(blob);
      
      // Buat iframe untuk print PDF
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "none";
      iframe.src = pdfUrl;
      
      document.body.appendChild(iframe);
      
      iframe.onload = () => {
        setTimeout(() => {
          try {
            iframe.contentWindow?.print();
            
            // Cleanup setelah beberapa detik
            setTimeout(() => {
              document.body.removeChild(iframe);
              URL.revokeObjectURL(pdfUrl);
            }, 1000);
          } catch (err) {
            console.error("Print error:", err);
            // Fallback: buka di window baru
            window.open(pdfUrl, "_blank");
            document.body.removeChild(iframe);
          }
        }, 500);
      };

      toast({
        title: "Berhasil",
        description: "PDF sedang dipersiapkan untuk dicetak.",
      });
    } catch (error) {
      console.error("Print PDF error:", error);
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan saat mencetak PDF.";
      
      toast({
        title: "Cetak gagal",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileBarChart className="h-6 w-6 text-blue-600" />
            Laporan Perizinan
          </h2>
          <p className="text-gray-600 mt-1">
            Analisis dan laporan data perizinan
          </p>
        </div>
      </div>

      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Laporan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Periode Waktu
              </label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Pilih periode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Waktu</SelectItem>
                  <SelectItem value="week">1 Minggu Terakhir</SelectItem>
                  <SelectItem value="month">1 Bulan Terakhir</SelectItem>
                  <SelectItem value="quarter">3 Bulan Terakhir</SelectItem>
                  <SelectItem value="year">1 Tahun Terakhir</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Sektor
              </label>
              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger>
                  <FileText className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Pilih sektor" />
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
          </div>
        </CardContent>
      </Card>

      {/* Report Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex justify-center">
          <TabsList className="flex flex-wrap w-full max-w-[1200px] h-auto gap-2 p-2">
            <TabsTrigger value="sla-performance" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Performa SLA
            </TabsTrigger>
            <TabsTrigger value="status-perizinan" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Status Perizinan
            </TabsTrigger>
            <TabsTrigger value="analisis-sektor" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analisis Sektor
            </TabsTrigger>
            <TabsTrigger value="periode-waktu" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Periode Waktu
            </TabsTrigger>
            <TabsTrigger value="keterlambatan-risiko" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Permohonan
            </TabsTrigger>
            <TabsTrigger value="izin-expired" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Izin Expired
            </TabsTrigger>
            <TabsTrigger value="daftar-pemohon" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Daftar Pemohon
            </TabsTrigger>
            <TabsTrigger value="permohonan-ditolak" className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Permohonan Ditolak
            </TabsTrigger>
          </TabsList>
        </div>

        {/* SLA Performance Tab */}
        <TabsContent value="sla-performance" className="space-y-6">
          {/* SLA Performance Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-700">Tepat Waktu</p>
                    <p className="text-2xl font-bold text-emerald-900">
                      {filteredLicenses.filter(l => l.totalSLA <= 14).length}
                    </p>
                    <p className="text-xs text-emerald-600">
                      {filteredLicenses.length > 0 ? Math.round((filteredLicenses.filter(l => l.totalSLA <= 14).length / filteredLicenses.length) * 100) : 0}% dari total
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-700">Terlambat</p>
                    <p className="text-2xl font-bold text-red-900">
                      {filteredLicenses.filter(l => l.totalSLA > 14).length}
                    </p>
                    <p className="text-xs text-red-600">
                      {filteredLicenses.length > 0 ? Math.round((filteredLicenses.filter(l => l.totalSLA > 14).length / filteredLicenses.length) * 100) : 0}% dari total
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Rata-rata SLA</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {reportStats.avgSLA}
                    </p>
                    <p className="text-xs text-blue-600">hari</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700">Target SLA</p>
                    <p className="text-2xl font-bold text-purple-900">14</p>
                    <p className="text-xs text-purple-600">hari maksimal</p>
                  </div>
                  <FileBarChart className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SLA Performance Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    Detail Laporan Performa SLA
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Analisis detail performa SLA untuk setiap perizinan
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadSLAPDF}
                  disabled={isExportingSLAPDF || filteredLicenses.length === 0}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {isExportingSLAPDF ? "Mengunduh..." : "Download PDF"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-2 font-semibold">No</th>
                      <th className="text-left py-3 px-2 font-semibold">Nama Izin</th>
                      <th className="text-left py-3 px-2 font-semibold">Tanggal Masuk</th>
                      <th className="text-left py-3 px-2 font-semibold">Tanggal Selesai</th>
                      <th className="text-left py-3 px-2 font-semibold">Durasi Aktual</th>
                      <th className="text-left py-3 px-2 font-semibold">Target SLA</th>
                      <th className="text-left py-3 px-2 font-semibold">Status SLA</th>
                      <th className="text-left py-3 px-2 font-semibold">Selisih Hari</th>
                      <th className="text-left py-3 px-2 font-semibold">Penyebab Keterlambatan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLicenses.map((license, index) => {
                      const isOverdue = license.totalSLA > 14;
                      const selisihHari = license.totalSLA - 14;
                      const tanggalMasuk = license.permohonanMasuk ? new Date(license.permohonanMasuk) : null;
                      const tanggalSelesai = license.tglPenyerahanIzin ? new Date(license.tglPenyerahanIzin) : null;
                      
                      return (
                        <tr key={license.id} className={`border-b hover:bg-gray-50 ${isOverdue ? 'bg-red-50' : ''}`}>
                          <td className="py-3 px-2 font-medium">{index + 1}</td>
                          <td className="py-3 px-2">
                            <div className="font-medium text-gray-900">{license.namaIzin}</div>
                            <div className="text-xs text-gray-500">{license.jenisIzin}</div>
                          </td>
                          <td className="py-3 px-2">
                            {tanggalMasuk ? tanggalMasuk.toLocaleDateString("id-ID") : "-"}
                          </td>
                          <td className="py-3 px-2">
                            {tanggalSelesai ? tanggalSelesai.toLocaleDateString("id-ID") : "-"}
                          </td>
                          <td className="py-3 px-2">
                            <span className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-700'}`}>
                              {license.totalSLA || 0} hari
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <span className="text-gray-600">14 hari</span>
                          </td>
                          <td className="py-3 px-2">
                            {isOverdue ? (
                              <Badge className="bg-red-100 text-red-800 border-red-200">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Terlambat
                              </Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Tepat Waktu
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-2">
                            <span className={`font-medium ${isOverdue ? 'text-red-600' : 'text-green-600'}`}>
                              {isOverdue ? `+${selisihHari} hari` : `${selisihHari} hari`}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            {isOverdue ? (
                              <span className="text-sm text-red-600">
                                {license.keterangan || "Dokumen tidak lengkap"}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-500">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                
                {filteredLicenses.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileBarChart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p>Tidak ada data perizinan yang ditemukan</p>
                    <p className="text-sm">Coba ubah filter pencarian Anda</p>
                  </div>
                )}
              </div>

              {/* SLA Performance Summary */}
              {filteredLicenses.length > 0 && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-700 mb-1">
                          {filteredLicenses.length > 0 ? Math.round((filteredLicenses.filter(l => l.totalSLA <= 14).length / filteredLicenses.length) * 100) : 0}%
                        </div>
                        <div className="text-sm text-emerald-600">Tingkat Kepatuhan SLA</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-700 mb-1">
                          {reportStats.avgSLA}
                        </div>
                        <div className="text-sm text-blue-600">Rata-rata Waktu Penyelesaian</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-700 mb-1">
                          {filteredLicenses.filter(l => l.totalSLA > 14).length}
                        </div>
                        <div className="text-sm text-red-600">Perizinan Terlambat</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Status Perizinan Tab */}
        <TabsContent value="status-perizinan" className="space-y-6">
          {/* Status Perizinan Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Draft</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {reportStats.draft}
                    </p>
                    <p className="text-xs text-gray-600">
                      {reportStats.total > 0 ? Math.round((reportStats.draft / reportStats.total) * 100) : 0}% dari total
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-gray-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-700">Dalam Proses</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {reportStats.proses}
                    </p>
                    <p className="text-xs text-yellow-600">
                      {reportStats.total > 0 ? Math.round((reportStats.proses / reportStats.total) * 100) : 0}% dari total
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-700">Rekomendasi</p>
                    <p className="text-2xl font-bold text-orange-900">
                      {reportStats.rekomendasi}
                    </p>
                    <p className="text-xs text-orange-600">
                      {reportStats.total > 0 ? Math.round((reportStats.rekomendasi / reportStats.total) * 100) : 0}% dari total
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Selesai</p>
                    <p className="text-2xl font-bold text-green-900">
                      {reportStats.selesai}
                    </p>
                    <p className="text-xs text-green-600">
                      {reportStats.total > 0 ? Math.round((reportStats.selesai / reportStats.total) * 100) : 0}% dari total
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-700">Terlambat</p>
                    <p className="text-2xl font-bold text-red-900">
                      {reportStats.terlambat}
                    </p>
                    <p className="text-xs text-red-600">
                      {reportStats.total > 0 ? Math.round((reportStats.terlambat / reportStats.total) * 100) : 0}% dari total
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status Perizinan Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Detail Laporan Status Perizinan
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Overview lengkap status semua perizinan dengan timeline progress
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadStatusPDF}
                  disabled={isExportingStatusPDF || filteredLicenses.length === 0}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {isExportingStatusPDF ? "Mengunduh..." : "Download PDF"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-2 font-semibold">No</th>
                      <th className="text-left py-3 px-2 font-semibold">Nama Izin</th>
                      <th className="text-left py-3 px-2 font-semibold">Jenis Izin</th>
                      <th className="text-left py-3 px-2 font-semibold">Sektor</th>
                      <th className="text-left py-3 px-2 font-semibold">Status Saat Ini</th>
                      <th className="text-left py-3 px-2 font-semibold">Tanggal Masuk</th>
                      <th className="text-left py-3 px-2 font-semibold">Durasi Proses</th>
                      <th className="text-left py-3 px-2 font-semibold">Estimasi Selesai</th>
                      <th className="text-left py-3 px-2 font-semibold">Prioritas</th>
                      <th className="text-left py-3 px-2 font-semibold">Petugas Penanggung Jawab</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLicenses.map((license, index) => {
                      const tanggalMasuk = license.permohonanMasuk ? new Date(license.permohonanMasuk) : null;
                      const tanggalSelesai = license.tglPenyerahanIzin ? new Date(license.tglPenyerahanIzin) : null;
                      const isOverdue = overdueLicenses.some(ol => ol.id === license.id);
                      
                      // Hitung durasi proses
                      const durasiProses = tanggalMasuk ? 
                        Math.floor((new Date().getTime() - tanggalMasuk.getTime()) / (1000 * 60 * 60 * 24)) : 0;
                      
                      // Estimasi selesai (tanggal masuk + 14 hari)
                      const estimasiSelesai = tanggalMasuk ? 
                        new Date(tanggalMasuk.getTime() + (14 * 24 * 60 * 60 * 1000)) : null;
                      
                      // Tentukan prioritas
                      const getPrioritas = () => {
                        if (isOverdue) return { level: "Tinggi", color: "bg-red-100 text-red-800" };
                        if (license.status === "proses" && durasiProses > 10) return { level: "Sedang", color: "bg-yellow-100 text-yellow-800" };
                        if (license.status === "draft") return { level: "Rendah", color: "bg-gray-100 text-gray-800" };
                        return { level: "Normal", color: "bg-blue-100 text-blue-800" };
                      };
                      
                      const prioritas = getPrioritas();
                      
                      return (
                        <tr key={license.id} className={`border-b hover:bg-gray-50 ${isOverdue ? 'bg-red-50' : ''}`}>
                          <td className="py-3 px-2 font-medium">{index + 1}</td>
                          <td className="py-3 px-2">
                            <div className="font-medium text-gray-900">{license.namaIzin}</div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="text-sm text-gray-600">{license.jenisIzin}</div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="text-sm text-gray-600">{license.sektor || "-"}</div>
                          </td>
                          <td className="py-3 px-2">
                            {/* Prioritas: Tampilkan status verifikasi ditolak terlebih dahulu */}
                            {license.verificationStatus === "rejected" ? (
                              <div className="space-y-1">
                                <Badge className="bg-red-100 text-red-800 border-red-200">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Ditolak
                                </Badge>
                                {license.verificationNotes && (
                                  <div className="text-xs text-red-700 mt-1 max-w-xs">
                                    <span className="font-medium">Alasan: </span>
                                    {license.verificationNotes}
                                  </div>
                                )}
                              </div>
                            ) : license.status === "draft" ? (
                              <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                                <FileText className="h-3 w-3 mr-1" />
                                Draft
                              </Badge>
                            ) : license.status === "proses" ? (
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                <Clock className="h-3 w-3 mr-1" />
                                Dalam Proses
                              </Badge>
                            ) : license.status === "rekomendasi" ? (
                              <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                                <Clock className="h-3 w-3 mr-1" />
                                Menunggu Rekomendasi
                              </Badge>
                            ) : license.status === "selesai" ? (
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Selesai
                              </Badge>
                            ) : license.status === "terlambat" ? (
                              <Badge className="bg-red-100 text-red-800 border-red-200">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Terlambat
                              </Badge>
                            ) : null}
                          </td>
                          <td className="py-3 px-2">
                            {tanggalMasuk ? tanggalMasuk.toLocaleDateString("id-ID") : "-"}
                          </td>
                          <td className="py-3 px-2">
                            <span className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-700'}`}>
                              {durasiProses} hari
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            {estimasiSelesai ? estimasiSelesai.toLocaleDateString("id-ID") : "-"}
                          </td>
                          <td className="py-3 px-2">
                            <Badge className={prioritas.color}>
                              {prioritas.level}
                            </Badge>
                          </td>
                          <td className="py-3 px-2">
                            <span className="text-sm text-gray-600">
                              {license.createdBy || "Petugas Perizinan"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                
                {filteredLicenses.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p>Tidak ada data perizinan yang ditemukan</p>
                    <p className="text-sm">Coba ubah filter pencarian Anda</p>
                  </div>
                )}
              </div>

              {/* Status Perizinan Summary */}
              {filteredLicenses.length > 0 && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-700 mb-1">
                          {reportStats.total}
                        </div>
                        <div className="text-sm text-blue-600">Total Perizinan</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-700 mb-1">
                          {reportStats.total > 0 ? Math.round((reportStats.selesai / reportStats.total) * 100) : 0}%
                        </div>
                        <div className="text-sm text-green-600">Tingkat Penyelesaian</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-700 mb-1">
                          {reportStats.proses + reportStats.rekomendasi}
                        </div>
                        <div className="text-sm text-yellow-600">Dalam Proses</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-700 mb-1">
                          {reportStats.terlambat}
                        </div>
                        <div className="text-sm text-red-600">Perlu Perhatian</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analisis Sektor Tab */}
        <TabsContent value="analisis-sektor" className="space-y-6">
          {/* Sektor Analysis Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Total Sektor</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {sectorData.length}
                    </p>
                    <p className="text-xs text-blue-600">Jenis sektor aktif</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-700">Sektor Terbanyak</p>
                    <p className="text-lg font-bold text-emerald-900">
                      {sectorData.length > 0 ? sectorData[0].sector : "-"}
                    </p>
                    <p className="text-xs text-emerald-600">
                      {sectorData.length > 0 ? `${sectorData[0].count} perizinan` : ""}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-emerald-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700">Rata-rata per Sektor</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {sectorData.length > 0 ? Math.round(reportStats.total / sectorData.length) : 0}
                    </p>
                    <p className="text-xs text-purple-600">perizinan per sektor</p>
                  </div>
                  <FileText className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-700">Diversifikasi</p>
                    <p className="text-2xl font-bold text-orange-900">
                      {reportStats.total > 0 ? Math.round((sectorData.length / reportStats.total) * 100) : 0}%
                    </p>
                    <p className="text-xs text-orange-600">distribusi sektor</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sektor Analysis Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Detail Laporan Analisis Sektor
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Analisis perizinan berdasarkan jenis izin dengan performa dan tren
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadSektorPDF}
                  disabled={isExportingSektorPDF || sectorData.length === 0}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {isExportingSektorPDF ? "Mengunduh..." : "Download PDF"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-2 font-semibold">No</th>
                      <th className="text-left py-3 px-2 font-semibold">Nama Sektor</th>
                      <th className="text-left py-3 px-2 font-semibold">Total Permohonan</th>
                      <th className="text-left py-3 px-2 font-semibold">Selesai</th>
                      <th className="text-left py-3 px-2 font-semibold">Dalam Proses</th>
                      <th className="text-left py-3 px-2 font-semibold">Terlambat</th>
                      <th className="text-left py-3 px-2 font-semibold">Rata-rata SLA</th>
                      <th className="text-left py-3 px-2 font-semibold">Tingkat Penyelesaian</th>
                      <th className="text-left py-3 px-2 font-semibold">Tren Bulan Ini</th>
                      <th className="text-left py-3 px-2 font-semibold">Kompleksitas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sectorData.map(({ sector, count }, index) => {
                      // Hitung statistik untuk sektor ini
                      const sectorLicenses = filteredLicenses.filter(l => l.sektor === sector);
                      const selesai = sectorLicenses.filter(l => l.status === "selesai").length;
                      const dalamProses = sectorLicenses.filter(l => l.status === "proses" || l.status === "rekomendasi").length;
                      const terlambat = sectorLicenses.filter(l => 
                        overdueLicenses.some(ol => ol.id === l.id)
                      ).length;
                      
                      // Hitung rata-rata SLA
                      const licensesWithSLA = sectorLicenses.filter(l => l.totalSLA > 0);
                      const avgSLA = licensesWithSLA.length > 0 
                        ? licensesWithSLA.reduce((sum, l) => sum + l.totalSLA, 0) / licensesWithSLA.length 
                        : 0;
                      
                      // Tingkat penyelesaian
                      const tingkatPenyelesaian = count > 0 ? Math.round((selesai / count) * 100) : 0;
                      
                      // Tren bulan ini (simulasi)
                      const trenBulanIni = Math.random() > 0.5 ? "+" + Math.floor(Math.random() * 20) + "%" : "-" + Math.floor(Math.random() * 10) + "%";
                      
                      // Tentukan kompleksitas
                      const getKompleksitas = () => {
                        if (avgSLA > 12) return { level: "Tinggi", color: "bg-red-100 text-red-800" };
                        if (avgSLA > 8) return { level: "Sedang", color: "bg-yellow-100 text-yellow-800" };
                        return { level: "Rendah", color: "bg-green-100 text-green-800" };
                      };
                      
                      const kompleksitas = getKompleksitas();
                      
                      return (
                        <tr key={sector} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-2 font-medium">{index + 1}</td>
                          <td className="py-3 px-2">
                            <div className="font-medium text-gray-900">{sector}</div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="font-semibold text-blue-700">{count}</div>
                            <div className="text-xs text-gray-500">permohonan</div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="font-medium text-green-700">{selesai}</div>
                            <div className="text-xs text-gray-500">selesai</div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="font-medium text-yellow-700">{dalamProses}</div>
                            <div className="text-xs text-gray-500">proses</div>
                          </td>
                          <td className="px-2 py-3">
                            <div className="font-medium text-red-700">{terlambat}</div>
                            <div className="text-xs text-gray-500">terlambat</div>
                          </td>
                          <td className="py-3 px-2">
                            <span className={`font-medium ${avgSLA > 14 ? 'text-red-600' : avgSLA > 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                              {Math.round(avgSLA * 10) / 10} hari
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${tingkatPenyelesaian >= 80 ? 'bg-green-600' : tingkatPenyelesaian >= 60 ? 'bg-yellow-600' : 'bg-red-600'}`}
                                  style={{ width: `${tingkatPenyelesaian}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">{tingkatPenyelesaian}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <span className={`text-sm font-medium ${trenBulanIni.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                              {trenBulanIni}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <Badge className={kompleksitas.color}>
                              {kompleksitas.level}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                
                {sectorData.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p>Tidak ada data sektor yang ditemukan</p>
                    <p className="text-sm">Coba ubah filter pencarian Anda</p>
                  </div>
                )}
              </div>

              {/* Sektor Analysis Charts */}
              {sectorData.length > 0 && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Distribusi Perizinan per Sektor</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {sectorData.slice(0, 5).map(({ sector, count }, index) => (
                          <div key={sector} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-700">
                                {index + 1}
                              </div>
                              <span className="text-sm font-medium">{sector}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${(count / reportStats.total) * 100}%` }}
                                ></div>
                              </div>
                              <Badge variant="secondary">{count}</Badge>
                            </div>
                          </div>
                        ))}
                        {sectorData.length > 5 && (
                          <div className="text-center text-sm text-gray-500">
                            Dan {sectorData.length - 5} sektor lainnya...
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Top 5 Sektor Terbanyak</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {sectorData.slice(0, 5).map(({ sector, count }, index) => {
                          const persentase = Math.round((count / reportStats.total) * 100);
                          return (
                            <div key={sector} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="font-medium">{sector}</span>
                                <span className="text-gray-600">{count} ({persentase}%)</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    index === 0 ? 'bg-emerald-600' :
                                    index === 1 ? 'bg-blue-600' :
                                    index === 2 ? 'bg-purple-600' :
                                    index === 3 ? 'bg-orange-600' :
                                    'bg-pink-600'
                                  }`}
                                  style={{ width: `${persentase}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Periode Waktu Tab */}
        <TabsContent value="periode-waktu" className="space-y-6">
          {/* Periode Waktu Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Total Periode</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {selectedPeriod === "all" ? "Semua" : "Terfilter"}
                    </p>
                    <p className="text-xs text-blue-600">Data periode</p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-700">Permohonan Masuk</p>
                    <p className="text-2xl font-bold text-emerald-900">
                      {filteredLicenses.length}
                    </p>
                    <p className="text-xs text-emerald-600">dalam periode ini</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-emerald-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700">Rata-rata SLA</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {reportStats.avgSLA}
                    </p>
                    <p className="text-xs text-purple-600">hari dalam periode</p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-700">Tingkat Penyelesaian</p>
                    <p className="text-2xl font-bold text-orange-900">
                      {reportStats.total > 0 ? Math.round((reportStats.selesai / reportStats.total) * 100) : 0}%
                    </p>
                    <p className="text-xs text-orange-600">selesai tepat waktu</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Periode Waktu Analysis Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Detail Laporan Periode Waktu
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Analisis trend dan pola perizinan berdasarkan waktu dengan perbandingan performa
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPeriodePDF}
                  disabled={isExportingPeriodePDF || filteredLicenses.length === 0}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {isExportingPeriodePDF ? "Mengunduh..." : "Download PDF"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-2 font-semibold">No</th>
                      <th className="text-left py-3 px-2 font-semibold">Periode</th>
                      <th className="text-left py-3 px-2 font-semibold">Total Permohonan</th>
                      <th className="text-left py-3 px-2 font-semibold">Permohonan Selesai</th>
                      <th className="text-left py-3 px-2 font-semibold">Permohonan Terlambat</th>
                      <th className="text-left py-3 px-2 font-semibold">Rata-rata SLA</th>
                      <th className="text-left py-3 px-2 font-semibold">Tingkat Penyelesaian</th>
                      <th className="text-left py-3 px-2 font-semibold">Perbandingan Bulan Lalu</th>
                      <th className="text-left py-3 px-2 font-semibold">Target vs Realisasi</th>
                      <th className="text-left py-3 px-2 font-semibold">Catatan Khusus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      // Generate data periode berdasarkan filter yang dipilih
                      const generatePeriodData = () => {
                        const periods = [];
                        const now = new Date();
                        
                        if (selectedPeriod === "all") {
                          // Generate data untuk 12 bulan terakhir
                          for (let i = 11; i >= 0; i--) {
                            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                            const monthName = date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
                            periods.push({
                              period: monthName,
                              date: date,
                              licenses: licenses.filter(l => {
                                // Gunakan permohonanMasuk sebagai tanggal referensi, fallback ke createdAt jika tidak ada
                                const licenseDateStr = l.permohonanMasuk || l.createdAt;
                                if (!licenseDateStr) return false;
                                
                                const licenseDate = new Date(licenseDateStr);
                                return licenseDate.getMonth() === date.getMonth() && 
                                       licenseDate.getFullYear() === date.getFullYear();
                              })
                            });
                          }
                        } else {
                          // Generate data untuk periode yang dipilih
                          const periodNames = {
                            "week": "1 Minggu Terakhir",
                            "month": "1 Bulan Terakhir", 
                            "quarter": "3 Bulan Terakhir",
                            "year": "1 Tahun Terakhir"
                          };
                          
                          periods.push({
                            period: periodNames[selectedPeriod as keyof typeof periodNames],
                            date: now,
                            licenses: filteredLicenses
                          });
                        }
                        
                        return periods;
                      };
                      
                      const periodData = generatePeriodData();
                      
                      return periodData.map(({ period, licenses: periodLicenses }, index) => {
                        const total = periodLicenses.length;
                        const selesai = periodLicenses.filter(l => l.status === "selesai").length;
                        const terlambat = periodLicenses.filter(l => 
                          overdueLicenses.some(ol => ol.id === l.id)
                        ).length;
                        
                        // Hitung rata-rata SLA
                        const licensesWithSLA = periodLicenses.filter(l => l.totalSLA > 0);
                        const avgSLA = licensesWithSLA.length > 0 
                          ? licensesWithSLA.reduce((sum, l) => sum + l.totalSLA, 0) / licensesWithSLA.length 
                          : 0;
                        
                        const tingkatPenyelesaian = total > 0 ? Math.round((selesai / total) * 100) : 0;
                        
                        // Simulasi perbandingan bulan lalu
                        const perbandinganBulanLalu = Math.random() > 0.5 ? 
                          "+" + Math.floor(Math.random() * 30) + "%" : 
                          "-" + Math.floor(Math.random() * 15) + "%";
                        
                        // Target vs Realisasi (target 90% penyelesaian)
                        const targetPenyelesaian = 90;
                        const realisasiPenyelesaian = tingkatPenyelesaian;
                        const pencapaianTarget = Math.round((realisasiPenyelesaian / targetPenyelesaian) * 100);
                        
                        // Catatan khusus berdasarkan performa
                        const getCatatanKhusus = () => {
                          if (tingkatPenyelesaian >= 95) return "Performa excellent";
                          if (tingkatPenyelesaian >= 85) return "Performa baik";
                          if (tingkatPenyelesaian >= 70) return "Performa cukup";
                          if (terlambat > total * 0.2) return "Banyak keterlambatan";
                          return "Perlu perhatian";
                        };
                        
                        return (
                          <tr key={period} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-2 font-medium">{index + 1}</td>
                            <td className="py-3 px-2">
                              <div className="font-medium text-gray-900">{period}</div>
                            </td>
                            <td className="py-3 px-2">
                              <div className="font-semibold text-blue-700">{total}</div>
                              <div className="text-xs text-gray-500">permohonan</div>
                            </td>
                            <td className="py-3 px-2">
                              <div className="font-medium text-green-700">{selesai}</div>
                              <div className="text-xs text-gray-500">selesai</div>
                            </td>
                            <td className="py-3 px-2">
                              <div className="font-medium text-red-700">{terlambat}</div>
                              <div className="text-xs text-gray-500">terlambat</div>
                            </td>
                            <td className="py-3 px-2">
                              <span className={`font-medium ${avgSLA > 14 ? 'text-red-600' : avgSLA > 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                                {Math.round(avgSLA * 10) / 10} hari
                              </span>
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${tingkatPenyelesaian >= 90 ? 'bg-green-600' : tingkatPenyelesaian >= 70 ? 'bg-yellow-600' : 'bg-red-600'}`}
                                    style={{ width: `${tingkatPenyelesaian}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium">{tingkatPenyelesaian}%</span>
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              <span className={`text-sm font-medium ${perbandinganBulanLalu.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                {perbandinganBulanLalu}
                              </span>
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-1">
                                <span className={`text-sm font-medium ${pencapaianTarget >= 100 ? 'text-green-600' : pencapaianTarget >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                                  {pencapaianTarget}%
                                </span>
                                <span className="text-xs text-gray-500">dari target</span>
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              <span className={`text-sm ${tingkatPenyelesaian >= 90 ? 'text-green-600' : tingkatPenyelesaian >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {getCatatanKhusus()}
                              </span>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
                
                {filteredLicenses.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p>Tidak ada data periode yang ditemukan</p>
                    <p className="text-sm">Coba ubah filter pencarian Anda</p>
                  </div>
                )}
              </div>

              {/* Periode Waktu Charts */}
              {filteredLicenses.length > 0 && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Trend Permohonan per Bulan</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {(() => {
                          // Generate data untuk 6 bulan terakhir
                          const monthlyData: { month: string; count: number }[] = [];
                          const now = new Date();
                          
                          for (let i = 5; i >= 0; i--) {
                            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                            const monthName = date.toLocaleDateString("id-ID", { month: "short" });
                            const monthLicenses = licenses.filter(l => {
                              // Gunakan permohonanMasuk sebagai tanggal referensi, fallback ke createdAt jika tidak ada
                              const licenseDateStr = l.permohonanMasuk || l.createdAt;
                              if (!licenseDateStr) return false;
                              
                              const licenseDate = new Date(licenseDateStr);
                              return licenseDate.getMonth() === date.getMonth() && 
                                     licenseDate.getFullYear() === date.getFullYear();
                            });
                            
                            monthlyData.push({
                              month: monthName,
                              count: monthLicenses.length
                            });
                          }
                          
                          return monthlyData.map(({ month, count }, index) => {
                            const maxCount = Math.max(...monthlyData.map((d: { month: string; count: number }) => d.count));
                            const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                            
                            return (
                              <div key={month} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="font-medium">{month}</span>
                                  <span className="text-gray-600">{count} permohonan</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      index === monthlyData.length - 1 ? 'bg-emerald-600' :
                                      index === monthlyData.length - 2 ? 'bg-blue-600' :
                                      index === monthlyData.length - 3 ? 'bg-purple-600' :
                                      'bg-gray-400'
                                    }`}
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Performa SLA per Periode</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {(() => {
                          const slaRanges = [
                            { range: "≤ 7 hari", min: 0, max: 7, color: "bg-green-600" },
                            { range: "8-10 hari", min: 8, max: 10, color: "bg-blue-600" },
                            { range: "11-14 hari", min: 11, max: 14, color: "bg-yellow-600" },
                            { range: "> 14 hari", min: 15, max: 999, color: "bg-red-600" }
                          ];
                          
                          return slaRanges.map(({ range, min, max, color }) => {
                            const count = filteredLicenses.filter(l => {
                              const sla = l.totalSLA || 0;
                              return sla >= min && sla <= max;
                            }).length;
                            
                            const percentage = filteredLicenses.length > 0 ? 
                              Math.round((count / filteredLicenses.length) * 100) : 0;
                            
                            return (
                              <div key={range} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="font-medium">{range}</span>
                                  <span className="text-gray-600">{count} ({percentage}%)</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${color}`}
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Keseluruhan Permohonan Perizinan Tab */}
        <TabsContent value="keterlambatan-risiko" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Total Permohonan</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {filteredLicenses.length}
                    </p>
                    <p className="text-xs text-blue-600">semua perizinan</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-700">Selesai</p>
                    <p className="text-2xl font-bold text-emerald-900">
                      {filteredLicenses.filter(l => l.status === "selesai").length}
                    </p>
                    <p className="text-xs text-emerald-600">perizinan selesai</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-700">Dalam Proses</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {filteredLicenses.filter(l => l.status === "proses" || l.status === "rekomendasi").length}
                    </p>
                    <p className="text-xs text-yellow-600">sedang diproses</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-700">Terlambat</p>
                    <p className="text-2xl font-bold text-red-900">
                      {filteredLicenses.filter(l => l.totalSLA > 14).length}
                    </p>
                    <p className="text-xs text-red-600">perizinan terlambat</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabel Keseluruhan Permohonan Perizinan */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Keseluruhan Permohonan Perizinan
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Daftar lengkap semua permohonan perizinan yang masuk
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadRisikoPDF}
                  disabled={isExportingRisikoPDF}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {isExportingRisikoPDF ? "Mengunduh..." : "Download PDF"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-2 font-semibold border">NO</th>
                      <th className="text-left py-3 px-2 font-semibold border">JENIS IZIN</th>
                      <th className="text-left py-3 px-2 font-semibold border">NAMA IZIN</th>
                      <th className="text-left py-3 px-2 font-semibold border">ALAMAT</th>
                      <th className="text-left py-3 px-2 font-semibold border">SEKTOR</th>
                      <th className="text-left py-3 px-2 font-semibold border">TANGGAL PEMOHON MASUK</th>
                      <th className="text-left py-3 px-2 font-semibold border">TANGGAL PERMINTAAN REKOMENDASI I</th>
                      <th className="text-left py-3 px-2 font-semibold border">TANGGAL PERMINTAAN REKOMENDASI DI SERAHKAN</th>
                      <th className="text-left py-3 px-2 font-semibold border">TANGGAL REKOMENDASI I</th>
                      <th className="text-left py-3 px-2 font-semibold border">TANGGAL REKOMENDASI IZIN DITERIMA</th>
                      <th className="text-left py-3 px-2 font-semibold border">TANGGAL TERBIT IZIN</th>
                      <th className="text-left py-3 px-2 font-semibold border">TANGGAL PENYERAHAN IZIN</th>
                      <th className="text-left py-3 px-2 font-semibold border">REKOMENDASI (HARI)</th>
                      <th className="text-left py-3 px-2 font-semibold border">PERIZINAN (HARI)</th>
                      <th className="text-left py-3 px-2 font-semibold border">TOTAL SLA</th>
                      <th className="text-left py-3 px-2 font-semibold border">STATUS</th>
                      <th className="text-left py-3 px-2 font-semibold border">KETERANGAN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLicenses.length === 0 ? (
                      <tr>
                        <td colSpan={17} className="text-center py-8 text-gray-500 border">
                          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p>Tidak ada data permohonan perizinan</p>
                        </td>
                      </tr>
                    ) : (
                      filteredLicenses.map((license, index) => {
                        // Debug: Log verification status untuk perizinan yang ditolak
                        if (license.verificationStatus === "rejected") {
                          console.log("License ditolak:", {
                            id: license.id,
                            namaIzin: license.namaIzin,
                            verificationStatus: license.verificationStatus,
                            verificationNotes: license.verificationNotes,
                            status: license.status
                          });
                        }
                        
                        const getStatusText = (status: string) => {
                          // Prioritas: Jika verificationStatus ditolak, tampilkan "ditolak"
                          if (license.verificationStatus === "rejected") {
                            return "ditolak";
                          }
                          
                          switch (status) {
                            case "selesai":
                              return "selesai";
                            case "proses":
                              return "proses";
                            case "rekomendasi":
                              return "rekomendasi";
                            case "draft":
                              return "draft";
                            case "terlambat":
                              return "terlambat";
                            case "dikirim":
                              return "dikirim";
                            default:
                              return status;
                          }
                        };

                        const formatDate = (dateString: string | null | undefined) => {
                          if (!dateString) return "-";
                          try {
                            return new Date(dateString).toLocaleDateString("id-ID");
                          } catch {
                            return "-";
                          }
                        };
                        
                        return (
                          <tr key={license.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-2 font-medium border">{index + 1}</td>
                            <td className="py-3 px-2 border">
                              <span className="text-sm text-gray-700">{license.jenisIzin || "-"}</span>
                            </td>
                            <td className="py-3 px-2 border">
                              <div className="font-medium text-gray-900">{license.namaIzin || "-"}</div>
                            </td>
                            <td className="py-3 px-2 border">
                              <span className="text-sm text-gray-700">
                                {license.lokasiIzin || "-"}
                              </span>
                            </td>
                            <td className="py-3 px-2 border">
                              <span className="text-sm text-gray-700">{license.sektor || "-"}</span>
                            </td>
                            <td className="py-3 px-2 border">
                              <span className="text-sm text-gray-700">
                                {formatDate(license.permohonanMasuk)}
                              </span>
                            </td>
                            <td className="py-3 px-2 border">
                              <span className="text-sm text-gray-700">
                                {formatDate(license.tglPermintaanRekomendasi)}
                              </span>
                            </td>
                            <td className="py-3 px-2 border">
                              <span className="text-sm text-gray-700">
                                {formatDate(license.tglPermintaanRekomendasiDiserahkan)}
                              </span>
                            </td>
                            <td className="py-3 px-2 border">
                              <span className="text-sm text-gray-700">
                                {formatDate(license.tglRekomendasi)}
                              </span>
                            </td>
                            <td className="py-3 px-2 border">
                              <span className="text-sm text-gray-700">
                                {formatDate(license.tglRekomendasiIzinDiterima)}
                              </span>
                            </td>
                            <td className="py-3 px-2 border">
                              <span className="text-sm text-gray-700">
                                {formatDate(license.tglTerbitIzin)}
                              </span>
                            </td>
                            <td className="py-3 px-2 border">
                              <span className="text-sm text-gray-700">
                                {formatDate(license.tglPenyerahanIzin)}
                              </span>
                            </td>
                            <td className="py-3 px-2 border">
                              <span className="text-sm text-gray-700">
                                {license.rekomendasiHari || 0}
                              </span>
                            </td>
                            <td className="py-3 px-2 border">
                              <span className="text-sm text-gray-700">
                                {license.perizinanHari || 0}
                              </span>
                            </td>
                            <td className="py-3 px-2 border">
                              <span className={`text-sm font-medium ${license.totalSLA > 14 ? "text-red-600" : "text-gray-700"}`}>
                                {license.totalSLA || 0}
                              </span>
                            </td>
                            <td className="py-3 px-2 border">
                              <span className={`text-sm font-medium ${
                                license.verificationStatus === "rejected" 
                                  ? "text-red-700" 
                                  : "text-gray-700"
                              }`}>
                                {getStatusText(license.status)}
                              </span>
                            </td>
                            <td className="py-3 px-2 border">
                              {license.verificationStatus === "rejected" && license.verificationNotes ? (
                                <span className="text-sm text-red-700 font-medium">
                                  {license.verificationNotes}
                                </span>
                              ) : (
                                <span className="text-sm text-gray-700">
                                  {license.keterangan || "-"}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
                        </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Izin Expired Tab */}
        <TabsContent value="izin-expired" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-700">Izin Expired</p>
                    <p className="text-2xl font-bold text-red-900">{expiredCount}</p>
                    <p className="text-xs text-red-600">izin telah habis masa berlaku</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-700">Akan Expired</p>
                    <p className="text-2xl font-bold text-amber-900">{expiringSoonCount}</p>
                    <p className="text-xs text-amber-600">akan habis dalam 30 hari</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-amber-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Masih Berlaku</p>
                    <p className="text-2xl font-bold text-green-900">{validCount}</p>
                    <p className="text-xs text-green-600">izin masih berlaku aktif</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-amber-600" />
                    Daftar Izin Expired / Mendekati Expired
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Izin yang telah habis masa berlaku atau akan habis dalam 30 hari ke depan
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadIzinExpiredPDF}
                  disabled={isExportingIzinExpiredPDF}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {isExportingIzinExpiredPDF ? "Mengunduh..." : "Download PDF"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-2 font-semibold border">NO</th>
                      <th className="text-left py-3 px-2 font-semibold border">NAMA IZIN</th>
                      <th className="text-left py-3 px-2 font-semibold border">PEMOHON</th>
                      <th className="text-left py-3 px-2 font-semibold border">BERLAKU SAMPAI</th>
                      <th className="text-left py-3 px-2 font-semibold border">STATUS</th>
                      <th className="text-left py-3 px-2 font-semibold border">SISA HARI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expiredLicenseData.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-500 border">
                          <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p>Tidak ada izin yang expired atau mendekati expired</p>
                        </td>
                      </tr>
                    ) : (
                      expiredLicenseData.map((item, index) => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-2 font-medium border">{index + 1}</td>
                          <td className="py-3 px-2 border">{item.namaIzin || "-"}</td>
                          <td className="py-3 px-2 border">{item.pemohonNama || "-"}</td>
                          <td className="py-3 px-2 border">{formatDate(item.berlakuSampai)}</td>
                          <td className="py-3 px-2 border">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              (item as any).isExpired
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
                            }`}>
                              {(item as any).isExpired ? "Expired" : "Akan Expired"}
                            </span>
                          </td>
                          <td className="py-3 px-2 border">
                            <span className={`font-medium ${
                              (item as any).isExpired ? "text-red-600" : "text-amber-600"
                            }`}>
                              {(item as any).isExpired
                                ? `${Math.abs((item as any).diffDays)} hari lalu`
                                : `${(item as any).diffDays} hari lagi`}
                            </span>
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

        {/* Daftar Pemohon Tab */}
        <TabsContent value="daftar-pemohon" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Daftar Pemohon Perizinan
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Rekapitulasi data pemohon izin
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadDaftarPemohonPDF}
                  disabled={isExportingDaftarPemohonPDF}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {isExportingDaftarPemohonPDF ? "Mengunduh..." : "Download PDF"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-2 font-semibold border">NO</th>
                      <th className="text-left py-3 px-2 font-semibold border">NAMA PEMOHON</th>
                      <th className="text-left py-3 px-2 font-semibold border">KONTAK</th>
                      <th className="text-left py-3 px-2 font-semibold border">ALAMAT</th>
                      <th className="text-left py-3 px-2 font-semibold border">NAMA IZIN</th>
                      <th className="text-left py-3 px-2 font-semibold border">JENIS IZIN</th>
                      <th className="text-left py-3 px-2 font-semibold border">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLicenses.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-gray-500 border">
                          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p>Tidak ada data pemohon</p>
                        </td>
                      </tr>
                    ) : (
                      filteredLicenses.map((license, index) => (
                        <tr key={license.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-2 font-medium border">{index + 1}</td>
                          <td className="py-3 px-2 border">{license.pemohonNama || "-"}</td>
                          <td className="py-3 px-2 border">
                            <div>{license.pemohonTelepon || "-"}</div>
                            <div className="text-xs text-gray-500">{license.pemohonEmail || ""}</div>
                          </td>
                          <td className="py-3 px-2 border">{license.alamat || license.lokasiIzin || "-"}</td>
                          <td className="py-3 px-2 border font-medium">{license.namaIzin || "-"}</td>
                          <td className="py-3 px-2 border">{license.jenisIzin || "-"}</td>
                          <td className="py-3 px-2 border">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              license.verificationStatus === "rejected"
                                ? "bg-red-100 text-red-800"
                                : license.status === "selesai"
                                ? "bg-green-100 text-green-800"
                                : license.status === "proses" || license.status === "rekomendasi"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}>
                              {license.verificationStatus === "rejected" ? "Ditolak" : license.status.toUpperCase()}
                            </span>
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

        {/* Laporan Permohonan Ditolak Tab */}
        <TabsContent value="permohonan-ditolak" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-700">Total Ditolak</p>
                    <p className="text-2xl font-bold text-red-900">
                      {filteredLicenses.filter(l => l.verificationStatus === "rejected").length}
                    </p>
                    <p className="text-xs text-red-600">permohonan ditolak</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-700">Menunggu Verifikasi</p>
                    <p className="text-2xl font-bold text-amber-900">
                      {filteredLicenses.filter(l => l.verificationStatus === "pending").length}
                    </p>
                    <p className="text-xs text-amber-600">belum diverifikasi</p>
                  </div>
                  <Clock className="h-8 w-8 text-amber-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Disetujui</p>
                    <p className="text-2xl font-bold text-green-900">
                      {filteredLicenses.filter(l => l.verificationStatus === "approved").length}
                    </p>
                    <p className="text-xs text-green-600">permohonan disetujui</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rejected Applications Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <XCircle className="h-5 w-5 text-red-600" />
                Daftar Permohonan Ditolak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
                <table className="w-full border-collapse bg-white">
                  <thead>
                    <tr className="bg-gradient-to-r from-red-50 to-red-100 border-b-2 border-red-300">
                      <th className="text-center p-3 text-xs font-bold text-red-800 border-r border-red-200 w-12">No</th>
                      <th className="text-left p-3 text-xs font-bold text-red-800 border-r border-red-200">Kode Tracking</th>
                      <th className="text-left p-3 text-xs font-bold text-red-800 border-r border-red-200">Nama Pemohon</th>
                      <th className="text-left p-3 text-xs font-bold text-red-800 border-r border-red-200">Jenis Izin</th>
                      <th className="text-center p-3 text-xs font-bold text-red-800 border-r border-red-200">Tanggal</th>
                      <th className="text-left p-3 text-xs font-bold text-red-800">Alasan Penolakan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLicenses.filter(l => l.verificationStatus === "rejected").length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-500">
                          Tidak ada permohonan yang ditolak
                        </td>
                      </tr>
                    ) : (
                      filteredLicenses
                        .filter(l => l.verificationStatus === "rejected")
                        .map((license, index) => (
                          <tr key={license.id} className="hover:bg-red-50 transition-colors border-b border-slate-200">
                            <td className="p-3 text-center text-sm text-slate-700 border-r border-slate-200 font-medium">{index + 1}</td>
                            <td className="p-3 text-sm text-slate-800 border-r border-slate-200 font-mono font-semibold">{license.trackingCode || "-"}</td>
                            <td className="p-3 text-sm text-slate-800 border-r border-slate-200 font-medium">{license.pemohonNama || "-"}</td>
                            <td className="p-3 text-sm text-slate-700 border-r border-slate-200">{license.namaIzin || "-"}</td>
                            <td className="p-3 text-sm text-slate-700 border-r border-slate-200 text-center whitespace-nowrap">{formatDate(license.permohonanMasuk)}</td>
                            <td className="p-3 text-sm text-red-700 font-medium">{license.verificationNotes || "Tidak ada alasan yang dicantumkan"}</td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
              {/* Download PDF Button */}
              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadDitolakPDF}
                  disabled={isExportingDitolakPDF}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {isExportingDitolakPDF ? "Mengunduh..." : "Download PDF"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
