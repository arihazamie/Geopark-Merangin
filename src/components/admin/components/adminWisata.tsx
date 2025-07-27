"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
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
  Map,
  Clock,
  DollarSign,
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
import { WisataPdfButton } from "../export/wisata/Button";

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
  ticketPrice?: number;
  openingTime?: string;
  closingTime?: string;
}

interface ApiResponse {
  success: boolean;
  data: Wisata[];
  message?: string;
}

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  itemName?: string;
}

// SWR fetcher function
const fetcher = async (url: string): Promise<Wisata[]> => {
  const response = await fetch(url);

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

  // Handle different response formats
  if (result.success && Array.isArray(result.data)) {
    return result.data;
  } else if (Array.isArray(result)) {
    return result;
  } else {
    console.error("Unexpected API response format:", result);
    return [];
  }
};

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
            {itemName && <span className="font-medium">"{itemName}"</span>}?
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

// Mock MapLocationPicker component
const MapLocationPicker: React.FC<{
  onLocationSelect: (lat: number, lng: number) => void;
  initialLat: number;
  initialLng: number;
  height: string;
}> = ({ onLocationSelect, initialLat, initialLng, height }) => {
  return (
    <div
      className="flex items-center justify-center border rounded-lg bg-muted/30"
      style={{ height }}>
      <div className="text-center">
        <Map className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Map Location Picker</p>
        <Button
          size="sm"
          className="mt-2"
          onClick={() => onLocationSelect(-6.2, 106.816)}>
          Select Location
        </Button>
      </div>
    </div>
  );
};

export default function WisataPage() {
  // SWR hook for data fetching
  const {
    data: wisataData = [],
    error,
    isLoading,
    mutate: mutateWisata,
  } = useSWR<Wisata[]>("/api/wisata", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 5000,
  });

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
  const [expandedWisata, setExpandedWisata] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // New states for map picker
  const [selectedLatitude, setSelectedLatitude] = useState<number>(0);
  const [selectedLongitude, setSelectedLongitude] = useState<number>(0);
  const [editSelectedLatitude, setEditSelectedLatitude] = useState<number>(0);
  const [editSelectedLongitude, setEditSelectedLongitude] = useState<number>(0);
  const [locationInputMethod, setLocationInputMethod] = useState<
    "manual" | "map"
  >("manual");

  const addFormRef = useRef<HTMLFormElement>(null);
  const editFormRef = useRef<HTMLFormElement>(null);

  // Filter wisata data based on search term and active tab
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

  // Show error toast when SWR error occurs
  useEffect(() => {
    if (error) {
      toast.error(
        error.message || "Gagal memuat data wisata. Silakan coba lagi."
      );
    }
  }, [error]);

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

      // Use coordinates from map picker if map method is selected
      let latitude: number;
      let longitude: number;

      if (locationInputMethod === "map") {
        latitude = selectedLatitude;
        longitude = selectedLongitude;
        formData.set("latitude", selectedLatitude.toString());
        formData.set("longitude", selectedLongitude.toString());
      } else {
        latitude = Number.parseFloat(
          formData.get("latitude")?.toString() || "0"
        );
        longitude = Number.parseFloat(
          formData.get("longitude")?.toString() || "0"
        );
      }

      const name = formData.get("name")?.toString();
      const description = formData.get("description")?.toString();
      const location = formData.get("location")?.toString();

      if (!name || !description || !location || !latitude || !longitude) {
        throw new Error("Semua field wajib diisi");
      }

      if (latitude === 0 && longitude === 0) {
        throw new Error(
          "Silakan pilih lokasi pada peta atau masukkan koordinat manual"
        );
      }

      // Validate time format if provided
      const openingTime = formData.get("openingTime")?.toString();
      const closingTime = formData.get("closingTime")?.toString();
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

      if (openingTime && !timeRegex.test(openingTime)) {
        throw new Error("Format jam buka tidak valid (gunakan HH:MM)");
      }
      if (closingTime && !timeRegex.test(closingTime)) {
        throw new Error("Format jam tutup tidak valid (gunakan HH:MM)");
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.floor(Math.random() * 15);
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 500);

      // Optimistic update - add temporary item
      const tempWisata: Wisata = {
        id: Date.now(), // temporary ID
        name: name,
        description: description,
        location: location,
        type: formData.get("type")?.toString() || null,
        latitude: latitude,
        longitude: longitude,
        images: previewImages,
        reviews: 0,
        isVerified: false,
        ticketPrice: Number(formData.get("ticketPrice")) || 0,
        openingTime: openingTime || undefined,
        closingTime: closingTime || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Optimistic update
      mutateWisata([...wisataData, tempWisata], false);

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

      // Revalidate data from server
      mutateWisata();

      setOpenAddDialog(false);
      setPreviewImages([]);
      setSelectedLatitude(0);
      setSelectedLongitude(0);
      setLocationInputMethod("manual");
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

      // Revert optimistic update on error
      mutateWisata();
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

      // Validate time format if provided
      const openingTime = formData.get("openingTime")?.toString();
      const closingTime = formData.get("closingTime")?.toString();
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

      if (openingTime && !timeRegex.test(openingTime)) {
        throw new Error("Format jam buka tidak valid (gunakan HH:MM)");
      }
      if (closingTime && !timeRegex.test(closingTime)) {
        throw new Error("Format jam tutup tidak valid (gunakan HH:MM)");
      }

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.floor(Math.random() * 15);
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 500);

      // Optimistic update
      const updatedWisata: Wisata = {
        ...selectedWisata,
        name: name,
        description: description,
        location: location,
        type: formData.get("type")?.toString() || null,
        latitude: Number.parseFloat(latitude),
        longitude: Number.parseFloat(longitude),
        ticketPrice: Number(formData.get("ticketPrice")) || 0,
        openingTime: openingTime || undefined,
        closingTime: closingTime || undefined,
        updatedAt: new Date().toISOString(),
      };

      mutateWisata(
        wisataData.map((w) => (w.id === selectedWisata.id ? updatedWisata : w)),
        false
      );

      const response = await fetch(
        `/api/admin/wisata?id=${selectedWisata.id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

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

      // Revalidate data from server
      mutateWisata();

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

      // Revert optimistic update on error
      mutateWisata();
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
      // Optimistic update - remove item immediately
      mutateWisata(
        wisataData.filter((w) => w.id !== wisataToDelete.id),
        false
      );

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

      // Revalidate data from server
      mutateWisata();

      toast.success("Wisata berhasil dihapus");
    } catch (error) {
      console.error("Error deleting wisata:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal menghapus wisata. Silakan coba lagi."
      );

      // Revert optimistic update on error
      mutateWisata();
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

  const handleVerify = async (wisata: Wisata) => {
    try {
      const toastId = toast.loading(
        wisata.isVerified
          ? "Membatalkan verifikasi wisata..."
          : "Memverifikasi wisata..."
      );

      // Optimistic update
      const updatedWisata = { ...wisata, isVerified: !wisata.isVerified };
      mutateWisata(
        wisataData.map((w) => (w.id === wisata.id ? updatedWisata : w)),
        false
      );

      const formData = new FormData();
      formData.append("isVerified", (!wisata.isVerified).toString());

      const response = await fetch(`/api/admin/wisata?id=${wisata.id}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const result = await response.json();

      // Revalidate data from server
      mutateWisata();

      toast.dismiss(toastId);
      toast.success(result.message);
    } catch (error) {
      console.error("Error updating verification status:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal memperbarui status verifikasi. Silakan coba lagi."
      );

      // Revert optimistic update on error
      mutateWisata();
    }
  };

  const getVerifiedCount = () => {
    return wisataData.filter((wisata) => wisata.isVerified).length;
  };

  const getUnverifiedCount = () => {
    return wisataData.filter((wisata) => !wisata.isVerified).length;
  };

  // Show loading state
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

  // Show error state
  if (error) {
    return (
      <div className="container py-10 mx-auto">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-lg font-medium text-red-600">
            Error loading data
          </div>
          <p className="max-w-md mt-2 text-sm text-muted-foreground">
            {error.message}
          </p>
          <Button
            onClick={() => mutateWisata()}
            className="mt-4"
            variant="outline">
            Retry
          </Button>
        </div>
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
            <WisataPdfButton />
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
                              Latitude
                            </Label>
                            <Input
                              id="latitude"
                              name="latitude"
                              type="number"
                              step="any"
                              placeholder="Latitude"
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
                              placeholder="Longitude"
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

      {/* Card-based UI Tampilan Data Wisata */}
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
                Tambahkan wisata baru dengan mengklik tombol "Tambah Wisata" di
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

                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={wisata.isVerified ? "outline" : "default"}
                            size="sm"
                            className={
                              wisata.isVerified
                                ? "border-green-200 text-green-600 hover:bg-green-50"
                                : "bg-primary"
                            }
                            onClick={() => handleVerify(wisata)}>
                            {wisata.isVerified ? (
                              <>
                                <X className="w-4 h-4 mr-1" />
                                Batalkan
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4 mr-1" />
                                Verifikasi
                              </>
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {wisata.isVerified
                              ? "Batalkan verifikasi"
                              : "Verifikasi wisata"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-blue-600 bg-transparent border-blue-200 hover:bg-blue-50"
                            onClick={() => handleEdit(wisata)}>
                            <Pencil className="w-4 h-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit wisata</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-600 bg-transparent border-red-200 hover:bg-red-50"
                            onClick={() => handleDelete(wisata)}>
                            <Trash2 className="w-4 h-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Hapus wisata</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={openEditDialog}
        onOpenChange={setOpenEditDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
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
                      <SelectItem value="Geologi">Geologi</SelectItem>
                      <SelectItem value="Biologi">Biologi</SelectItem>
                      <SelectItem value="Budaya">Budaya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid items-center grid-cols-4 gap-4">
                  <Label
                    htmlFor="edit-ticketPrice"
                    className="text-right">
                    Harga Tiket
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="edit-ticketPrice"
                      name="ticketPrice"
                      type="number"
                      min="0"
                      step="1000"
                      defaultValue={selectedWisata.ticketPrice || ""}
                      placeholder="0 (kosongkan jika gratis)"
                      className="w-full"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Masukkan 0 atau kosongkan jika gratis
                    </p>
                  </div>
                </div>

                <div className="grid items-center grid-cols-4 gap-4">
                  <Label className="text-right">Jam Operasional</Label>
                  <div className="grid grid-cols-2 col-span-3 gap-3">
                    <div>
                      <Label
                        htmlFor="edit-openingTime"
                        className="text-sm">
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
                    <div>
                      <Label
                        htmlFor="edit-closingTime"
                        className="text-sm">
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
                                src={image || "/placeholder.svg"}
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
