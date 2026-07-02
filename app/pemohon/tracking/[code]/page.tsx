"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Calendar, CheckCircle, Clock, XCircle, User, MapPin, Mail, Phone, File, Download, Eye, AlertCircle } from "lucide-react"
import Link from "next/link"
import { License } from "@/contexts/license-context"

export default function TrackingPage() {
  const params = useParams()
  const trackingCode = params.code as string
  const [license, setLicense] = useState<License | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLicense = async () => {
      try {
        const response = await fetch(`/api/mysql/licenses/tracking/${trackingCode}`)
        const result = await response.json()
        
        if (result.success && result.data) {
          setLicense(result.data)
        } else {
          setError(result.error || "Permohonan tidak ditemukan")
        }
      } catch (err) {
        setError("Gagal memuat data permohonan")
      } finally {
        setLoading(false)
      }
    }

    if (trackingCode) {
      fetchLicense()
    }
  }, [trackingCode])

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
      draft: { label: "Draft", variant: "secondary" },
      dikirim: { label: "Dikirim", variant: "default" },
      proses: { label: "Diproses", variant: "default" },
      rekomendasi: { label: "Rekomendasi", variant: "default" },
      disetujui: { label: "Disetujui", variant: "default" },
      selesai: { label: "Selesai", variant: "default" },
      terlambat: { label: "Terlambat", variant: "destructive" },
      ditolak: { label: "Ditolak", variant: "destructive" },
    }
    const config = statusConfig[status] || statusConfig.draft
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getStatusTimeline = (status: string) => {
    const steps = [
      { key: "dikirim", label: "Pengajuan Dikirim", date: license?.createdAt },
      { key: "proses", label: "Sedang Diproses", date: license?.tglPermintaanRekomendasi },
      { key: "rekomendasi", label: "Rekomendasi", date: license?.tglRekomendasi },
      { key: "disetujui", label: "Disetujui", date: license?.approvedAt },
      { key: "selesai", label: "Selesai", date: license?.tglPenyerahanIzin },
    ]

    const statusOrder = ["dikirim", "proses", "rekomendasi", "disetujui", "selesai", "terlambat", "ditolak"]
    const currentIndex = statusOrder.indexOf(status)

    return steps.map((step, index) => {
      const stepIndex = statusOrder.indexOf(step.key)
      const isCompleted = stepIndex <= currentIndex && currentIndex >= 0
      const isCurrent = stepIndex === currentIndex

      return (
        <div key={step.key} className="flex items-start gap-4">
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            isCompleted ? "bg-green-500 text-white" : isCurrent ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"
          }`}>
            {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
          </div>
          <div className="flex-1 pb-8">
            <div className={`font-semibold ${isCompleted || isCurrent ? "text-gray-900" : "text-gray-500"}`}>
              {step.label}
            </div>
            {step.date && (
              <div className="text-sm text-gray-600 mt-1">
                {new Date(step.date).toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            )}
          </div>
        </div>
      )
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center">Memuat data...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !license) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-lg font-semibold mb-2">Permohonan Tidak Ditemukan</p>
              <p className="text-gray-600 mb-4">{error || "Kode tracking tidak valid"}</p>
              <Link href="/pemohon">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali ke Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/pemohon">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tracking Permohonan</h1>
              <p className="text-gray-600">Kode Tracking: <code className="bg-gray-100 px-2 py-1 rounded">{trackingCode}</code></p>
            </div>
            {getStatusBadge(license.status)}
          </div>
        </div>

        {/* Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informasi Permohonan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-4">Detail Permohonan</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600">Jenis Izin:</span>
                    <p className="font-medium">{license.jenisIzin}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Nama Izin:</span>
                    <p className="font-medium">{license.namaIzin}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Sektor:</span>
                    <p className="font-medium">{license.sektor}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Perizinan:</span>
                    <p className="font-medium">{license.perizinan}</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Data Pemohon</h4>
                <div className="space-y-3 text-sm">
                  {license.pemohonNama && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{license.pemohonNama}</span>
                    </div>
                  )}
                  {license.pemohonEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{license.pemohonEmail}</span>
                    </div>
                  )}
                  {license.pemohonTelepon && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{license.pemohonTelepon}</span>
                    </div>
                  )}
                  {license.lokasiIzin && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                      <span>{license.lokasiIzin}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {license.keterangan && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold mb-2">Keterangan</h4>
                <p className="text-sm text-gray-600">{license.keterangan}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Berkas dan Verifikasi */}
        {license.files && license.files.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <File className="h-5 w-5" />
                Berkas Permohonan
              </CardTitle>
              <CardDescription>Dokumen yang telah Anda upload</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {license.verificationStatus && (
                  <div className="mb-4 p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">Status Verifikasi:</span>
                      {license.verificationStatus === "pending" ? (
                        <Badge className="bg-yellow-100 text-yellow-800 border-0">
                          <Clock className="h-3 w-3 mr-1" />
                          Menunggu Verifikasi
                        </Badge>
                      ) : license.verificationStatus === "approved" ? (
                        <Badge className="bg-green-100 text-green-800 border-0">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Disetujui
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800 border-0">
                          <XCircle className="h-3 w-3 mr-1" />
                          Ditolak
                        </Badge>
                      )}
                    </div>
                    {license.verificationNotes && (
                      <div className="mt-2">
                        <span className="font-semibold text-sm">Catatan:</span>
                        <p className="text-sm text-gray-600 mt-1">{license.verificationNotes}</p>
                      </div>
                    )}
                    {license.verifiedAt && (
                      <div className="mt-2 text-xs text-gray-500">
                        Diverifikasi pada: {new Date(license.verifiedAt).toLocaleString("id-ID")}
                      </div>
                    )}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {license.files.map((file, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <File className="h-6 w-6 text-blue-600 mt-1" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{file.name}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              {file.type} • {(file.size / 1024).toFixed(2)} KB
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Diupload: {new Date(file.uploadedAt).toLocaleString("id-ID")}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(file.url, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = file.url;
                              link.download = file.name;
                              link.click();
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timeline Proses
            </CardTitle>
            <CardDescription>Status dan progress permohonan Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getStatusTimeline(license.status)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

