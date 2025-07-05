"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Star,
  Search,
  Trash2,
  Check,
  X,
  MapPin,
  User,
  Calendar,
  Landmark,
  FileText,
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
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingCards } from "@/components/ui/loading-spinner";

interface UlasanWisata {
  id: number;
  rating: number;
  comment: string;
  isVerified?: boolean;
  createdAt: string;
  updatedAt: string;
  wisataId?: number;
  artikelId?: number;
  eventId?: number;
  pengguna?: {
    id: number;
    name: string;
    image?: string;
  };
  wisata?: {
    id: number;
    name: string;
  };
  artikel?: {
    id: number;
    title: string;
  };
  event?: {
    id: number;
    title: string;
  };
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
            {itemName && <span className="font-medium"> "{itemName}"</span>}?
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

export default function UlasanWisataPage() {
  const [selectedUlasan, setSelectedUlasan] = useState<UlasanWisata | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [ulasanData, setUlasanData] = useState<UlasanWisata[]>([]);
  const [filteredUlasan, setFilteredUlasan] = useState<UlasanWisata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [ulasanToDelete, setUlasanToDelete] = useState<UlasanWisata | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<"wisata" | "artikel" | "event">(
    "wisata"
  );

  useEffect(() => {
    fetchUlasan();
  }, []);

  useEffect(() => {
    if (ulasanData.length > 0) {
      let filtered = ulasanData;

      // Filter by category based on which ID exists
      if (activeTab === "wisata") {
        filtered = filtered.filter((ulasan) => ulasan.wisataId);
      } else if (activeTab === "artikel") {
        filtered = filtered.filter((ulasan) => ulasan.artikelId);
      } else if (activeTab === "event") {
        filtered = filtered.filter((ulasan) => ulasan.eventId);
      }

      // Filter by search term
      if (searchTerm) {
        filtered = filtered.filter(
          (ulasan) =>
            ulasan.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (ulasan.pengguna?.name &&
              ulasan.pengguna.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase())) ||
            (ulasan.wisata?.name &&
              ulasan.wisata.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase())) ||
            (ulasan.artikel?.title &&
              ulasan.artikel.title
                .toLowerCase()
                .includes(searchTerm.toLowerCase())) ||
            (ulasan.event?.title &&
              ulasan.event.title
                .toLowerCase()
                .includes(searchTerm.toLowerCase()))
        );
      }

      setFilteredUlasan(filtered);
    }
  }, [searchTerm, ulasanData, activeTab]);

  const fetchUlasan = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/ulasan", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUlasanData(data);
      setFilteredUlasan(data);
    } catch (error) {
      console.error("Error fetching ulasan:", error);
      toast.error("Gagal memuat data ulasan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (ulasan: UlasanWisata) => {
    setUlasanToDelete(ulasan);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!ulasanToDelete) return;

    try {
      const response = await fetch(`/api/ulasan?id=${ulasanToDelete.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Remove from local state
      setUlasanData(ulasanData.filter((u) => u.id !== ulasanToDelete.id));
      setFilteredUlasan(
        filteredUlasan.filter((u) => u.id !== ulasanToDelete.id)
      );
      toast.success("Ulasan berhasil dihapus");
    } catch (error) {
      console.error("Error deleting ulasan:", error);
      toast.error("Gagal menghapus ulasan. Silakan coba lagi.");
    } finally {
      setOpenDeleteDialog(false);
      setUlasanToDelete(null);
    }
  };

  const getWisataCount = () => {
    return ulasanData.filter((ulasan) => ulasan.wisataId).length;
  };

  const getArtikelCount = () => {
    return ulasanData.filter((ulasan) => ulasan.artikelId).length;
  };

  const getEventCount = () => {
    return ulasanData.filter((ulasan) => ulasan.eventId).length;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const getUlasanTitle = (ulasan: UlasanWisata) => {
    if (ulasan.wisata) return ulasan.wisata.name;
    if (ulasan.artikel) return ulasan.artikel.title;
    if (ulasan.event) return ulasan.event.title;
    return "Unknown";
  };

  const getUlasanType = (ulasan: UlasanWisata) => {
    if (ulasan.wisataId) return "Wisata";
    if (ulasan.artikelId) return "Artikel";
    if (ulasan.eventId) return "Event";
    return "Unknown";
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
            Ulasan Wisata
          </h1>
          <p className="mt-2 text-muted-foreground">
            Kelola ulasan wisata dalam satu tempat
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex gap-5">
            <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari ulasan..."
              className="pl-10 pr-4 w-[250px] bg-background/60 backdrop-blur-sm border-muted"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-start justify-between gap-4 mb-8 sm:flex-row sm:items-center">
        <div className="inline-flex p-1 rounded-lg shadow-sm bg-muted/60 backdrop-blur-sm">
          <button
            onClick={() => setActiveTab("wisata")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "wisata"
                ? "bg-background text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}>
            <Landmark className="w-4 h-4" />
            <span>Wisata</span>
            <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {getWisataCount()}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("artikel")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "artikel"
                ? "bg-background text-blue-600 shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}>
            <FileText className="w-4 h-4" />
            <span>Artikel</span>
            <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600">
              {getArtikelCount()}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("event")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "event"
                ? "bg-background text-purple-600 shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}>
            <Calendar className="w-4 h-4" />
            <span>Event</span>
            <span className="ml-2 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-600">
              {getEventCount()}
            </span>
          </button>
        </div>
      </div>

      {/* Card-based UI for Ulasan data */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium">
            Daftar Ulasan{" "}
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h3>
        </div>
        <div className="divide-y">
          {filteredUlasan.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Star className="w-12 h-12 mb-4 text-muted-foreground" />
              <div className="text-lg font-medium">Tidak ada data ulasan</div>
              <p className="max-w-md mt-2 text-sm text-muted-foreground">
                Belum ada ulasan {activeTab} yang tersedia.
              </p>
            </div>
          ) : (
            filteredUlasan.map((ulasan) => (
              <div
                key={ulasan.id}
                className="p-4 transition-colors hover:bg-muted/30">
                <div className="flex items-start gap-4">
                  <Avatar className="flex-shrink-0 w-12 h-12">
                    <AvatarImage
                      src={
                        ulasan.pengguna?.image ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${ulasan.pengguna?.name}`
                      }
                      alt={ulasan.pengguna?.name}
                    />
                    <AvatarFallback>
                      {ulasan.pengguna?.name?.substring(0, 2).toUpperCase() ||
                        "UN"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        {renderStars(ulasan.rating)}
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-xs">
                        {getUlasanType(ulasan)}
                      </Badge>
                    </div>

                    <p className="mb-3 text-sm text-muted-foreground line-clamp-3">
                      {ulasan.comment}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <User className="w-3.5 h-3.5 mr-1" />
                        {ulasan.pengguna?.name || "Anonim"}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1" />
                        {getUlasanTitle(ulasan)}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1" />
                        {formatDate(ulasan.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-auto">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(ulasan)}
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

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Hapus Ulasan"
        description="Apakah Anda yakin ingin menghapus ulasan ini? Tindakan ini tidak dapat dibatalkan."
        itemName={ulasanToDelete?.comment.substring(0, 50) + "..."}
      />
    </motion.div>
  );
}
