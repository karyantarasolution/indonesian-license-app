"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Edit, Search, Plus } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import type { Perizinan, Verification } from "@/lib/types"

interface VerificationListProps {
  perizinanData: Perizinan[]
  verifications: Verification[]
  onStartVerification: (perizinan: Perizinan) => void
  onEditVerification: (perizinan: Perizinan, verification: Verification) => void
  onViewVerification: (perizinan: Perizinan, verification: Verification) => void
}

export function VerificationList({
  perizinanData,
  verifications,
  onStartVerification,
  onEditVerification,
  onViewVerification,
}: VerificationListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredData = perizinanData.filter((perizinan) => {
    const matchesSearch =
      perizinan.namaIzin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      perizinan.applicantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      perizinan.lokasiIzin.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || perizinan.verificationStatus === statusFilter

    return matchesSearch && matchesStatus
  })

  const getVerificationStatusBadge = (status?: string) => {
    const colors = {
      not_verified: "bg-gray-100 text-gray-800",
      in_review: "bg-yellow-100 text-yellow-800",
      verified: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    }

    const labels = {
      not_verified: "Belum Diverifikasi",
      in_review: "Dalam Review",
      verified: "Terverifikasi",
      rejected: "Ditolak",
    }

    const currentStatus = status || "not_verified"
    return (
      <Badge className={colors[currentStatus as keyof typeof colors]}>
        {labels[currentStatus as keyof typeof labels]}
      </Badge>
    )
  }

  const getVerificationForPerizinan = (perizinanId: string) => {
    return verifications.find((v) => v.perizinanId === perizinanId)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Daftar Perizinan untuk Verifikasi</CardTitle>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari berdasarkan nama izin, pemohon, atau lokasi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="not_verified">Belum Diverifikasi</SelectItem>
                <SelectItem value="in_review">Dalam Review</SelectItem>
                <SelectItem value="verified">Terverifikasi</SelectItem>
                <SelectItem value="rejected">Ditolak</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Izin</TableHead>
                  <TableHead>Pemohon</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead>Tanggal Masuk</TableHead>
                  <TableHead>Status Verifikasi</TableHead>
                  <TableHead>Verifikator</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((perizinan) => {
                  const verification = getVerificationForPerizinan(perizinan.id)
                  return (
                    <TableRow key={perizinan.id}>
                      <TableCell className="font-medium">{perizinan.namaIzin}</TableCell>
                      <TableCell>{perizinan.applicantName || "-"}</TableCell>
                      <TableCell>{perizinan.lokasiIzin}</TableCell>
                      <TableCell>{format(perizinan.permohonanMasuk, "dd MMM yyyy", { locale: id })}</TableCell>
                      <TableCell>{getVerificationStatusBadge(perizinan.verificationStatus)}</TableCell>
                      <TableCell>{verification?.verifierName || "-"}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {verification ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onViewVerification(perizinan, verification)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEditVerification(perizinan, verification)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onStartVerification(perizinan)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Mulai Verifikasi
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
