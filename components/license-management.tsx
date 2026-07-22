"use client";

import React from "react";
import { useState, useMemo, useEffect } from "react";
import { useLicenses } from "../contexts/license-context";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  FileText,
  Clock,
  AlertCircle,
  Download,
  Filter,
  Calendar,
  MapPin,
  Building,
  ArrowUpDown,
  CheckCheck,
  XCircle,
  RefreshCw,
  Eye,
  CheckCircle,
  X,
  File,
} from "lucide-react";
import type { License } from "../contexts/license-context";
import { useAuth } from "../contexts/auth-context";
import { ExportDialog } from "./export-dialog";
import {
  calculateRekomendasiHari,
  calculatePerizinanHari,
  calculateTotalSLA,
  calculateDays,
} from "../lib/utils";
import { useToast } from "../hooks/use-toast";
import { Alert, AlertDescription } from "./ui/alert";

// Custom CSS untuk form yang rata
const formStyles = `
  .form-field {
    min-height: 48px;
    display: flex;
    align-items: center;
  }
  
  .form-label {
    line-height: 1.5;
    margin-bottom: 8px;
  }
  
  .form-input {
    height: 48px !important;
    min-height: 48px !important;
  }
  
  .form-select {
    height: 48px !important;
    min-height: 48px !important;
  }
  
  .form-textarea {
    min-height: 120px !important;
  }
`;

interface LicenseFormData {
  jenisIzin: string;
  namaIzin: string;
  lokasiIzin: string;
  permohonanMasuk: string;
  tglPermintaanRekomendasi: string;
  tglPermintaanRekomendasiDiserahkan: string;
  tglRekomendasiIzinDiterima: string;
  tglRekomendasi: string;
  tglTerbitIzin: string;
  tglPenyerahanIzin: string;
  rekomendasiHari: number;
  perizinanHari: number;
  totalSLA: number;
  sektor: string;
  keterangan: string;
  status:
    | "draft"
    | "dikirim"
    | "proses"
    | "rekomendasi"
    | "disetujui"
    | "selesai"
    | "terlambat"
    | "ditolak";
}

const statusOptions = [
  {
    value: "draft",
    label: "Draft",
    color: "bg-gray-100 text-gray-800",
    icon: FileText,
  },
  {
    value: "dikirim",
    label: "Dikirim",
    color: "bg-purple-100 text-purple-800",
    icon: FileText,
  },
  {
    value: "proses",
    label: "Dalam Proses",
    color: "bg-blue-100 text-blue-800",
    icon: Clock,
  },
  {
    value: "rekomendasi",
    label: "Menunggu Rekomendasi",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  {
    value: "disetujui",
    label: "Disetujui",
    color: "bg-teal-100 text-teal-800",
    icon: CheckCircle,
  },
  {
    value: "selesai",
    label: "Selesai",
    color: "bg-green-100 text-green-800",
    icon: CheckCheck,
  },
  {
    value: "terlambat",
    label: "Terlambat",
    color: "bg-red-100 text-red-800",
    icon: AlertCircle,
  },
  {
    value: "ditolak",
    label: "Ditolak",
    color: "bg-red-200 text-red-900",
    icon: XCircle,
  },
] as const;

const sektorOptions = [
  "Perdagangan",
  "Pariwisata",
  "Kesehatan",
  "Pendidikan",
  "Pertanian",
  "Perikanan",
  "Konstruksi",
];

function LicenseForm({
  license,
  onSubmit,
  onCancel,
}: {
  license?: License;
  onSubmit: (data: LicenseFormData) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<LicenseFormData>({
    jenisIzin: license?.jenisIzin ?? "",
    namaIzin: license?.namaIzin ?? "",
    lokasiIzin: license?.lokasiIzin ?? "",
    permohonanMasuk: license?.permohonanMasuk ?? "",
    tglPermintaanRekomendasi: license?.tglPermintaanRekomendasi ?? "",
    tglPermintaanRekomendasiDiserahkan:
      license?.tglPermintaanRekomendasiDiserahkan ?? "",
    tglRekomendasiIzinDiterima: license?.tglRekomendasiIzinDiterima ?? "",
    tglRekomendasi: license?.tglRekomendasi ?? "",
    tglTerbitIzin: license?.tglTerbitIzin ?? "",
    tglPenyerahanIzin: license?.tglPenyerahanIzin ?? "",
    rekomendasiHari: license?.rekomendasiHari ?? 0,
    perizinanHari: license?.perizinanHari ?? 0,
    totalSLA: license?.totalSLA ?? 0,
    sektor: license?.sektor ?? "",
    keterangan: license?.keterangan ?? "",
    status: license?.status ?? "draft",
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [isCustomSektor, setIsCustomSektor] = useState(false);
  const [customSektor, setCustomSektor] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const notInPreset =
      formData.sektor && !sektorOptions.includes(formData.sektor);
    if (notInPreset) {
      setIsCustomSektor(true);
      setCustomSektor(formData.sektor);
    }
  }, []);

  useEffect(() => {
    if (
      formData.tglPermintaanRekomendasiDiserahkan &&
      formData.tglRekomendasi
    ) {
      const diffDays = calculateDays(
        formData.tglPermintaanRekomendasiDiserahkan,
        formData.tglRekomendasi,
      );

      setFormData((prev) => ({
        ...prev,
        rekomendasiHari: diffDays,
      }));
    }
  }, [formData.tglPermintaanRekomendasiDiserahkan, formData.tglRekomendasi]);

  useEffect(() => {
    // Hitung Perizinan (Hari) sebagai jumlah dua segmen:
    // 1) Permohonan Masuk -> Surat Pengantar Rekomendasi
    // 2) Terbit Izin -> Penyerahan Izin
    let total = 0;

    if (formData.permohonanMasuk && formData.tglPermintaanRekomendasi) {
      total += calculateDays(
        formData.permohonanMasuk,
        formData.tglPermintaanRekomendasi,
      );
    }

    if (formData.tglTerbitIzin && formData.tglPenyerahanIzin) {
      total += calculateDays(
        formData.tglTerbitIzin,
        formData.tglPenyerahanIzin,
      );
    }

    setFormData((prev) => ({
      ...prev,
      perizinanHari: total,
    }));
  }, [
    formData.permohonanMasuk,
    formData.tglPermintaanRekomendasi,
    formData.tglTerbitIzin,
    formData.tglPenyerahanIzin,
  ]);

  // Fungsi untuk mengecek kelengkapan data
  const checkDataCompleteness = () => {
    const requiredBasicFields = [
      "jenisIzin",
      "namaIzin",
      "lokasiIzin",
      "permohonanMasuk",
      "sektor",
    ];

    const requiredTimelineFields = [
      "tglPermintaanRekomendasi",
      "tglPermintaanRekomendasiDiserahkan",
      "tglRekomendasi",
      "tglRekomendasiIzinDiterima",
      "tglTerbitIzin",
      "tglPenyerahanIzin",
    ];

    const allRequiredFields = [
      ...requiredBasicFields,
      ...requiredTimelineFields,
    ];

    const filledFields = allRequiredFields.filter((field) => {
      const value = formData[field as keyof LicenseFormData];
      return value !== "" && value !== null && value !== undefined;
    });

    return filledFields.length === allRequiredFields.length;
  };

  useEffect(() => {
    // Hitung Total SLA dari Rekomendasi (Hari) + Perizinan (Hari)
    const rekomendasiHari = formData.rekomendasiHari || 0;
    const perizinanHari = formData.perizinanHari || 0;
    const totalSLA = rekomendasiHari + perizinanHari;

    // Cek apakah data sudah lengkap untuk auto-complete status
    const isDataComplete = checkDataCompleteness();

    setFormData((prev) => {
      let newStatus = prev.status;

      // Prioritas 1: Jika Total SLA > 14 hari, status otomatis menjadi "terlambat"
      if (totalSLA > 14) {
        newStatus = "terlambat";
      }
      // Prioritas 2: Jika data lengkap dan SLA tidak terlambat, status otomatis menjadi "selesai"
      else if (isDataComplete) {
        newStatus = "selesai";
      }
      // Prioritas 3: Jika sebelumnya terlambat tapi sekarang SLA sudah normal, ubah ke "proses"
      else if (prev.status === "terlambat" && totalSLA <= 14) {
        newStatus = "proses";
      }

      return {
        ...prev,
        totalSLA: totalSLA,
        status: newStatus,
      };
    });
  }, [
    formData.rekomendasiHari,
    formData.perizinanHari,
    formData.jenisIzin,
    formData.namaIzin,
    formData.lokasiIzin,
    formData.permohonanMasuk,
    formData.sektor,
    formData.tglPermintaanRekomendasi,
    formData.tglPermintaanRekomendasiDiserahkan,
    formData.tglRekomendasi,
    formData.tglRekomendasiIzinDiterima,
    formData.tglTerbitIzin,
    formData.tglPenyerahanIzin,
    toast,
  ]);

  const progress = useMemo(() => {
    const requiredFields = [
      "jenisIzin",
      "namaIzin",
      "lokasiIzin",
      "permohonanMasuk",
      "sektor",
      "tglPenyerahanIzin",
    ];

    const optionalFields = [
      "tglPermintaanRekomendasi",
      "tglPermintaanRekomendasiDiserahkan",
      "tglRekomendasiIzinDiterima",
      "tglRekomendasi",
      "tglTerbitIzin",
      "keterangan",
    ];

    const allFields = [...requiredFields, ...optionalFields];

    const filledFields = allFields.filter((field) => {
      const value = formData[field as keyof LicenseFormData];
      return value !== "" && value !== null && value !== undefined;
    });

    return (filledFields.length / allFields.length) * 100;
  }, [formData]);

  // Validasi field wajib
  const validateRequiredFields = () => {
    const requiredFields = [
      { field: "jenisIzin", label: "Jenis Izin" },
      { field: "namaIzin", label: "Nama Izin" },
      { field: "lokasiIzin", label: "Alamat" },
      { field: "permohonanMasuk", label: "Tanggal Permohonan Masuk" },
      { field: "sektor", label: "Sektor" },
      // Hapus tglPenyerahanIzin dari required
      // { field: "tglPenyerahanIzin", label: "Tanggal Penyerahan Izin" }
    ];

    const errors: string[] = [];
    const newFieldErrors: Record<string, boolean> = {};

    requiredFields.forEach(({ field, label }) => {
      const value = formData[field as keyof LicenseFormData];
      if (!value || value === "") {
        errors.push(`${label} wajib diisi`);
        newFieldErrors[field] = true;
      } else {
        newFieldErrors[field] = false;
      }
    });

    setFieldErrors(newFieldErrors);
    return errors;
  };

  // Fungsi untuk mereset error saat user mulai mengetik
  const handleFieldChange = (field: keyof LicenseFormData, value: string) => {
    setFormData({ ...formData, [field]: value });

    // Reset error untuk field ini jika sudah diisi
    if (value && value !== "" && fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateRequiredFields();

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setShowErrorDialog(true);
      return;
    }

    onSubmit(formData);
  };

  const formSteps = [
    {
      title: "Informasi Dasar",
      icon: FileText,
      fields: (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col space-y-2">
              <Label
                htmlFor="jenisIzin"
                className="text-sm font-medium text-gray-700"
              >
                Jenis Izin <span className="text-red-500">*</span>
              </Label>
              <Input
                id="jenisIzin"
                value={formData.jenisIzin}
                onChange={(e) => handleFieldChange("jenisIzin", e.target.value)}
                placeholder="Contoh: Izin Perdagangan"
                className={`form-input ${
                  fieldErrors.jenisIzin
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
                required
              />
              {fieldErrors.jenisIzin && (
                <p className="text-sm text-red-600">Jenis Izin wajib diisi</p>
              )}
            </div>
            <div className="flex flex-col space-y-2">
              <Label
                htmlFor="sektor"
                className="text-sm font-medium text-gray-700"
              >
                Sektor <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.sektor}
                onValueChange={(value) => {
                  setFormData({ ...formData, sektor: value });
                  if (value && value !== "" && fieldErrors.sektor) {
                    setFieldErrors((prev) => ({ ...prev, sektor: false }));
                  }
                }}
              >
                <SelectTrigger
                  className={`form-select ${
                    fieldErrors.sektor
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                >
                  <SelectValue placeholder="Pilih sektor" />
                </SelectTrigger>
                <SelectContent>
                  {sektorOptions.map((sektor) => (
                    <SelectItem key={sektor} value={sektor}>
                      {sektor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.sektor && (
                <p className="text-sm text-red-600">Sektor wajib diisi</p>
              )}
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <Label
              htmlFor="namaIzin"
              className="text-sm font-medium text-gray-700"
            >
              Nama Izin <span className="text-red-500">*</span>
            </Label>
            <Input
              id="namaIzin"
              value={formData.namaIzin}
              onChange={(e) => handleFieldChange("namaIzin", e.target.value)}
              placeholder="Contoh: IUP Toko Elektronik ABC"
              className={`form-input ${
                fieldErrors.namaIzin
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : ""
              }`}
              required
            />
            {fieldErrors.namaIzin && (
              <p className="text-sm text-red-600">Nama Izin wajib diisi</p>
            )}
          </div>

          <div className="flex flex-col space-y-2">
            <Label
              htmlFor="lokasiIzin"
              className="text-sm font-medium text-gray-700"
            >
              Alamat <span className="text-red-500">*</span>
            </Label>
            <Input
              id="lokasiIzin"
              value={formData.lokasiIzin}
              onChange={(e) => handleFieldChange("lokasiIzin", e.target.value)}
              placeholder="Contoh: Jl. Sudirman No. 123, Jakarta"
              className={`form-input ${
                fieldErrors.lokasiIzin
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : ""
              }`}
              required
            />
            {fieldErrors.lokasiIzin && (
              <p className="text-sm text-red-600">Alamat wajib diisi</p>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Timeline & Status",
      icon: Calendar,
      fields: (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col space-y-2">
              <Label
                htmlFor="permohonanMasuk"
                className="text-sm font-medium text-gray-700"
              >
                Permohonan Masuk <span className="text-red-500">*</span>
              </Label>
              <Input
                id="permohonanMasuk"
                type="date"
                lang="id-ID"
                value={formData.permohonanMasuk}
                onChange={(e) =>
                  handleFieldChange("permohonanMasuk", e.target.value)
                }
                className={`form-input ${
                  fieldErrors.permohonanMasuk
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
                required
              />
              {fieldErrors.permohonanMasuk && (
                <p className="text-sm text-red-600">
                  Tanggal Permohonan Masuk wajib diisi
                </p>
              )}
            </div>
            <div className="flex flex-col space-y-2">
              <Label
                htmlFor="tglPermintaanRekomendasi"
                className="text-sm font-medium text-gray-700"
              >
                Surat Pengantar Rekomendasi
              </Label>
              <Input
                id="tglPermintaanRekomendasi"
                type="date"
                lang="id-ID"
                value={formData.tglPermintaanRekomendasi}
                onChange={(e) =>
                  handleFieldChange("tglPermintaanRekomendasi", e.target.value)
                }
                className="form-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col space-y-2">
              <Label
                htmlFor="tglPermintaanRekomendasiDiserahkan"
                className="text-sm font-medium text-gray-700"
              >
                Tanda Terima Berkas Permohonan Rekomendasi
              </Label>
              <Input
                id="tglPermintaanRekomendasiDiserahkan"
                type="date"
                lang="id-ID"
                value={formData.tglPermintaanRekomendasiDiserahkan}
                onChange={(e) =>
                  handleFieldChange(
                    "tglPermintaanRekomendasiDiserahkan",
                    e.target.value,
                  )
                }
                className="form-input"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label
                htmlFor="tglRekomendasi"
                className="text-sm font-medium text-gray-700"
              >
                Rekomendasi Terbit
              </Label>
              <Input
                id="tglRekomendasi"
                type="date"
                lang="id-ID"
                value={formData.tglRekomendasi}
                onChange={(e) =>
                  handleFieldChange("tglRekomendasi", e.target.value)
                }
                className="form-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col space-y-2">
              <Label
                htmlFor="tglRekomendasiIzinDiterima"
                className="text-sm font-medium text-gray-700"
              >
                Rekomendasi Kembali
              </Label>
              <Input
                id="tglRekomendasiIzinDiterima"
                type="date"
                lang="id-ID"
                value={formData.tglRekomendasiIzinDiterima}
                onChange={(e) =>
                  handleFieldChange(
                    "tglRekomendasiIzinDiterima",
                    e.target.value,
                  )
                }
                className="form-input"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label
                htmlFor="tglTerbitIzin"
                className="text-sm font-medium text-gray-700"
              >
                Terbit Izin
              </Label>
              <Input
                id="tglTerbitIzin"
                type="date"
                lang="id-ID"
                value={formData.tglTerbitIzin}
                onChange={(e) =>
                  handleFieldChange("tglTerbitIzin", e.target.value)
                }
                className="form-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col space-y-2">
              <Label
                htmlFor="tglPenyerahanIzin"
                className="text-sm font-medium text-gray-700"
              >
                Penyerahan Izin
                {/* <span className="text-red-500">*</span> */}
              </Label>
              <Input
                id="tglPenyerahanIzin"
                type="date"
                lang="id-ID"
                value={formData.tglPenyerahanIzin}
                onChange={(e) =>
                  handleFieldChange("tglPenyerahanIzin", e.target.value)
                }
                className="form-input"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label
                htmlFor="status"
                className="text-sm font-medium text-gray-700"
              >
                Status Perizinan
              </Label>
              <Select
                value={formData.status}
                onValueChange={(
                  value:
                    | "draft"
                    | "dikirim"
                    | "proses"
                    | "rekomendasi"
                    | "disetujui"
                    | "selesai"
                    | "terlambat"
                    | "ditolak",
                ) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="form-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      <div className="flex items-center gap-2">
                        <status.icon className="h-4 w-4" />
                        {status.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col space-y-2">
              <Label
                htmlFor="rekomendasiHari"
                className="text-sm font-medium text-gray-700"
              >
                Rekomendasi (Hari)
                <span className="text-xs text-gray-500 ml-1"></span>
              </Label>
              <Input
                id="rekomendasiHari"
                type="number"
                min="0"
                value={String(formData.rekomendasiHari || 0)}
                readOnly
                className="form-input bg-gray-50 cursor-not-allowed"
                title=""
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label
                htmlFor="perizinanHari"
                className="text-sm font-medium text-gray-700"
              >
                Perizinan (Hari)
                <span className="text-xs text-gray-500 ml-1"></span>
              </Label>
              <Input
                id="perizinanHari"
                type="number"
                min="0"
                value={String(formData.perizinanHari || 0)}
                readOnly
                className="form-input bg-gray-50 cursor-not-allowed"
                title=""
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col space-y-2">
              <Label
                htmlFor="totalSLA"
                className="text-sm font-medium text-gray-700"
              >
                Total SLA (Hari)
                <span className="text-xs text-gray-500 ml-1"></span>
              </Label>
              <Input
                id="totalSLA"
                type="number"
                min="1"
                value={String(formData.totalSLA || 0)}
                readOnly
                className="form-input bg-gray-50 cursor-not-allowed"
                title="Field ini dihitung otomatis dari Rekomendasi (Hari) + Perizinan (Hari)"
              />
              {formData.totalSLA > 14 && (
                <p className="text-sm text-red-600 flex items-center gap-1 mt-2">
                  <AlertCircle className="h-4 w-4" />
                  SLA melebihi batas maksimal 14 hari. Status menjadi terlambat.
                </p>
              )}
            </div>
            <div></div>
          </div>
        </div>
      ),
    },
    {
      title: "Keterangan",
      icon: FileText,
      fields: (
        <div className="space-y-6">
          {license?.files && license.files.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                Berkas yang Diupload ({license.files.length} file)
              </Label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {license.files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-white rounded border"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <File className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-700">{file.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(file.url, "_blank")}
                        className="h-7 px-2"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = file.url;
                          link.download = file.name;
                          link.click();
                        }}
                        className="h-7 px-2"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              {license.verificationStatus && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      Status Verifikasi:
                    </span>
                    {license.verificationStatus === "pending" ? (
                      <Badge className="bg-yellow-100 text-yellow-800 border-0">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    ) : license.verificationStatus === "approved" ? (
                      <Badge className="bg-green-100 text-green-800 border-0">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Disetujui
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800 border-0">
                        <X className="h-3 w-3 mr-1" />
                        Ditolak
                      </Badge>
                    )}
                  </div>
                  {license.verificationNotes && (
                    <p className="text-sm text-gray-600 mt-2">
                      {license.verificationNotes}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
          <div className="flex flex-col space-y-2">
            <Label
              htmlFor="keterangan"
              className="text-sm font-medium text-gray-700"
            >
              Keterangan & Catatan
            </Label>
            <Textarea
              id="keterangan"
              value={formData.keterangan}
              onChange={(e) => handleFieldChange("keterangan", e.target.value)}
              placeholder="Catatan atau keterangan tambahan mengenai perizinan ini..."
              rows={6}
              className="form-textarea resize-none"
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Dialog Error Validasi */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5 text-red-700" />
              Data Wajib Diisi
            </DialogTitle>
          </DialogHeader>
          <div className="mb-2 text-sm text-gray-700">
            Silakan lengkapi data berikut sebelum melanjutkan:
          </div>
          <ul className="list-disc ml-5 text-sm text-red-700 space-y-1">
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
          <div className="flex justify-end mt-4">
            <Button
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={() => setShowErrorDialog(false)}
            >
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom CSS */}
      <style dangerouslySetInnerHTML={{ __html: formStyles }} />

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Progress Pengisian</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Form Steps */}
      <Tabs
        value={currentStep.toString()}
        onValueChange={(value) => setCurrentStep(Number.parseInt(value))}
      >
        <TabsList className="grid w-full grid-cols-3">
          {formSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <TabsTrigger
                key={index}
                value={index.toString()}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{step.title}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <form onSubmit={handleSubmit}>
          {formSteps.map((step, index) => (
            <TabsContent key={index} value={index.toString()} className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <step.icon className="h-5 w-5 text-emerald-600" />
                    {step.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>{step.fields}</CardContent>
              </Card>
            </TabsContent>
          ))}
        </form>

        <div className="flex justify-between pt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                Sebelumnya
              </Button>
            )}
            {currentStep < formSteps.length - 1 ? (
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentStep(currentStep + 1);
                }}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Selanjutnya
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {license ? "Update" : "Simpan"} Perizinan
              </Button>
            )}
          </div>
        </div>
      </Tabs>
    </div>
  );
}

function getStatusBadge(status: License["status"]) {
  const statusConfig = statusOptions.find((s) => s.value === status);
  if (!statusConfig) return null;

  const Icon = statusConfig.icon;

  return (
    <Badge className={`${statusConfig.color} border-0 font-medium`}>
      <Icon className="h-3 w-3 mr-1" />
      {statusConfig.label}
    </Badge>
  );
}

export function LicenseManagement() {
  const {
    licenses,
    isLoading,
    addLicense,
    updateLicense,
    deleteLicense,
    getOverdueLicenses,
    refreshLicenses,
  } = useLicenses();
  const { user } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(
    searchParams.get("status") || "all",
  );
  const [sektorFilter, setSektorFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<License | null>(null);
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [viewingFiles, setViewingFiles] = useState<License | null>(null);
  const [verifyingLicense, setVerifyingLicense] = useState<License | null>(
    null,
  );
  const [verificationNotes, setVerificationNotes] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<
    "approved" | "rejected"
  >("approved");

  useEffect(() => {
    const statusParam = searchParams.get("status");
    if (statusParam && statusParam !== statusFilter) {
      setStatusFilter(statusParam);
    }
  }, [searchParams]);

  // Refresh licenses when component mounts or becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshLicenses();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    // Also refresh on mount
    refreshLicenses();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const overdueLicenses = getOverdueLicenses();

  const filteredLicenses = useMemo(() => {
    const filtered = licenses.filter((license) => {
      const matchesSearch =
        license.namaIzin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        license.jenisIzin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        license.sektor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        license.perizinan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (license.trackingCode
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ??
          false);

      let matchesStatus = false;
      if (statusFilter === "all") {
        matchesStatus = true;
      } else if (statusFilter === "terlambat") {
        // Check if license is overdue based on SLA calculation
        matchesStatus = overdueLicenses.some(
          (overdue) => overdue.id === license.id,
        );
      } else {
        matchesStatus = license.status === statusFilter;
      }

      const matchesSektor =
        sektorFilter === "all" || license.sektor === sektorFilter;

      return matchesSearch && matchesStatus && matchesSektor;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortField as keyof License];
      let bValue = b[sortField as keyof License];

      // Handle undefined values
      if (aValue === undefined) aValue = "";
      if (bValue === undefined) bValue = "";

      // Special handling for date fields (createdAt, updatedAt, permohonanMasuk, etc.)
      if (
        sortField === "createdAt" ||
        sortField === "updatedAt" ||
        sortField === "permohonanMasuk" ||
        sortField.includes("tgl") ||
        sortField.includes("Tanggal")
      ) {
        // Convert to Date for proper comparison
        const aDate = aValue ? new Date(aValue as string).getTime() : 0;
        const bDate = bValue ? new Date(bValue as string).getTime() : 0;
        if (sortDirection === "asc") {
          return aDate - bDate;
        } else {
          return bDate - aDate;
        }
      }

      // Special handling for number fields
      if (typeof aValue === "number" && typeof bValue === "number") {
        if (sortDirection === "asc") {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      }

      // String comparison
      if (typeof aValue === "string") aValue = aValue.toLowerCase();
      if (typeof bValue === "string") bValue = bValue.toLowerCase();

      if (sortDirection === "asc") {
        return (aValue ?? '') < (bValue ?? '') ? -1 : (aValue ?? '') > (bValue ?? '') ? 1 : 0;
      } else {
        return (aValue ?? '') > (bValue ?? '') ? -1 : (aValue ?? '') < (bValue ?? '') ? 1 : 0;
      }
    });

    return filtered;
  }, [
    licenses,
    searchTerm,
    statusFilter,
    sektorFilter,
    sortField,
    sortDirection,
  ]);

  const stats = useMemo(() => {
    const total = licenses.length;
    const draft = licenses.filter((l) => l.status === "draft").length;
    const proses = licenses.filter((l) => l.status === "proses").length;
    const rekomendasi = licenses.filter(
      (l) => l.status === "rekomendasi",
    ).length;
    const selesai = licenses.filter((l) => l.status === "selesai").length;
    const terlambat = overdueLicenses.length;

    return { total, draft, proses, rekomendasi, selesai, terlambat };
  }, [licenses, overdueLicenses]);

  const handleAddLicense = async (licenseData: LicenseFormData) => {
    try {
      await addLicense({
        ...licenseData,
        perizinan: "Instansi Terkait",
        createdBy: user?.username || "unknown",
      });
      setIsAddDialogOpen(false);
      // Refresh licenses to ensure new entry appears
      await refreshLicenses();
    } catch (error) {
      console.error("Error adding license:", error);
    }
  };

  const handleUpdateLicense = async (licenseData: LicenseFormData) => {
    if (editingLicense) {
      try {
        console.log("Updating license with data:", {
          id: editingLicense.id,
          keterangan: licenseData.keterangan,
          fullData: licenseData,
        });
        const result = await updateLicense(editingLicense.id, {
          ...licenseData,
          perizinan: editingLicense.perizinan,
        });
        console.log("Update result:", result);
        setEditingLicense(null);
        // Refresh licenses to ensure updated data appears
        await refreshLicenses();
      } catch (error) {
        console.error("Error updating license:", error);
      }
    }
  };

  const handleDeleteLicense = async (id: string) => {
    try {
      await deleteLicense(id);
    } catch (error) {
      console.error("Error deleting license:", error);
    }
  };

  const handleVerifyLicense = async () => {
    if (!verifyingLicense) return;

    try {
      console.log(
        "Verifying license:",
        verifyingLicense.id,
        "Status:",
        verificationStatus,
      );

      const now = new Date().toISOString();
      const verificationData: Partial<License> = {
        verificationStatus: verificationStatus,
        verificationNotes: verificationNotes || undefined,
        verifiedBy: user?.username || "admin",
        verifiedAt: now,
      };

      // Coba update via API verify endpoint dulu
      try {
        const response = await fetch(
          `/api/mysql/licenses/${verifyingLicense.id}/verify`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              status: verificationStatus,
              notes: verificationNotes,
              verifiedBy: user?.username || "admin",
            }),
          },
        );

        let result;
        try {
          result = await response.json();
        } catch (parseError) {
          console.error("Failed to parse JSON response:", parseError);
          throw new Error(
            `Gagal membaca response dari server. Status: ${response.status}`,
          );
        }

        if (response.ok && result.success) {
          console.log("Verification API success, updating local state...");

          // Update state lokal langsung untuk immediate feedback
          await updateLicense(verifyingLicense.id, verificationData);
          console.log("Local state updated");

          // Tutup dialog
          setVerifyingLicense(null);
          setVerificationNotes("");

          // Refresh data dari database untuk memastikan sinkronisasi
          console.log("Refreshing licenses from database...");
          await refreshLicenses();
          console.log("Licenses refreshed");

          toast({
            title: "Berhasil",
            description: `Berkas ${verificationStatus === "approved" ? "disetujui" : "ditolak"}`,
          });
          return;
        } else {
          // Jika API gagal, coba fallback ke updateLicense
          console.warn(
            "Verify API failed, trying fallback to updateLicense:",
            result?.error,
          );
          throw new Error(result?.error || "API verification failed");
        }
      } catch (apiError: any) {
        // Fallback: gunakan updateLicense untuk update verification status
        console.log("Falling back to updateLicense method");

        try {
          // Tutup dialog terlebih dahulu
          setVerifyingLicense(null);
          setVerificationNotes("");

          // Update state lokal
          await updateLicense(verifyingLicense.id, verificationData);

          // Refresh data dari database untuk memastikan sinkronisasi
          await refreshLicenses();

          toast({
            title: "Berhasil",
            description: `Berkas ${verificationStatus === "approved" ? "disetujui" : "ditolak"}`,
          });
        } catch (updateError: any) {
          console.error("Fallback update also failed:", updateError);
          throw new Error(
            updateError.message ||
              "Gagal memverifikasi berkas. Silakan coba lagi.",
          );
        }
      }
    } catch (error: any) {
      console.error("Error verifying license:", error);
      toast({
        title: "Error",
        description:
          error.message || "Gagal memverifikasi berkas. Silakan coba lagi.",
        variant: "destructive",
      });
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Kelola Pelayanan Perizinan
          </h2>
          <p className="text-gray-600 mt-1">Manajemen Data Perizinan</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-2 bg-transparent"
            onClick={() => refreshLicenses()}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <ExportDialog data={filteredLicenses} title="Data Perizinan">
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-transparent"
            >
              <Download className="h-4 w-4" />
              Export Data
            </Button>
          </ExportDialog>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              {user?.role !== "pimpinan" && (
                <Button className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Tambah Perizinan
                </Button>
              )}
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">
                  Tambah Perizinan Baru
                </DialogTitle>
              </DialogHeader>
              <LicenseForm
                onSubmit={handleAddLicense}
                onCancel={() => setIsAddDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-6 gap-4">
        <Card
          className={`bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 ${
            statusFilter === "all" ? "ring-2 ring-blue-400" : ""
          }`}
          onClick={() => setStatusFilter("all")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total</p>
                <p className="text-2xl font-bold text-blue-900">
                  {stats.total}
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 ${
            statusFilter === "draft" ? "ring-2 ring-gray-400" : ""
          }`}
          onClick={() => setStatusFilter("draft")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Draft</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.draft}
                </p>
              </div>
              <FileText className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 ${
            statusFilter === "proses" ? "ring-2 ring-yellow-400" : ""
          }`}
          onClick={() => setStatusFilter("proses")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-700">Proses</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {stats.proses}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 ${
            statusFilter === "rekomendasi" ? "ring-2 ring-orange-400" : ""
          }`}
          onClick={() => setStatusFilter("rekomendasi")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">
                  Rekomendasi
                </p>
                <p className="text-2xl font-bold text-orange-900">
                  {stats.rekomendasi}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`bg-gradient-to-br from-green-50 to-green-100 border-green-200 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 ${
            statusFilter === "selesai" ? "ring-2 ring-green-400" : ""
          }`}
          onClick={() => setStatusFilter("selesai")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Selesai</p>
                <p className="text-2xl font-bold text-green-900">
                  {stats.selesai}
                </p>
              </div>
              <CheckCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`bg-gradient-to-br from-red-50 to-red-100 border-red-200 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 ${
            statusFilter === "terlambat" ? "ring-2 ring-red-400" : ""
          }`}
          onClick={() => setStatusFilter("terlambat")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Terlambat</p>
                <p className="text-2xl font-bold text-red-900">
                  {stats.terlambat}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-5 w-5 text-gray-400" />
              <Input
                placeholder="Cari berdasarkan nama izin, jenis izin, sektor, atau instansi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[200px] h-11">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      <div className="flex items-center gap-2">
                        <status.icon className="h-4 w-4" />
                        {status.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sektorFilter} onValueChange={setSektorFilter}>
                <SelectTrigger className="w-full sm:w-[200px] h-11">
                  <Building className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter Sektor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Sektor</SelectItem>
                  {sektorOptions.map((sektor) => (
                    <SelectItem key={sektor} value={sektor}>
                      {sektor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-center w-12">
                    No
                  </TableHead>
                  <TableHead className="font-semibold">Kode Tracking</TableHead>
                  <TableHead className="font-semibold">Jenis Izin</TableHead>
                  <TableHead className="font-semibold">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("namaIzin")}
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                    >
                      Nama Izin
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="font-semibold">Alamat</TableHead>
                  <TableHead className="font-semibold">Sektor</TableHead>
                  <TableHead className="font-semibold">
                    Tgl Permohonan Masuk
                  </TableHead>
                  <TableHead className="font-semibold">
                    Tgl Permintaan Rekomendasi
                  </TableHead>
                  <TableHead className="font-semibold">
                    Tgl Permintaan Rekomendasi Diserahkan
                  </TableHead>
                  <TableHead className="font-semibold">
                    Tgl Rekomendasi
                  </TableHead>
                  <TableHead className="font-semibold">
                    Tgl Rekomendasi Izin Diterima
                  </TableHead>
                  <TableHead className="font-semibold">
                    Tgl Terbit Izin
                  </TableHead>
                  <TableHead className="font-semibold">
                    Tgl Penyerahan Izin
                  </TableHead>
                  <TableHead className="font-semibold">
                    Rekomendasi (Hari)
                  </TableHead>
                  <TableHead className="font-semibold">
                    Perizinan (Hari)
                    <br />
                    <span className="text-xs font-normal text-gray-500"></span>
                  </TableHead>
                  <TableHead className="font-semibold">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("totalSLA")}
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                    >
                      Total SLA
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Keterangan</TableHead>
                  <TableHead className="font-semibold">Berkas</TableHead>
                  <TableHead className="font-semibold">Verifikasi</TableHead>
                  <TableHead className="font-semibold text-center">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={21}
                      className="text-center py-8 text-gray-500"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                        <p>Memuat data perizinan...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredLicenses.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={21}
                      className="text-center py-8 text-gray-500"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="h-12 w-12 text-gray-300" />
                        <p>Tidak ada data perizinan yang ditemukan</p>
                        <p className="text-sm">
                          Coba ubah filter pencarian Anda
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLicenses.map((license, index) => {
                    const isOverdue = overdueLicenses.some(
                      (ol) => ol.id === license.id,
                    );
                    return (
                      <TableRow
                        key={license.id}
                        className={`hover:bg-gray-50 ${
                          isOverdue
                            ? "bg-red-50 border-l-4 border-l-red-500"
                            : ""
                        }`}
                      >
                        <TableCell className="text-center font-medium">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-mono font-medium text-gray-700 bg-gray-50 px-2 py-1 rounded border">
                            {license.trackingCode || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium text-gray-700">
                            {license.jenisIzin}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">
                          <span className="font-semibold text-gray-900">
                            {license.namaIzin}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {license.lokasiIzin}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {license.sektor || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {license.permohonanMasuk
                              ? new Date(
                                  license.permohonanMasuk,
                                ).toLocaleDateString("id-ID")
                              : "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {license.tglPermintaanRekomendasi
                              ? new Date(
                                  license.tglPermintaanRekomendasi,
                                ).toLocaleDateString("id-ID")
                              : "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {license.tglPermintaanRekomendasiDiserahkan
                              ? new Date(
                                  license.tglPermintaanRekomendasiDiserahkan,
                                ).toLocaleDateString("id-ID")
                              : "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {license.tglRekomendasi
                              ? new Date(
                                  license.tglRekomendasi,
                                ).toLocaleDateString("id-ID")
                              : "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {license.tglRekomendasiIzinDiterima
                              ? new Date(
                                  license.tglRekomendasiIzinDiterima,
                                ).toLocaleDateString("id-ID")
                              : "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {license.tglTerbitIzin
                              ? new Date(
                                  license.tglTerbitIzin,
                                ).toLocaleDateString("id-ID")
                              : "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {license.tglPenyerahanIzin
                              ? new Date(
                                  license.tglPenyerahanIzin,
                                ).toLocaleDateString("id-ID")
                              : "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`text-sm font-medium ${
                              calculateRekomendasiHari(license) < 0
                                ? "text-red-600"
                                : "text-gray-700"
                            }`}
                          >
                            {calculateRekomendasiHari(license)} hari
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`text-sm font-medium ${
                              calculatePerizinanHari(license) < 0
                                ? "text-red-600"
                                : "text-gray-700"
                            }`}
                          >
                            {calculatePerizinanHari(license)} hari
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`font-medium ${
                              isOverdue ? "text-red-600" : "text-gray-700"
                            }`}
                          >
                            {calculateTotalSLA(license)} hari
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(license.status)}</TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {license.keterangan &&
                            license.keterangan.trim() !== ""
                              ? license.keterangan
                              : "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {license.files && license.files.length > 0 ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setViewingFiles(license)}
                              className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              {license.files.length} File
                            </Button>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {license.verificationStatus === "pending" ? (
                            <Badge className="bg-yellow-100 text-yellow-800 border-0">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          ) : license.verificationStatus === "approved" ? (
                            <Badge className="bg-green-100 text-green-800 border-0">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Disetujui
                            </Badge>
                          ) : license.verificationStatus === "rejected" ? (
                            <Badge className="bg-red-100 text-red-800 border-0">
                              <X className="h-3 w-3 mr-1" />
                              Ditolak
                            </Badge>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                          {license.files && license.files.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setVerifyingLicense(license);
                                setVerificationNotes(
                                  license.verificationNotes || "",
                                );
                                setVerificationStatus(
                                  license.verificationStatus === "rejected"
                                    ? "rejected"
                                    : "approved",
                                );
                              }}
                              className="h-8 ml-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            >
                              Verifikasi
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            {user?.role !== "pimpinan" && (
                              <Dialog
                                open={editingLicense?.id === license.id}
                                onOpenChange={(open) =>
                                  !open && setEditingLicense(null)
                                }
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingLicense(license)}
                                    className="h-8 w-8 p-0 hover:bg-emerald-100"
                                  >
                                    <Edit className="h-4 w-4 text-emerald-600" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle className="text-xl font-semibold">
                                      Edit Perizinan
                                    </DialogTitle>
                                  </DialogHeader>
                                  <LicenseForm
                                    license={license}
                                    onSubmit={handleUpdateLicense}
                                    onCancel={() => setEditingLicense(null)}
                                  />
                                </DialogContent>
                              </Dialog>
                            )}

                            {user?.role !== "pimpinan" && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 hover:bg-red-100"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Hapus Perizinan
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Apakah Anda yakin ingin menghapus
                                      perizinan{" "}
                                      <strong>"{license.namaIzin}"</strong>?
                                      Tindakan ini tidak dapat dibatalkan.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDeleteLicense(license.id)
                                      }
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Hapus
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Results Summary */}
          {filteredLicenses.length > 0 && (
            <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
              <span>
                Menampilkan {filteredLicenses.length} dari {licenses.length}{" "}
                perizinan
              </span>
              {(searchTerm ||
                statusFilter !== "all" ||
                sektorFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setSektorFilter("all");
                  }}
                  className="text-emerald-600 hover:text-emerald-700"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reset Filter
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog untuk melihat file */}
      <Dialog
        open={!!viewingFiles}
        onOpenChange={(open) => !open && setViewingFiles(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Berkas Permohonan: {viewingFiles?.namaIzin}
            </DialogTitle>
          </DialogHeader>
          {viewingFiles &&
          viewingFiles.files &&
          viewingFiles.files.length > 0 ? (
            <div className="space-y-4 mt-4">
              {viewingFiles.files.map((file, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <File className="h-8 w-8 text-blue-600" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {file.type} • {(file.size / 1024).toFixed(2)} KB
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Diupload:{" "}
                          {new Date(file.uploadedAt).toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(file.url, "_blank")}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Lihat
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = file.url;
                          link.download = file.name;
                          link.click();
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Tidak ada berkas yang diupload</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog untuk verifikasi */}
      <Dialog
        open={!!verifyingLicense}
        onOpenChange={(open) => !open && setVerifyingLicense(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Verifikasi Berkas: {verifyingLicense?.namaIzin}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="verification-status">Status Verifikasi</Label>
              <Select
                value={verificationStatus}
                onValueChange={(value: "approved" | "rejected") =>
                  setVerificationStatus(value)
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Disetujui
                    </div>
                  </SelectItem>
                  <SelectItem value="rejected">
                    <div className="flex items-center gap-2">
                      <X className="h-4 w-4 text-red-600" />
                      Ditolak
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="verification-notes">Catatan Verifikasi</Label>
              <Textarea
                id="verification-notes"
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder="Masukkan catatan verifikasi (opsional)"
                rows={4}
                className="mt-1"
              />
            </div>
            {verifyingLicense && verifyingLicense.files && (
              <div>
                <Label>
                  Berkas yang akan diverifikasi ({verifyingLicense.files.length}{" "}
                  file)
                </Label>
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                  {verifyingLicense.files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded"
                    >
                      <File className="h-4 w-4" />
                      <span className="flex-1">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(file.url, "_blank")}
                        className="h-6 px-2"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setVerifyingLicense(null);
                setVerificationNotes("");
              }}
            >
              Batal
            </Button>
            <Button
              onClick={handleVerifyLicense}
              className={
                verificationStatus === "approved"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {verificationStatus === "approved" ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Setujui
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Tolak
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
