"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CheckCircle, XCircle, Clock, FileText, Settings, MapPin, Clipboard } from "lucide-react"
import type { Verification, VerificationItem, VerificationItemResult, Perizinan } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

interface VerificationFormProps {
  perizinan: Perizinan
  verificationItems: VerificationItem[]
  existingVerification?: Verification
  onSubmit: (verification: Omit<Verification, "id" | "createdAt" | "updatedAt">) => void
  onCancel?: () => void
}

export function VerificationForm({
  perizinan,
  verificationItems,
  existingVerification,
  onSubmit,
  onCancel,
}: VerificationFormProps) {
  const [itemResults, setItemResults] = useState<VerificationItemResult[]>(
    existingVerification?.items ||
      verificationItems.map((item) => ({
        itemId: item.id,
        status: "pending" as const,
        comments: "",
      })),
  )
  const [overallComments, setOverallComments] = useState(existingVerification?.comments || "")
  const [verificationStatus, setVerificationStatus] = useState<"in_review" | "verified" | "rejected">(
    existingVerification?.status || "in_review",
  )
  const { toast } = useToast()

  const updateItemStatus = (itemId: string, status: "pending" | "approved" | "rejected", comments?: string) => {
    setItemResults((prev) =>
      prev.map((item) => (item.itemId === itemId ? { ...item, status, comments: comments || item.comments } : item)),
    )
  }

  const updateItemComments = (itemId: string, comments: string) => {
    setItemResults((prev) => prev.map((item) => (item.itemId === itemId ? { ...item, comments } : item)))
  }

  const handleSubmit = () => {
    const requiredItems = verificationItems.filter((item) => item.required)
    const requiredResults = itemResults.filter((result) => requiredItems.some((item) => item.id === result.itemId))

    const hasRejectedRequired = requiredResults.some((result) => result.status === "rejected")
    const hasPendingRequired = requiredResults.some((result) => result.status === "pending")

    let finalStatus = verificationStatus
    if (hasRejectedRequired) {
      finalStatus = "rejected"
    } else if (hasPendingRequired) {
      finalStatus = "in_review"
    }

    const verification: Omit<Verification, "id" | "createdAt" | "updatedAt"> = {
      perizinanId: perizinan.id,
      verifierId: "2", // Current user ID
      verifierName: "Staff Perizinan", // Current user name
      status: finalStatus,
      items: itemResults,
      comments: overallComments,
    }

    onSubmit(verification)

    toast({
      title: "Verifikasi Disimpan",
      description: `Status verifikasi: ${finalStatus === "verified" ? "Disetujui" : finalStatus === "rejected" ? "Ditolak" : "Dalam Review"}`,
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
    }

    const labels = {
      approved: "Disetujui",
      rejected: "Ditolak",
      pending: "Pending",
    }

    return <Badge className={colors[status as keyof typeof colors]}>{labels[status as keyof typeof labels]}</Badge>
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "dokumen":
        return <FileText className="h-4 w-4" />
      case "teknis":
        return <Settings className="h-4 w-4" />
      case "administrasi":
        return <Clipboard className="h-4 w-4" />
      case "lokasi":
        return <MapPin className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const groupedItems = verificationItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    },
    {} as Record<string, VerificationItem[]>,
  )

  const categoryLabels = {
    dokumen: "Dokumen",
    teknis: "Teknis",
    administrasi: "Administrasi",
    lokasi: "Lokasi",
  }

  const getOverallProgress = () => {
    const total = itemResults.length
    const approved = itemResults.filter((item) => item.status === "approved").length
    const rejected = itemResults.filter((item) => item.status === "rejected").length

    return {
      total,
      approved,
      rejected,
      pending: total - approved - rejected,
      percentage: Math.round((approved / total) * 100),
    }
  }

  const progress = getOverallProgress()

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Form Verifikasi Perizinan</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {perizinan.namaIzin} - {perizinan.applicantName}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{progress.percentage}%</div>
              <div className="text-xs text-gray-500">Progress Verifikasi</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-green-600">{progress.approved}</div>
              <div className="text-xs text-gray-500">Disetujui</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-red-600">{progress.rejected}</div>
              <div className="text-xs text-gray-500">Ditolak</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-yellow-600">{progress.pending}</div>
              <div className="text-xs text-gray-500">Pending</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-600">{progress.total}</div>
              <div className="text-xs text-gray-500">Total Item</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Items by Category */}
      {Object.entries(groupedItems).map(([category, items]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getCategoryIcon(category)}
              {categoryLabels[category as keyof typeof categoryLabels]}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item) => {
              const result = itemResults.find((r) => r.itemId === item.id)
              return (
                <div key={item.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{item.label}</h4>
                        {item.required && (
                          <Badge variant="outline" className="text-xs">
                            Wajib
                          </Badge>
                        )}
                        {getStatusIcon(result?.status || "pending")}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    </div>
                    {getStatusBadge(result?.status || "pending")}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Status Verifikasi</Label>
                    <RadioGroup
                      value={result?.status || "pending"}
                      onValueChange={(value: any) => updateItemStatus(item.id, value)}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pending" id={`${item.id}-pending`} />
                        <Label htmlFor={`${item.id}-pending`} className="text-sm">
                          Pending
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="approved" id={`${item.id}-approved`} />
                        <Label htmlFor={`${item.id}-approved`} className="text-sm">
                          Disetujui
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="rejected" id={`${item.id}-rejected`} />
                        <Label htmlFor={`${item.id}-rejected`} className="text-sm">
                          Ditolak
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`${item.id}-comments`} className="text-sm font-medium">
                      Catatan {result?.status === "rejected" && <span className="text-red-500">*</span>}
                    </Label>
                    <Textarea
                      id={`${item.id}-comments`}
                      value={result?.comments || ""}
                      onChange={(e) => updateItemComments(item.id, e.target.value)}
                      placeholder={
                        result?.status === "rejected"
                          ? "Wajib diisi untuk item yang ditolak"
                          : "Catatan tambahan (opsional)"
                      }
                      rows={2}
                      className={result?.status === "rejected" && !result?.comments ? "border-red-300" : ""}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      ))}

      {/* Overall Comments */}
      <Card>
        <CardHeader>
          <CardTitle>Catatan Keseluruhan</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={overallComments}
            onChange={(e) => setOverallComments(e.target.value)}
            placeholder="Masukkan catatan keseluruhan untuk verifikasi ini..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Final Status */}
      <Card>
        <CardHeader>
          <CardTitle>Status Verifikasi Final</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={verificationStatus}
            onValueChange={(value: any) => setVerificationStatus(value)}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="in_review" id="status-review" />
              <Label htmlFor="status-review">Dalam Review</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="verified" id="status-verified" />
              <Label htmlFor="status-verified">Disetujui</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="rejected" id="status-rejected" />
              <Label htmlFor="status-rejected">Ditolak</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={handleSubmit} className="flex-1">
          {existingVerification ? "Update Verifikasi" : "Simpan Verifikasi"}
        </Button>
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Batal
          </Button>
        )}
      </div>
    </div>
  )
}
