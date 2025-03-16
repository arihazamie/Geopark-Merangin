"use client";

import { DialogFooter } from "@/components/ui/dialog";

import { DialogTrigger } from "@/components/ui/dialog";
import type React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  PlusCircle,
  Search,
  Trash2,
  FileText,
  Star,
  Upload,
  Check,
  X,
  User,
  Calendar,
  Pencil,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingTable } from "@/components/ui/loading-spinner";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { ArtikelPdfButton } from "../export/artikel/Button";
import Image from "next/image";

interface Ulasan {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  pengguna?: {
    id: number;
    name: string;
  };
}

// Update the Artikel interface to match the API response
interface Artikel {
  id: number;
  title: string;
  description: string;
  content: string;
  image: string;
  createdAt: string;
  updatedAt: string;
  isVerified?: boolean;
  pengelola?: {
    id: number;
    name: string;
    email: string;
  } | null;
  updatedBy?: {
    id: number;
    name: string;
    email: string;
  } | null;
  ulasans?: Ulasan[];
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ArtikelPage() {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedArtikel, setSelectedArtikel] = useState<Artikel | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [artikelData, setArtikelData] = useState<Artikel[]>([]);
  const [filteredArtikel, setFilteredArtikel] = useState<Artikel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [artikelToDelete, setArtikelToDelete] = useState<Artikel | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Add activeTab state after the other state declarations
  const [activeTab, setActiveTab] = useState<"all" | "verified" | "unverified">(
    "all"
  );

  const addFormRef = useRef<HTMLFormElement>(null);
  const editFormRef = useRef<HTMLFormElement>(null);

  // Add a formError state to handle API errors
  const [formError, setFormError] = useState<string | null>(null);

  // Replace the existing fetchArtikel function with this memoized version
  // Place this before the first useEffect that uses it
  const fetchArtikel = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/artikel?page=${pagination.page}&limit=${pagination.limit}`,
        { cache: "no-store" } // Prevent caching of the GET request
      );
      if (!response.ok) {
        throw new Error("Failed to fetch artikel data");
      }
      const data = await response.json();
      console.log("Fetched Articles:", data.data);
      setArtikelData(data.data);
      setFilteredArtikel(data.data);
      // Note: Pagination isn’t implemented in the API, so this might need adjustment
      setPagination((prev) => ({
        ...prev,
        total: data.data.length, // Temporary fix since API doesn’t return pagination
        totalPages: 1,
      }));
    } catch (error) {
      console.error("Error fetching artikel:", error);
      toast.error("Gagal memuat data artikel. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit]); // Add dependencies that fetchArtikel uses

  useEffect(() => {
    fetchArtikel();
  }, [fetchArtikel]); // Include fetchArtikel in the dependency array

  // Update the useEffect for filtering to include tab filtering
  useEffect(() => {
    if (artikelData.length > 0) {
      let filtered = artikelData;

      // Filter by tab
      if (activeTab === "verified") {
        filtered = filtered.filter((artikel) => artikel.isVerified);
      } else if (activeTab === "unverified") {
        filtered = filtered.filter((artikel) => !artikel.isVerified);
      }

      // Filter by search term
      if (searchTerm) {
        filtered = filtered.filter(
          (artikel) =>
            artikel.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            artikel.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            (artikel.pengelola?.name &&
              artikel.pengelola.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase()))
        );
      }
      setFilteredArtikel(filtered);
    }
  }, [searchTerm, artikelData, activeTab]);

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    isEdit = false
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Replace the handleAddArtikel function with this implementation
  const handleAddArtikel = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData(e.currentTarget);

      const progressInterval = setInterval(() => {
        setUploadProgress((prevProgress) => {
          if (prevProgress >= 95) {
            clearInterval(progressInterval);
            return prevProgress;
          }
          return prevProgress + 5;
        });
      }, 500);

      const response = await fetch("/api/artikel", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add artikel");
      }

      await fetchArtikel();
      setOpenAddDialog(false);
      toast.success("Artikel berhasil ditambahkan");
      if (addFormRef.current) addFormRef.current.reset();
      setPreviewImage(null);
    } catch (error) {
      console.error("Error adding artikel:", error);
      setFormError(
        error instanceof Error
          ? error.message
          : "Gagal menambahkan artikel. Silakan coba lagi."
      );
      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal menambahkan artikel. Silakan coba lagi."
      );
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  // Replace the handleEditArtikel function with this implementation
  const handleEditArtikel = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedArtikel) return;

    setIsSubmitting(true);
    setFormError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData(e.currentTarget);

      const progressInterval = setInterval(() => {
        setUploadProgress((prevProgress) => {
          if (prevProgress >= 95) {
            clearInterval(progressInterval);
            return prevProgress;
          }
          return prevProgress + 5;
        });
      }, 500);

      const response = await fetch(`/api/artikel?id=${selectedArtikel.id}`, {
        method: "PUT",
        body: formData,
        cache: "no-store",
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update artikel");
      }

      const result = await response.json();
      console.log("API Response:", result);

      const updatedArtikel = result.data;
      setArtikelData((prev) =>
        prev.map((a) =>
          a.id === selectedArtikel.id ? { ...a, ...updatedArtikel } : a
        )
      );
      setFilteredArtikel((prev) =>
        prev.map((a) =>
          a.id === selectedArtikel.id ? { ...a, ...updatedArtikel } : a
        )
      );

      setOpenEditDialog(false);
      toast.success(result.message || "Artikel berhasil diperbarui");
      setPreviewImage(null);
    } catch (error) {
      console.error("Error updating artikel:", error);
      setFormError(
        error instanceof Error
          ? error.message
          : "Gagal memperbarui artikel. Silakan coba lagi."
      );
      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal memperbarui artikel. Silakan coba lagi."
      );
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (artikel: Artikel) => {
    setArtikelToDelete(artikel);
    setOpenDeleteDialog(true);
  };

  // Replace the confirmDelete function with this implementation
  const confirmDelete = async () => {
    if (!artikelToDelete) return;

    try {
      const toastId = toast.loading("Menghapus artikel...");

      const response = await fetch(`/api/artikel?id=${artikelToDelete.id}`, {
        method: "DELETE",
        cache: "no-store", // Prevent caching of the DELETE request
      });

      const result = await response.json();
      console.log("DELETE Response:", result);

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete artikel");
      }

      // Refresh data
      await fetchArtikel();
      console.log("Updated artikelData:", artikelData);

      toast.dismiss(toastId);
      toast.success(result.message || "Artikel berhasil dihapus");
    } catch (error) {
      console.error("Error deleting artikel:", error);
      toast.dismiss();
      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal menghapus artikel. Silakan coba lagi."
      );
    } finally {
      setOpenDeleteDialog(false);
      setArtikelToDelete(null);
    }
  };

  const handleEdit = (artikel: Artikel) => {
    setSelectedArtikel(artikel);
    setFormError(null);
    setPreviewImage(artikel.image);
    setOpenEditDialog(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Add these functions after the formatDate function
  const getVerifiedCount = () => {
    return artikelData.filter((artikel) => artikel.isVerified).length;
  };

  const getUnverifiedCount = () => {
    return artikelData.filter((artikel) => !artikel.isVerified).length;
  };

  const [pengelolaData, setPengelolaData] = useState<Artikel[]>([]);

  // Replace the handleVerificationToggle function with this implementation
  const handleVerificationToggle = async (artikel: Artikel) => {
    try {
      const toastId = toast.loading(
        artikel.isVerified
          ? "Membatalkan verifikasi artikel..."
          : "Memverifikasi artikel..."
      );

      const response = await fetch(`/api/admin/artikel?id=${artikel.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isVerified: !artikel.isVerified,
        }),
      });

      const result = await response.json();
      console.log("API Response:", result); // Debug: Check the response

      if (!response.ok) {
        throw new Error(result.error || "Failed to update verification status");
      }

      const updatedArtikel = result.data;
      console.log("Updated Artikel:", updatedArtikel); // Debug: Check the updated data

      // Update state immutably and force re-render
      setArtikelData((prev) =>
        prev.map((a) => (a.id === artikel.id ? { ...a, ...updatedArtikel } : a))
      );
      setFilteredArtikel((prev) =>
        prev.map((a) => (a.id === artikel.id ? { ...a, ...updatedArtikel } : a))
      );

      toast.dismiss(toastId);
      toast.success(result.message || "Status verifikasi berhasil diperbarui");
    } catch (error) {
      console.error("Error updating verification status:", error);
      toast.dismiss(); // Dismiss loading toast on error
      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal memperbarui status verifikasi. Silakan coba lagi."
      );
    }
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4">
              <div className="p-3 bg-gray-200 rounded-full dark:bg-gray-800 animate-pulse">
                <div className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <div className="w-32 h-4 rounded-md bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 animate-pulse" />
                <div className="w-16 h-6 rounded-md bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
        <LoadingTable />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="container py-10 mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Artikel</h1>
          <p className="mt-2 text-muted-foreground">
            Kelola artikel dalam satu tempat
          </p>
        </div>
        <div>
          <div className="flex items-center gap-4">
            <div className="relative flex gap-5">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari artikel..."
                className="pl-8 w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <ArtikelPdfButton />
            </div>
            <Dialog
              open={openAddDialog}
              onOpenChange={setOpenAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Tambah Artikel
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Tambah Artikel Baru</DialogTitle>
                  <DialogDescription>
                    Masukkan informasi lengkap tentang artikel baru.
                  </DialogDescription>
                </DialogHeader>
                <form
                  ref={addFormRef}
                  onSubmit={handleAddArtikel}>
                  <div className="grid gap-4 py-4">
                    <div className="grid items-center grid-cols-4 gap-4">
                      <Label
                        htmlFor="title"
                        className="text-right">
                        Judul
                      </Label>
                      <Input
                        id="title"
                        name="title"
                        placeholder="Judul artikel"
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
                        placeholder="Deskripsi artikel"
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid items-center grid-cols-4 gap-4">
                      <Label
                        htmlFor="content"
                        className="text-right">
                        Konten
                      </Label>
                      <Textarea
                        id="content"
                        name="content"
                        placeholder="Konten artikel"
                        className="col-span-3"
                        rows={5}
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

                        {previewImage && (
                          <div className="relative overflow-hidden border rounded-md aspect-video">
                            <Image
                              src={previewImage || "/placeholder.svg"}
                              alt="Preview"
                              className="object-cover w-full h-full"
                            />
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
                        setPreviewImage(null);
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
      </div>

      <div className="flex flex-col items-start justify-between gap-4 mb-8 sm:flex-row sm:items-center">
        {/* Add the tabs UI after the header section and before the Card component */}
        <div className="inline-flex p-1 rounded-lg shadow-sm bg-muted/60 backdrop-blur-sm">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "all"
                ? "bg-background text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}>
            <FileText className="w-4 h-4" />
            <span>Semua Artikel</span>
            <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {artikelData.length}
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

      {/* Replace the Card and Table section with this simplified UI */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium">Daftar Artikel</h3>
        </div>
        <div className="divide-y">
          {filteredArtikel.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="w-12 h-12 mb-4 text-muted-foreground" />
              <div className="text-lg font-medium">Tidak ada data artikel</div>
              <p className="max-w-md mt-2 text-sm text-muted-foreground">
                Tambahkan artikel baru dengan mengklik tombol "Tambah Artikel"
                di bagian atas.
              </p>
            </div>
          ) : (
            filteredArtikel.map((artikel) => (
              <div
                key={artikel.id}
                className="p-4 transition-colors hover:bg-muted/30">
                <div className="flex items-start gap-4">
                  <Avatar className="flex-shrink-0 w-16 h-16 rounded-md">
                    <AvatarImage
                      src={artikel.image}
                      alt={artikel.title}
                      className="object-cover"
                    />
                    <AvatarFallback className="rounded-md">
                      {artikel.title.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{artikel.title}</h4>
                      {artikel.isVerified ? (
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
                      {artikel.description}
                    </p>

                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <User className="w-3.5 h-3.5 mr-1" />
                        {artikel.pengelola?.name || "N/A"}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1" />
                        {formatDate(artikel.createdAt)}
                      </span>
                      {artikel.ulasans && artikel.ulasans.length > 0 && (
                        <span className="flex items-center">
                          <Star className="w-3.5 h-3.5 mr-1 text-yellow-500" />
                          {(
                            artikel.ulasans.reduce(
                              (acc, ulasan) => acc + ulasan.rating,
                              0
                            ) / artikel.ulasans.length
                          ).toFixed(1)}
                          <span className="ml-1">
                            ({artikel.ulasans.length})
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={artikel.isVerified ? "outline" : "default"}
                            size="sm"
                            className={
                              artikel.isVerified
                                ? "border-green-200 text-green-600 hover:bg-green-50"
                                : "bg-primary"
                            }
                            onClick={() => handleVerificationToggle(artikel)}>
                            {artikel.isVerified ? (
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
                            {artikel.isVerified
                              ? "Batalkan verifikasi"
                              : "Verifikasi artikel"}
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
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            onClick={() => handleEdit(artikel)}>
                            <Pencil className="w-4 h-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit artikel</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleDelete(artikel)}>
                            <Trash2 className="w-4 h-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Hapus artikel</p>
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

      <Dialog
        open={openEditDialog}
        onOpenChange={setOpenEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Artikel</DialogTitle>
            <DialogDescription>Ubah informasi artikel.</DialogDescription>
          </DialogHeader>
          {selectedArtikel && (
            <form
              ref={editFormRef}
              onSubmit={handleEditArtikel}>
              <div className="grid gap-4 py-4">
                <div className="grid items-center grid-cols-4 gap-4">
                  <Label
                    htmlFor="edit-title"
                    className="text-right">
                    Judul
                  </Label>
                  <Input
                    id="edit-title"
                    name="title"
                    defaultValue={selectedArtikel.title}
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
                    defaultValue={selectedArtikel.description}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid items-center grid-cols-4 gap-4">
                  <Label
                    htmlFor="edit-content"
                    className="text-right">
                    Konten
                  </Label>
                  <Textarea
                    id="edit-content"
                    name="content"
                    defaultValue={selectedArtikel.content}
                    className="col-span-3"
                    rows={5}
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
                    <div className="flex items-center gap-2">
                      <div className="relative w-full p-2 border rounded-md">
                        <Input
                          id="edit-images"
                          name="images"
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 z-10 w-full opacity-0 cursor-pointer"
                          onChange={(e) => handleImageChange(e, true)}
                        />
                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                          <Upload className="w-4 h-4" />
                          <span>Pilih gambar baru atau seret ke sini</span>
                        </div>
                      </div>
                    </div>
                    {previewImage && (
                      <div className="relative overflow-hidden border rounded-md aspect-video">
                        <Image
                          src={previewImage || "/placeholder.svg"}
                          alt="Preview"
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}
                  </div>
                </div>
                {/* <div className="grid items-center grid-cols-4 gap-4">
                  <Label
                    htmlFor="edit-isVerified"
                    className="text-right">
                    Status Verifikasi
                  </Label>
                  <div className="flex items-center col-span-3 gap-2">
                    <Switch
                      id="edit-isVerified"
                      name="isVerified"
                      checked={selectedArtikel.isVerified || false}
                      onCheckedChange={(checked) => {
                        if (selectedArtikel) {
                          setSelectedArtikel({
                            ...selectedArtikel,
                            isVerified: checked,
                          });
                        }
                      }}
                      // Disable for non-admins if needed (optional)
                      // disabled={session.user.role !== "ADMIN"}
                    />
                    <Label
                      htmlFor="edit-isVerified"
                      className="cursor-pointer">
                      {selectedArtikel.isVerified
                        ? "Terverifikasi"
                        : "Belum Terverifikasi"}
                    </Label>
                  </div>
                </div> */}
                {/* Rest of the form (e.g., ulasans) remains unchanged */}
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
                    setPreviewImage(null);
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
        title="Hapus Artikel"
        description="Apakah Anda yakin ingin menghapus artikel ini? Tindakan ini tidak dapat dibatalkan."
        itemName={artikelToDelete?.title}
      />
    </motion.div>
  );
}
