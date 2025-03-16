"use client";

import { DialogFooter } from "@/components/ui/dialog";

import { DialogTrigger } from "@/components/ui/dialog";

import type React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  PlusCircle,
  Search,
  Pencil,
  Trash2,
  User,
  Check,
  X,
  Mail,
  Phone,
  Shield,
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
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LoadingCards } from "@/components/ui/loading-spinner";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import { PengelolaPdfButton } from "../export/pengelola/Button";

interface Pengelola {
  id: number;
  name: string;
  email: string;
  notelp: string;
  isVerified: boolean;
  image?: string | null;
  verifiedById?: number | null;
  createdAt: string;
  updatedAt: string;
  verifiedBy?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

export default function PengelolaPage() {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedPengelola, setSelectedPengelola] = useState<Pengelola | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [pengelolaData, setPengelolaData] = useState<Pengelola[]>([]);
  const [filteredPengelola, setFilteredPengelola] = useState<Pengelola[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [pengelolaToDelete, setPengelolaToDelete] = useState<Pengelola | null>(
    null
  );
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "verified" | "unverified">(
    "all"
  );
  const [formError, setFormError] = useState<string | null>(null);

  const addFormRef = useRef<HTMLFormElement>(null);
  const editFormRef = useRef<HTMLFormElement>(null);

  const fetchPengelola = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/pengelola");

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          handleAuthError(errorData);
        } else {
          throw new Error(
            errorData.message || "Failed to fetch pengelola data"
          );
        }
      }

      const data = await response.json();
      // Update to handle the correct API response structure
      setPengelolaData(data.data?.pengelola || []);
      setFilteredPengelola(data.data?.pengelola || []);
    } catch (error) {
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPengelola();
  }, [fetchPengelola]);

  useEffect(() => {
    if (pengelolaData.length > 0) {
      let filtered = pengelolaData;

      // Filter by tab
      if (activeTab === "verified") {
        filtered = filtered.filter((pengelola) => pengelola.isVerified);
      } else if (activeTab === "unverified") {
        filtered = filtered.filter((pengelola) => !pengelola.isVerified);
      }

      // Filter by search term
      if (searchTerm) {
        filtered = filtered.filter(
          (pengelola) =>
            pengelola.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pengelola.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pengelola.notelp.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setFilteredPengelola(filtered);
    }
  }, [searchTerm, pengelolaData, activeTab]);

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    isEdit = false
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Store the file in the form data
      if (!isEdit && addFormRef.current) {
        const formData = new FormData(addFormRef.current);
        formData.set("image", file);
      } else if (isEdit && editFormRef.current && selectedPengelola) {
        const formData = new FormData(editFormRef.current);
        formData.set("image", file);
      }

      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Update the handleAddPengelola function to use the correct API path
  const handleAddPengelola = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setUploadProgress(10);

    try {
      const formData = new FormData(e.currentTarget);

      // Validate password length
      const password = formData.get("password") as string;
      if (password.length < 8) {
        throw new Error("Kata sandi harus minimal 8 karakter");
      }

      // Add role to formData
      formData.append("role", "PENGELOLA");

      // Handle image upload
      const imageFile = formData.get("image") as File;
      if (imageFile && imageFile.size > 0) {
        formData.set("image", imageFile);
      } else {
        formData.delete("image");
      }

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.floor(Math.random() * 15);
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 500);

      const response = await fetch("/api/pengelola", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menambahkan pengelola");
      }

      await fetchPengelola();
      setOpenAddDialog(false);
      setPreviewImage(null);
      if (addFormRef.current) addFormRef.current.reset();
      toast.success("Pengelola berhasil ditambahkan");
    } catch (error) {
      console.error("Error adding pengelola:", error);
      setFormError(
        error instanceof Error
          ? error.message
          : "Gagal menambahkan pengelola. Silakan coba lagi."
      );
      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal menambahkan pengelola. Silakan coba lagi."
      );
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  // Update the handleEditPengelola function to use the correct API path
  const handleEditPengelola = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPengelola) return;

    setIsSubmitting(true);
    setFormError(null);
    setUploadProgress(10);

    try {
      const formData = new FormData(e.currentTarget);
      const password = formData.get("password") as string;

      // Validate password if provided
      if (password && password.length > 0 && password.length < 8) {
        throw new Error("Kata sandi harus minimal 8 karakter");
      }

      const pengelolaData = {
        id: selectedPengelola.id,
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        notelp: formData.get("notelp") as string,
        password: password || undefined, // Only include password if it's not empty
        isVerified: formData.get("isVerified") === "on",
      };

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.floor(Math.random() * 15);
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 500);

      const response = await fetch("/api/pengelola", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pengelolaData),
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          handleAuthError(result);
        } else {
          throw new Error(result.message || "Gagal memperbarui pengelola");
        }
      }

      await fetchPengelola();
      setOpenEditDialog(false);
      setPreviewImage(null);
      toast.success("Pengelola berhasil diperbarui");
    } catch (error) {
      console.error("Error updating pengelola:", error);
      handleAuthError(error);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = (pengelola: Pengelola) => {
    setPengelolaToDelete(pengelola);
    setOpenDeleteDialog(true);
  };

  // Update the confirmDelete function to use the correct API path
  const confirmDelete = async () => {
    if (!pengelolaToDelete) return;

    try {
      const response = await fetch("/api/pengelola", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: pengelolaToDelete.id }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          handleAuthError(result);
        } else {
          throw new Error(result.message || "Gagal menghapus pengelola");
        }
      }

      await fetchPengelola();
      toast.success("Pengelola berhasil dihapus");
    } catch (error) {
      console.error("Error deleting pengelola:", error);
      handleAuthError(error);
    } finally {
      setOpenDeleteDialog(false);
      setPengelolaToDelete(null);
    }
  };

  const handleEdit = (pengelola: Pengelola) => {
    setSelectedPengelola(pengelola);
    setFormError(null);
    setOpenEditDialog(true);
  };

  // Update the handleVerificationToggle function to use the correct API path
  const handleVerificationToggle = async (pengelola: Pengelola) => {
    // If already verified, show info message that API doesn't support unverifying
    if (pengelola.isVerified) {
      toast.info("Fitur pembatalan verifikasi belum tersedia di API");
      return;
    }

    try {
      // Show loading toast
      const toastId = toast.loading("Memverifikasi pengelola...");

      // Call the verification API endpoint
      const response = await fetch(`/api/pengelola`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: pengelola.id,
          isVerified: true,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          handleAuthError(result);
        } else {
          throw new Error(
            result.message || result.error || "Gagal memverifikasi pengelola"
          );
        }
      }

      // Update local state with the updated data from the API
      const updatedPengelola = result.data;
      const updatedData = pengelolaData.map((p) =>
        p.id === pengelola.id ? updatedPengelola : p
      );

      setPengelolaData(updatedData);
      setFilteredPengelola(
        filteredPengelola.map((p) =>
          p.id === pengelola.id ? updatedPengelola : p
        )
      );

      // Dismiss loading toast and show success toast
      toast.dismiss(toastId);
      toast.success("Pengelola berhasil diverifikasi");
    } catch (error) {
      console.error("Error verifying pengelola:", error);
      handleAuthError(error);
    }
  };

  const getVerifiedCount = () => {
    return pengelolaData.filter((pengelola) => pengelola.isVerified).length;
  };

  const getUnverifiedCount = () => {
    return pengelolaData.filter((pengelola) => !pengelola.isVerified).length;
  };

  const getRoleBadgeColor = (role: string) => {
    return "bg-blue-100 text-blue-600 border-blue-200";
  };

  const handleAuthError = (error: any) => {
    if (error.message && error.message.includes("Autentikasi diperlukan")) {
      toast.error("Anda tidak memiliki izin untuk mengakses halaman ini");
      // Redirect to login page or show authentication dialog
      // window.location.href = "/login"
    } else {
      toast.error(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan. Silakan coba lagi."
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
        <LoadingCards />
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
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">
            Pengelola
          </h1>
          <p className="mt-2 text-muted-foreground">
            Kelola akun pengelola sistem dalam satu tempat
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex gap-5">
            <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari pengelola..."
              className="pl-10 pr-4 w-[250px] bg-background/60 backdrop-blur-sm border-muted"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <PengelolaPdfButton />
          </div>
          <Dialog
            open={openAddDialog}
            onOpenChange={setOpenAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <PlusCircle className="w-4 h-4 mr-2" />
                Tambah Pengelola
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Tambah Pengelola Baru</DialogTitle>
                <DialogDescription>
                  Masukkan informasi lengkap tentang pengelola baru.
                </DialogDescription>
              </DialogHeader>
              <form
                ref={addFormRef}
                onSubmit={handleAddPengelola}>
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
                      placeholder="Nama lengkap"
                      className="col-span-3"
                      maxLength={100}
                      required
                    />
                  </div>
                  <div className="grid items-center grid-cols-4 gap-4">
                    <Label
                      htmlFor="email"
                      className="text-right">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Email"
                      className="col-span-3"
                      required
                      pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                      title="Masukkan format email yang valid"
                    />
                  </div>
                  <div className="grid items-center grid-cols-4 gap-4">
                    <Label
                      htmlFor="noTelepon"
                      className="text-right">
                      Telepon
                    </Label>
                    <Input
                      id="noTelepon"
                      name="noTelepon"
                      placeholder="Nomor telepon"
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid items-center grid-cols-4 gap-4">
                    <Label
                      htmlFor="password"
                      className="text-right">
                      Password
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Minimal 8 karakter"
                        className="w-full"
                        required
                        minLength={8}
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        Password harus minimal 8 karakter
                      </p>
                    </div>
                  </div>
                  <div className="grid items-center grid-cols-4 gap-4">
                    <Label
                      htmlFor="image"
                      className="text-right">
                      Foto Profil
                    </Label>
                    <Input
                      id="image"
                      name="image"
                      type="file"
                      accept="image/*"
                      className="col-span-3"
                      onChange={(e) => handleImageChange(e)}
                    />
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

      <div className="flex flex-col items-start justify-between gap-4 mb-8 sm:flex-row sm:items-center">
        <div className="inline-flex p-1 rounded-lg shadow-sm bg-muted/60 backdrop-blur-sm">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "all"
                ? "bg-background text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}>
            <User className="w-4 h-4" />
            <span>Semua Pengelola</span>
            <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {pengelolaData.length}
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

      {/* Card-based UI */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium">Daftar Pengelola</h3>
        </div>
        <div className="divide-y">
          {filteredPengelola.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <User className="w-12 h-12 mb-4 text-muted-foreground" />
              <div className="text-lg font-medium">
                Tidak ada data pengelola
              </div>
              <p className="max-w-md mt-2 text-sm text-muted-foreground">
                Tambahkan pengelola baru dengan mengklik tombol "Tambah
                Pengelola" di bagian atas.
              </p>
            </div>
          ) : (
            filteredPengelola.map((pengelola) => (
              <div
                key={pengelola.id}
                className="p-4 transition-colors hover:bg-muted/30">
                <div className="flex items-start gap-4">
                  <Avatar className="flex-shrink-0 w-16 h-16 rounded-md">
                    <AvatarFallback className="rounded-md bg-primary/10 text-primary">
                      <Image
                        src={pengelola.image || "/avatar-placeholder.png"}
                        width={64}
                        height={64}
                        alt={pengelola.name}
                      />
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{pengelola.name}</h4>
                      {pengelola.isVerified ? (
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
                      <Badge
                        variant="outline"
                        className={getRoleBadgeColor("pengelola")}>
                        <Shield className="w-3.5 h-3.5 mr-1" />
                        Pengelola
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <Mail className="w-3.5 h-3.5 mr-1" />
                        {pengelola.email}
                      </span>
                      <span className="flex items-center">
                        <Phone className="w-3.5 h-3.5 mr-1" />
                        {pengelola.notelp}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={
                              pengelola.isVerified ? "outline" : "default"
                            }
                            size="sm"
                            className={
                              pengelola.isVerified
                                ? "border-green-200 text-green-600 hover:bg-green-50"
                                : "bg-primary"
                            }
                            onClick={() => handleVerificationToggle(pengelola)}
                            disabled={pengelola.isVerified}>
                            {pengelola.isVerified ? (
                              <>
                                <Check className="w-4 h-4 mr-1" />
                                Terverifikasi
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
                            {pengelola.isVerified
                              ? "Pengelola sudah terverifikasi"
                              : "Verifikasi pengelola"}
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
                            onClick={() => handleEdit(pengelola)}>
                            <Pencil className="w-4 h-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit pengelola</p>
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
                            onClick={() => handleDelete(pengelola)}>
                            <Trash2 className="w-4 h-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Hapus pengelola</p>
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
            <DialogTitle>Edit Pengelola</DialogTitle>
            <DialogDescription>Ubah informasi pengelola.</DialogDescription>
          </DialogHeader>
          {selectedPengelola && (
            <form
              ref={editFormRef}
              onSubmit={handleEditPengelola}>
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
                    defaultValue={selectedPengelola.name}
                    className="col-span-3"
                    maxLength={100}
                    required
                  />
                </div>
                <div className="grid items-center grid-cols-4 gap-4">
                  <Label
                    htmlFor="edit-email"
                    className="text-right">
                    Email
                  </Label>
                  <Input
                    id="edit-email"
                    name="email"
                    type="email"
                    defaultValue={selectedPengelola.email}
                    className="col-span-3"
                    required
                    pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                    title="Masukkan format email yang valid"
                  />
                </div>
                <div className="grid items-center grid-cols-4 gap-4">
                  <Label
                    htmlFor="edit-notelp"
                    className="text-right">
                    Telepon
                  </Label>
                  <Input
                    id="edit-notelp"
                    name="notelp"
                    defaultValue={selectedPengelola.notelp}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid items-center grid-cols-4 gap-4">
                  <Label
                    htmlFor="edit-password"
                    className="text-right">
                    Password
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="edit-password"
                      name="password"
                      type="password"
                      placeholder="Kosongkan jika tidak ingin mengubah password"
                      className="w-full"
                      minLength={8}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Biarkan kosong jika tidak ingin mengubah password. Jika
                      diisi, minimal 8 karakter.
                    </p>
                  </div>
                </div>
                <div className="grid items-center grid-cols-4 gap-4">
                  <Label
                    htmlFor="edit-isVerified"
                    className="text-right">
                    Status Verifikasi
                  </Label>
                  <div className="flex items-center col-span-3 gap-2">
                    <Switch
                      id="edit-isVerified"
                      name="isVerified"
                      checked={selectedPengelola?.isVerified || false}
                      onCheckedChange={(checked) => {
                        if (selectedPengelola) {
                          setSelectedPengelola({
                            ...selectedPengelola,
                            isVerified: checked,
                          });
                        }
                      }}
                    />
                    <Label
                      htmlFor="edit-isVerified"
                      className="cursor-pointer">
                      {selectedPengelola?.isVerified
                        ? "Terverifikasi"
                        : "Belum Terverifikasi"}
                    </Label>
                  </div>
                </div>
                {selectedPengelola.verifiedBy && (
                  <div className="grid items-center grid-cols-4 gap-4">
                    <Label className="text-right">Diverifikasi Oleh</Label>
                    <div className="col-span-3 text-sm text-muted-foreground">
                      {selectedPengelola.verifiedBy.name} (
                      {selectedPengelola.verifiedBy.email})
                    </div>
                  </div>
                )}
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
        title="Hapus Pengelola"
        description="Apakah Anda yakin ingin menghapus pengelola ini? Tindakan ini tidak dapat dibatalkan."
        itemName={pengelolaToDelete?.name}
      />
    </motion.div>
  );
}
