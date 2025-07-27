"use client";

import { DialogTrigger } from "@/components/ui/dialog";
import type React from "react";
import { useState, useEffect, useRef, useMemo } from "react";
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
  Clock,
  DollarSign,
  AlertCircle,
  RefreshCw,
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";
import MapLocationPicker from "./map-location-picker";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Wisata {
  id: number;
  name: string;
  description: string;
  location: string;
  type: string;
  latitude: number;
  longitude: number;
  images: string[];
  reviews: number;
  isVerified: boolean;
  pengelolaId?: number;
  createdAt: string;
  updatedAt: string;
  ticketPrice?: number;
  openingTime?: string;
  closingTime?: string;
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
  const [filteredWisata, setFilteredWisata] = useState<Wisata[]>([]);
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
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  // Map picker states
  const [selectedLatitude, setSelectedLatitude] = useState<number>(-6.2);
  const [selectedLongitude, setSelectedLongitude] = useState<number>(106.816);
  const [editSelectedLatitude, setEditSelectedLatitude] =
    useState<number>(-6.2);
  const [editSelectedLongitude, setEditSelectedLongitude] =
    useState<number>(106.816);

  const addFormRef = useRef<HTMLFormElement>(null);
  const editFormRef = useRef<HTMLFormElement>(null);

  const { data, error, isLoading, mutate } = useSWR("/api/wisata", fetcher);
  const wisataData: Wisata[] = useMemo(() => data?.data || [], [data?.data]);

  useEffect(() => {
    if (wisataData && wisataData.length > 0) {
      let filtered = wisataData;

      if (activeTab === "verified") {
        filtered = filtered.filter((wisata: Wisata) => wisata.isVerified);
      } else if (activeTab === "unverified") {
        filtered = filtered.filter((wisata: Wisata) => !wisata.isVerified);
      }

      if (searchTerm) {
        filtered = filtered.filter(
          (wisata: Wisata) =>
            wisata.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            wisata.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (wisata.type &&
              wisata.type.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      setFilteredWisata(filtered);
    }
  }, [searchTerm, wisataData, activeTab]);

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

  const handleLocationSelect = (lat: number, lng: number, isEdit = false) => {
    if (isEdit) {
      setEditSelectedLatitude(lat);
      setEditSelectedLongitude(lng);
    } else {
      setSelectedLatitude(lat);
      setSelectedLongitude(lng);
    }
  };

  const formatPrice = (price: number | null | undefined) => {
    if (!price || price === 0) return "Gratis";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddWisata = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setUploadProgress(10);

    try {
      const formData = new FormData(e.currentTarget);

      // Set coordinates from map picker
      formData.set("latitude", selectedLatitude.toString());
      formData.set("longitude", selectedLongitude.toString());

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.floor(Math.random() * 15);
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 500);

      const response = await fetch("/api/wisata", {
        method: "POST",
        body: formData,
      });
      mutate("/api/wisata");

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal menambahkan wisata");
      }
      setOpenAddDialog(false);
      setPreviewImages([]);
      setSelectedLatitude(-6.2);
      setSelectedLongitude(106.816);
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

      // Set coordinates from map picker
      formData.set("latitude", editSelectedLatitude.toString());
      formData.set("longitude", editSelectedLongitude.toString());

      // Simulate progress
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
      mutate("/api/wisata");

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal memperbarui wisata");
      }

      setOpenEditDialog(false);
      setEditPreviewImages([]);
      toast.success("Wisata berhasil diperbarui");
    } catch (error) {
      console.error("Error updating wisata:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Gagal memperbarui wisata. Silakan coba lagi.";
      setFormError(message);
      toast.error(message);
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
      mutate("/api/wisata");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal menghapus wisata");
      }

      toast.success("Wisata berhasil dihapus");
    } catch (error) {
      console.error("Error deleting wisata:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Gagal menghapus wisata. Silakan coba lagi.";
      toast.error(message);
    } finally {
      setOpenDeleteDialog(false);
      setWisataToDelete(null);
    }
  };

  const handleEdit = (wisata: Wisata) => {
    setSelectedWisata(wisata);
    setEditPreviewImages(wisata.images || []);
    setEditSelectedLatitude(wisata.latitude);
    setEditSelectedLongitude(wisata.longitude);
    setFormError(null);
    setOpenEditDialog(true);
  };

  const getVerifiedCount = () => {
    return wisataData.filter((wisata: Wisata) => wisata.isVerified).length;
  };

  const getUnverifiedCount = () => {
    return wisataData.filter((wisata: Wisata) => !wisata.isVerified).length;
  };

  const handleRetry = () => {
    mutate();
  };

  // Error state
  if (error) {
    return (
      <div className="container py-10 mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">
              Wisata
            </h1>
            <p className="mt-2 text-muted-foreground">
              Kelola destinasi wisata dalam satu tempat
            </p>
          </div>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              Gagal memuat data wisata.{" "}
              {error.message || "Terjadi kesalahan pada server."}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="ml-4 bg-transparent">
              <RefreshCw className="w-4 h-4 mr-2" />
              Coba Lagi
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Loading state
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
            <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">
                  Tambah Wisata Baru
                </DialogTitle>
                <DialogDescription>
                  Masukkan informasi lengkap tentang destinasi wisata baru.
                </DialogDescription>
              </DialogHeader>

              <form
                ref={addFormRef}
                onSubmit={handleAddWisata}>
                <div className="grid grid-cols-1 gap-8 py-6 lg:grid-cols-2">
                  {/* Left Column - Form Fields */}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="name"
                          className="text-sm font-medium">
                          Nama Wisata
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="Nama Wisata"
                          className="w-full"
                          maxLength={100}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="description"
                          className="text-sm font-medium">
                          Deskripsi
                        </Label>
                        <Textarea
                          id="description"
                          name="description"
                          placeholder="Deskripsi Wisata"
                          className="w-full min-h-[80px]"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="location"
                          className="text-sm font-medium">
                          Lokasi
                        </Label>
                        <Input
                          id="location"
                          name="location"
                          placeholder="Lokasi"
                          className="w-full"
                          maxLength={200}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="type"
                          className="text-sm font-medium">
                          Tipe
                        </Label>
                        <Select name="type">
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Tipe Wisata" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Geologi">Geologi</SelectItem>
                            <SelectItem value="Biologi">Biologi</SelectItem>
                            <SelectItem value="Budaya">Budaya</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Koordinat</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label
                              htmlFor="latitude"
                              className="text-xs text-muted-foreground">
                              Lattitude
                            </Label>
                            <Input
                              id="latitude"
                              name="latitude"
                              type="number"
                              step="any"
                              placeholder="String"
                              value={selectedLatitude}
                              onChange={(e) =>
                                setSelectedLatitude(
                                  Number.parseFloat(e.target.value) || 0
                                )
                              }
                              required
                            />
                          </div>
                          <div>
                            <Label
                              htmlFor="longitude"
                              className="text-xs text-muted-foreground">
                              Longitude
                            </Label>
                            <Input
                              id="longitude"
                              name="longitude"
                              type="number"
                              step="any"
                              placeholder="String"
                              value={selectedLongitude}
                              onChange={(e) =>
                                setSelectedLongitude(
                                  Number.parseFloat(e.target.value) || 0
                                )
                              }
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="ticketPrice"
                          className="text-sm font-medium">
                          Harga Tiket (Rp)
                        </Label>
                        <Input
                          id="ticketPrice"
                          name="ticketPrice"
                          type="number"
                          min="0"
                          step="1000"
                          placeholder="0 (kosongkan jika gratis)"
                          className="w-full"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label
                            htmlFor="openingTime"
                            className="text-sm font-medium">
                            Jam Buka
                          </Label>
                          <Input
                            id="openingTime"
                            name="openingTime"
                            type="time"
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="closingTime"
                            className="text-sm font-medium">
                            Jam Tutup
                          </Label>
                          <Input
                            id="closingTime"
                            name="closingTime"
                            type="time"
                            className="w-full"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="images"
                          className="text-sm font-medium">
                          Gambar
                        </Label>
                        <div className="relative p-4 transition-colors border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400">
                          <Input
                            id="images"
                            name="images"
                            type="file"
                            multiple
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => handleImageChange(e)}
                            required
                          />
                          <div className="text-center">
                            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm text-gray-600">
                              Pilih Gambar
                            </p>
                          </div>
                        </div>

                        {previewImages.length > 0 && (
                          <div className="grid grid-cols-3 gap-2 mt-3">
                            {previewImages.map((url, index) => (
                              <div
                                key={index}
                                className="relative overflow-hidden border rounded-md aspect-square">
                                <Image
                                  src={url || "/placeholder.svg"}
                                  alt={`Preview ${index + 1}`}
                                  width={100}
                                  height={100}
                                  className="object-cover w-full h-full"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Map */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Pilih koordinat pada Maps
                      </Label>
                      <MapLocationPicker
                        onLocationSelect={(lat, lng) =>
                          handleLocationSelect(lat, lng, false)
                        }
                        initialLat={selectedLatitude}
                        initialLng={selectedLongitude}
                        height="400px"
                      />
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

                <DialogFooter className="flex gap-3">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      setOpenAddDialog(false);
                      setFormError(null);
                      setPreviewImages([]);
                      setSelectedLatitude(-6.2);
                      setSelectedLongitude(106.816);
                      if (addFormRef.current) addFormRef.current.reset();
                    }}
                    disabled={isSubmitting}
                    className="px-8">
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 bg-blue-600 hover:bg-blue-700">
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
            filteredWisata.map((wisata: Wisata) => (
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
                      {wisata.ticketPrice !== undefined && (
                        <span className="flex items-center text-green-600">
                          <DollarSign className="w-3.5 h-3.5 mr-1" />
                          {formatPrice(wisata.ticketPrice)}
                        </span>
                      )}
                      {(wisata.openingTime || wisata.closingTime) && (
                        <span className="flex items-center text-blue-600">
                          <Clock className="w-3.5 h-3.5 mr-1" />
                          {wisata.openingTime || "00:00"} -{" "}
                          {wisata.closingTime || "24:00"}
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

      {/* Edit Dialog - Similar structure to Add Dialog */}
      <Dialog
        open={openEditDialog}
        onOpenChange={setOpenEditDialog}>
        <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Edit Wisata
            </DialogTitle>
            <DialogDescription>
              Ubah informasi destinasi wisata.
            </DialogDescription>
          </DialogHeader>
          {selectedWisata && (
            <form
              ref={editFormRef}
              onSubmit={handleEditWisata}>
              <div className="grid grid-cols-1 gap-8 py-6 lg:grid-cols-2">
                {/* Left Column - Form Fields */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="edit-name"
                        className="text-sm font-medium">
                        Nama Wisata
                      </Label>
                      <Input
                        id="edit-name"
                        name="name"
                        defaultValue={selectedWisata.name}
                        className="w-full"
                        maxLength={100}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="edit-description"
                        className="text-sm font-medium">
                        Deskripsi
                      </Label>
                      <Textarea
                        id="edit-description"
                        name="description"
                        defaultValue={selectedWisata.description}
                        className="w-full min-h-[80px]"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="edit-location"
                        className="text-sm font-medium">
                        Lokasi
                      </Label>
                      <Input
                        id="edit-location"
                        name="location"
                        defaultValue={selectedWisata.location}
                        className="w-full"
                        maxLength={200}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="edit-type"
                        className="text-sm font-medium">
                        Tipe Wisata
                      </Label>
                      <Select
                        name="type"
                        defaultValue={selectedWisata.type}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih tipe wisata" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="geologi">Geologi</SelectItem>
                          <SelectItem value="biologi">Biologi</SelectItem>
                          <SelectItem value="budaya">Budaya</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Koordinat</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label
                            htmlFor="edit-latitude"
                            className="text-xs text-muted-foreground">
                            Lattitude
                          </Label>
                          <Input
                            id="edit-latitude"
                            name="latitude"
                            type="number"
                            step="any"
                            value={editSelectedLatitude}
                            onChange={(e) =>
                              setEditSelectedLatitude(
                                Number.parseFloat(e.target.value) || 0
                              )
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="edit-longitude"
                            className="text-xs text-muted-foreground">
                            Longitude
                          </Label>
                          <Input
                            id="edit-longitude"
                            name="longitude"
                            type="number"
                            step="any"
                            value={editSelectedLongitude}
                            onChange={(e) =>
                              setEditSelectedLongitude(
                                Number.parseFloat(e.target.value) || 0
                              )
                            }
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="edit-ticketPrice"
                        className="text-sm font-medium">
                        Harga Tiket (Rp)
                      </Label>
                      <Input
                        id="edit-ticketPrice"
                        name="ticketPrice"
                        type="number"
                        min="0"
                        step="1000"
                        defaultValue={selectedWisata.ticketPrice || ""}
                        className="w-full"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label
                          htmlFor="edit-openingTime"
                          className="text-sm font-medium">
                          Jam Buka
                        </Label>
                        <Input
                          id="edit-openingTime"
                          name="openingTime"
                          type="time"
                          defaultValue={selectedWisata.openingTime || ""}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="edit-closingTime"
                          className="text-sm font-medium">
                          Jam Tutup
                        </Label>
                        <Input
                          id="edit-closingTime"
                          name="closingTime"
                          type="time"
                          defaultValue={selectedWisata.closingTime || ""}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="edit-images"
                        className="text-sm font-medium">
                        Gambar
                      </Label>
                      {selectedWisata.images &&
                        selectedWisata.images.length > 0 && (
                          <div className="flex gap-2 mb-2">
                            {selectedWisata.images.map((image, index) => (
                              <Avatar
                                key={index}
                                className="w-12 h-12">
                                <AvatarImage
                                  src={image || "/placeholder.svg"}
                                  alt={`Wisata image ${index + 1}`}
                                />
                                <AvatarFallback>IMG</AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                        )}

                      <div className="relative p-4 transition-colors border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400">
                        <Input
                          id="edit-images"
                          name="images"
                          type="file"
                          multiple
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => handleImageChange(e, true)}
                        />
                        <div className="text-center">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-600">
                            Pilih gambar baru atau seret ke sini
                          </p>
                        </div>
                      </div>

                      {editPreviewImages.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mt-3">
                          {editPreviewImages.map((url, index) => (
                            <div
                              key={index}
                              className="relative overflow-hidden border rounded-md aspect-square">
                              <Image
                                src={url || "/placeholder.svg"}
                                alt={`Preview ${index + 1}`}
                                width={100}
                                height={100}
                                className="object-cover w-full h-full"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Map */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Pilih koordinat pada Maps
                    </Label>
                    <MapLocationPicker
                      onLocationSelect={(lat, lng) =>
                        handleLocationSelect(lat, lng, true)
                      }
                      initialLat={editSelectedLatitude}
                      initialLng={editSelectedLongitude}
                      height="400px"
                    />
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

              <DialogFooter className="flex gap-3">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setOpenEditDialog(false);
                    setFormError(null);
                    setEditPreviewImages([]);
                    setEditSelectedLatitude(-6.2);
                    setEditSelectedLongitude(106.816);
                  }}
                  disabled={isSubmitting}
                  className="px-8">
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 bg-blue-600 hover:bg-blue-700">
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
