"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

interface ApiResponse {
  success: boolean;
  data: {
    pengelola: Pengelola[];
  };
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
const fetcher = async (url: string): Promise<Pengelola[]> => {
  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json();
    if (response.status === 401) {
      throw new Error(errorData.message || "Autentikasi diperlukan");
    } else {
      throw new Error(errorData.message || "Failed to fetch pengelola data");
    }
  }

  const data: ApiResponse = await response.json();
  return data.data?.pengelola || [];
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

export default function PengelolaPage() {
  // SWR hook for data fetching
  const {
    data: pengelolaData = [],
    error,
    isLoading,
    mutate: mutatePengelola,
  } = useSWR<Pengelola[]>("/api/pengelola", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 5000,
  });

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedPengelola, setSelectedPengelola] = useState<Pengelola | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPengelola, setFilteredPengelola] = useState<Pengelola[]>([]);
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

  // Filter pengelola data based on search term and active tab
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

  // Show error toast when SWR error occurs
  useEffect(() => {
    if (error) {
      handleAuthError(error);
    }
  }, [error]);

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

      // Create temporary pengelola for optimistic update
      const tempPengelola: Pengelola = {
        id: Date.now(), // temporary ID
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        notelp: formData.get("noTelepon") as string,
        isVerified: false,
        image: previewImage,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Optimistic update
      mutatePengelola([...pengelolaData, tempPengelola], false);

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

      // Revalidate data from server
      mutatePengelola();

      setOpenAddDialog(false);
      setPreviewImage(null);
      if (addFormRef.current) addFormRef.current.reset();
      toast.success("Pengelola berhasil ditambahkan");
    } catch (error) {
      console.error("Error adding pengelola:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Gagal menambahkan pengelola. Silakan coba lagi.";
      setFormError(message);
      toast.error(message);

      // Revert optimistic update on error
      mutatePengelola();
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

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

      const pengelolaUpdateData = {
        id: selectedPengelola.id,
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        notelp: formData.get("notelp") as string,
        password: password || undefined,
        isVerified: formData.get("isVerified") === "on",
      };

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.floor(Math.random() * 15);
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 500);

      // Optimistic update
      const updatedPengelola: Pengelola = {
        ...selectedPengelola,
        name: pengelolaUpdateData.name,
        email: pengelolaUpdateData.email,
        notelp: pengelolaUpdateData.notelp,
        isVerified: pengelolaUpdateData.isVerified,
        updatedAt: new Date().toISOString(),
      };

      mutatePengelola(
        pengelolaData.map((p: Pengelola) =>
          p.id === selectedPengelola.id ? updatedPengelola : p
        ),
        false
      );

      const response = await fetch("/api/pengelola", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pengelolaUpdateData),
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

      // Revalidate data from server
      mutatePengelola();

      setOpenEditDialog(false);
      setPreviewImage(null);
      toast.success("Pengelola berhasil diperbarui");
    } catch (error) {
      console.error("Error updating pengelola:", error);
      handleAuthError(error);

      // Revert optimistic update on error
      mutatePengelola();
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = (pengelola: Pengelola) => {
    setPengelolaToDelete(pengelola);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!pengelolaToDelete) return;

    try {
      // Optimistic update - remove item immediately
      mutatePengelola(
        pengelolaData.filter((p) => p.id !== pengelolaToDelete.id),
        false
      );

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

      // Revalidate data from server
      mutatePengelola();

      toast.success("Pengelola berhasil dihapus");
    } catch (error) {
      console.error("Error deleting pengelola:", error);
      handleAuthError(error);

      // Revert optimistic update on error
      mutatePengelola();
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

  const handleVerificationToggle = async (pengelola: Pengelola) => {
    // If already verified, show info message that API doesn't support unverifying
    if (pengelola.isVerified) {
      toast.info("Fitur pembatalan verifikasi belum tersedia di API");
      return;
    }

    try {
      const toastId = toast.loading("Memverifikasi pengelola...");

      // Optimistic update
      const updatedPengelola = { ...pengelola, isVerified: true };
      mutatePengelola(
        pengelolaData.map((p) =>
          p.id === pengelola.id ? updatedPengelola : p
        ),
        false
      );

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

      // Revalidate data from server
      mutatePengelola();

      toast.dismiss(toastId);
      toast.success("Pengelola berhasil diverifikasi");
    } catch (error) {
      console.error("Error verifying pengelola:", error);
      handleAuthError(error);

      // Revert optimistic update on error
      mutatePengelola();
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
    } else {
      toast.error(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan. Silakan coba lagi."
      );
    }
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
            onClick={() => mutatePengelola()}
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
                        src={
                          pengelola.image ||
                          "/placeholder.svg?height=64&width=64"
                        }
                        width={64}
                        height={64}
                        alt={pengelola.name}
                        className="object-cover w-full h-full rounded-md"
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
                            className="text-blue-600 bg-transparent border-blue-200 hover:bg-blue-50"
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
                            className="text-red-600 bg-transparent border-red-200 hover:bg-red-50"
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

      {/* Edit Dialog */}
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
