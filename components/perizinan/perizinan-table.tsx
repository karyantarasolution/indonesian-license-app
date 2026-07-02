"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Search, Plus } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import type { Perizinan } from "@/lib/types"

interface PerizinanTableProps {
  data: Perizinan[]
  onEdit: (perizinan: Perizinan) => void
  onDelete: (id: string) => void
  onAdd: () => void
}

export function PerizinanTable({ data, onEdit, onDelete, onAdd }: PerizinanTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredData = data.filter(
    (item) =>
      item.namaIzin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.lokasiIzin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sektor.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      proses: "default",
      selesai: "default",
      ditolak: "destructive",
    } as const

    const colors = {
      pending: "bg-gray-100 text-gray-800",
      proses: "bg-yellow-100 text-yellow-800",
      selesai: "bg-green-100 text-green-800",
      ditolak: "bg-red-100 text-red-800",
    }

    return (
      <Badge variant={variants[status as keyof typeof variants]} className={colors[status as keyof typeof colors]}>
        {status}
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Data Perizinan</CardTitle>
          <Button onClick={onAdd} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Perizinan
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cari berdasarkan nama izin, lokasi, atau sektor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Izin</TableHead>
                <TableHead>Jenis Izin</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead>Sektor</TableHead>
                <TableHead>Permohonan Masuk</TableHead>
                <TableHead>Total SLA</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.namaIzin}</TableCell>
                  <TableCell>{item.jenisIzin}</TableCell>
                  <TableCell>{item.lokasiIzin}</TableCell>
                  <TableCell>{item.sektor}</TableCell>
                  <TableCell>{format(item.permohonanMasuk, "dd MMM yyyy", { locale: id })}</TableCell>
                  <TableCell>{item.totalSLA} hari</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
