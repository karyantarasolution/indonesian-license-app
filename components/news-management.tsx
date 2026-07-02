"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
} from "@/components/ui/alert-dialog"
import { Plus, Edit, Trash2, Search, Newspaper, X } from "lucide-react"
import type { News } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface NewsFormData {
  title: string
  content: string
  image: string
  published: boolean
}

function NewsForm({
  news,
  onSubmit,
  onCancel,
  onError,
}: {
  news?: News
  onSubmit: (data: NewsFormData) => void
  onCancel: () => void
  onError?: (message: string) => void
}) {
  const [formData, setFormData] = useState<NewsFormData>({
    title: news?.title || "",
    content: news?.content || "",
    image: news?.image || "",
    published: news?.published ?? false,
  })
  const [imagePreview, setImagePreview] = useState<string>(news?.image || "")

  // Update form data when news prop changes (important for editing)
  useEffect(() => {
    if (news) {
      setFormData({
        title: news.title || "",
        content: news.content || "",
        image: news.image || "",
        published: news.published ?? false,
      })
      setImagePreview(news.image || "")
    } else {
      // Reset form when creating new news
      setFormData({
        title: "",
        content: "",
        image: "",
        published: false,
      })
      setImagePreview("")
    }
  }, [news])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        onError?.("File harus berupa gambar (JPG, PNG, GIF)")
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        onError?.("Ukuran file maksimal 5MB")
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        
        // Compress image if too large (reduce quality for base64)
        const img = new window.Image()
        img.onload = () => {
          const canvas = document.createElement("canvas")
          let width = img.width
          let height = img.height
          
          // Resize if too large (max 1200px)
          const maxDimension = 1200
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height * maxDimension) / width
              width = maxDimension
            } else {
              width = (width * maxDimension) / height
              height = maxDimension
            }
          }
          
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext("2d")
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height)
            const compressedBase64 = canvas.toDataURL("image/jpeg", 0.8)
            setFormData({ ...formData, image: compressedBase64 })
            setImagePreview(compressedBase64)
          } else {
            setFormData({ ...formData, image: base64String })
            setImagePreview(base64String)
          }
        }
        img.src = base64String
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: "" })
    setImagePreview("")
    // Reset file input
    const fileInput = document.getElementById("image") as HTMLInputElement
    if (fileInput) {
      fileInput.value = ""
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted with data:", { ...formData, image: formData.image ? "Base64 image present" : "No image" })
    
    // Validate required fields
    if (!formData.title.trim()) {
      onError?.("Judul berita wajib diisi")
      return
    }
    
    if (!formData.content.trim()) {
      onError?.("Isi berita wajib diisi")
      return
    }
    
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Judul Berita</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Gambar</Label>
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="cursor-pointer"
        />
        {imagePreview && (
          <div className="mt-2 relative inline-block">
            <Image
              src={imagePreview}
              alt="Preview"
              width={200}
              height={200}
              className="rounded-lg object-cover border"
              unoptimized
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
        <p className="text-xs text-gray-500">Format: JPG, PNG, GIF. Maksimal 5MB</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Isi Berita</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={8}
          required
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="published"
          checked={formData.published}
          onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
        />
        <Label htmlFor="published">Publikasikan</Label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit">{news ? "Update" : "Tambah"}</Button>
      </div>
    </form>
  )
}

export function NewsManagement() {
  const [newsList, setNewsList] = useState<News[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingNews, setEditingNews] = useState<News | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadNews()
  }, [])

  // Reload news when dialog closes (in case data was added)
  useEffect(() => {
    if (!isDialogOpen && !editingNews) {
      // Small delay to ensure localStorage is updated
      const timer = setTimeout(() => {
        loadNews()
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [isDialogOpen, editingNews])

  const loadNews = async () => {
    try {
      setLoading(true)
      console.log("🔄 Loading news...")
       
      // Always load from localStorage first (primary source)
      const stored = localStorage.getItem("news")
      if (stored) {
        try {
          const news = JSON.parse(stored)
          console.log("📦 Raw data from localStorage:", news.length, "items")
          
          // Convert date strings to Date objects
          const formattedNews = news.map((n: any) => ({
            ...n,
            createdAt: n.createdAt ? new Date(n.createdAt) : new Date(),
            updatedAt: n.updatedAt ? new Date(n.updatedAt) : new Date(),
          }))
          
          console.log("✅ Formatted news:", formattedNews.length, "items")
          console.log("✅ Setting newsList state...")
          setNewsList(formattedNews)
          console.log("✅ State updated!")
        } catch (parseError) {
          console.error("❌ Error parsing localStorage data:", parseError)
          setNewsList([])
        }
      } else {
        console.log("ℹ️ No data in localStorage")
        setNewsList([])
      }
      
      // Also try to fetch from API (but don't wait for it)
      const response = await fetch("/api/news")
      if (response.ok) {
        const data = await response.json()
        const news = data.news || []
        if (news.length > 0) {
          console.log("📡 Also loaded from API:", news.length, "items")
          // Convert date strings to Date objects
          const formattedNews = news.map((n: any) => ({
            ...n,
            createdAt: n.createdAt ? new Date(n.createdAt) : new Date(),
            updatedAt: n.updatedAt ? new Date(n.updatedAt) : new Date(),
          }))
          setNewsList(formattedNews)
        }
      } else {
        console.log("⚠️ API response not OK, using localStorage data")
      }
    } catch (error) {
      console.error("❌ Error loading news:", error)
      // Fallback to localStorage
      const stored = localStorage.getItem("news")
      if (stored) {
        try {
          const news = JSON.parse(stored)
          console.log("📦 Fallback: Loading from localStorage:", news.length, "items")
          // Convert date strings to Date objects
          const formattedNews = news.map((n: any) => ({
            ...n,
            createdAt: n.createdAt ? new Date(n.createdAt) : new Date(),
            updatedAt: n.updatedAt ? new Date(n.updatedAt) : new Date(),
          }))
          setNewsList(formattedNews)
        } catch (parseError) {
          console.error("❌ Error parsing localStorage data:", parseError)
          setNewsList([])
        }
      } else {
        console.log("ℹ️ No data in localStorage")
        setNewsList([])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: NewsFormData) => {
    try {
      console.log("Submitting news data:", { ...data, image: data.image ? "Base64 image (length: " + data.image.length + ")" : "No image" })
      
      // Validate required fields
      if (!data.title || !data.content) {
        toast({
          title: "Error",
          description: "Judul dan isi berita wajib diisi",
          variant: "destructive",
        })
        return
      }

      if (editingNews) {
        // Always update localStorage first (primary storage)
        const stored = localStorage.getItem("news")
        const newsArray = stored ? JSON.parse(stored) : []
        const updated = newsArray.map((n: any) =>
          n.id === editingNews.id
            ? { 
                ...n, 
                title: data.title,
                content: data.content,
                image: data.image || n.image, // Keep existing image if new one is empty
                published: Boolean(data.published),
                updatedAt: new Date().toISOString(),
                createdAt: n.createdAt || new Date().toISOString()
              }
            : n
        )
        
        console.log("💾 Updating news in localStorage:", {
          id: editingNews.id,
          title: data.title,
          content: data.content.substring(0, 50) + "...",
          published: data.published,
          hasImage: !!data.image
        })
        localStorage.setItem("news", JSON.stringify(updated))
        console.log("✅ Updated in localStorage:", updated.length, "items")
        
        // Update state immediately
        const formattedNews = updated.map((n: any) => ({
          ...n,
          createdAt: n.createdAt ? new Date(n.createdAt) : new Date(),
          updatedAt: n.updatedAt ? new Date(n.updatedAt) : new Date(),
        }))
        setNewsList(formattedNews)
        console.log("✅ State updated immediately")
        
        // Also try to update via API (but don't wait for it)
        try {
          const response = await fetch(`/api/news/${editingNews.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          })
          
          if (response.ok) {
            console.log("✅ Also updated via API")
          } else {
            console.log("⚠️ API update failed, but localStorage updated successfully")
          }
        } catch (apiError) {
          console.log("⚠️ API error (non-critical):", apiError)
        }
        
        // Close dialog and reset
        setIsDialogOpen(false)
        setEditingNews(null)
        
        // Reload to ensure consistency
        setTimeout(() => {
          loadNews()
        }, 100)
        
        toast({
          title: "Berhasil",
          description: "Berita berhasil diperbarui",
        })
      } else {
        // Create new news
        const newNews: News = {
          id: Date.now().toString(),
          ...data,
          author: "Admin",
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        // Always save to localStorage first (primary storage)
        const stored = localStorage.getItem("news")
        const newsArray = stored ? JSON.parse(stored) : []
        
        // Ensure dates are stored as ISO strings and published is boolean
        const newsToSave = {
          ...newNews,
          published: Boolean(newNews.published), // Ensure published is always boolean
          createdAt: newNews.createdAt.toISOString(),
          updatedAt: newNews.updatedAt.toISOString(),
        }
        
        console.log("💾 Saving news with published:", newsToSave.published, "type:", typeof newsToSave.published)
        
        newsArray.push(newsToSave)
        
        try {
          localStorage.setItem("news", JSON.stringify(newsArray))
          console.log("✅ Saved to localStorage:", newsArray.length, "items")
          
          // Update state immediately - FORCE UPDATE
          const formattedNews = newsArray.map((n: any) => ({
            ...n,
            createdAt: n.createdAt ? new Date(n.createdAt) : new Date(),
            updatedAt: n.updatedAt ? new Date(n.updatedAt) : new Date(),
          }))
          
          console.log("✅ Setting state with:", formattedNews.length, "items")
          console.log("✅ First item:", formattedNews[0])
          
          // Force state update
          setNewsList([...formattedNews])
          
          // Also try to save to API (but don't wait for it)
          fetch("/api/news", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newNews),
          }).then((response) => {
            if (response.ok) {
              console.log("✅ Also saved to API")
            } else {
              console.log("⚠️ API save failed, but localStorage saved successfully")
            }
          }).catch((error) => {
            console.log("⚠️ API error (non-critical):", error)
          })
          
          setIsDialogOpen(false)
          setEditingNews(null)
          
          toast({
            title: "Berhasil",
            description: "Berita berhasil ditambahkan",
          })
          
          // Force reload after a short delay
          setTimeout(() => {
            console.log("🔄 Forcing reload...")
            loadNews()
          }, 500)
        } catch (storageError: any) {
          console.error("❌ Error saving to localStorage:", storageError)
          // If storage is full, try to compress or remove old data
          if (storageError.name === "QuotaExceededError") {
            toast({
              title: "Error",
              description: "Penyimpanan penuh. Silakan hapus beberapa berita lama atau kurangi ukuran gambar.",
              variant: "destructive",
            })
            return
          }
          throw storageError
        }
      }
    } catch (error) {
      console.error("Error saving news:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal menyimpan berita",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      console.log("🗑️ Deleting news with id:", id)
      
      // Always delete from localStorage first (primary storage)
      const stored = localStorage.getItem("news")
      const newsArray = stored ? JSON.parse(stored) : []
      const filtered = newsArray.filter((n: News) => n.id !== id)
      
      console.log("💾 Deleting from localStorage:", {
        before: newsArray.length,
        after: filtered.length,
        deleted: newsArray.length - filtered.length
      })
      
      localStorage.setItem("news", JSON.stringify(filtered))
      
      // Update state immediately
      const formattedNews = filtered.map((n: any) => ({
        ...n,
        createdAt: n.createdAt ? new Date(n.createdAt) : new Date(),
        updatedAt: n.updatedAt ? new Date(n.updatedAt) : new Date(),
      }))
      setNewsList(formattedNews)
      console.log("✅ State updated immediately")
      
      // Also try to delete via API (but don't wait for it)
      try {
        const response = await fetch(`/api/news/${id}`, {
          method: "DELETE",
        })
        
        if (response.ok) {
          console.log("✅ Also deleted via API")
        } else {
          console.log("⚠️ API delete failed, but localStorage deleted successfully")
        }
      } catch (apiError) {
        console.log("⚠️ API error (non-critical):", apiError)
      }
      
      // Reload to ensure consistency
      setTimeout(() => {
        loadNews()
      }, 100)
      
      toast({
        title: "Berhasil",
        description: "Berita berhasil dihapus",
      })
    } catch (error) {
      console.error("❌ Error deleting news:", error)
      toast({
        title: "Error",
        description: "Gagal menghapus berita",
        variant: "destructive",
      })
    }
  }

  const filteredNews = newsList.filter(
    (news) =>
      news.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      news.content?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Debug: Log news list
  useEffect(() => {
    console.log("News list updated:", newsList.length, "items")
    console.log("Filtered news:", filteredNews.length, "items")
  }, [newsList, filteredNews])

  const publishedCount = newsList.filter((n) => n.published).length
  const draftCount = newsList.filter((n) => !n.published).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Manajemen Berita</h3>
          <p className="text-sm text-gray-600">Kelola berita dan informasi</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingNews(null)
                setIsDialogOpen(true)
              }}
              className="bg-black text-white hover:bg-gray-800"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Berita
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingNews ? "Edit Berita" : "Tambah Berita Baru"}</DialogTitle>
            </DialogHeader>
            <NewsForm
              key={editingNews?.id || "new"}
              news={editingNews || undefined}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsDialogOpen(false)
                setEditingNews(null)
              }}
              onError={(message) => {
                toast({
                  title: "Error",
                  description: message,
                  variant: "destructive",
                })
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Berita</CardTitle>
            <Newspaper className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newsList.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dipublikasikan</CardTitle>
            <Newspaper className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{publishedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <Newspaper className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{draftCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Cari berita berdasarkan judul atau isi..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <Card key={`news-table-${newsList.length}`}>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Judul</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal Dibuat</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : filteredNews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Tidak ada berita
                  </TableCell>
                </TableRow>
              ) : (
                filteredNews.map((news, index) => (
                  <TableRow key={news.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{news.title}</TableCell>
                    <TableCell>
                      <Badge variant={news.published ? "default" : "secondary"}>
                        {news.published ? "Dipublikasikan" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {news.createdAt 
                        ? new Date(news.createdAt).toLocaleDateString("id-ID", {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                          })
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingNews(news)
                            setIsDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Berita?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus berita "{news.title}"? Tindakan ini tidak dapat dibatalkan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(news.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

