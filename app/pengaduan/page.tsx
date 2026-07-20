"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Send, ArrowLeft, LogIn, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function PengaduanPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    telepon: "",
    kategori: "",
    trackingCode: "",
    pesan: "",
    rating: 5,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.email || !formData.kategori || !formData.pesan) {
      toast({ title: "Error", description: "Lengkapi field yang wajib diisi", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/mysql/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Gagal mengirim pengaduan");
      }
      toast({ title: "Pengaduan Terkirim", description: "Terima kasih, pengaduan Anda akan segera ditindaklanjuti." });
      setFormData({ nama: "", email: "", telepon: "", kategori: "", trackingCode: "", pesan: "", rating: 5 });
    } catch (error) {
      toast({ title: "Error", description: "Gagal mengirim pengaduan", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24 py-4">
            <div className="flex items-center space-x-4 flex-shrink-0">
              <div className="relative">
                <Image src="/logo2.png" alt="Logo DPMPTSP" width={80} height={80} className="h-20 w-auto object-contain" priority />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 uppercase tracking-tight">
                  Sistem Pelayanan Perizinan DPMPTSP Kabupaten Tapin
                </h1>
                <p className="text-sm text-slate-600 mt-0.5">SIP(Sistem Informasi Perizinan Tapin)</p>
              </div>
            </div>
            <div className="flex items-center space-x-6 flex-shrink-0">
              <Link href="/" className="text-sm text-slate-700 hover:text-slate-900 font-medium">Beranda</Link>
              <Link href="/ajukan-permohonan" className="text-sm text-slate-700 hover:text-slate-900 font-medium">Ajukan Permohonan Perizinan</Link>
              <Link href="/tracking-permohonan" className="text-sm text-slate-700 hover:text-slate-900 font-medium">Tracking Permohonan</Link>
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

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/" className="inline-flex items-center text-sm text-slate-600 hover:text-emerald-600 mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" /> Kembali ke Beranda
        </Link>

        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <MessageSquare className="h-6 w-6" />
              Pengaduan Layanan Perizinan
            </CardTitle>
            <CardDescription className="text-emerald-50">
              Sampaikan pengaduan, saran, pertanyaan, atau testimoni terkait layanan perizinan
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nama">Nama Lengkap *</Label>
                  <Input id="nama" value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} placeholder="Nama Anda" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="email@example.com" required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telepon">No Telepon</Label>
                  <Input id="telepon" value={formData.telepon} onChange={(e) => setFormData({ ...formData, telepon: e.target.value })} placeholder="081234567890" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kategori">Kategori *</Label>
                  <Select value={formData.kategori} onValueChange={(value) => setFormData({ ...formData, kategori: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pengaduan">Pengaduan</SelectItem>
                      <SelectItem value="saran">Saran</SelectItem>
                      <SelectItem value="pertanyaan">Pertanyaan</SelectItem>
                      <SelectItem value="testimoni">Testimoni</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trackingCode">Kode Tracking (jika terkait permohonan tertentu)</Label>
                <Input id="trackingCode" value={formData.trackingCode} onChange={(e) => setFormData({ ...formData, trackingCode: e.target.value })} placeholder="Contoh: ABC12345" />
              </div>

              {formData.kategori === "testimoni" && (
                <div className="space-y-2">
                  <Label>Rating *</Label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-7 w-7 cursor-pointer transition-colors ${
                            star <= formData.rating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-slate-300 hover:text-slate-400"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-slate-600">{formData.rating}/5</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="pesan">Pesan *</Label>
                <Textarea id="pesan" value={formData.pesan} onChange={(e) => setFormData({ ...formData, pesan: e.target.value })} placeholder="Tulis pengaduan, saran, atau pertanyaan Anda..." rows={6} required />
              </div>

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>Mengirim...</>
                ) : (
                  <><Send className="h-4 w-4 mr-2" /> Kirim Pengaduan</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
