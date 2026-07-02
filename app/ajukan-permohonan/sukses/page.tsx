"use client";

import React, { Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, Copy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { LogIn } from "lucide-react";

function SuksesContent() {
  const searchParams = useSearchParams();
  const trackingCode = searchParams.get("code");
  const { toast } = useToast();

  const copyToClipboard = () => {
    if (trackingCode) {
      navigator.clipboard.writeText(trackingCode);
      toast({
        title: "Berhasil!",
        description: "Kode tracking telah disalin ke clipboard",
      });
    }
  };

  if (!trackingCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Kode Tracking Tidak Ditemukan</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/ajukan-permohonan">
              <Button>Kembali ke Form</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                <h1 className="text-xl font-bold text-slate-900 uppercase tracking-tight">
                  PERIZINAN NON ELEKTRONIK DPMPTSP
                </h1>
                <p className="text-sm text-slate-600 mt-0.5">
                  Rantau, Kabupaten Tapin
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
                href="/#tracking"
                className="text-sm text-slate-700 hover:text-slate-900 font-medium"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = "/";
                  setTimeout(() => {
                    const trackingTab = document.querySelector(
                      '[value="tracking"]',
                    ) as HTMLElement;
                    if (trackingTab) {
                      trackingTab.click();
                      window.scrollTo({ top: 600, behavior: "smooth" });
                    }
                  }, 100);
                }}
              >
                Tracking Permohonan
              </Link>
              <Link href="/login">
                <Button className="bg-blue-600 hover:bg-blue-700 text-sm">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          {/* Success Icon */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-16 w-16 text-emerald-600" />
            </div>
          </div>

          {/* Success Message */}
          <Card className="w-full max-w-2xl shadow-lg border-2 border-emerald-200">
            <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-t-lg text-center">
              <CardTitle className="text-3xl mb-2">
                Permohonan Berhasil Dikirim!
              </CardTitle>
              <CardDescription className="text-emerald-50 text-lg">
                Permohonan perizinan Anda telah berhasil dikirim dan sedang
                diproses
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                {/* Kode Tracking */}
                <div className="text-center space-y-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-2">
                      Kode Tracking Permohonan Anda:
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <div className="bg-slate-100 border-2 border-emerald-500 rounded-lg px-6 py-4">
                        <p className="text-3xl font-bold text-emerald-700 tracking-wider font-mono">
                          {trackingCode}
                        </p>
                      </div>
                      <Button
                        onClick={copyToClipboard}
                        variant="outline"
                        size="lg"
                        className="border-emerald-500 text-emerald-700 hover:bg-emerald-50"
                      >
                        <Copy className="h-5 w-5 mr-2" />
                        Salin
                      </Button>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm text-amber-800">
                      <strong>Penting!</strong> Simpan kode tracking ini dengan
                      baik. Anda akan membutuhkannya untuk mengecek status
                      permohonan Anda.
                    </p>
                  </div>
                </div>

                {/* Informasi */}
                <div className="border-t pt-6 space-y-4">
                  <h3 className="font-semibold text-slate-900 text-lg">
                    Langkah Selanjutnya:
                  </h3>
                  <ul className="space-y-2 text-slate-600">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold mt-1">
                        1.
                      </span>
                      <span>
                        Permohonan Anda akan diproses oleh tim DPMPTSP
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold mt-1">
                        2.
                      </span>
                      <span>
                        Gunakan kode tracking di atas untuk memantau status
                        permohonan
                      </span>
                    </li>
                    {/* <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold mt-1">3.</span>
                      <span>Anda akan mendapat notifikasi melalui email atau SMS jika ada update</span>
                    </li> */}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function SuksesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Memuat...</p>
          </div>
        </div>
      }
    >
      <SuksesContent />
    </Suspense>
  );
}
