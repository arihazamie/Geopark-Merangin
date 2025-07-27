"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import {
  PlusCircle,
  Search,
  Pencil,
  Trash2,
  Calendar,
  Upload,
  Check,
  X,
  MapPin,
  Clock,
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
import { LoadingCards } from "@/components/ui/loading-spinner";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { EventPdfButton } from "../export/event/Button";

interface Event {
  id: number;
  title: string;
  description: string;
  image: string;
  startDate: string;
  endDate: string;
  wisataId: number;
  isVerified?: boolean;
  wisata?: {
    id: number;
    name: string;
  };
  pengelola?: {
    id: number;
    name: string;
  } | null;
  updatedBy?: {
    id: number;
    name: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

interface Wisata {
  id: number;
  name: string;
}

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  itemName?: string;
}

// SWR fetcher function for events
const eventFetcher = async (url: string): Promise<Event[]> => {
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

  const data = await response.json();
  return Array.isArray(data) ? data : [];
};

// SWR fetcher function for wisata list
const wisataFetcher = async (url: string): Promise<Wisata[]> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch wisata data");
  }

  const data = await response.json();

  // Handle different response formats
  if (Array.isArray(data)) {
    return data;
  } else if (data.data && Array.isArray(data.data)) {
    return data.data;
  } else if (data.wisata && Array.isArray(data.wisata)) {
    return data.wisata;
  } else if (data.success && data.data && Array.isArray(data.data)) {
    return data.data;
  } else {
    console.error("Unexpected API response format:", data);
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

export default function EventPage() {
  // SWR hooks for data fetching
  const {
    data: eventData = [],
    error: eventError,
    isLoading: isLoadingEvents,
    mutate: mutateEvents,
  } = useSWR<Event[]>("/api/event", eventFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 5000,
  });

  const {
    data: wisataList = [],
    error: wisataError,
    isLoading: isLoadingWisata,
  } = useSWR<Wisata[]>("/api/wisata", wisataFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 10000,
  });

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "verified" | "unverified">(
    "all"
  );

  const addFormRef = useRef<HTMLFormElement>(null);
  const editFormRef = useRef<HTMLFormElement>(null);

  // Filter events based on search term and active tab
  useEffect(() => {
    if (eventData.length > 0) {
      let filtered = eventData;

      // Filter by tab
      if (activeTab === "verified") {
        filtered = filtered.filter((event) => event.isVerified);
      } else if (activeTab === "unverified") {
        filtered = filtered.filter((event) => !event.isVerified);
      }

      // Filter by search term
      if (searchTerm) {
        filtered = filtered.filter(
          (event) =>
            event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            (event.wisata?.name &&
              event.wisata.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase()))
        );
      }

      setFilteredEvents(filtered);
    }
  }, [searchTerm, eventData, activeTab]);

  // Show error toast when SWR error occurs
  useEffect(() => {
    if (eventError) {
      toast.error(
        eventError.message || "Gagal memuat data event. Silakan coba lagi."
      );
    }
  }, [eventError]);

  useEffect(() => {
    if (wisataError) {
      toast.error("Gagal memuat daftar wisata. Silakan coba lagi.");
    }
  }, [wisataError]);

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

  const handleAddEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData(e.currentTarget);

      // Create temporary event for optimistic update
      const tempEvent: Event = {
        id: Date.now(), // temporary ID
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        image: previewImage || "",
        startDate: formData.get("startDate") as string,
        endDate: formData.get("endDate") as string,
        wisataId: Number(formData.get("wisataId")),
        isVerified: false,
        wisata: wisataList.find(
          (w) => w.id === Number(formData.get("wisataId"))
        ),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Optimistic update
      mutateEvents([...eventData, tempEvent], false);

      const progressInterval = setInterval(() => {
        setUploadProgress((prevProgress) => {
          if (prevProgress >= 95) {
            clearInterval(progressInterval);
            return prevProgress;
          }
          return prevProgress + 5;
        });
      }, 500);

      const response = await fetch("/api/event", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add event");
      }

      // Revalidate data from server
      mutateEvents();

      setOpenAddDialog(false);
      toast.success("Event berhasil ditambahkan");
      if (addFormRef.current) addFormRef.current.reset();
      setPreviewImage(null);
    } catch (error) {
      console.error("Error adding event:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Gagal menambahkan event. Silakan coba lagi.";
      setFormError(message);
      toast.error(message);

      // Revert optimistic update on error
      mutateEvents();
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleEditEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedEvent) return;

    setIsSubmitting(true);
    setFormError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData(e.currentTarget);

      // Check if a new image was selected
      const imageFile = (
        e.currentTarget.elements.namedItem("images") as HTMLInputElement
      )?.files?.[0];
      if (!imageFile) {
        // If no new image was selected, remove the images field from formData
        formData.delete("images");
      }

      // Optimistic update
      const updatedEvent: Event = {
        ...selectedEvent,
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        startDate: formData.get("startDate") as string,
        endDate: formData.get("endDate") as string,
        wisataId: Number(formData.get("wisataId")),
        wisata: wisataList.find(
          (w) => w.id === Number(formData.get("wisataId"))
        ),
        updatedAt: new Date().toISOString(),
      };

      mutateEvents(
        eventData.map((event) =>
          event.id === selectedEvent.id ? updatedEvent : event
        ),
        false
      );

      const progressInterval = setInterval(() => {
        setUploadProgress((prevProgress) => {
          if (prevProgress >= 95) {
            clearInterval(progressInterval);
            return prevProgress;
          }
          return prevProgress + 5;
        });
      }, 500);

      const response = await fetch(`/api/event?id=${selectedEvent.id}`, {
        method: "PUT",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update event");
      }

      // Revalidate data from server
      mutateEvents();

      setOpenEditDialog(false);
      toast.success("Event berhasil diperbarui");
      setPreviewImage(null);
    } catch (error) {
      console.error("Error updating event:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Gagal memperbarui event. Silakan coba lagi.";
      setFormError(message);
      toast.error(message);

      // Revert optimistic update on error
      mutateEvents();
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (event: Event) => {
    setEventToDelete(event);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;

    try {
      // Optimistic update - remove item immediately
      mutateEvents(
        eventData.filter((event) => event.id !== eventToDelete.id),
        false
      );

      const response = await fetch(`/api/event?id=${eventToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete event");
      }

      // Revalidate data from server
      mutateEvents();

      toast.success("Event berhasil dihapus");
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal menghapus event. Silakan coba lagi."
      );

      // Revert optimistic update on error
      mutateEvents();
    } finally {
      setOpenDeleteDialog(false);
      setEventToDelete(null);
    }
  };

  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    setFormError(null);
    setPreviewImage(event.image);
    setOpenEditDialog(true);
  };

  const handleVerificationToggle = async (event: Event) => {
    try {
      // Determine the new verification status (opposite of current)
      const newVerificationStatus = !event.isVerified;

      // Show appropriate loading toast
      const actionText = newVerificationStatus
        ? "Memverifikasi"
        : "Membatalkan verifikasi";
      const loadingToast = toast.loading(`${actionText} event...`);

      // Optimistic update
      const updatedEvent = { ...event, isVerified: newVerificationStatus };
      mutateEvents(
        eventData.map((e) => (e.id === event.id ? updatedEvent : e)),
        false
      );

      // Call the API to update the event verification status
      const response = await fetch(`/api/admin/event?id=${event.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isVerified: newVerificationStatus }),
      });

      // Parse the response
      const result = await response.json();

      // Clear the loading toast
      toast.dismiss(loadingToast);

      // Handle the response
      if (!response.ok) {
        throw new Error(
          result.error || `Gagal ${actionText.toLowerCase()} event`
        );
      }

      // Revalidate data from server
      mutateEvents();

      // Show success message
      toast.success(
        result.message ||
          `Event berhasil ${
            newVerificationStatus ? "diverifikasi" : "dibatalkan verifikasinya"
          }`
      );
    } catch (error) {
      console.error("Error updating event verification:", error);

      // Show error message
      if (
        error instanceof Error &&
        error.message.includes("Autentikasi diperlukan")
      ) {
        toast.error(
          "Anda tidak memiliki izin untuk mengubah status verifikasi event"
        );
      } else {
        toast.error(
          error instanceof Error
            ? error.message
            : "Gagal mengubah status verifikasi event. Silakan coba lagi."
        );
      }

      // Revert optimistic update on error
      mutateEvents();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatISODate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "";
      }
      return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  const getEventStatus = (event: Event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    if (startDate <= now && endDate >= now) {
      return {
        status: "Berlangsung",
        color: "bg-green-100 text-green-600 border-green-200",
      };
    } else if (endDate < now) {
      return {
        status: "Selesai",
        color: "bg-gray-100 text-gray-600 border-gray-200",
      };
    } else {
      return {
        status: "Mendatang",
        color: "bg-blue-100 text-blue-600 border-blue-200",
      };
    }
  };

  const getVerifiedCount = () => {
    return eventData.filter((event) => event.isVerified).length;
  };

  const getUnverifiedCount = () => {
    return eventData.filter((event) => !event.isVerified).length;
  };

  // Show loading state
  if (isLoadingEvents) {
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
  if (eventError) {
    return (
      <div className="container py-10 mx-auto">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-lg font-medium text-red-600">
            Error loading data
          </div>
          <p className="max-w-md mt-2 text-sm text-muted-foreground">
            {eventError.message}
          </p>
          <Button
            onClick={() => mutateEvents()}
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
            Event
          </h1>
          <p className="mt-2 text-muted-foreground">
            Kelola event wisata dalam satu tempat
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex gap-5">
            <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari event..."
              className="pl-10 pr-4 w-[250px] bg-background/60 backdrop-blur-sm border-muted"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <EventPdfButton />
          </div>
          <Dialog
            open={openAddDialog}
            onOpenChange={setOpenAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <PlusCircle className="w-4 h-4 mr-2" />
                Tambah Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Tambah Event Baru</DialogTitle>
                <DialogDescription>
                  Masukkan informasi lengkap tentang event baru.
                </DialogDescription>
              </DialogHeader>
              <form
                ref={addFormRef}
                onSubmit={handleAddEvent}>
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
                      placeholder="Judul event"
                      className="col-span-3"
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
                      placeholder="Deskripsi event"
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
                        <div className="relative w-full overflow-hidden border rounded-md aspect-video">
                          <Image
                            src={previewImage || "/placeholder.svg"}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid items-center grid-cols-4 gap-4">
                    <Label
                      htmlFor="startDate"
                      className="text-right">
                      Tanggal Mulai
                    </Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="datetime-local"
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid items-center grid-cols-4 gap-4">
                    <Label
                      htmlFor="endDate"
                      className="text-right">
                      Tanggal Selesai
                    </Label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="datetime-local"
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid items-center grid-cols-4 gap-4">
                    <Label
                      htmlFor="wisataId"
                      className="text-right">
                      Wisata
                    </Label>
                    <Select
                      name="wisataId"
                      required>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Pilih wisata" />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingWisata ? (
                          <SelectItem
                            value="loading"
                            disabled>
                            Memuat daftar wisata...
                          </SelectItem>
                        ) : wisataList.length === 0 ? (
                          <SelectItem
                            value="empty"
                            disabled>
                            Tidak ada wisata tersedia
                          </SelectItem>
                        ) : (
                          wisataList.map((wisata) => (
                            <SelectItem
                              key={wisata.id}
                              value={wisata.id.toString()}>
                              {wisata.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
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
            <Calendar className="w-4 h-4" />
            <span>Semua Event</span>
            <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {eventData.length}
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

      {/* Card-based UI for Event data */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium">Daftar Event</h3>
        </div>
        <div className="divide-y">
          {filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="w-12 h-12 mb-4 text-muted-foreground" />
              <div className="text-lg font-medium">Tidak ada data event</div>
              <p className="max-w-md mt-2 text-sm text-muted-foreground">
                Tambahkan event baru dengan mengklik tombol "Tambah Event" di
                bagian atas.
              </p>
            </div>
          ) : (
            filteredEvents.map((event) => {
              const { status, color } = getEventStatus(event);
              return (
                <div
                  key={event.id}
                  className="p-4 transition-colors hover:bg-muted/30">
                  <div className="flex items-start gap-4">
                    <Avatar className="flex-shrink-0 w-16 h-16 rounded-md">
                      <AvatarImage
                        src={event.image || "/placeholder.svg"}
                        alt={event.title}
                        className="object-cover"
                      />
                      <AvatarFallback className="rounded-md">
                        {event.title.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{event.title}</h4>
                        {event.isVerified ? (
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
                          className={color}>
                          {status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                        {event.wisata && (
                          <span className="flex items-center">
                            <MapPin className="w-3.5 h-3.5 mr-1" />
                            {event.wisata.name}
                          </span>
                        )}
                        <span className="flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1" />
                          {formatDateTime(event.startDate)}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1" />
                          {formatDateTime(event.endDate)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant={event.isVerified ? "outline" : "default"}
                              size="sm"
                              className={
                                event.isVerified
                                  ? "border-green-200 text-green-600 hover:bg-green-50"
                                  : "bg-primary"
                              }
                              onClick={() => handleVerificationToggle(event)}>
                              {event.isVerified ? (
                                <>
                                  <X className="w-4 h-4 mr-1" />
                                  Batalkan Verifikasi
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
                              {event.isVerified
                                ? "Batalkan verifikasi"
                                : "Verifikasi event"}
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
                              onClick={() => handleEdit(event)}>
                              <Pencil className="w-4 h-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit event</p>
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
                              onClick={() => handleDelete(event)}>
                              <Trash2 className="w-4 h-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Hapus event</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={openEditDialog}
        onOpenChange={setOpenEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>Ubah informasi event.</DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <form
              ref={editFormRef}
              onSubmit={handleEditEvent}>
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
                    defaultValue={selectedEvent.title}
                    className="col-span-3"
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
                    defaultValue={selectedEvent.description}
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
                          width={400}
                          height={225}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid items-center grid-cols-4 gap-4">
                  <Label
                    htmlFor="edit-startDate"
                    className="text-right">
                    Tanggal Mulai
                  </Label>
                  <Input
                    id="edit-startDate"
                    name="startDate"
                    type="datetime-local"
                    defaultValue={formatISODate(selectedEvent.startDate)}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid items-center grid-cols-4 gap-4">
                  <Label
                    htmlFor="edit-endDate"
                    className="text-right">
                    Tanggal Selesai
                  </Label>
                  <Input
                    id="edit-endDate"
                    name="endDate"
                    type="datetime-local"
                    defaultValue={formatISODate(selectedEvent.endDate)}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid items-center grid-cols-4 gap-4">
                  <Label
                    htmlFor="edit-wisataId"
                    className="text-right">
                    Wisata
                  </Label>
                  <Select
                    name="wisataId"
                    defaultValue={selectedEvent.wisataId.toString()}
                    required>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Pilih wisata" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingWisata ? (
                        <SelectItem
                          value="loading"
                          disabled>
                          Memuat daftar wisata...
                        </SelectItem>
                      ) : wisataList.length === 0 ? (
                        <SelectItem
                          value="empty"
                          disabled>
                          Tidak ada wisata tersedia
                        </SelectItem>
                      ) : (
                        wisataList.map((wisata) => (
                          <SelectItem
                            key={wisata.id}
                            value={wisata.id.toString()}>
                            {wisata.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
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
        title="Hapus Event"
        description="Apakah Anda yakin ingin menghapus event ini? Tindakan ini tidak dapat dibatalkan."
        itemName={eventToDelete?.title}
      />
    </motion.div>
  );
}
