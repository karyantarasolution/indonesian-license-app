"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  FileText,
  Search, 
  LogIn, 
  Plus, 
  CheckCircle, 
  Clock,
  User, 
  Mail, 
  Phone, 
  MapPin,
  ArrowRight,
  Shield,
  Calendar,
  TrendingUp,
  Image as ImageIcon,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Building2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  HelpCircle,
  Star,
  MessageSquare,
  CreditCard,
  ClipboardList,
  CalendarDays,
  BarChart3
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { LicenseService } from "@/lib/license-service";
import { useToast } from "@/hooks/use-toast";
import { useLicenses } from "@/contexts/license-context";
import type { News, Gallery, Testimonial, Tutorial, KamusPerizinan, Payment } from "@/lib/types";

// Generate tracking code
function generateTrackingCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function LandingPage() {
  const { toast } = useToast();
  const { licenses } = useLicenses();
  
  // State untuk form pengajuan
  const [formData, setFormData] = useState({
    jenisIzin: "",
    namaIzin: "",
    lokasiIzin: "",
    permohonanMasuk: new Date().toISOString().split('T')[0],
    perizinan: "",
    sektor: "",
    keterangan: "",
    pemohonNama: "",
    pemohonEmail: "",
    pemohonTelepon: "",
  });

  // State untuk tracking
  const [trackingCode, setTrackingCode] = useState("");
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);

  // State untuk form submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State untuk berita
  const [newsList, setNewsList] = useState<News[]>([]);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  
  // State untuk galeri
  const [galleryList, setGalleryList] = useState<Gallery[]>([]);
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);
  const [currentGalleryImageIndex, setCurrentGalleryImageIndex] = useState(0);
  
  // State untuk testimoni
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  
  // State untuk tutorial
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  
  // State untuk kamus perizinan
  const [kamusList, setKamusList] = useState<KamusPerizinan[]>([]);
  const [kamusSearch, setKamusSearch] = useState("");
  const [kamusKategori, setKamusKategori] = useState("Semua");
  
  // State untuk pencarian izin
  const [searchIzin, setSearchIzin] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // State untuk pembayaran
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentData, setPaymentData] = useState({
    jumlah: 0,
    metodePembayaran: "transfer" as const,
    trackingCode: "",
    pemohonNama: "",
  });
  
  // Debug: Log when newsList changes
  useEffect(() => {
    console.log("🎨 newsList state changed:", newsList.length, "items");
    if (newsList.length > 0) {
      console.log("📰 Current news titles:", newsList.map((n) => n.title));
    }
  }, [newsList]);

  // Hitung statistik
  const stats = useMemo(() => {
    const total = licenses.length;
    const sedangDiproses = licenses.filter((l) => 
      l.status === "proses" || l.status === "rekomendasi" || l.status === "dikirim"
    ).length;
    const selesai = licenses.filter((l) => l.status === "selesai").length;
    
    // Rata-rata waktu penyelesaian
    const completedLicenses = licenses.filter((l) => l.status === "selesai" && l.totalSLA > 0);
    const avgWaktu = completedLicenses.length > 0
      ? Math.round(completedLicenses.reduce((acc, l) => acc + l.totalSLA, 0) / completedLicenses.length)
      : 0;

    return {
      total,
      sedangDiproses,
      selesai,
      avgWaktu,
    };
  }, [licenses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const tracking = generateTrackingCode();
      
      const newLicense = await LicenseService.addLicense({
        jenisIzin: formData.jenisIzin,
        namaIzin: formData.namaIzin,
        lokasiIzin: formData.lokasiIzin,
        permohonanMasuk: formData.permohonanMasuk,
        perizinan: formData.perizinan,
        sektor: formData.sektor,
        pemohonId: "",
        pemohonNama: formData.pemohonNama,
        pemohonEmail: formData.pemohonEmail,
        pemohonTelepon: formData.pemohonTelepon,
        trackingCode: tracking,
        status: "dikirim",
        createdBy: "pemohon",
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
      });

      toast({
        title: "Pengajuan Berhasil!",
        description: `Permohonan Anda telah dikirim. Kode Tracking: ${tracking}`,
      });

      // Reset form
      setFormData({
        jenisIzin: "",
        namaIzin: "",
        lokasiIzin: "",
        permohonanMasuk: new Date().toISOString().split('T')[0],
        perizinan: "",
        sektor: "",
        keterangan: "",
        pemohonNama: "",
        pemohonEmail: "",
        pemohonTelepon: "",
      });

      // Set tracking code untuk tab tracking
      setTrackingCode(tracking);
      
      // Switch ke tab tracking
      const tabsList = document.querySelector('[role="tablist"]');
      const trackingTab = document.querySelector('[value="tracking"]') as HTMLElement;
      if (trackingTab) {
        trackingTab.click();
      }
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

  const handleTracking = async () => {
    if (!trackingCode.trim()) {
      toast({
        title: "Error",
        description: "Masukkan kode tracking terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    setIsTrackingLoading(true);
    try {
      const response = await fetch(`/api/mysql/licenses/tracking/${trackingCode}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setTrackingResult(result.data);
      } else {
        setTrackingResult(null);
        toast({
          title: "Tidak Ditemukan",
          description: result.error || "Kode tracking tidak valid",
          variant: "destructive",
        });
      }
    } catch (error) {
      setTrackingResult(null);
      toast({
        title: "Error",
        description: "Gagal memuat data tracking",
        variant: "destructive",
      });
    } finally {
      setIsTrackingLoading(false);
    }
  };

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
    };
    const config = statusConfig[status] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Load berita dari API (primary) dengan fallback localStorage
  const loadNews = useCallback(async () => {
    try {
      const res = await fetch("/api/mysql/news");
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        const published = result.data.filter((n: any) => n.published === true || n.published === 1 || n.published === "1");
        const formatted = published.map((n: any) => ({
          ...n,
          createdAt: n.createdAt ? new Date(n.createdAt) : new Date(),
          updatedAt: n.updatedAt ? new Date(n.updatedAt) : new Date(),
        }));
        formatted.sort((a: News, b: News) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (formatted.length > 0) { setNewsList([...formatted]); return; }
      }
    } catch {}
    // Fallback to localStorage
    const stored = localStorage.getItem("news");
    if (stored) {
      try {
        const news = JSON.parse(stored);
        const published = news.filter((n: any) => n.published === true || n.published === 1 || n.published === "true" || n.published === "1");
        const formatted = published.map((n: any) => ({
          ...n,
          createdAt: n.createdAt ? new Date(n.createdAt) : new Date(),
          updatedAt: n.updatedAt ? new Date(n.updatedAt) : new Date(),
        }));
        formatted.sort((a: News, b: News) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setNewsList([...formatted]);
      } catch { setNewsList([]); }
    } else { setNewsList([]); }
  }, []);

  useEffect(() => {
    loadNews();
    const interval = setInterval(loadNews, 3000);
    return () => clearInterval(interval);
  }, [loadNews]);

  // Helper function to format date
  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  // Helper function to get gradient color based on index
  const getGradientColor = (index: number) => {
    const gradients = [
      "bg-gradient-to-br from-blue-100 to-blue-200",
      "bg-gradient-to-br from-green-100 to-blue-100",
      "bg-gradient-to-br from-yellow-100 to-yellow-200",
      "bg-gradient-to-br from-yellow-50 to-green-100",
      "bg-gradient-to-br from-purple-100 to-purple-200",
      "bg-gradient-to-br from-pink-100 to-pink-200",
    ];
    return gradients[index % gradients.length];
  };

  // Load galeri dari API (primary) dengan fallback localStorage
  useEffect(() => {
    const loadGallery = async () => {
      try {
        const res = await fetch("/api/mysql/gallery");
        const result = await res.json();
        if (result.success && Array.isArray(result.data)) {
          const published = result.data.filter((g: any) => g.published === true || g.published === 1 || g.published === "1");
          const formatted = published.map((g: any) => ({
            ...g,
            createdAt: g.createdAt ? new Date(g.createdAt) : new Date(),
            updatedAt: g.updatedAt ? new Date(g.updatedAt) : new Date(),
          }));
          formatted.sort((a: Gallery, b: Gallery) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          if (formatted.length > 0) { setGalleryList([...formatted]); return; }
        }
      } catch {}
      // Fallback
      const stored = localStorage.getItem("gallery");
      if (stored) {
        try {
          const gallery = JSON.parse(stored);
          const published = gallery.filter((g: any) => g.published === true || g.published === 1 || g.published === "true" || g.published === "1");
          const formatted = published.map((g: any) => ({
            ...g,
            createdAt: g.createdAt ? new Date(g.createdAt) : new Date(),
            updatedAt: g.updatedAt ? new Date(g.updatedAt) : new Date(),
          }));
          formatted.sort((a: Gallery, b: Gallery) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setGalleryList([...formatted]);
        } catch { setGalleryList([]); }
      }
    };
    loadGallery();
    const interval = setInterval(loadGallery, 3000);
    return () => clearInterval(interval);
  }, []);

  // Load testimoni
  useEffect(() => {
    (async () => {
      const allTestimonials: Testimonial[] = [];
      try {
        const res = await fetch("/api/mysql/testimonials");
        const result = await res.json();
        if (result.success && Array.isArray(result.data)) {
          const published = result.data.filter((t: any) => t.published === true || t.published === 1 || t.published === "1");
          allTestimonials.push(...published.slice(0, 6));
        }
      } catch {}
      // Load testimoni from complaints
      try {
        const res = await fetch("/api/mysql/complaints");
        const result = await res.json();
        if (result.success && Array.isArray(result.data)) {
          const testimoniComplaints = result.data
            .filter((c: any) => c.kategori === "testimoni" && (c.status === "selesai" || c.status === "ditindaklanjuti"))
            .map((c: any) => ({
              id: c.id,
              nama: c.nama,
              jenisIzin: c.tracking_code || "Umum",
              rating: c.rating || 5,
              komentar: c.pesan,
              published: true,
              createdAt: c.created_at,
            }));
          allTestimonials.push(...testimoniComplaints.slice(0, 6 - allTestimonials.length));
        }
      } catch {}
      if (allTestimonials.length > 0) {
        setTestimonials(allTestimonials);
      } else {
        // Fallback localStorage
        const stored = localStorage.getItem("testimonials");
        if (stored) {
          try {
            const data = JSON.parse(stored);
            const published = data.filter((t: any) => t.published === true);
            setTestimonials(published.slice(0, 6));
          } catch {}
        }
      }
    })();
  }, []);

  // Load tutorial
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/mysql/tutorials");
        const result = await res.json();
        if (result.success && Array.isArray(result.data)) {
          const published = result.data.filter((t: any) => t.published === true || t.published === 1 || t.published === "1");
          published.sort((a: any, b: any) => a.urutan - b.urutan);
          setTutorials(published);
          if (published.length > 0) return;
        }
      } catch {}
      // Fallback localStorage
      const stored = localStorage.getItem("tutorials");
      if (stored) {
        try {
          const data = JSON.parse(stored);
          const published = data.filter((t: any) => t.published === true);
          published.sort((a: any, b: any) => a.urutan - b.urutan);
          setTutorials(published);
        } catch {}
      }
    })();
  }, []);

  // Load kamus perizinan
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/mysql/kamus-perizinan");
        const result = await res.json();
        if (result.success && Array.isArray(result.data)) {
          const published = result.data.filter((k: any) => k.published === true || k.published === 1 || k.published === "1");
          setKamusList(published);
          if (published.length > 0) return;
        }
      } catch {}
      // Fallback localStorage
      const stored = localStorage.getItem("kamusPerizinan");
      if (stored) {
        try {
          const data = JSON.parse(stored);
          const published = data.filter((k: any) => k.published === true);
          setKamusList(published);
        } catch {}
      }
    })();
  }, []);

  // Cari izin
  const handleSearchIzin = async () => {
    if (!searchIzin.trim()) return;
    setIsSearching(true);
    try {
      const result = await LicenseService.getLicenses();
      const filtered = result.filter((l) =>
        l.namaIzin.toLowerCase().includes(searchIzin.toLowerCase()) ||
        l.jenisIzin.toLowerCase().includes(searchIzin.toLowerCase()) ||
        l.sektor.toLowerCase().includes(searchIzin.toLowerCase())
      );
      setSearchResults(filtered);
    } catch (e) {
      console.error("Search error:", e);
    } finally {
      setIsSearching(false);
    }
  };

  // Kamus filtered
  const filteredKamus = kamusKategori === "Semua"
    ? kamusList
    : kamusList.filter((k) => k.kategori === kamusKategori);

  const searchedKamus = kamusSearch
    ? filteredKamus.filter((k) =>
        k.istilah.toLowerCase().includes(kamusSearch.toLowerCase()) ||
        k.pengertian.toLowerCase().includes(kamusSearch.toLowerCase())
      )
    : filteredKamus;

  const kamusKategoriList = ["Semua", ...new Set(kamusList.map((k) => k.kategori))];
  
  // Statistik berita
  const newsStats = useMemo(() => {
    const total = newsList.length;
    const thisMonth = newsList.filter((n) => {
      const d = new Date(n.createdAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    return { total, thisMonth };
  }, [newsList]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100">
      <div className="fixed inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_35px,rgba(0,0,0,0.05)_35px,rgba(0,0,0,0.05)_70px)] pointer-events-none" />

      {/* Header/Navbar */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-slate-200 sticky top-0 z-50 w-full">
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
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
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
              <Link 
                href="/pengaduan" 
                className="text-sm text-slate-700 hover:text-slate-900 font-medium"
              >
                Pengaduan
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

      {/* Main Content */}
      <main className="relative z-0">
        {/* Hero Section / Banner */}
        <section className="relative bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  Selamat Datang Di SIP (Sistem Informasi Perizinan) Kabupaten Tapin
                </h1>
                <p className="text-lg md:text-xl text-emerald-50 mb-8">
                  Komitmen kami untuk memberikan pelayanan yang cepat, mudah, dan transparan dalam mengelola setiap permohonan perizinan Anda.
                </p>
                <Link href="/ajukan-permohonan">
                  <Button 
                    size="lg" 
                    className="bg-white text-emerald-600 hover:bg-emerald-50 text-lg px-8 py-6 rounded-lg"
                  >
                    Ajukan Permohonan
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              </div>
              <div className="relative flex items-center justify-center">
                <Image 
                  src="/logo.png" 
                  alt="Logo DPMPTSP Kabupaten Tapin" 
                  width={200} 
                  height={100} 
                  className="w-auto h-auto max-w-xs object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Kartu Statistik */}
        {/* <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Permohonan Masuk</CardTitle>
                <FileText className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
                <p className="text-xs text-slate-600 mt-1">Total permohonan</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-yellow-500 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sedang Diproses</CardTitle>
                <Clock className="h-5 w-5 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{stats.sedangDiproses}</div>
                <p className="text-xs text-slate-600 mt-1">Dalam proses</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Permohonan Selesai</CardTitle>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.selesai}</div>
                <p className="text-xs text-slate-600 mt-1">Telah diselesaikan</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rata-rata Waktu</CardTitle>
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{stats.avgWaktu}</div>
                <p className="text-xs text-slate-600 mt-1">Hari penyelesaian</p>
              </CardContent>
            </Card>
          </div>
        </section> */}

        {/* Section Berita */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-emerald-600 mb-3">BERITA</h2>
            <p className="text-slate-600">
              Dapatkan berita terkini seputar kegiatan, program, dan kebijakan dari Dinas Penanaman Modal Dan Pelayanan Terpadu Satu Pintu.
            </p>
          </div>

          {newsList.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">Belum ada berita yang dipublikasikan.</p>
              <p className="text-xs text-slate-400 mt-2">Cek console browser untuk detail debugging.</p>
            </div>
          ) : selectedNews ? (
            // Tampilan Detail Berita (saat berita diklik)
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Detail Berita - Kiri (Lebih Besar) */}
              <div className="lg:col-span-2">
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedNews(null)}
                        className="mb-4"
                      >
                        ← Kembali ke Daftar Berita
                      </Button>
                    </div>
                    {selectedNews.image && (
                      <div className="mb-6 rounded-t-lg overflow-hidden">
                        <Image
                          src={selectedNews.image}
                          alt={selectedNews.title}
                          width={800}
                          height={450}
                          className="w-full h-full object-cover rounded-lg"
                          unoptimized
                        />
                      </div>
                    )}
                    <h1 className="text-3xl font-bold text-slate-900 mb-3">
                      {selectedNews.title}
                    </h1>
                    <p className="text-sm text-slate-500 mb-6">{formatDate(selectedNews.createdAt)}</p>
                    <div className="text-base text-slate-700 whitespace-pre-line leading-relaxed">
                      {selectedNews.content}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Berita Lainnya - Kanan */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Berita Lainnya</h3>
                {newsList
                  .filter((berita) => berita.id !== selectedNews.id)
                  .slice(0, 4)
                  .map((berita, index) => (
                    <Card 
                      key={berita.id} 
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => {
                        setSelectedNews(berita);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      {berita.image ? (
                        <div className="aspect-video rounded-t-lg overflow-hidden">
                          <Image
                            src={berita.image}
                            alt={berita.title}
                            width={400}
                            height={225}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className={`aspect-video ${getGradientColor(index + 1)} rounded-t-lg flex items-center justify-center`}>
                          <div className="text-center p-4">
                            <div className="text-base font-bold text-slate-900 mb-1">
                              {berita.title.substring(0, 30)}...
                            </div>
                            <div className="text-xs text-slate-700">{formatDate(berita.createdAt)}</div>
                          </div>
                        </div>
                      )}
                      <CardContent className="pt-4">
                        <h3 className="text-base font-bold text-slate-900 mb-1">
                          {berita.title}
                        </h3>
                        <p className="text-xs text-slate-500 mb-2">{formatDate(berita.createdAt)}</p>
                        <div className="text-xs text-slate-600 line-clamp-2 whitespace-pre-line">
                          {berita.content}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ) : (
            // Tampilan Normal (daftar berita) - Layout Grid Seimbang
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsList.slice(0, 6).map((berita, index) => (
                <Card 
                  key={berita.id} 
                  className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col"
                  onClick={() => {
                    setSelectedNews(berita);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  {berita.image ? (
                    <div className="aspect-video rounded-t-lg overflow-hidden">
                      <Image
                        src={berita.image}
                        alt={berita.title}
                        width={600}
                        height={400}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className={`aspect-video ${getGradientColor(index)} rounded-t-lg flex items-center justify-center`}>
                      <div className="text-center p-4">
                        <div className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">
                          {berita.title}
                        </div>
                        <div className="text-sm text-slate-700">{formatDate(berita.createdAt)}</div>
                      </div>
                    </div>
                  )}
                  <CardContent className="pt-4 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">
                      {berita.title}
                    </h3>
                    <p className="text-xs text-slate-500 mb-3">{formatDate(berita.createdAt)}</p>
                    <div className="text-sm text-slate-600 line-clamp-3 whitespace-pre-line leading-relaxed flex-1">
                      {berita.content}
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <span className="text-xs text-emerald-600 font-medium hover:text-emerald-700">
                        Baca selengkapnya →
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Galeri Foto */}
        <section className="bg-white/50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-emerald-600 mb-3">GALERI FOTO</h2>
              <p className="text-slate-600">
                Dokumentasi kegiatan pelayanan, sosialisasi, dan aktivitas pegawai DPMPTSP Kabupaten Tapin.
              </p>
            </div>

            {galleryList.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500">Belum ada galeri foto.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {galleryList.slice(0, 6).map((item) => (
                    <Card 
                      key={item.id} 
                      className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                      onClick={() => {
                        setSelectedGallery(item)
                        setCurrentGalleryImageIndex(0)
                      }}
                    >
                      {(() => {
                        const images = item.images && item.images.length > 0 ? item.images : (item.image ? [item.image] : [])
                        const displayImage = images[0] || item.image
                        
                        return displayImage ? (
                          <div className="aspect-square relative overflow-hidden">
                            <Image
                              src={displayImage}
                              alt={item.title}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                            {images.length > 1 && (
                              <div className="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-tl">
                                {images.length} foto
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="aspect-square bg-gradient-to-br from-blue-200 to-blue-300 flex items-center justify-center">
                            <ImageIcon className="h-12 w-12 text-white/70" />
                          </div>
                        )
                      })()}
                      <CardContent className="p-3">
                        <p className="text-xs font-medium text-slate-700 text-center">{item.title}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Modal untuk menampilkan foto */}
                <Dialog open={!!selectedGallery} onOpenChange={(open) => {
                  if (!open) {
                    setSelectedGallery(null)
                    setCurrentGalleryImageIndex(0)
                  }
                }}>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    {selectedGallery && (
                      <>
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold text-slate-900">
                            {selectedGallery.title}
                          </DialogTitle>
                          {selectedGallery.description && (
                            <p className="text-sm text-slate-600 mt-2">
                              {selectedGallery.description}
                            </p>
                          )}
                        </DialogHeader>
                        <div className="mt-4">
                          {(() => {
                            const images = selectedGallery.images && selectedGallery.images.length > 0 
                              ? selectedGallery.images 
                              : (selectedGallery.image ? [selectedGallery.image] : [])
                            
                            if (images.length === 0) return null
                            
                            return (
                              <div className="space-y-4">
                                {/* Carousel */}
                                <div className="relative">
                                  <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
                                    <Image
                                      src={images[currentGalleryImageIndex]}
                                      alt={`${selectedGallery.title} - Foto ${currentGalleryImageIndex + 1}`}
                                      fill
                                      className="object-contain"
                                      unoptimized
                                    />
                                    
                                    {/* Navigation buttons */}
                                    {images.length > 1 && (
                                      <>
                                        <Button
                                          variant="outline"
                                          size="icon"
                                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setCurrentGalleryImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
                                          }}
                                        >
                                          <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="icon"
                                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setCurrentGalleryImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
                                          }}
                                        >
                                          <ChevronRight className="h-4 w-4" />
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                  
                                  {/* Image counter */}
                                  {images.length > 1 && (
                                    <div className="text-center text-sm text-gray-600 mt-2">
                                      Foto {currentGalleryImageIndex + 1} dari {images.length}
                                    </div>
                                  )}
                                  
                                  {/* Thumbnail navigation */}
                                  {images.length > 1 && (
                                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mt-4 max-h-32 overflow-y-auto">
                                      {images.map((img, idx) => (
                                        <div
                                          key={idx}
                                          className={`relative aspect-square cursor-pointer rounded border-2 transition-all ${
                                            idx === currentGalleryImageIndex ? 'border-blue-500' : 'border-gray-200 hover:border-gray-400'
                                          }`}
                                          onClick={() => setCurrentGalleryImageIndex(idx)}
                                        >
                                          <Image
                                            src={img}
                                            alt={`Thumbnail ${idx + 1}`}
                                            fill
                                            className="object-cover rounded"
                                            unoptimized
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })()}
                        </div>
                      </>
                    )}
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </section>

        {/* ===== Statistik Berita ===== */}
        {newsList.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="flex items-center gap-4 p-6">
                  <BarChart3 className="h-10 w-10 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-blue-700">{newsStats.total}</p>
                    <p className="text-sm text-blue-600">Total Berita</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <CardContent className="flex items-center gap-4 p-6">
                  <TrendingUp className="h-10 w-10 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-green-700">{newsStats.thisMonth}</p>
                    <p className="text-sm text-green-600">Berita Bulan Ini</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* ===== Tutorial Izin ===== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-emerald-600 mb-3 flex items-center gap-2">
              <BookOpen className="h-8 w-8" />
              TUTORIAL IZIN
            </h2>
            <p className="text-slate-600">Panduan lengkap cara mengajukan perizinan di DPMPTSP Kabupaten Tapin</p>
          </div>

          {tutorials.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500">Belum ada tutorial.</p>
            </div>
          ) : selectedTutorial ? (
            <Card className="max-w-3xl mx-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">{selectedTutorial.judul}</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setSelectedTutorial(null)}>Kembali</Button>
                </div>
                <p className="text-slate-600">{selectedTutorial.deskripsi}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {selectedTutorial.langkah.map((step) => (
                    <div key={step.nomor} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {step.nomor}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{step.judul}</h4>
                        <p className="text-sm text-slate-600 mt-1">{step.konten}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tutorials.map((tutorial) => (
                <Card
                  key={tutorial.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedTutorial(tutorial)}
                >
                  <CardHeader>
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
                      <BookOpen className="h-6 w-6 text-emerald-600" />
                    </div>
                    <CardTitle className="text-lg">{tutorial.judul}</CardTitle>
                    <CardDescription>{tutorial.deskripsi}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="text-sm text-emerald-600 font-medium">
                      {tutorial.langkah?.length || 0} langkah →
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* ===== Cari Izin ===== */}
        <section className="bg-white/50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-emerald-600 mb-3 flex items-center gap-2">
                <Search className="h-8 w-8" />
                CARI IZIN
              </h2>
              <p className="text-slate-600">Cari informasi izin yang telah diajukan dengan kata kunci</p>
            </div>
            <div className="flex gap-3 max-w-xl mx-auto mb-8">
              <Input
                placeholder="Cari nama izin, jenis izin, atau sektor..."
                value={searchIzin}
                onChange={(e) => setSearchIzin(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchIzin()}
              />
              <Button onClick={handleSearchIzin} disabled={isSearching}>
                <Search className="h-4 w-4 mr-2" />
                Cari
              </Button>
            </div>
            {searchResults.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">Ditemukan {searchResults.length} hasil:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.slice(0, 9).map((item) => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <FileText className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">{item.namaIzin}</p>
                            <p className="text-xs text-slate-500 mt-1">{item.jenisIzin}</p>
                            <Badge variant="secondary" className="mt-2 text-xs">{item.status}</Badge>
                            {item.trackingCode && (
                              <p className="text-xs text-slate-400 mt-1">Kode: {item.trackingCode}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            {searchIzin && searchResults.length === 0 && !isSearching && (
              <p className="text-center text-slate-500">Tidak ditemukan izin dengan kata kunci "{searchIzin}"</p>
            )}
          </div>
        </section>

        {/* ===== Kamus Perizinan ===== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-emerald-600 mb-3 flex items-center gap-2">
              <BookOpen className="h-8 w-8" />
              KAMUS PERIZINAN
            </h2>
            <p className="text-slate-600">Istilah dan pengertian seputar perizinan</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Cari istilah..."
                value={kamusSearch}
                onChange={(e) => setKamusSearch(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={kamusKategori} onValueChange={setKamusKategori}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {kamusKategoriList.map((k) => (
                    <SelectItem key={k} value={k}>{k}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {searchedKamus.length === 0 ? (
            <p className="text-center text-slate-500 py-8">Tidak ada istilah ditemukan.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchedKamus.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <HelpCircle className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-900">{item.istilah}</p>
                        <Badge variant="secondary" className="my-2 text-xs">{item.kategori}</Badge>
                        <p className="text-sm text-slate-600">{item.pengertian}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* ===== Testimoni Perizinan ===== */}
        <section className="bg-white/50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-emerald-600 mb-3 flex items-center gap-2">
                <Star className="h-8 w-8" />
                TESTIMONI PERIZINAN
              </h2>
              <p className="text-slate-600">Apa kata mereka tentang pelayanan perizinan DPMPTSP Kabupaten Tapin</p>
            </div>

            {testimonials.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500">Belum ada testimoni.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials.map((item) => (
                  <Card key={item.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-1 mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${star <= item.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-300"}`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-slate-600 italic mb-4">"{item.komentar}"</p>
                      <div className="flex items-center gap-3 border-t pt-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{item.nama}</p>
                          <p className="text-xs text-slate-500">{item.jenisIzin}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ===== Layanan Pembayaran ===== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-emerald-600 mb-3 flex items-center gap-2">
              <CreditCard className="h-8 w-8" />
              LAYANAN PEMBAYARAN
            </h2>
            <p className="text-slate-600">Informasi pembayaran retribusi perizinan secara online</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Transfer Bank</h3>
                <p className="text-sm text-slate-600">BNI: 1234567890<br/>a.n. DPMPTSP Tapin</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Virtual Account</h3>
                <p className="text-sm text-slate-600">VA BNI: 9881234567890<br/>VA Mandiri: 891234567890</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">QRIS</h3>
                <p className="text-sm text-slate-600">Scan QR Code<br/>di kantor DPMPTSP</p>
              </CardContent>
            </Card>
          </div>

          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle className="text-lg">Cek Pembayaran</CardTitle>
              <CardDescription>Masukkan kode tracking untuk cek status pembayaran</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input
                  placeholder="Kode Tracking..."
                  value={paymentData.trackingCode}
                  onChange={(e) => setPaymentData({ ...paymentData, trackingCode: e.target.value })}
                />
                <Button
                  onClick={async () => {
                    if (paymentData.trackingCode.trim()) {
                      try {
                        const res = await fetch(`/api/mysql/payments/tracking/${paymentData.trackingCode.trim()}`);
                        const result = await res.json();
                        if (result.success && result.data) {
                          setPayments(Array.isArray(result.data) ? result.data : [result.data]);
                        } else {
                          setPayments([]);
                        }
                      } catch {
                        setPayments([]);
                      }
                      setShowPaymentDialog(true);
                    }
                  }}
                >
                  Cari
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payment Dialog */}
          <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Status Pembayaran</DialogTitle>
              </DialogHeader>
              {payments.length === 0 ? (
                <p className="text-center text-slate-500 py-4">Tidak ditemukan pembayaran untuk kode tracking tersebut.</p>
              ) : (
                <div className="space-y-4">
                  {payments.map((p, i) => (
                    <Card key={i}>
                      <CardContent className="p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-sm">Status:</span>
                          <Badge className={p.statusPembayaran === "lunas" ? "bg-green-500" : p.statusPembayaran === "gagal" ? "bg-red-500" : "bg-yellow-500"}>
                            {p.statusPembayaran}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Jumlah:</span>
                          <span className="font-semibold">Rp {p.jumlah.toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Metode:</span>
                          <span>{p.metodePembayaran}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Tanggal:</span>
                          <span>{p.tanggalPembayaran || "-"}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white/95 backdrop-blur-sm border-t border-slate-200 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Informasi Kontak */}
            <div>
              <h3 className="font-bold text-slate-900 mb-4">Kontak Kami</h3>
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-1 text-emerald-600" />
                  <p>Jl. Brigjend H. Hasan Basery, Rantau, Kabupaten Tapin</p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-emerald-600" />
                  <p>-</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-emerald-600" />
                  <p>dpmptsp.tapin@gmail.com</p>
                </div>
              </div>
            </div>

            {/* Jadwal Operasional */}
            <div>
              <h3 className="font-bold text-slate-900 mb-4">Jadwal Operasional</h3>
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-600" />
                  <p>Senin - Kamis: 08:00 - 15:00</p>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-600" />
                  <p>Jumat: 08:00 - 14:00</p>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-600" />
                  <p>Sabtu - Minggu: Tutup</p>
                </div>
              </div>
            </div>

            {/* Link Cepat */}
            <div>
              <h3 className="font-bold text-slate-900 mb-4">Link Cepat</h3>
              <div className="space-y-2 text-sm">
                <Link href="/ajukan-permohonan" className="block text-slate-600 hover:text-emerald-600">
                  Ajukan Permohonan
                </Link>
                <Link href="/tracking-permohonan" className="block text-slate-600 hover:text-emerald-600">
                  Tracking Permohonan
                </Link>
                <Link href="/pengaduan" className="block text-slate-600 hover:text-emerald-600">
                  Pengaduan
                </Link>
                <Link href="/login" className="block text-slate-600 hover:text-emerald-600">
                  Login 
                </Link>
              </div>
            </div>

            {/* Media Sosial */}
            <div>
              <h3 className="font-bold text-slate-900 mb-4">Media Sosial</h3>
              <div className="flex gap-3">
                <a href="#" className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="p-2 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="p-2 bg-blue-400 text-white rounded-full hover:bg-blue-500 transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors">
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 mt-8 pt-8 text-center text-sm text-slate-600">
            <p>© 2024 DPMPTSP Rantau, Kabupaten Tapin. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
