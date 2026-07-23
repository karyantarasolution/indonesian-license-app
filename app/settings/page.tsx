"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { NewsManagement } from "@/components/news-management"
import { GalleryManagement } from "@/components/gallery-management"
import { UserManagement } from "@/components/user-management"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Newspaper, Image as ImageIcon, Users, BookOpen, Plus, Edit2, Trash2, Save, X } from "lucide-react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminHeader } from "@/components/layout/admin-header"
import { useToast } from "@/hooks/use-toast"
import type { Tutorial, TutorialStep } from "@/lib/types"

function SettingsPageContent() {
  const { user, logout } = useAuth()
  const { toast } = useToast()

  // Tutorial state
  const [tutorials, setTutorials] = useState<Tutorial[]>([])
  const [isTutorialDialogOpen, setIsTutorialDialogOpen] = useState(false)
  const [editingTutorial, setEditingTutorial] = useState<Tutorial | null>(null)
  const [tutorialForm, setTutorialForm] = useState({
    judul: "",
    deskripsi: "",
    icon: "BookOpen",
    urutan: 0,
    published: false,
  })
  const [tutorialSteps, setTutorialSteps] = useState<TutorialStep[]>([
    { nomor: 1, judul: "", konten: "" }
  ])

  // Load tutorials from API
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/mysql/tutorials");
        const result = await res.json();
        if (result.success && Array.isArray(result.data)) {
          const formatted = result.data.map((t: any) => ({
            id: t.id,
            judul: t.judul,
            deskripsi: t.deskripsi || "",
            icon: t.icon || "BookOpen",
            langkah: typeof t.langkah === 'string' ? JSON.parse(t.langkah) : (t.langkah || []),
            urutan: t.urutan || 0,
            published: t.published === true || t.published === 1 || t.published === "1",
            createdAt: t.created_at ? new Date(t.created_at) : new Date(),
          }));
          setTutorials(formatted);
        }
      } catch (err) {
        console.error("Gagal memuat tutorials:", err);
      }
    })();
  }, []);

  // Tutorial CRUD
  const handleSaveTutorial = async () => {
    if (!tutorialForm.judul) {
      toast({ title: "Error", description: "Judul tutorial wajib diisi", variant: "destructive" })
      return
    }
    try {
      const payload = {
        ...tutorialForm,
        langkah: tutorialSteps.filter(s => s.judul.trim() !== ""),
      };

      if (editingTutorial) {
        const res = await fetch(`/api/mysql/tutorials/${editingTutorial.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (result.success) {
          setTutorials(prev => prev.map(t => t.id === editingTutorial.id ? { ...t, ...payload, langkah: payload.langkah } : t));
          toast({ title: "Berhasil", description: "Tutorial berhasil diperbarui" });
        } else {
          toast({ title: "Gagal", description: result.error || "Gagal memperbarui tutorial", variant: "destructive" });
        }
      } else {
        const res = await fetch("/api/mysql/tutorials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (result.success && result.data) {
          const newTutorial: Tutorial = {
            id: result.data.id,
            judul: result.data.judul,
            deskripsi: result.data.deskripsi || "",
            icon: result.data.icon || "BookOpen",
            langkah: typeof result.data.langkah === 'string' ? JSON.parse(result.data.langkah) : (result.data.langkah || []),
            urutan: result.data.urutan || 0,
            published: result.data.published === true || result.data.published === 1,
            createdAt: result.data.created_at ? new Date(result.data.created_at) : new Date(),
          };
          setTutorials(prev => [...prev, newTutorial]);
          toast({ title: "Berhasil", description: "Tutorial berhasil ditambahkan" });
        } else {
          toast({ title: "Gagal", description: result.error || "Gagal menambahkan tutorial", variant: "destructive" });
        }
      }
      setIsTutorialDialogOpen(false);
      setEditingTutorial(null);
      setTutorialForm({ judul: "", deskripsi: "", icon: "BookOpen", urutan: 0, published: false });
      setTutorialSteps([{ nomor: 1, judul: "", konten: "" }]);
    } catch (err) {
      toast({ title: "Error", description: "Terjadi kesalahan saat menyimpan tutorial", variant: "destructive" });
    }
  };

  const handleDeleteTutorial = async (id: string) => {
    try {
      const res = await fetch(`/api/mysql/tutorials/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        setTutorials(prev => prev.filter(t => t.id !== id));
        toast({ title: "Berhasil", description: "Tutorial berhasil dihapus" });
      } else {
        toast({ title: "Gagal", description: "Gagal menghapus tutorial", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Terjadi kesalahan saat menghapus tutorial", variant: "destructive" });
    }
  };

  const handleToggleTutorialPublished = async (tutorial: Tutorial) => {
    try {
      const res = await fetch(`/api/mysql/tutorials/${tutorial.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !tutorial.published }),
      });
      const result = await res.json();
      if (result.success) {
        setTutorials(prev => prev.map(t => t.id === tutorial.id ? { ...t, published: !t.published } : t));
        toast({ title: "Berhasil", description: `Tutorial ${!tutorial.published ? "dipublikasikan" : "diarsipkan"}` });
      }
    } catch (err) {
      toast({ title: "Error", description: "Gagal mengubah status tutorial", variant: "destructive" });
    }
  };

  // Cek apakah user adalah admin
  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Akses Ditolak</h1>
          <p className="text-slate-600 mb-4">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
          <Button onClick={() => window.location.href = "/dashboard"}>
            Kembali ke Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Header */}
      <AdminHeader />

      {/* Main Content */}
      <main className="lg:pl-64 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Pengaturan</h2>
              <p className="text-gray-600">Kelola Berita, Galeri, Tutorial Izin, dan User</p>
            </div>
          </div>

          <Tabs defaultValue="news" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-[800px]">
              <TabsTrigger value="news" className="flex items-center gap-2">
                <Newspaper className="h-4 w-4" />
                Manajemen Berita
              </TabsTrigger>
              <TabsTrigger value="gallery" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Manajemen Galeri
              </TabsTrigger>
              <TabsTrigger value="tutorial-izin" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Tutorial Izin
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Manajemen User
              </TabsTrigger>
            </TabsList>

            <TabsContent value="news" className="space-y-6">
              <NewsManagement />
            </TabsContent>

            <TabsContent value="gallery" className="space-y-6">
              <GalleryManagement />
            </TabsContent>

            <TabsContent value="tutorial-izin" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-emerald-600" />
                      Daftar Tutorial Izin
                    </CardTitle>
                    <CardDescription>Kelola tutorial panduan pengajuan perizinan untuk masyarakat</CardDescription>
                  </div>
                  <Dialog open={isTutorialDialogOpen} onOpenChange={(open) => {
                    setIsTutorialDialogOpen(open)
                    if (!open) {
                      setEditingTutorial(null)
                      setTutorialForm({ judul: "", deskripsi: "", icon: "BookOpen", urutan: 0, published: false })
                      setTutorialSteps([{ nomor: 1, judul: "", konten: "" }])
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button className="bg-emerald-600 hover:bg-emerald-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Tutorial
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{editingTutorial ? "Edit" : "Tambah"} Tutorial Izin</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Judul Tutorial *</Label>
                          <Input
                            value={tutorialForm.judul}
                            onChange={(e) => setTutorialForm({ ...tutorialForm, judul: e.target.value })}
                            placeholder="Contoh: Cara Mengajukan Izin Usaha"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Deskripsi</Label>
                          <Textarea
                            value={tutorialForm.deskripsi}
                            onChange={(e) => setTutorialForm({ ...tutorialForm, deskripsi: e.target.value })}
                            placeholder="Deskripsi singkat tutorial"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Urutan</Label>
                            <Input
                              type="number"
                              value={tutorialForm.urutan}
                              onChange={(e) => setTutorialForm({ ...tutorialForm, urutan: Number(e.target.value) })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Icon</Label>
                            <Select value={tutorialForm.icon} onValueChange={(v) => setTutorialForm({ ...tutorialForm, icon: v })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="BookOpen">BookOpen</SelectItem>
                                <SelectItem value="FileText">FileText</SelectItem>
                                <SelectItem value="ClipboardList">ClipboardList</SelectItem>
                                <SelectItem value="HelpCircle">HelpCircle</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Langkah-langkah</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setTutorialSteps(prev => [...prev, { nomor: prev.length + 1, judul: "", konten: "" }])}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Tambah Langkah
                            </Button>
                          </div>
                          <div className="space-y-3">
                            {tutorialSteps.map((step, idx) => (
                              <div key={idx} className="border rounded-lg p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-gray-700">Langkah {step.nomor}</span>
                                  {tutorialSteps.length > 1 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setTutorialSteps(prev => prev.filter((_, i) => i !== idx).map((s, i) => ({ ...s, nomor: i + 1 })));
                                      }}
                                    >
                                      <Trash2 className="h-3 w-3 text-red-500" />
                                    </Button>
                                  )}
                                </div>
                                <Input
                                  placeholder="Judul langkah"
                                  value={step.judul}
                                  onChange={(e) => {
                                    const newSteps = [...tutorialSteps];
                                    newSteps[idx] = { ...newSteps[idx], judul: e.target.value };
                                    setTutorialSteps(newSteps);
                                  }}
                                />
                                <Textarea
                                  placeholder="Isi konten langkah"
                                  value={step.konten}
                                  onChange={(e) => {
                                    const newSteps = [...tutorialSteps];
                                    newSteps[idx] = { ...newSteps[idx], konten: e.target.value };
                                    setTutorialSteps(newSteps);
                                  }}
                                  rows={2}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="published"
                            checked={tutorialForm.published}
                            onChange={(e) => setTutorialForm({ ...tutorialForm, published: e.target.checked })}
                            className="rounded"
                          />
                          <Label htmlFor="published">Publikasikan</Label>
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                          <Button variant="outline" onClick={() => setIsTutorialDialogOpen(false)}>Batal</Button>
                          <Button onClick={handleSaveTutorial} className="bg-emerald-600 hover:bg-emerald-700">
                            <Save className="h-4 w-4 mr-2" />
                            Simpan
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left py-3 px-2 font-semibold">No</th>
                          <th className="text-left py-3 px-2 font-semibold">Judul</th>
                          <th className="text-left py-3 px-2 font-semibold">Deskripsi</th>
                          <th className="text-center py-3 px-2 font-semibold">Langkah</th>
                          <th className="text-center py-3 px-2 font-semibold">Urutan</th>
                          <th className="text-center py-3 px-2 font-semibold">Status</th>
                          <th className="text-center py-3 px-2 font-semibold">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tutorials.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-8 text-gray-500">
                              Belum ada tutorial izin. Klik &quot;Tambah Tutorial&quot; untuk membuat baru.
                            </td>
                          </tr>
                        ) : (
                          tutorials.map((tutorial, index) => (
                            <tr key={tutorial.id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-2">{index + 1}</td>
                              <td className="py-3 px-2 font-medium">{tutorial.judul}</td>
                              <td className="py-3 px-2 text-gray-600 max-w-xs truncate">{tutorial.deskripsi}</td>
                              <td className="py-3 px-2 text-center">
                                <Badge variant="secondary">{tutorial.langkah?.length || 0} langkah</Badge>
                              </td>
                              <td className="py-3 px-2 text-center">{tutorial.urutan}</td>
                              <td className="py-3 px-2 text-center">
                                <Badge className={tutorial.published ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                                  {tutorial.published ? "Published" : "Draft"}
                                </Badge>
                              </td>
                              <td className="py-3 px-2 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <Button variant="ghost" size="sm" onClick={() => handleToggleTutorialPublished(tutorial)}>
                                    {tutorial.published ? (
                                      <span className="text-xs text-gray-600">Arsipkan</span>
                                    ) : (
                                      <span className="text-xs text-green-600">Publikasikan</span>
                                    )}
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => {
                                    setEditingTutorial(tutorial)
                                    setTutorialForm({
                                      judul: tutorial.judul,
                                      deskripsi: tutorial.deskripsi,
                                      icon: tutorial.icon,
                                      urutan: tutorial.urutan,
                                      published: tutorial.published,
                                    });
                                    setTutorialSteps(tutorial.langkah?.length > 0 ? tutorial.langkah : [{ nomor: 1, judul: "", konten: "" }]);
                                    setIsTutorialDialogOpen(true)
                                  }}>
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => handleDeleteTutorial(tutorial.id)}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <UserManagement />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsPageContent />
    </ProtectedRoute>
  )
}
