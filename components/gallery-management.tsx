"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
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
import { Plus, Edit, Trash2, Search, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react"
import type { Gallery } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface GalleryFormData {
  title: string
  description: string
  image: string
  category: string
  published: boolean
}

function GalleryForm({
  gallery,
  onSubmit,
  onCancel,
  onError,
}: {
  gallery?: Gallery
  onSubmit: (data: GalleryFormData, images?: string[]) => void
  onCancel: () => void
  onError?: (message: string) => void
}) {
  const [formData, setFormData] = useState<GalleryFormData>({
    title: gallery?.title || "",
    description: gallery?.description || "",
    image: gallery?.image || "",
    category: gallery?.category || "",
    published: gallery?.published ?? false,
  })
  const [imagePreview, setImagePreview] = useState<string>(gallery?.image || "")
  const [imagePreviews, setImagePreviews] = useState<string[]>(gallery?.image ? [gallery.image] : [])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  // Update form data when gallery prop changes (important for editing)
  useEffect(() => {
    if (gallery) {
      // Use images array if available, otherwise fallback to single image
      const galleryImages = gallery.images && gallery.images.length > 0 
        ? gallery.images 
        : (gallery.image ? [gallery.image] : [])
      
      setFormData({
        title: gallery.title || "",
        description: gallery.description || "",
        image: galleryImages[0] || gallery.image || "",
        category: gallery.category || "",
        published: gallery.published ?? false,
      })
      setImagePreview(galleryImages[0] || gallery.image || "")
      setImagePreviews(galleryImages)
      setSelectedFiles([])
    } else {
      // Reset form when creating new gallery
      setFormData({
        title: "",
        description: "",
        image: "",
        category: "",
        published: false,
      })
      setImagePreview("")
      setImagePreviews([])
      setSelectedFiles([])
    }
  }, [gallery])

  const processImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        reject(new Error("File harus berupa gambar (JPG, PNG, GIF)"))
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error("Ukuran file maksimal 5MB"))
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
            resolve(compressedBase64)
          } else {
            resolve(base64String)
          }
        }
        img.onerror = () => reject(new Error("Gagal memproses gambar"))
        img.src = base64String
      }
      reader.onerror = () => reject(new Error("Gagal membaca file"))
      reader.readAsDataURL(file)
    })
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)
    const newFiles: File[] = []
    const newPreviews: string[] = []

    try {
      for (const file of fileArray) {
        try {
          const preview = await processImageFile(file)
          newFiles.push(file)
          newPreviews.push(preview)
        } catch (error: any) {
          onError?.(error.message || "Error processing image")
        }
      }

      if (newPreviews.length > 0) {
        setSelectedFiles(prev => [...prev, ...newFiles])
        setImagePreviews(prev => [...prev, ...newPreviews])
        // Set first image as main preview for backward compatibility
        setImagePreview(newPreviews[0])
        setFormData({ ...formData, image: newPreviews[0] })
      }
    } catch (error: any) {
      onError?.(error.message || "Gagal memproses gambar")
    }
  }

  const handleRemoveImage = (index?: number) => {
    if (index !== undefined) {
      // Remove specific image
      const newPreviews = [...imagePreviews]
      const newFiles = [...selectedFiles]
      newPreviews.splice(index, 1)
      newFiles.splice(index, 1)
      setImagePreviews(newPreviews)
      setSelectedFiles(newFiles)
      
      // Update main preview and form data
      if (newPreviews.length > 0) {
        setImagePreview(newPreviews[0])
        setFormData({ ...formData, image: newPreviews[0] })
      } else {
        setImagePreview("")
        setFormData({ ...formData, image: "" })
      }
    } else {
      // Remove all images
      setFormData({ ...formData, image: "" })
      setImagePreview("")
      setImagePreviews([])
      setSelectedFiles([])
      // Reset file input
      const fileInput = document.getElementById("image") as HTMLInputElement
      if (fileInput) {
        fileInput.value = ""
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted with data:", { ...formData, images: imagePreviews.length })
    
    // Validate required fields
    if (!formData.title.trim()) {
      onError?.("Judul wajib diisi")
      return
    }
    
    // If editing, check if image is needed
    if (gallery) {
      // For edit, image is optional (can keep existing)
      // If user uploaded new image(s), use all images
      if (imagePreviews.length > 0) {
        const updatedFormData = { ...formData, image: imagePreviews[0] }
        onSubmit(updatedFormData, imagePreviews) // Pass all images for album
      } else {
        // No new image uploaded, use existing formData (with existing images)
        const existingImages = gallery.images && gallery.images.length > 0 
          ? gallery.images 
          : (gallery.image ? [gallery.image] : [])
        onSubmit(formData, existingImages)
      }
    } else {
      // For new gallery, image is required
      if (imagePreviews.length === 0) {
        onError?.("Minimal satu gambar wajib diupload")
        return
      }
      // If creating new, submit all images
      onSubmit(formData, imagePreviews)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Judul</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Kategori</Label>
        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="kegiatan">Kegiatan</SelectItem>
            <SelectItem value="fasilitas">Fasilitas</SelectItem>
            <SelectItem value="acara">Acara</SelectItem>
            <SelectItem value="lainnya">Lainnya</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Gambar {!gallery && ""}</Label>
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="cursor-pointer"
          required={!gallery}
          multiple={!gallery}
        />
        {imagePreviews.length > 0 && (
          <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative inline-block">
                <Image
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  width={200}
                  height={200}
                  className="rounded-lg object-cover border w-full h-32"
                  unoptimized
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-2 right-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-500">
          Format: JPG, PNG, GIF. Maksimal 5MB per gambar. {!gallery && "Anda bisa memilih lebih dari satu gambar."}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
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
        <Button type="submit">{gallery ? "Update" : "Tambah"}</Button>
      </div>
    </form>
  )
}

export function GalleryManagement() {
  const [galleryList, setGalleryList] = useState<Gallery[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingGallery, setEditingGallery] = useState<Gallery | null>(null)
  const [loading, setLoading] = useState(false)
  const [viewingGallery, setViewingGallery] = useState<Gallery | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    loadGallery()
  }, [])

  // Reload gallery when dialog closes (in case data was added)
  useEffect(() => {
    if (!isDialogOpen && !editingGallery) {
      // Small delay to ensure localStorage is updated
      const timer = setTimeout(() => {
        loadGallery()
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [isDialogOpen, editingGallery])

  const loadGallery = async () => {
    try {
      setLoading(true)
      console.log("🔄 Loading gallery...")
      
      // Always load from localStorage first (primary source)
      const stored = localStorage.getItem("gallery")
      if (stored) {
        try {
          const gallery = JSON.parse(stored)
          console.log("📦 Raw data from localStorage:", gallery.length, "items")
          
          // Convert date strings to Date objects
          const formattedGallery = gallery.map((g: any) => ({
            ...g,
            createdAt: g.createdAt ? new Date(g.createdAt) : new Date(),
            updatedAt: g.updatedAt ? new Date(g.updatedAt) : new Date(),
          }))
          
          console.log("✅ Formatted gallery:", formattedGallery.length, "items")
          console.log("✅ Setting galleryList state...")
          setGalleryList(formattedGallery)
          console.log("✅ State updated!")
        } catch (parseError) {
          console.error("❌ Error parsing localStorage data:", parseError)
          setGalleryList([])
        }
      } else {
        console.log("ℹ️ No data in localStorage")
        setGalleryList([])
      }
      
      // Also try to fetch from API (but don't wait for it)
      const response = await fetch("/api/gallery")
      if (response.ok) {
        const data = await response.json()
        const gallery = data.gallery || []
        if (gallery.length > 0) {
          console.log("📡 Also loaded from API:", gallery.length, "items")
          // Convert date strings to Date objects
          const formattedGallery = gallery.map((g: any) => ({
            ...g,
            createdAt: g.createdAt ? new Date(g.createdAt) : new Date(),
            updatedAt: g.updatedAt ? new Date(g.updatedAt) : new Date(),
          }))
          setGalleryList(formattedGallery)
        }
      } else {
        console.log("⚠️ API response not OK, using localStorage data")
      }
    } catch (error) {
      console.error("❌ Error loading gallery:", error)
      // Fallback to localStorage
      const stored = localStorage.getItem("gallery")
      if (stored) {
        try {
          const gallery = JSON.parse(stored)
          console.log("📦 Fallback: Loading from localStorage:", gallery.length, "items")
          // Convert date strings to Date objects
          const formattedGallery = gallery.map((g: any) => ({
            ...g,
            createdAt: g.createdAt ? new Date(g.createdAt) : new Date(),
            updatedAt: g.updatedAt ? new Date(g.updatedAt) : new Date(),
          }))
          setGalleryList(formattedGallery)
        } catch (parseError) {
          console.error("❌ Error parsing localStorage data:", parseError)
          setGalleryList([])
        }
      } else {
        console.log("ℹ️ No data in localStorage")
        setGalleryList([])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: GalleryFormData, images?: string[]) => {
    try {
      // For edit, if no new images provided, keep existing images
      let imagesToProcess: string[] = []
      if (editingGallery) {
        if (images && images.length > 0) {
          // New images uploaded
          imagesToProcess = images
        } else {
          // No new images, keep existing
          imagesToProcess = editingGallery.images && editingGallery.images.length > 0
            ? editingGallery.images
            : (editingGallery.image ? [editingGallery.image] : [])
        }
      } else {
        // For new gallery, use provided images or fallback to single image
        imagesToProcess = images && images.length > 0 ? images : (data.image ? [data.image] : [])
      }
      
      console.log("Submitting gallery data:", { 
        ...data, 
        imageCount: imagesToProcess.length,
        isEdit: !!editingGallery,
        image: data.image ? "Base64 image (length: " + data.image.length + ")" : "No image" 
      })
      
      // Validate required fields
      if (!data.title) {
        toast({
          title: "Error",
          description: "Judul wajib diisi",
          variant: "destructive",
        })
        return
      }
      
      // For new gallery, image is required. For edit, image can be kept from existing
      if (!editingGallery && imagesToProcess.length === 0) {
        toast({
          title: "Error",
          description: "Minimal satu gambar wajib diupload",
          variant: "destructive",
        })
        return
      }

      if (editingGallery) {
        // Always update localStorage first (primary storage)
        const stored = localStorage.getItem("gallery")
        const galleryArray = stored ? JSON.parse(stored) : []
        const updated = galleryArray.map((g: any) =>
          g.id === editingGallery.id
            ? { 
                ...g, 
                title: data.title,
                description: data.description || g.description,
                image: imagesToProcess[0] || g.image, // Use first image from imagesToProcess or keep existing
                images: imagesToProcess.length > 0 ? imagesToProcess : (g.images || (g.image ? [g.image] : [])), // Update images array
                category: data.category || g.category,
                published: Boolean(data.published),
                updatedAt: new Date().toISOString(),
                createdAt: g.createdAt || new Date().toISOString()
              }
            : g
        )
        
        console.log("💾 Updating gallery in localStorage:", {
          id: editingGallery.id,
          title: data.title,
          description: data.description?.substring(0, 50) + "...",
          published: data.published,
          hasImage: !!data.image
        })
        localStorage.setItem("gallery", JSON.stringify(updated))
        console.log("✅ Updated in localStorage:", updated.length, "items")
        
        // Update state immediately
        const formattedGallery = updated.map((g: any) => ({
          ...g,
          createdAt: g.createdAt ? new Date(g.createdAt) : new Date(),
          updatedAt: g.updatedAt ? new Date(g.updatedAt) : new Date(),
        }))
        setGalleryList(formattedGallery)
        console.log("✅ State updated immediately")
        
        // Also try to update via API (but don't wait for it)
        try {
          const response = await fetch(`/api/gallery/${editingGallery.id}`, {
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
        setEditingGallery(null)
        
        // Reload to ensure consistency
        setTimeout(() => {
          loadGallery()
        }, 100)
        
        toast({
          title: "Berhasil",
          description: "Galeri berhasil diperbarui",
        })
      } else {
        // Create ONE gallery item with multiple images (album style)
        const stored = localStorage.getItem("gallery")
        const galleryArray = stored ? JSON.parse(stored) : []
        
        // Create single gallery item with all images
        const newGallery: Gallery = {
          id: Date.now().toString() + "-" + Math.random().toString(36).substr(2, 9),
          title: data.title,
          description: data.description,
          image: imagesToProcess[0] || "", // First image as thumbnail/main image
          images: imagesToProcess, // All images for carousel/album
          category: data.category,
          published: Boolean(data.published),
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        
        const galleryToSave = {
          ...newGallery,
          published: Boolean(newGallery.published),
          createdAt: newGallery.createdAt.toISOString(),
          updatedAt: newGallery.updatedAt.toISOString(),
        }
        
        console.log("📸 Creating gallery album with", imagesToProcess.length, "images:", {
          id: newGallery.id,
          title: newGallery.title,
          imageCount: imagesToProcess.length,
          hasImages: !!newGallery.images
        })
        
        galleryArray.push(galleryToSave)
        
        try {
          localStorage.setItem("gallery", JSON.stringify(galleryArray))
          console.log("✅ Saved to localStorage:", galleryArray.length, "items")
          
          // Update state immediately - FORCE UPDATE
          const formattedGallery = galleryArray.map((g: any) => ({
            ...g,
            createdAt: g.createdAt ? new Date(g.createdAt) : new Date(),
            updatedAt: g.updatedAt ? new Date(g.updatedAt) : new Date(),
          }))
          
          console.log("✅ Setting state with:", formattedGallery.length, "items")
          if (formattedGallery.length > 0) {
            console.log("✅ First item:", formattedGallery[0])
          }
          
          // Force state update with new array reference
          setGalleryList([...formattedGallery])
          console.log("✅ State updated immediately with", formattedGallery.length, "items")
          
          // Also try to save to API (but don't wait for it)
          fetch("/api/gallery", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(galleryToSave),
          }).then((response) => {
            if (response.ok) {
              console.log("✅ Also saved to API:", galleryToSave.id)
            } else {
              console.log("⚠️ API save failed for:", galleryToSave.id)
            }
          }).catch((error) => {
            console.log("⚠️ API error (non-critical):", error)
          })
          
          // Close dialog and reset
          setIsDialogOpen(false)
          setEditingGallery(null)
          
          toast({
            title: "Berhasil",
            description: `Album galeri dengan ${imagesToProcess.length} ${imagesToProcess.length > 1 ? 'gambar berhasil ditambahkan' : 'gambar berhasil ditambahkan'}`,
          })
          
          // Force reload after a short delay to ensure consistency
          setTimeout(() => {
            console.log("🔄 Forcing reload...")
            loadGallery()
          }, 300)
        } catch (storageError: any) {
          console.error("❌ Error saving to localStorage:", storageError)
          // If storage is full, try to compress or remove old data
          if (storageError.name === "QuotaExceededError") {
            toast({
              title: "Error",
              description: "Penyimpanan penuh. Silakan hapus beberapa galeri lama atau kurangi ukuran gambar.",
              variant: "destructive",
            })
            return
          }
          throw storageError
        }
      }
    } catch (error) {
      console.error("Error saving gallery:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal menyimpan galeri",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      console.log("🗑️ Deleting gallery with id:", id)
      
      // Always delete from localStorage first (primary storage)
      const stored = localStorage.getItem("gallery")
      const galleryArray = stored ? JSON.parse(stored) : []
      const beforeCount = galleryArray.length
      const filtered = galleryArray.filter((g: any) => g.id !== id)
      const afterCount = filtered.length
      
      console.log("📊 Before delete:", beforeCount, "items, After delete:", afterCount, "items")
      
      if (beforeCount === afterCount) {
        console.warn("⚠️ Gallery item not found in localStorage, id:", id)
        toast({
          title: "Peringatan",
          description: "Galeri tidak ditemukan",
          variant: "destructive",
        })
        return
      }
      
      localStorage.setItem("gallery", JSON.stringify(filtered))
      console.log("✅ Deleted from localStorage")
      
      // Update state immediately with formatted data
      const formattedGallery = filtered.map((g: any) => ({
        ...g,
        createdAt: g.createdAt ? new Date(g.createdAt) : new Date(),
        updatedAt: g.updatedAt ? new Date(g.updatedAt) : new Date(),
      }))
      setGalleryList(formattedGallery)
      console.log("✅ State updated immediately")
      
      // Also try to delete from API (but don't wait for it)
      try {
        const response = await fetch(`/api/gallery/${id}`, {
          method: "DELETE",
        })
        
        if (response.ok) {
          console.log("✅ Also deleted from API")
        } else {
          console.log("⚠️ API delete failed, but localStorage deleted successfully")
        }
      } catch (apiError) {
        console.log("⚠️ API error (non-critical):", apiError)
      }
      
      toast({
        title: "Berhasil",
        description: "Galeri berhasil dihapus",
      })
      
      // Reload to ensure consistency
      setTimeout(() => {
        loadGallery()
      }, 100)
    } catch (error) {
      console.error("❌ Error deleting gallery:", error)
      toast({
        title: "Error",
        description: "Gagal menghapus galeri. Silakan coba lagi.",
        variant: "destructive",
      })
    }
  }

  const filteredGallery = galleryList.filter(
    (gallery) =>
      gallery.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (gallery.description && gallery.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const categoryCounts = galleryList.reduce((acc, item) => {
    const cat = item.category || "lainnya"
    acc[cat] = (acc[cat] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Manajemen Galeri</h3>
          <p className="text-sm text-gray-600">Kelola foto dan gambar galeri</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingGallery(null)
                setIsDialogOpen(true)
              }}
              className="bg-black text-white hover:bg-gray-800"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Galeri
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingGallery ? "Edit Galeri" : "Tambah Galeri Baru"}</DialogTitle>
            </DialogHeader>
            <GalleryForm
              key={editingGallery?.id || "new"}
              gallery={editingGallery || undefined}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsDialogOpen(false)
                setEditingGallery(null)
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
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Galeri</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{galleryList.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dipublikasikan</CardTitle>
            <ImageIcon className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {galleryList.filter((g) => g.published).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <ImageIcon className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {galleryList.filter((g) => !g.published).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kegiatan</CardTitle>
            <ImageIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{categoryCounts.kegiatan || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acara</CardTitle>
            <ImageIcon className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{categoryCounts.acara || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Cari galeri berdasarkan judul atau deskripsi..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <Card key={`gallery-table-${galleryList.length}`}>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Gambar</TableHead>
                <TableHead>Judul</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal Dibuat</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : filteredGallery.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Tidak ada galeri
                  </TableCell>
                </TableRow>
              ) : (
                filteredGallery.map((gallery, index) => (
                  <TableRow key={gallery.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <div className="w-16 h-16 relative group cursor-pointer" onClick={() => {
                        setViewingGallery(gallery)
                        setCurrentImageIndex(0)
                      }}>
                        {(() => {
                          const images = gallery.images && gallery.images.length > 0 ? gallery.images : (gallery.image ? [gallery.image] : [])
                          const displayImage = images[0] || gallery.image
                          
                          return displayImage ? (
                            <>
                              <Image
                                src={displayImage}
                                alt={gallery.title}
                                fill
                                className="rounded object-cover"
                                unoptimized
                                onError={(e) => {
                                  e.currentTarget.style.display = "none"
                                }}
                              />
                              {images.length > 1 && (
                                <div className="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded-tl">
                                  {images.length} foto
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                              <ImageIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          )
                        })()}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{gallery.title}</TableCell>
                    <TableCell>{gallery.category || "Lainnya"}</TableCell>
                    <TableCell>
                      <Badge variant={gallery.published ? "default" : "secondary"}>
                        {gallery.published ? "Dipublikasikan" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {gallery.createdAt 
                        ? new Date(gallery.createdAt).toLocaleDateString("id-ID", {
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
                            setEditingGallery(gallery)
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
                              <AlertDialogTitle>Hapus Galeri?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus galeri "{gallery.title}"? Tindakan ini tidak dapat dibatalkan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  console.log("🗑️ Delete button clicked for gallery:", gallery.id)
                                  handleDelete(gallery.id)
                                }}
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

      {/* Dialog untuk melihat album foto dengan carousel */}
      <Dialog open={!!viewingGallery} onOpenChange={(open) => !open && setViewingGallery(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {viewingGallery && (() => {
            const images = viewingGallery.images && viewingGallery.images.length > 0 
              ? viewingGallery.images 
              : (viewingGallery.image ? [viewingGallery.image] : [])
            
            return (
              <>
                <DialogHeader>
                  <DialogTitle>{viewingGallery.title}</DialogTitle>
                  {viewingGallery.description && (
                    <p className="text-sm text-gray-600 mt-1">{viewingGallery.description}</p>
                  )}
                </DialogHeader>
                
                {images.length > 0 ? (
                  <div className="space-y-4">
                    {/* Carousel */}
                    <div className="relative">
                      <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={images[currentImageIndex]}
                          alt={`${viewingGallery.title} - Foto ${currentImageIndex + 1}`}
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
                                setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
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
                                setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
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
                          Foto {currentImageIndex + 1} dari {images.length}
                        </div>
                      )}
                      
                      {/* Thumbnail navigation */}
                      {images.length > 1 && (
                        <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mt-4 max-h-32 overflow-y-auto">
                          {images.map((img, idx) => (
                            <div
                              key={idx}
                              className={`relative aspect-square cursor-pointer rounded border-2 transition-all ${
                                idx === currentImageIndex ? 'border-blue-500' : 'border-gray-200 hover:border-gray-400'
                              }`}
                              onClick={() => setCurrentImageIndex(idx)}
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
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Tidak ada gambar
                  </div>
                )}
              </>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}

