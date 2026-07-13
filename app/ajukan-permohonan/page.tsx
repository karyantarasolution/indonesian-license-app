"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FileText,
  Upload,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  FileCheck,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  X,
  Image as ImageIcon,
  LogIn,
  Save,
  CalendarDays,
  Clock,
  CreditCard
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { LicenseService } from "@/lib/license-service";

// Generate tracking code
function generateTrackingCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

interface UploadedFile {
  name: string;
  file: File;
  preview?: string;
}

export default function AjukanPermohonanPage() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftList, setDraftList] = useState<any[]>([]);
  const [showDraftPanel, setShowDraftPanel] = useState(false);
  const [draftName, setDraftName] = useState("");
  
  // Survey calendar
  const [showSurveyCalendar, setShowSurveyCalendar] = useState(false);
  const [surveyData, setSurveyData] = useState({
    tanggal: "",
    waktu: "",
    lokasi: "",
  });

  // Form Data
  const [formData, setFormData] = useState({
    // Data Pemohon
    namaPemohon: "",
    alamat: "",
    alamatUsaha: "", // untuk perorangan
    jenisUsaha: "", // untuk perorangan
    nik: "",
    nomorHP: "",
    email: "",
    jenisPemohon: "perorangan", // perorangan atau perusahaan
    sektor: "", // untuk perorangan dan perusahaan
    
    // Data Perusahaan (jika perusahaan)
    namaPerusahaan: "",
    alamatPerusahaan: "",
    nib: "",
    penanggungJawab: "",
    lokasiSpesifikasiBangunan: "",
    keteranganPemanfaatanBangunan: "",
    
    // Data Permohonan
    jenisIzin: "",
    lokasiUsaha: "",
    lokasiKegiatanUsaha: "", // untuk perorangan
    suratPernyataan: false,
    latitude: "",
    longitude: "",
  });

  // Uploaded Files - Perorangan
  const [ktpFile, setKtpFile] = useState<UploadedFile | null>(null);
  const [npwpPribadiFile, setNpwpPribadiFile] = useState<UploadedFile | null>(null);
  const [kkFile, setKkFile] = useState<UploadedFile | null>(null);
  const [suratPernyataanFile, setSuratPernyataanFile] = useState<UploadedFile | null>(null);
  
  // Uploaded Files - Perusahaan
  const [aktaPendirianFile, setAktaPendirianFile] = useState<UploadedFile | null>(null);
  const [nibFile, setNibFile] = useState<UploadedFile | null>(null);
  const [npwpPerusahaanFile, setNpwpPerusahaanFile] = useState<UploadedFile | null>(null);
  const [ktpDirekturFile, setKtpDirekturFile] = useState<UploadedFile | null>(null);
  const [suratKuasaFile, setSuratKuasaFile] = useState<UploadedFile | null>(null);
  
  // Uploaded Files - Dokumen Persyaratan Perorangan
  const [skduFile, setSkduFile] = useState<UploadedFile | null>(null);
  const [fotoLokasiUsahaFile, setFotoLokasiUsahaFile] = useState<UploadedFile[]>([]);
  const [denahLokasiUsahaFile, setDenahLokasiUsahaFile] = useState<UploadedFile | null>(null);
  const [suratKuasaPemohonFile, setSuratKuasaPemohonFile] = useState<UploadedFile | null>(null);
  
  // Uploaded Files - Dokumen Persyaratan Perusahaan (Izin Bangunan)
  const [sertifikatTanahFile, setSertifikatTanahFile] = useState<UploadedFile | null>(null);
  const [suratSewaFile, setSuratSewaFile] = useState<UploadedFile | null>(null);
  const [suratKeteranganTidakSengketaFile, setSuratKeteranganTidakSengketaFile] = useState<UploadedFile | null>(null);
  const [denahBangunanFile, setDenahBangunanFile] = useState<UploadedFile | null>(null);
  const [fotoLokasiTanahBangunanFile, setFotoLokasiTanahBangunanFile] = useState<UploadedFile[]>([]);
  const [suratPernyataanKesesuaianFungsiFile, setSuratPernyataanKesesuaianFungsiFile] = useState<UploadedFile | null>(null);
  
  // Uploaded Files - Dokumen Persyaratan per Jenis Izin (generic)
  const [dokumenIzin, setDokumenIzin] = useState<Record<string, UploadedFile | null>>({});
  const [dokumenIzinMulti, setDokumenIzinMulti] = useState<Record<string, UploadedFile[]>>({});

  const setDokumen = (key: string, file: UploadedFile | null) => {
    setDokumenIzin(prev => ({ ...prev, [key]: file }));
  };
  const addDokumenMulti = (key: string, newFiles: UploadedFile[]) => {
    setDokumenIzinMulti(prev => ({ ...prev, [key]: [...(prev[key] || []), ...newFiles] }));
  };
  const removeDokumenMulti = (key: string, index: number) => {
    setDokumenIzinMulti(prev => ({
      ...prev,
      [key]: (prev[key] || []).filter((_: any, i: number) => i !== index),
    }));
  };

  const [identitasFiles, setIdentitasFiles] = useState<UploadedFile[]>([]);
  const [dokumenFiles, setDokumenFiles] = useState<UploadedFile[]>([]);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "identitas" | "dokumen"
  ) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach((file) => {
      const uploadedFile: UploadedFile = {
        name: file.name,
        file: file,
      };

      // Generate preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          uploadedFile.preview = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      }

      if (type === "identitas") {
        setIdentitasFiles((prev) => [...prev, uploadedFile]);
      } else {
        setDokumenFiles((prev) => [...prev, uploadedFile]);
      }
    });

    toast({
      title: "File berhasil ditambahkan",
      description: `${files.length} file telah ditambahkan`,
    });
  };

  const removeFile = (index: number, type: "identitas" | "dokumen") => {
    if (type === "identitas") {
      setIdentitasFiles((prev) => prev.filter((_, i) => i !== index));
    } else {
      setDokumenFiles((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Fungsi untuk upload file ke server
  const uploadFile = async (file: File): Promise<{ name: string; url: string; type: string; size: number; uploadedAt: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to upload file');
    }

    return result.data;
  };

  // Fungsi untuk mengumpulkan semua file yang diupload
  const collectAllFiles = async (): Promise<Array<{ name: string; url: string; type: string; size: number; uploadedAt: string }>> => {
    const allFiles: Array<{ name: string; url: string; type: string; size: number; uploadedAt: string }> = [];
    
    // Helper untuk menambahkan file ke array
    const addFile = async (file: UploadedFile | null, label: string) => {
      if (file?.file) {
        try {
          const uploaded = await uploadFile(file.file);
          allFiles.push({ ...uploaded, name: `${label} - ${uploaded.name}` });
        } catch (error) {
          console.error(`Error uploading ${label}:`, error);
          toast({
            title: "Peringatan",
            description: `Gagal mengupload ${label}. File akan dilewati.`,
            variant: "destructive",
          });
        }
      }
    };

    const addFiles = async (files: UploadedFile[], label: string) => {
      for (const file of files) {
        await addFile(file, label);
      }
    };

    // Upload dokumen identitas berdasarkan jenis pemohon
    if (formData.jenisPemohon === "perorangan") {
      await addFile(ktpFile, "KTP");
      await addFile(npwpPribadiFile, "NPWP Pribadi");
      await addFile(kkFile, "Kartu Keluarga");
    } else {
      await addFile(aktaPendirianFile, "Akta Pendirian");
      await addFile(nibFile, "NIB");
      await addFile(npwpPerusahaanFile, "NPWP Perusahaan");
      await addFile(ktpDirekturFile, "KTP Direktur");
      await addFile(suratKuasaFile, "Surat Kuasa");
    }

    // Upload surat pernyataan (wajib semua jenis izin)
    await addFile(suratPernyataanFile, "Surat Pernyataan");

    // Upload dokumen persyaratan berdasarkan jenis izin
    if (isNonBangunanIzin()) {
      // Upload using generic dokumenIzin state
      for (const doc of docRequirements) {
        if (doc.multiple) {
          const multiFiles = dokumenIzinMulti[doc.key] || [];
          await addFiles(multiFiles, doc.label);
        } else {
          const singleFile = dokumenIzin[doc.key] || null;
          await addFile(singleFile, doc.label);
        }
      }
    } else if (isBangunanIzin()) {
      await addFile(sertifikatTanahFile, "Sertifikat Tanah");
      await addFile(suratSewaFile, "Surat Sewa");
      await addFile(suratKeteranganTidakSengketaFile, "Surat Keterangan Tidak Sengketa");
      await addFile(denahBangunanFile, "Denah Bangunan");
      await addFiles(fotoLokasiTanahBangunanFile, "Foto Lokasi Tanah/Bangunan");
      await addFile(suratPernyataanKesesuaianFungsiFile, "Surat Pernyataan Kesesuaian Fungsi");
    }

    // Upload file identitas dan dokumen tambahan
    await addFiles(identitasFiles, "Dokumen Identitas");
    await addFiles(dokumenFiles, "Dokumen Tambahan");

    return allFiles;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const tracking = generateTrackingCode();

      // Upload semua file terlebih dahulu
      const uploadedFiles = await collectAllFiles();

      // Simpan data permohonan
      const lokasiIzin = formData.jenisPemohon === "perorangan" 
        ? formData.lokasiKegiatanUsaha 
        : formData.lokasiSpesifikasiBangunan;

      // Nama Izin diambil dari field "Nama Izin"
      // Untuk perorangan: formData.namaPemohon (yang sebenarnya adalah nama izin)
      // Untuk perusahaan: formData.namaPerusahaan (nama perusahaan/izin)
      const namaIzin = formData.jenisPemohon === "perorangan" 
        ? formData.namaPemohon 
        : formData.namaPerusahaan;
      
      // Jenis Izin
      const jenisIzin = formData.jenisIzin;

      // Alamat untuk disimpan di field alamat terpisah
      const alamat = formData.jenisPemohon === "perorangan"
        ? formData.alamatUsaha
        : formData.alamatPerusahaan;

      const newLicense = await LicenseService.addLicense({
        pemohonId: "",
        pemohonNama: formData.jenisPemohon === "perorangan" ? formData.namaPemohon : formData.penanggungJawab,
        pemohonEmail: formData.email,
        pemohonTelepon: formData.nomorHP,
        trackingCode: tracking,
        status: "dikirim",
        createdBy: "pemohon",
        jenisIzin: jenisIzin,
        namaIzin: namaIzin,
        lokasiIzin: lokasiIzin,
        alamat: alamat, // Simpan alamat di field alamat terpisah
        latitude: formData.latitude,
        longitude: formData.longitude,
        permohonanMasuk: new Date().toISOString().split('T')[0],
        perizinan: "",
        sektor: formData.sektor,
        keterangan: "", // Keterangan kosong untuk permohonan baru, akan diisi admin nanti
        tglPermintaanRekomendasi: "",
        tglPermintaanRekomendasiDiserahkan: "",
        tglRekomendasiIzinDiterima: "",
        tglRekomendasi: "",
        tglTerbitIzin: "",
        tglPenyerahanIzin: "",
        rekomendasiHari: 0,
        perizinanHari: 0,
        totalSLA: 0,
        files: uploadedFiles,
        verificationStatus: "pending",
      });

      // Kirim Notifikasi Izin Masuk
      try {
        await fetch('/api/mysql/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Permohonan Izin Baru',
            message: `Terdapat permohonan izin baru atas nama ${namaIzin} (${jenisIzin})`,
            type: 'new_license',
            reference_id: newLicense.id
          })
        });
      } catch (notifError) {
        console.error("Failed to send notification", notifError);
      }

      // Buat payment record
      try {
        await fetch('/api/mysql/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            licenseId: newLicense.id,
            trackingCode: tracking,
            pemohonNama: formData.jenisPemohon === "perorangan" ? formData.namaPemohon : formData.penanggungJawab,
            jumlah: 0,
            metodePembayaran: "transfer",
            statusPembayaran: "pending",
            keterangan: "Pembayaran retribusi izin"
          })
        });
      } catch (payError) {
        console.error("Failed to create payment record", payError);
      }

      // Redirect to success page with tracking code
      window.location.href = `/ajukan-permohonan/sukses?code=${tracking}`;
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mengajukan permohonan. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load drafts
  useEffect(() => {
    const stored = localStorage.getItem("draftPermohonan");
    if (stored) {
      try {
        setDraftList(JSON.parse(stored));
      } catch (e) {
        console.error("Error loading drafts:", e);
      }
    }
  }, []);

  // Simpan draft
  const saveDraft = () => {
    setIsSavingDraft(true);
    try {
      const draftData = {
        id: Date.now().toString(),
        nama: draftName || `Draft ${new Date().toLocaleDateString("id-ID")}`,
        formData: { ...formData },
        jenisPemohon: formData.jenisPemohon,
        createdAt: new Date().toISOString(),
      };
      const stored = localStorage.getItem("draftPermohonan");
      const existing = stored ? JSON.parse(stored) : [];
      const updated = [...existing, draftData];
      localStorage.setItem("draftPermohonan", JSON.stringify(updated));
      setDraftList(updated);
      toast({
        title: "Draft Disimpan",
        description: `Draft "${draftData.nama}" berhasil disimpan`,
      });
      setDraftName("");
    } catch (e) {
      toast({
        title: "Gagal",
        description: "Gagal menyimpan draft",
        variant: "destructive",
      });
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Load draft
  const loadDraft = (draft: any) => {
    setFormData(draft.formData);
    setShowDraftPanel(false);
    toast({
      title: "Draft Dimuat",
      description: `Draft "${draft.nama}" berhasil dimuat`,
    });
  };

  // Hapus draft
  const deleteDraft = (id: string) => {
    const updated = draftList.filter((d) => d.id !== id);
    localStorage.setItem("draftPermohonan", JSON.stringify(updated));
    setDraftList(updated);
    toast({
      title: "Draft Dihapus",
      description: "Draft berhasil dihapus",
    });
  };

  // Dynamic fields berdasarkan jenis izin
  const getDynamicFields = () => {
    const type = formData.jenisIzin;
    const fields: Array<{ label: string; key: string; type: "text" | "select" | "textarea"; required: boolean; options?: string[] }> = [];

    if (["Izin Perdagangan", "Izin Pariwisata", "Izin Kesehatan", "Izin Pendidikan", "Izin Pertanian", "Izin Perikanan"].includes(type)) {
      fields.push({ label: "Nama Kegiatan", key: "jenisUsaha", type: "text", required: true });
      fields.push({ label: "Lokasi Kegiatan", key: "lokasiKegiatanUsaha", type: "textarea", required: true });
    }
    if (type === "Izin Mendirikan Bangunan (IMB)") {
      fields.push({ label: "Luas Bangunan (m²)", key: "luasBangunan", type: "text", required: true });
      fields.push({ label: "Fungsi Bangunan", key: "keteranganPemanfaatanBangunan", type: "text", required: true });
      fields.push({ label: "Jumlah Lantai", key: "jumlahLantai", type: "text", required: false });
    }
    if (type === "Izin Kesehatan") {
      fields.push({ label: "Jenis Fasilitas Kesehatan", key: "jenisFasilitasKesehatan", type: "select", required: true, options: ["Klinik", "Rumah Sakit", "Puskesmas", "Laboratorium Kesehatan", "Apotek", "Praktik Mandiri"] });
      fields.push({ label: "Nomor STR Tenaga Kesehatan", key: "nomorSTR", type: "text", required: true });
      fields.push({ label: "Alamat Lokasi Praktik", key: "alamatLokasiPraktik", type: "textarea", required: true });
    }
    if (type === "Izin Pariwisata") {
      fields.push({ label: "Jenis Kegiatan Pariwisata", key: "jenisUsahaPariwisata", type: "select", required: true, options: ["Hotel", "Restoran", "Biro Perjalanan Wisata", "Tempat Hiburan", "Objek Wisata"] });
      fields.push({ label: "Kapasitas", key: "kapasitas", type: "text", required: true });
    }
    if (type === "Izin Pendidikan") {
      fields.push({ label: "Jenis Lembaga Pendidikan", key: "jenisLembagaPendidikan", type: "select", required: true, options: ["Formal", "Non-Formal", "Kursus Pelatihan", "Bimbingan Belajar", "Pendidikan Anak Usia Dini"] });
      fields.push({ label: "Akreditasi", key: "akreditasi", type: "text", required: false });
    }
    if (type === "Izin Pertanian") {
      fields.push({ label: "Jenis Komoditas", key: "jenisKomoditas", type: "text", required: true });
      fields.push({ label: "Luas Lahan (m²)", key: "luasLahan", type: "text", required: true });
    }
    if (type === "Izin Perikanan") {
      fields.push({ label: "Jenis Budidaya", key: "jenisBudidaya", type: "text", required: true });
      fields.push({ label: "Lokasi Perairan", key: "lokasiPerairan", type: "textarea", required: true });
    }

    return fields;
  };

  const dynamicFields = getDynamicFields();

  const izinPerizinan = ["Izin Perdagangan", "Izin Pariwisata", "Izin Kesehatan", "Izin Pendidikan", "Izin Pertanian", "Izin Perikanan"];

  const isNonBangunanIzin = () => izinPerizinan.includes(formData.jenisIzin);
  const isBangunanIzin = () => formData.jenisIzin === "Izin Mendirikan Bangunan (IMB)";

  // Document requirements per izin type
  interface DocRequirement {
    key: string;
    label: string;
    required: boolean;
    multiple?: boolean;
    description?: string;
  }

  const getDocRequirements = (): DocRequirement[] => {
    const type = formData.jenisIzin;

    if (type === "Izin Perdagangan") {
      return [
        { key: "skd", label: "Surat Keterangan Domisili (SKD) dari Desa/Kelurahan", required: true },
        { key: "fotoLokasi", label: "Foto Lokasi Usaha (Tampak Luar & Dalam)", required: true, multiple: true, description: "Upload minimal 2 foto (luar & dalam)" },
        { key: "denahLokasi", label: "Denah Lokasi Usaha", required: true },
        { key: "suratPernyataanKesiapan", label: "Surat Pernyataan Kesiapan Usaha", required: true },
        { key: "aktaPendirianUsaha", label: "Akta Pendirian Usaha / Surat Pernyataan Usaha", required: true },
        { key: "suratKuasaPemohon", label: "Surat Kuasa (jika diwakilkan)", required: false },
      ];
    }

    if (type === "Izin Pariwisata") {
      return [
        { key: "skd", label: "Surat Keterangan Domisili (SKD) dari Desa/Kelurahan", required: true },
        { key: "fotoLokasi", label: "Foto Lokasi Usaha Pariwisata (Tampak Luar & Dalam)", required: true, multiple: true, description: "Upload minimal 2 foto (luar & dalam)" },
        { key: "denahLokasi", label: "Denah Lokasi", required: true },
        { key: "izinLingkungan", label: "Izin Lingkungan (AMDAL / UKL-UPL)", required: true },
        { key: "sertifikatLaikUsaha", label: "Sertifikat Laik Usaha (SLU) / Sertifikat Laik Fungsi (SLF)", required: true },
        { key: "suratPernyataanKesiapan", label: "Surat Pernyataan Kesiapan Usaha", required: true },
      ];
    }

    if (type === "Izin Kesehatan") {
      return [
        { key: "skd", label: "Surat Keterangan Domisili (SKD) dari Desa/Kelurahan", required: true },
        { key: "fotoLokasi", label: "Foto Lokasi Fasilitas Kesehatan (Tampak Luar & Dalam)", required: true, multiple: true, description: "Upload minimal 2 foto (luar & dalam)" },
        { key: "denahLokasi", label: "Denah Lokasi", required: true },
        { key: "strTenagaKesehatan", label: "Surat Tanda Registrasi (STR) Tenaga Kesehatan", required: true },
        { key: "suratIzinPraktik", label: "Surat Izin Praktik (SIP) / Izin Kerja", required: true },
        { key: "izinEdarAlkes", label: "Izin Edar Alat Kesehatan (jika applicable)", required: false, description: "Opsional - untuk instalasi alat kesehatan" },
      ];
    }

    if (type === "Izin Pendidikan") {
      return [
        { key: "skd", label: "Surat Keterangan Domisili (SKD) dari Desa/Kelurahan", required: true },
        { key: "fotoLokasi", label: "Foto Lokasi / Gedung Pendidikan (Tampak Luar & Dalam)", required: true, multiple: true, description: "Upload minimal 2 foto (luar & dalam)" },
        { key: "denahLokasi", label: "Denah Lokasi", required: true },
        { key: "izinOperasional", label: "Izin Operasional Lembaga Pendidikan", required: true },
        { key: "rekomendasiDindik", label: "Surat Rekomendasi Dinas Pendidikan", required: true },
        { key: "aktaPendirianLembaga", label: "Akta Pendirian Lembaga Pendidikan", required: true },
        { key: "daftarTenagaPendidik", label: "Daftar Nama Tenaga Pendidik & Kependidikan", required: false, description: "Opsional" },
      ];
    }

    if (type === "Izin Pertanian") {
      return [
        { key: "skd", label: "Surat Keterangan Domisili (SKD) dari Desa/Kelurahan", required: true },
        { key: "fotoLokasi", label: "Foto Lokasi / Lahan Pertanian (Tampak Luar & Dalam)", required: true, multiple: true, description: "Upload minimal 2 foto" },
        { key: "denahLokasi", label: "Denah Lokasi Lahan", required: true },
        { key: "analisaRisiko", label: "Surat Analisa Risiko dari Dinas Pertanian", required: true },
        { key: "izinPenggunaanLahan", label: "Izin Penggunaan Lahan", required: true },
        { key: "suratPengelolaanLingkungan", label: "Surat Pernyataan Pengelolaan Lingkungan Hidup", required: false, description: "Opsional" },
      ];
    }

    if (type === "Izin Perikanan") {
      return [
        { key: "skd", label: "Surat Keterangan Domisili (SKD) dari Desa/Kelurahan", required: true },
        { key: "fotoLokasi", label: "Foto Lokasi / Area Perairan (Tampak Luar & Dalam)", required: true, multiple: true, description: "Upload minimal 2 foto" },
        { key: "denahLokasi", label: "Denah Lokasi", required: true },
        { key: "izinUsahaPerikanan", label: "Izin Usaha Perikanan (IUP)", required: true },
        { key: "kelayakanBudidaya", label: "Surat Kelayakan Tempat Budidaya / Surat Kelayakan Armada", required: true },
        { key: "izinPemanfaatanRuangLaut", label: "Izin Pemanfaatan Ruang Laut", required: false, description: "Opsional - untuk kegiatan di perairan laut" },
      ];
    }

    return [];
  };

  const docRequirements = getDocRequirements();

  const steps = [
    { number: 1, title: "Formulir Permohonan" },
    { number: 2, title: "Dokumen Identitas" },
    { number: 3, title: "Dokumen Persyaratan" },
  ];

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                      currentStep >= step.number
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "bg-white border-slate-300 text-slate-400"
                    }`}
                  >
                    {currentStep > step.number ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <span className="font-bold">{step.number}</span>
                    )}
                  </div>
                  <div className="ml-3 hidden md:block">
                    <p className={`text-sm font-medium ${
                      currentStep >= step.number ? "text-slate-900" : "text-slate-400"
                    }`}>
                      {step.title}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 transition-all ${
                      currentStep > step.number ? "bg-emerald-600" : "bg-slate-300"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Draft Panel */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowDraftPanel(!showDraftPanel)}
          >
            <Save className="h-4 w-4 mr-2" />
            Draft ({draftList.length})
          </Button>
          {showDraftPanel && (
            <div className="flex items-center gap-2">
              <Input
                placeholder="Nama draft..."
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                className="w-48 h-9 text-sm"
              />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={saveDraft}
                disabled={isSavingDraft}
              >
                <Save className="h-4 w-4 mr-1" />
                Simpan
              </Button>
            </div>
          )}
          {showDraftPanel && draftList.length > 0 && (
            <div className="w-full mt-3 space-y-2">
              <p className="text-sm font-medium text-slate-700">Draft tersimpan:</p>
              {draftList.map((draft) => (
                <div key={draft.id} className="flex items-center justify-between bg-white rounded-lg border p-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{draft.nama}</p>
                    <p className="text-xs text-slate-500">{new Date(draft.createdAt).toLocaleDateString("id-ID")}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => loadDraft(draft)}>
                      Muat
                    </Button>
                    <Button type="button" size="sm" variant="destructive" onClick={() => deleteDraft(draft.id)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Survey Calendar Button */}
        <div className="mb-6">
          <Button
            type="button"
            variant="outline"
            className="border-orange-300 text-orange-700 hover:bg-orange-50"
            onClick={() => setShowSurveyCalendar(true)}
          >
            <CalendarDays className="h-4 w-4 mr-2" />
            Jadwalkan Survey Lokasi
          </Button>
        </div>

        {/* Survey Calendar Dialog */}
        <Dialog open={showSurveyCalendar} onOpenChange={setShowSurveyCalendar}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-orange-600" />
                Jadwalkan Survey Lokasi
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tanggal Survey *</Label>
                <Input
                  type="date"
                  value={surveyData.tanggal}
                  onChange={(e) => setSurveyData({ ...surveyData, tanggal: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label>Waktu Survey *</Label>
                <Input
                  type="time"
                  value={surveyData.waktu}
                  onChange={(e) => setSurveyData({ ...surveyData, waktu: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Lokasi Survey *</Label>
                <Textarea
                  value={surveyData.lokasi}
                  onChange={(e) => setSurveyData({ ...surveyData, lokasi: e.target.value })}
                  placeholder="Alamat lengkap lokasi yang akan disurvey"
                  rows={3}
                />
              </div>
              <Button
                className="w-full bg-orange-600 hover:bg-orange-700"
                onClick={() => {
                  if (!surveyData.tanggal || !surveyData.waktu || !surveyData.lokasi) {
                    toast({ title: "Error", description: "Lengkapi semua field survey", variant: "destructive" });
                    return;
                  }
                  const survey = {
                    id: Date.now().toString(),
                    tanggal: surveyData.tanggal,
                    waktu: surveyData.waktu,
                    lokasi: surveyData.lokasi,
                    status: "dijadwalkan",
                    createdAt: new Date().toISOString(),
                  };
                  const stored = localStorage.getItem("surveySchedules");
                  const existing = stored ? JSON.parse(stored) : [];
                  existing.push(survey);
                  localStorage.setItem("surveySchedules", JSON.stringify(existing));
                  toast({ title: "Survey Dijadwalkan", description: `Survey pada ${surveyData.tanggal} pukul ${surveyData.waktu}` });
                  setShowSurveyCalendar(false);
                  setSurveyData({ tanggal: "", waktu: "", lokasi: "" });
                }}
              >
                <CalendarDays className="h-4 w-4 mr-2" />
                Jadwalkan Survey
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Formulir Permohonan Izin */}
          {currentStep === 1 && (
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <FileText className="h-6 w-6" />
                  Formulir Permohonan Izin
                </CardTitle>
                <CardDescription className="text-emerald-50">
                  Lengkapi data pemohon dan informasi permohonan izin
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Form untuk Perorangan */}
                {formData.jenisPemohon === "perorangan" ? (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-slate-900 border-b pb-2 flex items-center gap-2">
                      <User className="h-5 w-5 text-emerald-600" />
                      Formulir Permohonan Perorangan
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="jenisPemohon">Jenis Pemohon *</Label>
                        <Select
                          value={formData.jenisPemohon}
                          onValueChange={(value) => setFormData({ ...formData, jenisPemohon: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="perorangan">Perorangan</SelectItem>
                            <SelectItem value="perusahaan">Perusahaan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sektor">Sektor *</Label>
                        <Select
                          value={formData.sektor}
                          onValueChange={(value) => setFormData({ ...formData, sektor: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih sektor" />
                          </SelectTrigger>
                          <SelectContent>
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

                    <div className="space-y-2">
                      <Label htmlFor="namaPemohon">Nama Izin *</Label>
                      <Input
                        id="namaPemohon"
                        value={formData.namaPemohon}
                        onChange={(e) => setFormData({ ...formData, namaPemohon: e.target.value })}
                        placeholder="Nama izin yang diajukan"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="alamatUsaha">Alamat *</Label>
                      <Textarea
                        id="alamatUsaha"
                        value={formData.alamatUsaha}
                        onChange={(e) => setFormData({ ...formData, alamatUsaha: e.target.value })}
                        placeholder="Alamat lengkap"
                        required
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="jenisIzin">Jenis Izin *</Label>
                      <Select
                        value={formData.jenisIzin}
                        onValueChange={(value) => setFormData({ ...formData, jenisIzin: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis izin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Izin Perdagangan">Izin Perdagangan</SelectItem>
                          <SelectItem value="Izin Pariwisata">Izin Pariwisata</SelectItem>
                          <SelectItem value="Izin Kesehatan">Izin Kesehatan</SelectItem>
                          <SelectItem value="Izin Pendidikan">Izin Pendidikan</SelectItem>
                          <SelectItem value="Izin Pertanian">Izin Pertanian</SelectItem>
                          <SelectItem value="Izin Perikanan">Izin Perikanan</SelectItem>
                          <SelectItem value="Izin Mendirikan Bangunan (IMB)">Izin Mendirikan Bangunan (IMB)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Dynamic Fields berdasarkan jenis izin */}
                    {dynamicFields.map((field) => (
                      <div key={field.key} className="space-y-2">
                        <Label htmlFor={field.key}>
                          {field.label} {field.required && '*'}
                        </Label>
                        {field.type === "textarea" ? (
                          <Textarea
                            id={field.key}
                            value={(formData as any)[field.key] || ""}
                            onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                            placeholder={`Masukkan ${field.label.toLowerCase()}`}
                            required={field.required}
                            rows={3}
                          />
                        ) : field.type === "select" && field.options ? (
                          <Select
                            value={(formData as any)[field.key] || ""}
                            onValueChange={(value) => setFormData({ ...formData, [field.key]: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={`Pilih ${field.label.toLowerCase()}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options.map((opt) => (
                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            id={field.key}
                            value={(formData as any)[field.key] || ""}
                            onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                            placeholder={`Masukkan ${field.label.toLowerCase()}`}
                            required={field.required}
                          />
                        )}
                      </div>
                    ))}

                    <div className="space-y-2">
                      <Label htmlFor="nik">NIK / No KTP *</Label>
                      <Input
                        id="nik"
                        value={formData.nik}
                        onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                        placeholder="16 digit NIK"
                        required
                        maxLength={16}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nomorHP">No HP *</Label>
                        <Input
                          id="nomorHP"
                          value={formData.nomorHP}
                          onChange={(e) => setFormData({ ...formData, nomorHP: e.target.value })}
                          placeholder="081234567890"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="email@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lokasiKegiatanUsaha">Lokasi Kegiatan *</Label>
                      <Textarea
                        id="lokasiKegiatanUsaha"
                        value={formData.lokasiKegiatanUsaha}
                        onChange={(e) => setFormData({ ...formData, lokasiKegiatanUsaha: e.target.value })}
                        placeholder="Alamat lengkap lokasi kegiatan"
                        required
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="latitude">Latitude Peta (Opsional)</Label>
                        <Input
                          id="latitude"
                          value={formData.latitude}
                          onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                          placeholder="Contoh: -2.9427"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="longitude">Longitude Peta (Opsional)</Label>
                        <Input
                          id="longitude"
                          value={formData.longitude}
                          onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                          placeholder="Contoh: 115.1587"
                        />
                      </div>
                    </div>

                    {/* Upload Surat Pernyataan */}
                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Label className="text-base font-semibold text-slate-900">Surat Pernyataan Kebenaran Data (Materai) *</Label>
                        <span className="text-red-500"></span>
                      </div>
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors">
                        <Upload className="h-10 w-10 mx-auto text-slate-400 mb-3" />
                        <Label htmlFor="surat-pernyataan-upload" className="cursor-pointer">
                          <span className="text-emerald-600 font-medium hover:text-emerald-700">
                            Klik untuk upload atau drag & drop
                          </span>
                          <p className="text-sm text-slate-500 mt-2">
                            Format: PDF, JPG, PNG (Maks. 5MB)
                          </p>
                        </Label>
                        <Input
                          id="surat-pernyataan-upload"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const uploadedFile: UploadedFile = {
                                name: file.name,
                                file: file,
                              };
                              if (file.type.startsWith("image/")) {
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                  uploadedFile.preview = e.target?.result as string;
                                };
                                reader.readAsDataURL(file);
                              }
                              setSuratPernyataanFile(uploadedFile);
                            }
                          }}
                          className="hidden"
                          required
                        />
                      </div>
                      {suratPernyataanFile && (
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileText className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                            <span className="text-sm text-slate-700 truncate">{suratPernyataanFile.name}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSuratPernyataanFile(null)}
                            className="flex-shrink-0"
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Form untuk Perusahaan */}
                    <h3 className="text-lg font-semibold text-slate-900 border-b pb-2 flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-emerald-600" />
                      Formulir Permohonan Perusahaan
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="jenisPemohon">Jenis Pemohon *</Label>
                        <Select
                          value={formData.jenisPemohon}
                          onValueChange={(value) => setFormData({ ...formData, jenisPemohon: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="perorangan">Perorangan</SelectItem>
                            <SelectItem value="perusahaan">Perusahaan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sektor">Sektor *</Label>
                        <Select
                          value={formData.sektor}
                          onValueChange={(value) => setFormData({ ...formData, sektor: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih sektor" />
                          </SelectTrigger>
                          <SelectContent>
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

                    <div className="space-y-2">
                      <Label htmlFor="namaPerusahaan">Nama Izin *</Label>
                      <Input
                        id="namaPerusahaan"
                        value={formData.namaPerusahaan}
                        onChange={(e) => setFormData({ ...formData, namaPerusahaan: e.target.value })}
                        placeholder="Nama perusahaan"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="alamatPerusahaan">Alamat  *</Label>
                      <Textarea
                        id="alamatPerusahaan"
                        value={formData.alamatPerusahaan}
                        onChange={(e) => setFormData({ ...formData, alamatPerusahaan: e.target.value })}
                        placeholder="Alamat lengkap perusahaan"
                        required
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nib">NIB (jika sudah punya OSS)</Label>
                      <Input
                        id="nib"
                        value={formData.nib}
                        onChange={(e) => setFormData({ ...formData, nib: e.target.value })}
                        placeholder="Nomor Induk Berusaha"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="penanggungJawab">Penanggung Jawab  *</Label>
                      <Input
                        id="penanggungJawab"
                        value={formData.penanggungJawab}
                        onChange={(e) => setFormData({ ...formData, penanggungJawab: e.target.value })}
                        placeholder="Nama penanggung jawab"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lokasiSpesifikasiBangunan">Lokasi dan Spesifikasi Bangunan *</Label>
                      <Textarea
                        id="lokasiSpesifikasiBangunan"
                        value={formData.lokasiSpesifikasiBangunan}
                        onChange={(e) => setFormData({ ...formData, lokasiSpesifikasiBangunan: e.target.value })}
                        placeholder="Lokasi dan spesifikasi bangunan secara detail"
                        required
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="jenisIzinPerusahaan">Jenis Izin *</Label>
                      <Select
                        value={formData.jenisIzin}
                        onValueChange={(value) => setFormData({ ...formData, jenisIzin: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis izin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Izin Perdagangan">Izin Perdagangan</SelectItem>
                          <SelectItem value="Izin Pariwisata">Izin Pariwisata</SelectItem>
                          <SelectItem value="Izin Kesehatan">Izin Kesehatan</SelectItem>
                          <SelectItem value="Izin Pendidikan">Izin Pendidikan</SelectItem>
                          <SelectItem value="Izin Pertanian">Izin Pertanian</SelectItem>
                          <SelectItem value="Izin Perikanan">Izin Perikanan</SelectItem>
                          <SelectItem value="Izin Mendirikan Bangunan (IMB)">Izin Mendirikan Bangunan (IMB)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="keteranganPemanfaatanBangunan">Keterangan Pemanfaatan Bangunan *</Label>
                      <Input
                        id="keteranganPemanfaatanBangunan"
                        value={formData.keteranganPemanfaatanBangunan}
                        onChange={(e) => setFormData({ ...formData, keteranganPemanfaatanBangunan: e.target.value })}
                        placeholder="Contoh: Kantor, Gudang, Pabrik, Toko, Rumah Makan, Hotel, dll"
                        required
                      />
                    </div>

                    {/* Dynamic Fields berdasarkan jenis izin */}
                    {dynamicFields.map((field) => (
                      <div key={field.key} className="space-y-2">
                        <Label htmlFor={field.key}>
                          {field.label} {field.required && '*'}
                        </Label>
                        {field.type === "textarea" ? (
                          <Textarea
                            id={field.key}
                            value={(formData as any)[field.key] || ""}
                            onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                            placeholder={`Masukkan ${field.label.toLowerCase()}`}
                            required={field.required}
                            rows={3}
                          />
                        ) : field.type === "select" && field.options ? (
                          <Select
                            value={(formData as any)[field.key] || ""}
                            onValueChange={(value) => setFormData({ ...formData, [field.key]: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={`Pilih ${field.label.toLowerCase()}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options.map((opt) => (
                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            id={field.key}
                            value={(formData as any)[field.key] || ""}
                            onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                            placeholder={`Masukkan ${field.label.toLowerCase()}`}
                            required={field.required}
                          />
                        )}
                      </div>
                    ))}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="latitudeComp">Latitude Peta (Opsional)</Label>
                        <Input
                          id="latitudeComp"
                          value={formData.latitude}
                          onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                          placeholder="Contoh: -2.9427"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="longitudeComp">Longitude Peta (Opsional)</Label>
                        <Input
                          id="longitudeComp"
                          value={formData.longitude}
                          onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                          placeholder="Contoh: 115.1587"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <Button 
                    type="button" 
                    onClick={nextStep} 
                    className="bg-emerald-600 hover:bg-emerald-700"
                    disabled={
                      (formData.jenisPemohon === "perorangan" && !suratPernyataanFile) ||
                      (formData.jenisPemohon === "perusahaan" && (
                        !formData.namaPerusahaan ||
                        !formData.alamatPerusahaan ||
                        !formData.penanggungJawab ||
                        !formData.lokasiSpesifikasiBangunan ||
                        !formData.keteranganPemanfaatanBangunan
                      ))
                    }
                  >
                    Lanjutkan
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Dokumen Identitas */}
          {currentStep === 2 && (
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Upload className="h-6 w-6" />
                  Fotokopi Identitas Pemohon
                </CardTitle>
                <CardDescription className="text-emerald-50">
                  Upload dokumen identitas sesuai jenis pemohon
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {formData.jenisPemohon === "perorangan" ? (
                  <div className="space-y-6">
                    {/* Form KTP - Wajib */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Label className="text-base font-semibold text-slate-900">Fotokopi KTP Pemohon *</Label>
                        <span className="text-red-500"></span>
                      </div>
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors">
                        <Upload className="h-10 w-10 mx-auto text-slate-400 mb-3" />
                        <Label htmlFor="ktp-upload" className="cursor-pointer">
                          <span className="text-emerald-600 font-medium hover:text-emerald-700">
                            Klik untuk upload atau drag & drop
                          </span>
                          <p className="text-sm text-slate-500 mt-2">
                            Format: PDF, JPG, PNG (Maks. 5MB)
                          </p>
                        </Label>
                        <Input
                          id="ktp-upload"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const uploadedFile: UploadedFile = {
                                name: file.name,
                                file: file,
                              };
                              if (file.type.startsWith("image/")) {
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                  uploadedFile.preview = e.target?.result as string;
                                };
                                reader.readAsDataURL(file);
                              }
                              setKtpFile(uploadedFile);
                            }
                          }}
                          className="hidden"
                          required
                        />
                      </div>
                      {ktpFile && (
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileText className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                            <span className="text-sm text-slate-700 truncate">{ktpFile.name}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setKtpFile(null)}
                            className="flex-shrink-0"
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Form NPWP Pribadi - Wajib */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Label className="text-base font-semibold text-slate-900">NPWP Pribadi *</Label>
                        <span className="text-red-500"></span>
                      </div>
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors">
                        <Upload className="h-10 w-10 mx-auto text-slate-400 mb-3" />
                        <Label htmlFor="npwp-pribadi-upload" className="cursor-pointer">
                          <span className="text-emerald-600 font-medium hover:text-emerald-700">
                            Klik untuk upload atau drag & drop
                          </span>
                          <p className="text-sm text-slate-500 mt-2">
                            Format: PDF, JPG, PNG (Maks. 5MB)
                          </p>
                        </Label>
                        <Input
                          id="npwp-pribadi-upload"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const uploadedFile: UploadedFile = {
                                name: file.name,
                                file: file,
                              };
                              if (file.type.startsWith("image/")) {
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                  uploadedFile.preview = e.target?.result as string;
                                };
                                reader.readAsDataURL(file);
                              }
                              setNpwpPribadiFile(uploadedFile);
                            }
                          }}
                          className="hidden"
                          required
                        />
                      </div>
                      {npwpPribadiFile && (
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileText className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                            <span className="text-sm text-slate-700 truncate">{npwpPribadiFile.name}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setNpwpPribadiFile(null)}
                            className="flex-shrink-0"
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Form KK - Opsional */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Label className="text-base font-semibold text-slate-900">KK (Kartu Keluarga)</Label>
                        <span className="text-slate-500 text-sm">Opsional</span>
                      </div>
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors">
                        <Upload className="h-10 w-10 mx-auto text-slate-400 mb-3" />
                        <Label htmlFor="kk-upload" className="cursor-pointer">
                          <span className="text-emerald-600 font-medium hover:text-emerald-700">
                            Klik untuk upload atau drag & drop
                          </span>
                          <p className="text-sm text-slate-500 mt-2">
                            Format: PDF, JPG, PNG (Maks. 5MB)
                          </p>
                        </Label>
                        <Input
                          id="kk-upload"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const uploadedFile: UploadedFile = {
                                name: file.name,
                                file: file,
                              };
                              if (file.type.startsWith("image/")) {
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                  uploadedFile.preview = e.target?.result as string;
                                };
                                reader.readAsDataURL(file);
                              }
                              setKkFile(uploadedFile);
                            }
                          }}
                          className="hidden"
                        />
                      </div>
                      {kkFile && (
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileText className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                            <span className="text-sm text-slate-700 truncate">{kkFile.name}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setKkFile(null)}
                            className="flex-shrink-0"
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Form Akta Pendirian Perusahaan - Wajib */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Label className="text-base font-semibold text-slate-900">Akta Pendirian Perusahaan *</Label>
                        <span className="text-red-500"></span>
                      </div>
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors">
                        <Upload className="h-10 w-10 mx-auto text-slate-400 mb-3" />
                        <Label htmlFor="akta-pendirian-upload" className="cursor-pointer">
                          <span className="text-emerald-600 font-medium hover:text-emerald-700">
                            Klik untuk upload atau drag & drop
                          </span>
                          <p className="text-sm text-slate-500 mt-2">
                            Format: PDF, JPG, PNG (Maks. 5MB)
                          </p>
                        </Label>
                        <Input
                          id="akta-pendirian-upload"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const uploadedFile: UploadedFile = {
                                name: file.name,
                                file: file,
                              };
                              if (file.type.startsWith("image/")) {
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                  uploadedFile.preview = e.target?.result as string;
                                };
                                reader.readAsDataURL(file);
                              }
                              setAktaPendirianFile(uploadedFile);
                            }
                          }}
                          className="hidden"
                          required
                        />
                      </div>
                      {aktaPendirianFile && (
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileText className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                            <span className="text-sm text-slate-700 truncate">{aktaPendirianFile.name}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setAktaPendirianFile(null)}
                            className="flex-shrink-0"
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Form NIB - Wajib */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Label className="text-base font-semibold text-slate-900">NIB / Nomor Induk Berusaha *</Label>
                        <span className="text-red-500"></span>
                      </div>
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors">
                        <Upload className="h-10 w-10 mx-auto text-slate-400 mb-3" />
                        <Label htmlFor="nib-upload" className="cursor-pointer">
                          <span className="text-emerald-600 font-medium hover:text-emerald-700">
                            Klik untuk upload atau drag & drop
                          </span>
                          <p className="text-sm text-slate-500 mt-2">
                            Format: PDF, JPG, PNG (Maks. 5MB)
                          </p>
                        </Label>
                        <Input
                          id="nib-upload"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const uploadedFile: UploadedFile = {
                                name: file.name,
                                file: file,
                              };
                              if (file.type.startsWith("image/")) {
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                  uploadedFile.preview = e.target?.result as string;
                                };
                                reader.readAsDataURL(file);
                              }
                              setNibFile(uploadedFile);
                            }
                          }}
                          className="hidden"
                          required
                        />
                      </div>
                      {nibFile && (
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileText className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                            <span className="text-sm text-slate-700 truncate">{nibFile.name}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setNibFile(null)}
                            className="flex-shrink-0"
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Form NPWP Perusahaan - Wajib */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Label className="text-base font-semibold text-slate-900">NPWP Perusahaan *</Label>
                        <span className="text-red-500"></span>
                      </div>
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors">
                        <Upload className="h-10 w-10 mx-auto text-slate-400 mb-3" />
                        <Label htmlFor="npwp-perusahaan-upload" className="cursor-pointer">
                          <span className="text-emerald-600 font-medium hover:text-emerald-700">
                            Klik untuk upload atau drag & drop
                          </span>
                          <p className="text-sm text-slate-500 mt-2">
                            Format: PDF, JPG, PNG (Maks. 5MB)
                          </p>
                        </Label>
                        <Input
                          id="npwp-perusahaan-upload"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const uploadedFile: UploadedFile = {
                                name: file.name,
                                file: file,
                              };
                              if (file.type.startsWith("image/")) {
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                  uploadedFile.preview = e.target?.result as string;
                                };
                                reader.readAsDataURL(file);
                              }
                              setNpwpPerusahaanFile(uploadedFile);
                            }
                          }}
                          className="hidden"
                          required
                        />
                      </div>
                      {npwpPerusahaanFile && (
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileText className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                            <span className="text-sm text-slate-700 truncate">{npwpPerusahaanFile.name}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setNpwpPerusahaanFile(null)}
                            className="flex-shrink-0"
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Form KTP Direktur/Penanggung Jawab - Wajib */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Label className="text-base font-semibold text-slate-900">KTP Penanggung Jawab *</Label>
                        <span className="text-red-500"></span>
                      </div>
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors">
                        <Upload className="h-10 w-10 mx-auto text-slate-400 mb-3" />
                        <Label htmlFor="ktp-direktur-upload" className="cursor-pointer">
                          <span className="text-emerald-600 font-medium hover:text-emerald-700">
                            Klik untuk upload atau drag & drop
                          </span>
                          <p className="text-sm text-slate-500 mt-2">
                            Format: PDF, JPG, PNG (Maks. 5MB)
                          </p>
                        </Label>
                        <Input
                          id="ktp-direktur-upload"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const uploadedFile: UploadedFile = {
                                name: file.name,
                                file: file,
                              };
                              if (file.type.startsWith("image/")) {
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                  uploadedFile.preview = e.target?.result as string;
                                };
                                reader.readAsDataURL(file);
                              }
                              setKtpDirekturFile(uploadedFile);
                            }
                          }}
                          className="hidden"
                          required
                        />
                      </div>
                      {ktpDirekturFile && (
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileText className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                            <span className="text-sm text-slate-700 truncate">{ktpDirekturFile.name}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setKtpDirekturFile(null)}
                            className="flex-shrink-0"
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Form Surat Kuasa - Opsional */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Label className="text-base font-semibold text-slate-900">Surat Kuasa Perusahaan</Label>
                        <span className="text-slate-500 text-sm">Opsional </span>
                      </div>
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors">
                        <Upload className="h-10 w-10 mx-auto text-slate-400 mb-3" />
                        <Label htmlFor="surat-kuasa-upload" className="cursor-pointer">
                          <span className="text-emerald-600 font-medium hover:text-emerald-700">
                            Klik untuk upload atau drag & drop
                          </span>
                          <p className="text-sm text-slate-500 mt-2">
                            Format: PDF, JPG, PNG (Maks. 5MB)
                          </p>
                        </Label>
                        <Input
                          id="surat-kuasa-upload"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const uploadedFile: UploadedFile = {
                                name: file.name,
                                file: file,
                              };
                              if (file.type.startsWith("image/")) {
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                  uploadedFile.preview = e.target?.result as string;
                                };
                                reader.readAsDataURL(file);
                              }
                              setSuratKuasaFile(uploadedFile);
                            }
                          }}
                          className="hidden"
                        />
                      </div>
                      {suratKuasaFile && (
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileText className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                            <span className="text-sm text-slate-700 truncate">{suratKuasaFile.name}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSuratKuasaFile(null)}
                            className="flex-shrink-0"
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Kembali
                  </Button>
                  <Button 
                    type="button" 
                    onClick={nextStep} 
                    className="bg-emerald-600 hover:bg-emerald-700"
                    disabled={
                      (formData.jenisPemohon === "perorangan" && (!ktpFile || !npwpPribadiFile)) ||
                      (formData.jenisPemohon === "perusahaan" && (!aktaPendirianFile || !nibFile || !npwpPerusahaanFile || !ktpDirekturFile))
                    }
                  >
                    Lanjutkan
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Dokumen Persyaratan */}
          {currentStep === 3 && (
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <FileCheck className="h-6 w-6" />
                  Dokumen Persyaratan Perizinan
                </CardTitle>
                <CardDescription className="text-emerald-50">
                  Upload dokumen sesuai jenis izin yang diajukan
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {isBangunanIzin() ? (
                  <div className="space-y-6">
                    {/* Dokumen Tanah */}
                    <div className="space-y-4 pt-4 border-t">
                      <h3 className="text-lg font-semibold text-slate-900 border-b pb-2 flex items-center gap-2">
                        <FileCheck className="h-5 w-5 text-emerald-600" />
                        1. Dokumen Tanah
                      </h3>

                      {/* Sertifikat Tanah - Wajib */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="text-base font-semibold text-slate-900">Sertifikat Tanah (SHM / HGB) *</Label>
                        </div>
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors">
                          <Upload className="h-10 w-10 mx-auto text-slate-400 mb-3" />
                          <Label htmlFor="sertifikat-tanah-upload" className="cursor-pointer">
                            <span className="text-emerald-600 font-medium hover:text-emerald-700">
                              Klik untuk upload atau drag & drop
                            </span>
                            <p className="text-sm text-slate-500 mt-2">
                              Format: PDF, JPG, PNG (Maks. 5MB)
                            </p>
                          </Label>
                          <Input
                            id="sertifikat-tanah-upload"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const uploadedFile: UploadedFile = {
                                  name: file.name,
                                  file: file,
                                };
                                if (file.type.startsWith("image/")) {
                                  const reader = new FileReader();
                                  reader.onload = (e) => {
                                    uploadedFile.preview = e.target?.result as string;
                                  };
                                  reader.readAsDataURL(file);
                                }
                                setSertifikatTanahFile(uploadedFile);
                              }
                            }}
                            className="hidden"
                            required
                          />
                        </div>
                        {sertifikatTanahFile && (
                          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <FileText className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                              <span className="text-sm text-slate-700 truncate">{sertifikatTanahFile.name}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setSertifikatTanahFile(null)}
                              className="flex-shrink-0"
                            >
                              <X className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Surat Sewa / Perjanjian - Opsional */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="text-base font-semibold text-slate-900">Surat Sewa / Perjanjian Penggunaan Lahan</Label>
                          <span className="text-slate-500 text-sm">Opsional (jika bukan milik sendiri)</span>
                        </div>
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors">
                          <Upload className="h-10 w-10 mx-auto text-slate-400 mb-3" />
                          <Label htmlFor="surat-sewa-upload" className="cursor-pointer">
                            <span className="text-emerald-600 font-medium hover:text-emerald-700">
                              Klik untuk upload atau drag & drop
                            </span>
                            <p className="text-sm text-slate-500 mt-2">
                              Format: PDF, JPG, PNG (Maks. 5MB)
                            </p>
                          </Label>
                          <Input
                            id="surat-sewa-upload"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const uploadedFile: UploadedFile = {
                                  name: file.name,
                                  file: file,
                                };
                                if (file.type.startsWith("image/")) {
                                  const reader = new FileReader();
                                  reader.onload = (e) => {
                                    uploadedFile.preview = e.target?.result as string;
                                  };
                                  reader.readAsDataURL(file);
                                }
                                setSuratSewaFile(uploadedFile);
                              }
                            }}
                            className="hidden"
                          />
                        </div>
                        {suratSewaFile && (
                          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <FileText className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                              <span className="text-sm text-slate-700 truncate">{suratSewaFile.name}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setSuratSewaFile(null)}
                              className="flex-shrink-0"
                            >
                              <X className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Surat Keterangan Tidak Sengketa - Wajib */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="text-base font-semibold text-slate-900">Surat Keterangan Tidak Dalam Sengketa *</Label>
                        </div>
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors">
                          <Upload className="h-10 w-10 mx-auto text-slate-400 mb-3" />
                          <Label htmlFor="surat-keterangan-sengketa-upload" className="cursor-pointer">
                            <span className="text-emerald-600 font-medium hover:text-emerald-700">
                              Klik untuk upload atau drag & drop
                            </span>
                            <p className="text-sm text-slate-500 mt-2">
                              Format: PDF, JPG, PNG (Maks. 5MB)
                            </p>
                          </Label>
                          <Input
                            id="surat-keterangan-sengketa-upload"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const uploadedFile: UploadedFile = {
                                  name: file.name,
                                  file: file,
                                };
                                if (file.type.startsWith("image/")) {
                                  const reader = new FileReader();
                                  reader.onload = (e) => {
                                    uploadedFile.preview = e.target?.result as string;
                                  };
                                  reader.readAsDataURL(file);
                                }
                                setSuratKeteranganTidakSengketaFile(uploadedFile);
                              }
                            }}
                            className="hidden"
                            required
                          />
                        </div>
                        {suratKeteranganTidakSengketaFile && (
                          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <FileText className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                              <span className="text-sm text-slate-700 truncate">{suratKeteranganTidakSengketaFile.name}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setSuratKeteranganTidakSengketaFile(null)}
                              className="flex-shrink-0"
                            >
                              <X className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Dokumen Teknis Bangunan */}
                    <div className="space-y-4 pt-4 border-t">
                      <h3 className="text-lg font-semibold text-slate-900 border-b pb-2 flex items-center gap-2">
                        <FileCheck className="h-5 w-5 text-emerald-600" />
                        2. Dokumen Teknis Bangunan
                      </h3>

                      {/* Denah - Wajib */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="text-base font-semibold text-slate-900">Gambar Teknis / Blueprint: Denah *</Label>
                        </div>
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors">
                          <Upload className="h-10 w-10 mx-auto text-slate-400 mb-3" />
                          <Label htmlFor="denah-bangunan-upload" className="cursor-pointer">
                            <span className="text-emerald-600 font-medium hover:text-emerald-700">
                              Klik untuk upload atau drag & drop
                            </span>
                            <p className="text-sm text-slate-500 mt-2">
                              Format: PDF, JPG, PNG (Maks. 5MB)
                            </p>
                          </Label>
                          <Input
                            id="denah-bangunan-upload"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const uploadedFile: UploadedFile = {
                                  name: file.name,
                                  file: file,
                                };
                                if (file.type.startsWith("image/")) {
                                  const reader = new FileReader();
                                  reader.onload = (e) => {
                                    uploadedFile.preview = e.target?.result as string;
                                  };
                                  reader.readAsDataURL(file);
                                }
                                setDenahBangunanFile(uploadedFile);
                              }
                            }}
                            className="hidden"
                            required
                          />
                        </div>
                        {denahBangunanFile && (
                          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <FileText className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                              <span className="text-sm text-slate-700 truncate">{denahBangunanFile.name}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setDenahBangunanFile(null)}
                              className="flex-shrink-0"
                            >
                              <X className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Foto Lokasi Tanah dan Bangunan - Wajib */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="text-base font-semibold text-slate-900">Foto Lokasi Tanah dan Bangunan *</Label>
                        </div>
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors">
                          <Upload className="h-10 w-10 mx-auto text-slate-400 mb-3" />
                          <Label htmlFor="foto-lokasi-tanah-upload" className="cursor-pointer">
                            <span className="text-emerald-600 font-medium hover:text-emerald-700">
                              Klik untuk upload atau drag & drop
                            </span>
                            <p className="text-sm text-slate-500 mt-2">
                              Format: JPG, PNG (Maks. 5MB per file)
                            </p>
                          </Label>
                          <Input
                            id="foto-lokasi-tanah-upload"
                            type="file"
                            multiple
                            accept=".jpg,.jpeg,.png"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              files.forEach((file) => {
                                const uploadedFile: UploadedFile = {
                                  name: file.name,
                                  file: file,
                                };
                                if (file.type.startsWith("image/")) {
                                  const reader = new FileReader();
                                  reader.onload = (e) => {
                                    uploadedFile.preview = e.target?.result as string;
                                  };
                                  reader.readAsDataURL(file);
                                }
                                setFotoLokasiTanahBangunanFile((prev) => [...prev, uploadedFile]);
                              });
                            }}
                            className="hidden"
                          />
                        </div>
                        {fotoLokasiTanahBangunanFile.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-slate-900 text-sm">File yang diupload:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {fotoLokasiTanahBangunanFile.map((file, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                                >
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <FileText className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                                    <span className="text-sm text-slate-700 truncate">{file.name}</span>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setFotoLokasiTanahBangunanFile((prev) => prev.filter((_, i) => i !== index))}
                                    className="flex-shrink-0"
                                  >
                                    <X className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Surat Pernyataan Kesesuaian Fungsi - Wajib */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="text-base font-semibold text-slate-900">Surat Pernyataan Kesesuaian Fungsi Bangunan *</Label>
                        </div>
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors">
                          <Upload className="h-10 w-10 mx-auto text-slate-400 mb-3" />
                          <Label htmlFor="surat-kesesuaian-fungsi-upload" className="cursor-pointer">
                            <span className="text-emerald-600 font-medium hover:text-emerald-700">
                              Klik untuk upload atau drag & drop
                            </span>
                            <p className="text-sm text-slate-500 mt-2">
                              Format: PDF, JPG, PNG (Maks. 5MB)
                            </p>
                          </Label>
                          <Input
                            id="surat-kesesuaian-fungsi-upload"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const uploadedFile: UploadedFile = {
                                  name: file.name,
                                  file: file,
                                };
                                if (file.type.startsWith("image/")) {
                                  const reader = new FileReader();
                                  reader.onload = (e) => {
                                    uploadedFile.preview = e.target?.result as string;
                                  };
                                  reader.readAsDataURL(file);
                                }
                                setSuratPernyataanKesesuaianFungsiFile(uploadedFile);
                              }
                            }}
                            className="hidden"
                            required
                          />
                        </div>
                        {suratPernyataanKesesuaianFungsiFile && (
                          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <FileText className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                              <span className="text-sm text-slate-700 truncate">{suratPernyataanKesesuaianFungsiFile.name}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setSuratPernyataanKesesuaianFungsiFile(null)}
                              className="flex-shrink-0"
                            >
                              <X className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : isNonBangunanIzin() ? (
                  <div className="space-y-6">
                    {/* Dynamic document requirements per izin type */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-emerald-800 font-medium">
                        Jenis Izin: <span className="font-bold">{formData.jenisIzin}</span>
                      </p>
                      <p className="text-xs text-emerald-600 mt-1">
                        Silakan upload dokumen persyaratan sesuai jenis izin yang dipilih
                      </p>
                    </div>

                    {docRequirements.map((doc) => (
                      <div className="space-y-3" key={doc.key}>
                        <div className="flex items-center gap-2">
                          <Label className="text-base font-semibold text-slate-900">
                            {doc.label} {doc.required ? "*" : ""}
                          </Label>
                          {!doc.required && (
                            <span className="text-slate-500 text-sm">Opsional</span>
                          )}
                        </div>
                        {doc.description && (
                          <p className="text-xs text-slate-500 -mt-1">{doc.description}</p>
                        )}
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors">
                          <Upload className="h-10 w-10 mx-auto text-slate-400 mb-3" />
                          <Label htmlFor={`doc-${doc.key}-upload`} className="cursor-pointer">
                            <span className="text-emerald-600 font-medium hover:text-emerald-700">
                              Klik untuk upload atau drag & drop
                            </span>
                            <p className="text-sm text-slate-500 mt-2">
                              Format: PDF, JPG, PNG (Maks. 5MB)
                              {doc.multiple ? " - Bisa upload multiple file" : ""}
                            </p>
                          </Label>
                          <Input
                            id={`doc-${doc.key}-upload`}
                            type="file"
                            multiple={doc.multiple}
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              if (doc.multiple) {
                                const uploadedFiles: UploadedFile[] = files.map((file) => {
                                  const uf: UploadedFile = { name: file.name, file };
                                  if (file.type.startsWith("image/")) {
                                    const reader = new FileReader();
                                    reader.onload = (ev) => {
                                      uf.preview = ev.target?.result as string;
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                  return uf;
                                });
                                addDokumenMulti(doc.key, uploadedFiles);
                              } else {
                                const file = files[0];
                                if (file) {
                                  const uf: UploadedFile = { name: file.name, file };
                                  if (file.type.startsWith("image/")) {
                                    const reader = new FileReader();
                                    reader.onload = (ev) => {
                                      uf.preview = ev.target?.result as string;
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                  setDokumen(doc.key, uf);
                                }
                              }
                            }}
                            className="hidden"
                          />
                        </div>
                        {/* Show single file */}
                        {!doc.multiple && dokumenIzin[doc.key] && (
                          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <FileText className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                              <span className="text-sm text-slate-700 truncate">{dokumenIzin[doc.key]!.name}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setDokumen(doc.key, null)}
                              className="flex-shrink-0"
                            >
                              <X className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        )}
                        {/* Show multiple files */}
                        {doc.multiple && (dokumenIzinMulti[doc.key]?.length || 0) > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-slate-900 text-sm">File yang diupload:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {(dokumenIzinMulti[doc.key] || []).map((file: UploadedFile, index: number) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                                >
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <FileText className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                                    <span className="text-sm text-slate-700 truncate">{file.name}</span>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeDokumenMulti(doc.key, index)}
                                    className="flex-shrink-0"
                                  >
                                    <X className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Kembali
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      isSubmitting || 
                      (isNonBangunanIzin() && docRequirements.some(doc => {
                        if (!doc.required) return false;
                        if (doc.multiple) {
                          return (dokumenIzinMulti[doc.key]?.length || 0) === 0;
                        }
                        return !dokumenIzin[doc.key];
                      })) ||
                      (isBangunanIzin() && (
                        !sertifikatTanahFile || 
                        !suratKeteranganTidakSengketaFile || 
                        !denahBangunanFile || 
                        fotoLokasiTanahBangunanFile.length === 0 || 
                        !suratPernyataanKesesuaianFungsiFile
                      ))
                    }
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Kirim Permohonan
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </main>
    </div>
  );
}

