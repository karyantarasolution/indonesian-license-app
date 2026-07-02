"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ArrowRight,
  ArrowLeft,
  FileText,
  LogIn,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Trash,
  CreditCard,
  MessageSquare,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { License, useLicenses } from "@/contexts/license-context";

export default function TrackingPermohonanPage() {
  const { toast } = useToast();
  const [trackingCode, setTrackingCode] = useState("");
  const [license, setLicense] = useState<License | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showFilesPanel, setShowFilesPanel] = useState(false);
  const [editingFileIndex, setEditingFileIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Debug: Log trackingCode changes
  useEffect(() => {
    console.log("Tracking code changed:", trackingCode, "trimmed length:", trackingCode.trim().length, "isDisabled:", isLoading || !trackingCode || trackingCode.trim().length === 0);
  }, [trackingCode, isLoading]);

  const handleSearch = async () => {
    if (!trackingCode.trim()) {
      toast({
        title: "Error",
        description: "Masukkan kode tracking terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setLicense(null);
    setShowResult(false);
    
    try {
      const code = trackingCode.trim().toUpperCase();
      console.log("Mencari tracking code:", code);
      
      // Coba fetch dari API
      let foundInAPI = false;
      try {
        const apiUrl = `/api/mysql/licenses/tracking/${encodeURIComponent(code)}`;
        console.log("API URL:", apiUrl);
        
        const response = await fetch(apiUrl);
        console.log("Response status:", response.status);
        
        const result = await response.json();
        console.log("API Result:", result);

        if (result.success && result.data) {
          // Data ditemukan di API
          // Pastikan data sudah dalam format License yang benar
          const licenseData = result.data as License;
          console.log("License data from API:", licenseData);
          console.log("Verification status:", licenseData.verificationStatus);
          setLicense(licenseData);
          setShowResult(true);
          toast({
            title: "Berhasil",
            description: "Data permohonan berhasil ditemukan",
          });
          foundInAPI = true;
          return;
        } else if (response.status === 404) {
          // 404: Data tidak ditemukan di database, coba fallback ke localStorage
          console.warn("Data tidak ditemukan di database (404), mencoba localStorage fallback");
        } else {
          // Error lain dari API, coba fallback ke localStorage
          console.warn("API error, mencoba localStorage fallback. Status:", response.status, "Error:", result.error);
        }
      } catch (apiError: any) {
        console.error("API Error details:", apiError);
        // Network error atau error lain, coba fallback ke localStorage
      }
      
      // Fallback: cari di localStorage jika tidak ditemukan di API
      if (!foundInAPI && typeof window !== 'undefined') {
        try {
          const savedLicenses = localStorage.getItem('licenses');
          if (savedLicenses) {
            const licenses = JSON.parse(savedLicenses);
            const foundLicense = licenses.find((l: License) => 
              l.trackingCode?.toUpperCase() === code
            );
            
            if (foundLicense) {
              setLicense(foundLicense);
              setShowResult(true);
              toast({
                title: "Berhasil",
                description: "Data permohonan berhasil ditemukan (dari cache lokal)",
              });
              return;
            }
          }
        } catch (localError) {
          console.error("Error reading from localStorage:", localError);
        }
      }
      
      // Jika tidak ditemukan di API maupun localStorage
      toast({
        title: "Tidak Ditemukan",
        description: "Permohonan tidak ditemukan dengan kode tracking tersebut. Pastikan kode tracking benar.",
        variant: "destructive",
      });
      setLicense(null);
      setShowResult(false);
      
    } catch (error: any) {
      console.error("Error fetching tracking:", error);
      toast({
        title: "Error",
        description: error.message || "Gagal memuat data permohonan. Silakan coba lagi.",
        variant: "destructive",
      });
      setLicense(null);
      setShowResult(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setShowResult(false);
    setLicense(null);
    setTrackingCode("");
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const { updateLicense } = useLicenses();

  const handleToggleFilesPanel = () => {
    setShowFilesPanel((s) => !s);
  };

  const handleTriggerEdit = (index: number) => {
    setEditingFileIndex(index);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !license) return;
    const file = e.target.files[0];
    if (!file || editingFileIndex === null) return;

    // Keep the document prefix if it exists (e.g. "KTP - ")
    const existingFiles = license.files ? [...license.files] : [];
    const oldName = existingFiles[editingFileIndex]?.name || "";
    let prefix = "";
    if (oldName.includes(" - ")) {
      prefix = oldName.split(" - ")[0] + " - ";
    }

    const newFileObj = {
      name: prefix + file.name,
      url: URL.createObjectURL(file),
      type: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    };

    existingFiles[editingFileIndex] = newFileObj;

    try {
      await updateLicense(license.id, { files: existingFiles, is_applicant_edit: true });
      setLicense({ ...license, files: existingFiles }); // Update local state
      setEditingFileIndex(null);
      setShowFilesPanel(true);
      toast({ title: "Berhasil", description: "Dokumen berhasil diperbarui" });
    } catch (err) {
      console.error("Error replacing file:", err);
      toast({ title: "Error", description: "Gagal mengganti dokumen", variant: "destructive" });
    }
  };

  const handleDeleteFile = async (index: number) => {
    if (!license) return;
    const confirmDel = confirm("Hapus dokumen ini? Tindakan tidak dapat dibatalkan.");
    if (!confirmDel) return;
    const existingFiles = license.files ? [...license.files] : [];
    existingFiles.splice(index, 1);
    try {
      await updateLicense(license.id, { files: existingFiles, is_applicant_edit: true });
      setLicense({ ...license, files: existingFiles }); // Update local state
      setShowFilesPanel(true);
      toast({ title: "Berhasil", description: "Dokumen berhasil dihapus" });
    } catch (err) {
      console.error("Error deleting file:", err);
      toast({ title: "Error", description: "Gagal menghapus dokumen", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      draft: { label: "Draft", className: "bg-slate-500" },
      dikirim: { label: "Dikirim", className: "bg-blue-500" },
      proses: { label: "Diproses", className: "bg-yellow-500" },
      rekomendasi: { label: "Rekomendasi", className: "bg-orange-500" },
      disetujui: { label: "Disetujui", className: "bg-green-500" },
      selesai: { label: "Selesai", className: "bg-emerald-600" },
      terlambat: { label: "Terlambat", className: "bg-red-500" },
      ditolak: { label: "Ditolak", className: "bg-red-600" },
    };

    const config = statusConfig[status] || { label: status, className: "bg-gray-500" };
    return (
      <Badge className={`${config.className} text-white`}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24 py-4">
            {/* Logo Section - Kiri */}
            <div className="flex items-center space-x-4 flex-shrink-0">
              <div className="relative">
                <Image 
                  src="/logo2.png" 
                  alt="Logo DPMPTSP" 
                  width={80} 
                  height={80} 
                  className="h-20 w-auto object-contain"
                  priority
                />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 uppercase tracking-tight">
                  Sistem Pelayanan Perizinan DPMPTSP Kabupaten Tapin
                </h1>
                <p className="text-sm text-slate-600 mt-0.5">
                  SIP(Sistem Informasi Perizinan Tapin)
                </p>
              </div>
            </div>

            {/* Navigasi - Kanan */}
            <div className="flex items-center space-x-6 flex-shrink-0">
              <Link 
                href="/" 
                className="text-sm text-slate-700 hover:text-slate-900 font-medium"
              >
                Beranda
              </Link>
              <Link 
                href="/ajukan-permohonan" 
                className="text-sm text-slate-700 hover:text-slate-900 font-medium"
              >
                Ajukan Permohonan Perizinan
              </Link>
              <Link 
                href="/tracking-permohonan" 
                className="text-sm text-slate-700 hover:text-slate-900 font-medium"
              >
                Tracking Permohonan
              </Link>
              <Link href="/login">
                <Button className="bg-blue-600 hover:bg-blue-700 text-sm">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login 
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showResult ? (
          /* Step 1: Form Input Kode Tracking */
          <Card className="shadow-lg max-w-2xl mx-auto">
            <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Search className="h-6 w-6" />
                Tracking Permohonan
              </CardTitle>
              <CardDescription className="text-emerald-50">
                Masukkan kode tracking untuk melihat status permohonan Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="trackingCode" className="text-base font-semibold">
                  Kode Tracking *
                </Label>
                <Input
                  id="trackingCode"
                  type="text"
                  placeholder="Masukkan kode tracking (contoh: ABC12345)"
                  value={trackingCode}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    setTrackingCode(value);
                  }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && trackingCode.trim() && !isLoading) {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                  className="text-lg"
                />
                <p className="text-sm text-slate-500">
                  Kode tracking dapat Anda temukan di halaman sukses setelah mengajukan permohonan
                </p>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    console.log("Button clicked! isLoading:", isLoading, "trackingCode:", trackingCode);
                    
                    // Cegah multiple clicks saat sedang loading
                    if (isLoading) {
                      console.log("Button click ignored: masih loading");
                      return;
                    }
                    
                    const trimmedCode = trackingCode.trim();
                    console.log("Trimmed code:", trimmedCode, "length:", trimmedCode.length);
                    
                    // Validasi input
                    if (!trimmedCode || trimmedCode.length === 0) {
                      console.log("Validation failed: empty tracking code");
                      toast({
                        title: "Error",
                        description: "Masukkan kode tracking terlebih dahulu",
                        variant: "destructive",
                      });
                      return;
                    }
                    
                    console.log("Calling handleSearch...");
                    // Panggil handleSearch
                    handleSearch().catch((error) => {
                      console.error("Error in handleSearch:", error);
                    });
                  }} 
                  disabled={isLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white w-full sm:w-auto min-w-[120px] px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer relative z-10"
                  style={{ 
                    pointerEvents: isLoading ? 'none' : 'auto',
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin mr-2 inline-block">⏳</span>
                      Mencari...
                    </>
                  ) : (
                    <>
                      Selanjutnya
                      <ArrowRight className="h-4 w-4 ml-2 inline-block" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Step 2: Tampilan Tabel Hasil Tracking */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Hasil Tracking Permohonan</h1>
                <p className="text-slate-600 mt-1">
                  Kode Tracking: <code className="bg-slate-100 px-2 py-1 rounded font-mono">{trackingCode}</code>
                </p>
              </div>
              <div className="flex items-center gap-3">
                {license && getStatusBadge(license.status)}
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Cari Lagi
                </Button>
              </div>
            </div>

            {license && (
              <>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Detail Permohonan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
                    <table className="w-full border-collapse bg-white">
                      <thead>
                        <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-300">
                          <th className="text-left p-4 text-xs font-bold text-slate-800 border-r border-slate-300 whitespace-nowrap">Jenis Izin</th>
                          <th className="text-left p-4 text-xs font-bold text-slate-800 border-r border-slate-300 whitespace-nowrap">Nama Izin</th>
                          <th className="text-left p-4 text-xs font-bold text-slate-800 border-r border-slate-300 whitespace-nowrap">Alamat</th>
                          <th className="text-left p-4 text-xs font-bold text-slate-800 border-r border-slate-300 whitespace-nowrap">Sektor</th>
                          <th className="text-left p-4 text-xs font-bold text-slate-800 border-r border-slate-300 whitespace-nowrap">Tanggal Permohonan Masuk</th>
                          <th className="text-left p-4 text-xs font-bold text-slate-800 border-r border-slate-300 whitespace-nowrap">Tanggal Permintaan Rekomendasi Diserahkan</th>
                          <th className="text-left p-4 text-xs font-bold text-slate-800 border-r border-slate-300 whitespace-nowrap">Tanggal Rekomendasi</th>
                          <th className="text-left p-4 text-xs font-bold text-slate-800 border-r border-slate-300 whitespace-nowrap">Tanggal Rekomendasi Izin Diterima</th>
                          <th className="text-left p-4 text-xs font-bold text-slate-800 border-r border-slate-300 whitespace-nowrap">Tanggal Terbit Izin</th>
                          <th className="text-left p-4 text-xs font-bold text-slate-800 border-r border-slate-300 whitespace-nowrap">Tanggal Penyerahan Izin</th>
                          <th className="text-center p-4 text-xs font-bold text-slate-800 border-r border-slate-300 whitespace-nowrap">Rekomendasi (Hari)</th>
                          <th className="text-center p-4 text-xs font-bold text-slate-800 border-r border-slate-300 whitespace-nowrap">Perizinan (Hari)</th>
                          <th className="text-center p-4 text-xs font-bold text-slate-800 border-r border-slate-300 whitespace-nowrap">Total SLA</th>
                          <th className="text-center p-4 text-xs font-bold text-slate-800 border-r border-slate-300 whitespace-nowrap">Verifikasi</th>
                          <th className="text-center p-4 text-xs font-bold text-slate-800 border-r border-slate-300 whitespace-nowrap">Aksi</th>
                          <th className="text-center p-4 text-xs font-bold text-slate-800 border-r border-slate-300 whitespace-nowrap">Status</th>
                          <th className="text-left p-4 text-xs font-bold text-slate-800 whitespace-nowrap">Keterangan</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="hover:bg-slate-50 transition-colors border-b border-slate-200">
                          <td className="p-4 text-sm text-slate-800 border-r border-slate-200 font-medium">{license.jenisIzin || "-"}</td>
                          <td className="p-4 text-sm text-slate-800 border-r border-slate-200 font-medium">{license.namaIzin || "-"}</td>
                          <td className="p-4 text-sm text-slate-700 border-r border-slate-200">
                            {license.alamat || "-"}
                          </td>
                          <td className="p-4 text-sm text-slate-700 border-r border-slate-200">{license.sektor || "-"}</td>
                          <td className="p-4 text-sm text-slate-700 border-r border-slate-200 whitespace-nowrap">{formatDate(license.permohonanMasuk)}</td>
                          <td className="p-4 text-sm text-slate-700 border-r border-slate-200 whitespace-nowrap">{formatDate(license.tglPermintaanRekomendasiDiserahkan)}</td>
                          <td className="p-4 text-sm text-slate-700 border-r border-slate-200 whitespace-nowrap">{formatDate(license.tglRekomendasi)}</td>
                          <td className="p-4 text-sm text-slate-700 border-r border-slate-200 whitespace-nowrap">{formatDate(license.tglRekomendasiIzinDiterima)}</td>
                          <td className="p-4 text-sm text-slate-700 border-r border-slate-200 whitespace-nowrap">{formatDate(license.tglTerbitIzin)}</td>
                          <td className="p-4 text-sm text-slate-700 border-r border-slate-200 whitespace-nowrap">{formatDate(license.tglPenyerahanIzin)}</td>
                          <td className="p-4 text-sm text-slate-700 border-r border-slate-200 text-center font-semibold">{license.rekomendasiHari || 0} hari</td>
                          <td className="p-4 text-sm text-slate-700 border-r border-slate-200 text-center font-semibold">{license.perizinanHari || 0} hari</td>
                          <td className="p-4 text-sm text-emerald-700 border-r border-slate-200 text-center font-bold">{license.totalSLA || 0} hari</td>
                          <td className="p-4 border-r border-slate-200 text-center">
                            {license.verificationStatus === "pending" ? (
                              <Badge className="bg-yellow-100 text-yellow-800 border-0 text-xs px-2 py-1">
                                <Clock className="h-3 w-3 mr-1 inline" />
                                Menunggu
                              </Badge>
                            ) : license.verificationStatus === "approved" ? (
                              <Badge className="bg-green-100 text-green-800 border-0 text-xs px-2 py-1">
                                <CheckCircle className="h-3 w-3 mr-1 inline" />
                                Disetujui
                              </Badge>
                            ) : license.verificationStatus === "rejected" ? (
                              <Badge className="bg-red-100 text-red-800 border-0 text-xs px-2 py-1">
                                <XCircle className="h-3 w-3 mr-1 inline" />
                                Ditolak
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800 border-0 text-xs px-2 py-1">-</Badge>
                            )}
                          </td>
                          <td className="p-4 border-r border-slate-200 text-center align-top">
                            <div className="flex flex-col items-center gap-2">
                              <button type="button" onClick={handleToggleFilesPanel} className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded text-sm">
                                <FileText className="h-4 w-4" />
                                Kelola Dokumen
                              </button>
                              {showFilesPanel && (
                                <div className="mt-2 w-64 bg-white border border-slate-200 p-2 rounded shadow">
                                  {license.files && license.files.length > 0 ? (
                                    <ul className="space-y-2">
                                      {license.files.map((f, idx) => (
                                        <li key={idx} className="flex items-center justify-between">
                                          <a className="text-sm text-slate-700 truncate" href={f.url} target="_blank" rel="noreferrer">{f.name}</a>
                                          <div className="flex items-center gap-2">
                                            <button onClick={() => handleTriggerEdit(idx)} className="text-emerald-600 hover:text-emerald-800">
                                              <Edit className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleDeleteFile(idx)} className="text-red-600 hover:text-red-800">
                                              <Trash className="h-4 w-4" />
                                            </button>
                                          </div>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <div className="text-sm text-slate-500">Belum ada dokumen yang diunggah</div>
                                  )}
                                </div>
                              )}
                              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
                            </div>
                          </td>
                          <td className="p-4 border-r border-slate-200 text-center">
                            {(() => {
                              // Debug: log verification status
                              if (license.verificationStatus) {
                                console.log("Verification Status:", license.verificationStatus);
                                console.log("Verification Notes:", license.verificationNotes);
                              }
                              
                              // Prioritas: Jika ditolak, tampilkan "Ditolak"
                              if (license.verificationStatus === "rejected") {
                                return (
                                  <Badge className="bg-red-100 text-red-800 border-0 text-xs px-2 py-1">
                                    <XCircle className="h-3 w-3 mr-1 inline" />
                                    Ditolak
                                  </Badge>
                                );
                              }
                              
                              // Jika tidak ditolak, tampilkan status normal
                              return getStatusBadge(license.status);
                            })()}
                          </td>
                          <td className="p-4 text-sm text-slate-700">
                            {(() => {
                              // Jika ditolak dan ada alasan, tampilkan alasan
                              if (license.verificationStatus === "rejected") {
                                if (license.verificationNotes) {
                                  return (
                                    <span className="text-red-700 font-medium">
                                      {license.verificationNotes}
                                    </span>
                                  );
                                } else {
                                  // Jika ditolak tapi tidak ada alasan, tampilkan pesan default
                                  return (
                                    <span className="text-red-700 font-medium italic">
                                      Permohonan ditolak
                                    </span>
                                  );
                                }
                              }
                              
                              // Jika tidak ditolak, tampilkan keterangan normal
                              return license.keterangan || "-";
                            })()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Payment & Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-emerald-600" />
                      Info Pembayaran
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 mb-3">
                      Untuk informasi pembayaran retribusi izin, silakan hubungi petugas atau lakukan pembayaran melalui:
                    </p>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">BNI:</span> 1234567890 a.n. DPMPTSP Tapin</p>
                      <p><span className="font-medium">VA BNI:</span> 9881234567890</p>
                      <p><span className="font-medium">VA Mandiri:</span> 891234567890</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-orange-600" />
                      Pengaduan / Bantuan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 mb-3">
                      Ada kendala atau pertanyaan? Silakan hubungi kami:
                    </p>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Email:</span> dpmptsp.tapin@gmail.com</p>
                      <p><span className="font-medium">Telepon:</span> -</p>
                      <Link href="/pengaduan">
                        <Button variant="outline" size="sm" className="mt-2">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Kirim Pengaduan
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

