"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import {
  Landmark,
  PlusCircle,
  Search,
  Pencil,
  Trash2,
  Star,
  Upload,
  MapPin,
  Tag,
  Check,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { LoadingCards } from "@/components/ui/loading-spinner";
import Image from "next/image";

interface Wisata {
  id: number;
  name: string;
  description: string;
  location: string;
  type: string | null;
  latitude: number;
  longitude: number;
  images: string[];
  reviews: number;
  isVerified: boolean;
  pengelolaId?: number;
  createdAt: string;
  updatedAt: string;
}

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  itemName?: string;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
}) => {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
            {itemName && <span className="font-medium">{itemName}</span>}?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}>
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}>
            Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function WisataPage() {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedWisata, setSelectedWisata] = useState<Wisata | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [wisataData, setWisataData] = useState<Wisata[]>([]);
  const [filteredWisata, setFilteredWisata] = useState<Wisata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [editPreviewImages, setEditPreviewImages] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [wisataToDelete, setWisataToDelete] = useState<Wisata | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "verified" | "unverified">(
    "all"
  );
  const [formError, setFormError] = useState<string | null>(null);

  const addFormRef = useRef<HTMLFormElement>(null);
  const editFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    fetchWisata();
  }, []);

  useEffect(() => {
    if (wisataData.length > 0) {
      let filtered = wisataData;

      // Filter by tab
      if (activeTab === "verified") {
        filtered = filtered.filter((wisata) => wisata.isVerified);
      } else if (activeTab === "unverified") {
        filtered = filtered.filter((wisata) => !wisata.isVerified);
      }

      // Filter by search term
      if (searchTerm) {
        filtered = filtered.filter(
          (wisata) =>
            wisata.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            wisata.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (wisata.type &&
              wisata.type.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      setFilteredWisata(filtered);
    }
  }, [searchTerm, wisataData, activeTab]);

  const fetchWisata = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/wisata`);

      if (!response.ok) {
        let errorMessage = `Server error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();

      // Check if the API returns data in the expected structure
      if (result.success && Array.isArray(result.data)) {
        setWisataData(result.data);
        setFilteredWisata(result.data);
      } else if (Array.isArray(result)) {
        // Fallback for direct array response
        setWisataData(result);
        setFilteredWisata(result);
      } else {
        console.error("Unexpected API response format:", result);
        setWisataData([]);
        setFilteredWisata([]);
      }
    } catch (error) {
      console.error("Error fetching wisata:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal memuat data wisata. Silakan coba lagi."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    isEdit = false
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPreviewUrls: string[] = [];

    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      newPreviewUrls.push(url);
    });

    if (isEdit) {
      setEditPreviewImages(newPreviewUrls);
    } else {
      setPreviewImages(newPreviewUrls);
    }
  };

  const handleAddWisata = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setUploadProgress(10);

    try {
      // Get form data
      const formData = new FormData(e.currentTarget);

      // Validate required fields
      const name = formData.get("name")?.toString();
      const description = formData.get("description")?.toString();
      const location = formData.get("location")?.toString();
      const latitude = formData.get("latitude")?.toString();
      const longitude = formData.get("longitude")?.toString();
      const imageFiles = formData.getAll("images") as File[];

      // Validate required fields
      if (!name || !description || !location || !latitude || !longitude) {
        throw new Error("Semua field wajib diisi");
      }
      if (
        imageFiles.length === 0 ||
        !imageFiles.every((f) => f instanceof File && f.size > 0)
      ) {
        throw new Error("Minimal satu gambar valid diperlukan");
      }

      // Simulate progress upload
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.floor(Math.random() * 15);
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 500);

      // Send data to API
      const response = await fetch("/api/wisata", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        let errorMessage = `Server error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
        }
        throw new Error(errorMessage);
      }

      // Success response
      await fetchWisata(); // Refresh wisata list
      setOpenAddDialog(false);
      setPreviewImages([]);
      if (addFormRef.current) addFormRef.current.reset();
      toast.success("Wisata berhasil ditambahkan");
    } catch (error) {
      console.error("Error adding wisata:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Gagal menambahkan wisata. Silakan coba lagi.";
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleEditWisata = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedWisata) return;

    setIsSubmitting(true);
    setFormError(null);
    setUploadProgress(10);

    try {
      const formData = new FormData(e.currentTarget);

      // Validate required fields
      const name = formData.get("name") as string;
      const description = formData.get("description") as string;
      const location = formData.get("location") as string;
      const latitude = formData.get("latitude") as string;
      const longitude = formData.get("longitude") as string;

      if (!name || !description || !location || !latitude || !longitude) {
        throw new Error("Semua field wajib diisi");
      }

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.floor(Math.random() * 15);
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 500);

      const response = await fetch(`/api/wisata?id=${selectedWisata.id}`, {
        method: "PUT",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        let errorMessage = `Server error: ${response.status} ${response.statusText}`;

        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
        }

        throw new Error(errorMessage);
      }

      await fetchWisata();
      setOpenEditDialog(false);
      setEditPreviewImages([]);
      toast.success("Wisata berhasil diperbarui");
    } catch (error) {
      console.error("Error updating wisata:", error);
      setFormError(
        error instanceof Error
          ? error.message
          : "Gagal memperbarui wisata. Silakan coba lagi."
      );
      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal memperbarui wisata. Silakan coba lagi."
      );
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = (wisata: Wisata) => {
    setWisataToDelete(wisata);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!wisataToDelete) return;

    try {
      const response = await fetch(`/api/wisata?id=${wisataToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        let errorMessage = `Server error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
        }
        throw new Error(errorMessage);
      }

      // Update local state after successful deletion
      setWisataData(wisataData.filter((w) => w.id !== wisataToDelete.id));
      setFilteredWisata(
        filteredWisata.filter((w) => w.id !== wisataToDelete.id)
      );

      toast.success("Wisata berhasil dihapus");
    } catch (error) {
      console.error("Error deleting wisata:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal menghapus wisata. Silakan coba lagi."
      );
    } finally {
      setOpenDeleteDialog(false);
      setWisataToDelete(null);
    }
  };

  const handleEdit = (wisata: Wisata) => {
    setSelectedWisata(wisata);
    setEditPreviewImages(wisata.images || []);
    setFormError(null);
    setOpenEditDialog(true);
  };

  const getVerifiedCount = () => {
    return wisataData.filter((wisata) => wisata.isVerified).length;
  };

  const getUnverifiedCount = () => {
    return wisataData.filter((wisata) => !wisata.isVerified).length;
  };

  if (isLoading) {
    return (
      <div className="container py-10 mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="w-32 h-8 rounded-md bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 animate-pulse" />
            <div className="w-64 h-4 rounded-md bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 animate-pulse" />
          </div>
        </div>
        <LoadingCards />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">
            Wisata
          </h1>
          <p className="mt-2 text-muted-foreground">
            Kelola destinasi wisata dalam satu tempat
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex gap-5">
            <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari wisata..."
              className="pl-10 pr-4 w-[250px] bg-background/60 backdrop-blur-sm border-muted"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog
            open={openAddDialog}
            onOpenChange={setOpenAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <PlusCircle className="w-4 h-4 mr-2" />
                Tambah Wisata
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Tambah Wisata Baru</DialogTitle>
                <DialogDescription>
                  Masukkan informasi lengkap tentang destinasi wisata baru.
                </DialogDescription>
              </DialogHeader>
              <form
                ref={addFormRef}
                onSubmit={handleAddWisata}>
                <div className="grid gap-4 py-4">
                  <div className="grid items-center grid-cols-4 gap-4">
                    <Label
                      htmlFor="name"
                      className="text-right">
                      Nama
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Nama wisata"
                      className="col-span-3"
                      maxLength={100}
                      required
                    />
                  </div>
                  <div className="grid items-center grid-cols-4 gap-4">
                    <Label
                      htmlFor="description"
                      className="text-right">
                      Deskripsi
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Deskripsi wisata"
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid items-center grid-cols-4 gap-4">
                    <Label
                      htmlFor="location"
                      className="text-right">
                      Lokasi
                    </Label>
                    <Input
                      id="location"
                      name="location"
                      placeholder="Lokasi wisata"
                      className="col-span-3"
                      maxLength={200}
                      required
                    />
                  </div>
                  <div className="grid items-center grid-cols-4 gap-4">
                    <Label
                      htmlFor="type"
                      className="text-right">
                      Tipe
                    </Label>
                    <Select name="type">
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Pilih tipe wisata" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pantai">Pantai</SelectItem>
                        <SelectItem value="gunung">Gunung</SelectItem>
                        <SelectItem value="candi">Candi</SelectItem>
                        <SelectItem value="taman">Taman</SelectItem>
                        <SelectItem value="danau">Danau</SelectItem>
                        <SelectItem value="air-terjun">Air Terjun</SelectItem>
                        <SelectItem value="budaya">Budaya</SelectItem>
                        <SelectItem value="sejarah">Sejarah</SelectItem>
                        <SelectItem value="religi">Religi</SelectItem>
                        <SelectItem value="kuliner">Kuliner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid items-center grid-cols-4 gap-4">
                    <Label
                      htmlFor="latitude"
                      className="text-right">
                      Latitude
                    </Label>
                    <Input
                      id="latitude"
                      name="latitude"
                      type="number"
                      step="any"
                      placeholder="Latitude"
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid items-center grid-cols-4 gap-4">
                    <Label
                      htmlFor="longitude"
                      className="text-right">
                      Longitude
                    </Label>
                    <Input
                      id="longitude"
                      name="longitude"
                      type="number"
                      step="any"
                      placeholder="Longitude"
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid items-start grid-cols-4 gap-4">
                    <Label
                      htmlFor="images"
                      className="pt-2 text-right">
                      Gambar
                    </Label>
                    <div className="col-span-3 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="relative w-full p-2 border rounded-md">
                          <Input
                            id="images"
                            name="images"
                            type="file"
                            multiple
                            accept="image/*"
                            className="absolute inset-0 z-10 w-full opacity-0 cursor-pointer"
                            onChange={(e) => handleImageChange(e)}
                            required
                          />
                          <div className="flex items-center justify-center gap-2 text-muted-foreground">
                            <Upload className="w-4 h-4" />
                            <span>Pilih gambar atau seret ke sini</span>
                          </div>
                        </div>
                      </div>

                      {previewImages.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                          {previewImages.map((url, index) => (
                            <div
                              key={index}
                              className="relative overflow-hidden border rounded-md aspect-square">
                              <Image
                                src={url || "/placeholder.svg"}
                                alt={`Preview ${index + 1}`}
                                className="object-cover w-full h-full"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {formError && (
                  <div className="p-3 mb-4 text-sm text-red-600 border border-red-200 rounded-md bg-red-50">
                    {formError}
                  </div>
                )}
                {isSubmitting && (
                  <div className="mb-4">
                    <Label className="mb-1.5 block">Mengunggah...</Label>
                    <Progress
                      value={uploadProgress}
                      className="h-2"
                    />
                  </div>
                )}
                <DialogFooter>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      setOpenAddDialog(false);
                      setFormError(null);
                      setPreviewImages([]);
                      if (addFormRef.current) addFormRef.current.reset();
                    }}
                    disabled={isSubmitting}>
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}>
                    {isSubmitting ? "Menyimpan..." : "Simpan"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col items-start justify-between gap-4 mb-8 sm:flex-row sm:items-center">
        <div className="inline-flex p-1 rounded-lg shadow-sm bg-muted/60 backdrop-blur-sm">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "all"
                ? "bg-background text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}>
            <Landmark className="w-4 h-4" />
            <span>Semua Wisata</span>
            <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {wisataData.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("verified")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "verified"
                ? "bg-background text-green-600 shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}>
            <Check className="w-4 h-4" />
            <span>Terverifikasi</span>
            <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-600">
              {getVerifiedCount()}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("unverified")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "unverified"
                ? "bg-background text-amber-600 shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}>
            <X className="w-4 h-4" />
            <span>Belum Terverifikasi</span>
            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-600">
              {getUnverifiedCount()}
            </span>
          </button>
        </div>
      </div>

      {/* Card-based UI  Tampilan Data Wiasata*/}
      <Card className="overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium">Daftar Wisata</h3>
        </div>
        <div className="divide-y">
          {filteredWisata.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Landmark className="w-12 h-12 mb-4 text-muted-foreground" />
              <div className="text-lg font-medium">Tidak ada data wisata</div>
              <p className="max-w-md mt-2 text-sm text-muted-foreground">
                Tambahkan wisata baru dengan mengklik tombol Tambah Wisata di
                bagian atas.
              </p>
            </div>
          ) : (
            filteredWisata.map((wisata) => (
              <div
                key={wisata.id}
                className="p-4 transition-colors hover:bg-muted/30">
                <div className="flex items-start gap-4">
                  <Avatar className="flex-shrink-0 w-16 h-16 rounded-md">
                    <AvatarImage
                      src={wisata.images?.[0] || "/placeholder.svg"}
                      alt={wisata.name}
                      className="object-cover"
                    />
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{wisata.name}</h4>
                      {wisata.isVerified ? (
                        <Badge
                          variant="outline"
                          className="text-green-600 border-green-200 bg-green-50">
                          <Check className="w-3 h-3 mr-1" />
                          Terverifikasi
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-amber-50 text-amber-600 border-amber-200">
                          <X className="w-3 h-3 mr-1" />
                          Belum Terverifikasi
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {wisata.description}
                    </p>

                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1" />
                        {wisata.location}
                      </span>
                      {wisata.type && (
                        <span className="flex items-center">
                          <Tag className="w-3.5 h-3.5 mr-1" />
                          {wisata.type}
                        </span>
                      )}
                      {wisata.reviews > 0 && (
                        <span className="flex items-center">
                          <Star className="w-3.5 h-3.5 mr-1 text-yellow-500" />
                          {wisata.reviews}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-auto">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(wisata)}
                            className="w-8 h-8">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(wisata)}
                            className="w-8 h-8 text-destructive hover:bg-destructive/10">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Hapus</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
      <Dialog
        open={openEditDialog}
        onOpenChange={setOpenEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Wisata</DialogTitle>
            <DialogDescription>
              Ubah informasi destinasi wisata.
            </DialogDescription>
          </DialogHeader>
          {selectedWisata && (
            <form
              ref={editFormRef}
              onSubmit={handleEditWisata}>
              <div className="grid gap-4 py-4">
                <div className="grid items-center grid-cols-4 gap-4">
                  <Label
                    htmlFor="edit-name"
                    className="text-right">
                    Nama
                  </Label>
                  <Input
                    id="edit-name"
                    name="name"
                    defaultValue={selectedWisata.name}
                    className="col-span-3"
                    maxLength={100}
                    required
                  />
                </div>
                <div className="grid items-center grid-cols-4 gap-4">
                  <Label
                    htmlFor="edit-description"
                    className="text-right">
                    Deskripsi
                  </Label>
                  <Textarea
                    id="edit-description"
                    name="description"
                    defaultValue={selectedWisata.description}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid items-center grid-cols-4 gap-4">
                  <Label
                    htmlFor="edit-location"
                    className="text-right">
                    Lokasi
                  </Label>
                  <Input
                    id="edit-location"
                    name="location"
                    defaultValue={selectedWisata.location}
                    className="col-span-3"
                    maxLength={200}
                    required
                  />
                </div>
                <div className="grid items-center grid-cols-4 gap-4">
                  <Label
                    htmlFor="edit-type"
                    className="text-right">
                    Tipe
                  </Label>
                  <Select
                    name="type"
                    defaultValue={selectedWisata.type || undefined}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Pilih tipe wisata" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pantai">Pantai</SelectItem>
                      <SelectItem value="gunung">Gunung</SelectItem>
                      <SelectItem value="candi">Candi</SelectItem>
                      <SelectItem value="taman">Taman</SelectItem>
                      <SelectItem value="danau">Danau</SelectItem>
                      <SelectItem value="air-terjun">Air Terjun</SelectItem>
                      <SelectItem value="budaya">Budaya</SelectItem>
                      <SelectItem value="sejarah">Sejarah</SelectItem>
                      <SelectItem value="religi">Religi</SelectItem>
                      <SelectItem value="kuliner">Kuliner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid items-center grid-cols-4 gap-4">
                  <Label
                    htmlFor="edit-latitude"
                    className="text-right">
                    Latitude
                  </Label>
                  <Input
                    id="edit-latitude"
                    name="latitude"
                    type="number"
                    step="any"
                    defaultValue={selectedWisata.latitude}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid items-center grid-cols-4 gap-4">
                  <Label
                    htmlFor="edit-longitude"
                    className="text-right">
                    Longitude
                  </Label>
                  <Input
                    id="edit-longitude"
                    name="longitude"
                    type="number"
                    step="any"
                    defaultValue={selectedWisata.longitude}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid items-start grid-cols-4 gap-4">
                  <Label
                    htmlFor="edit-images"
                    className="pt-2 text-right">
                    Gambar
                  </Label>
                  <div className="col-span-3 space-y-3">
                    {selectedWisata.images &&
                      selectedWisata.images.length > 0 && (
                        <div className="flex gap-2 mb-2">
                          {selectedWisata.images.map((image, index) => (
                            <Avatar
                              key={index}
                              className="w-12 h-12">
                              <AvatarImage
                                src={image}
                                alt={`Wisata image ${index + 1}`}
                              />
                              <AvatarFallback>IMG</AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                      )}

                    <div className="relative w-full p-2 border rounded-md">
                      <Input
                        id="edit-images"
                        name="images"
                        type="file"
                        multiple
                        accept="image/*"
                        className="absolute inset-0 z-10 w-full opacity-0 cursor-pointer"
                        onChange={(e) => handleImageChange(e, true)}
                      />
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Upload className="w-4 h-4" />
                        <span>Pilih gambar baru atau seret ke sini</span>
                      </div>
                    </div>

                    {editPreviewImages.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {editPreviewImages.map((url, index) => (
                          <div
                            key={index}
                            className="relative overflow-hidden border rounded-md aspect-square">
                            <Image
                              src={url || "/placeholder.svg"}
                              alt={`Preview ${index + 1}`}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {formError && (
                <div className="p-3 mb-4 text-sm text-red-600 border border-red-200 rounded-md bg-red-50">
                  {formError}
                </div>
              )}
              {isSubmitting && (
                <div className="mb-4">
                  <Label className="mb-1.5 block">Mengunggah...</Label>
                  <Progress
                    value={uploadProgress}
                    className="h-2"
                  />
                </div>
              )}
              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setOpenEditDialog(false);
                    setFormError(null);
                    setEditPreviewImages([]);
                  }}
                  disabled={isSubmitting}>
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <DeleteConfirmationDialog
        isOpen={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Hapus Wisata"
        description="Apakah Anda yakin ingin menghapus wisata ini? Tindakan ini tidak dapat dibatalkan."
        itemName={wisataToDelete?.name}
      />
    </motion.div>
  );
}
