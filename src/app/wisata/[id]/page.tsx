// src/app/wisata/[id]/page.tsx
"use client";

import React from "react";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  Star,
  ChevronLeft,
  Share2,
  Heart,
  CheckCircle,
  Map,
  AlertCircle,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
import StarRating from "@/components/Wisata/id/star-rating";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Review {
  id: number;
  rating: number;
  comment: string;
  pengguna: {
    id: number;
    name: string;
    image?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

interface Pengelola {
  id: number;
  name: string;
}

interface UpdatedBy {
  id: number;
  name: string;
}

interface Attraction {
  id: number;
  name: string;
  description: string;
  location: string;
  images: string[];
  reviews: Review[];
  isVerified: boolean;
  createdAt: string;
  latitude?: number;
  longitude?: number;
  type?: string;
  pengelolaId?: number;
  updatedAt?: string;
  pengelola?: Pengelola;
  updatedBy?: UpdatedBy;
}

const LeafletMap = dynamic(() => import("@/components/Wisata/id/leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full rounded-lg flex items-center justify-center">
      <p className="text-muted-foreground">Memuat peta...</p>
    </div>
  ),
});

export default function AttractionDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = React.use(paramsPromise);
  const [attraction, setAttraction] = useState<Attraction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState<number>(5);
  const [editComment, setEditComment] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/session");
      if (response.ok) {
        const sessionData = await response.json();
        if (sessionData.user?.id) {
          setCurrentUserId(Number(sessionData.user.id));
        }
      }
    } catch (error) {
      console.error("Error fetching user session:", error);
    }
  };

  // Update the fetchAttraction function to properly handle the API response
  const fetchAttraction = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const attractionResponse = await fetch(`/api/wisata?id=${params.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!attractionResponse.ok) {
        throw new Error("Failed to fetch attraction");
      }

      const attractionData = await attractionResponse.json();
      if (!attractionData.success) {
        throw new Error(attractionData.error || "Failed to load attraction");
      }

      const reviewsResponse = await fetch(`/api/ulasan?wisataId=${params.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!reviewsResponse.ok) {
        throw new Error("Failed to fetch reviews");
      }

      const reviewsData = await reviewsResponse.json();

      setAttraction({
        ...attractionData.data,
        reviews: reviewsData,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setAttraction(null);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  // Update the handleSubmitReview function to match the API expectations
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/ulasan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment,
          wisataId: Number(params.id),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit review");
      }

      // Success notification
      toast.success("Ulasan berhasil dikirim!");

      // Refresh the reviews
      await fetchAttraction();

      // Reset form
      setReviewComment("");
      setReviewRating(5);
    } catch (err) {
      toast.error("Terjadi kesalahan saat mengirim ulasan.");
    }
  };

  // Update the handleUpdateReview function to match the API expectations
  const handleUpdateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReviewId) return;

    try {
      const response = await fetch(`/api/ulasan?id=${editingReviewId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: editRating,
          comment: editComment,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update review");
      }

      // Success notification
      toast.success("Ulasan berhasil diperbarui!");

      // Refresh the reviews
      await fetchAttraction();

      // Reset edit state
      setEditingReviewId(null);
      setEditRating(5);
      setEditComment("");
    } catch (err) {
      toast.error("Terjadi kesalahan saat memperbarui ulasan.");
    }
  };

  // Update the confirmDeleteReview function to match the API expectations
  const confirmDeleteReview = async () => {
    if (!reviewToDelete) return;

    try {
      const response = await fetch(`/api/ulasan?id=${reviewToDelete}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete review");
      }

      // Success notification
      toast.success("Ulasan berhasil dihapus!");

      // Refresh the reviews
      await fetchAttraction();

      // Reset delete state
      setDeleteDialogOpen(false);
      setReviewToDelete(null);
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menghapus ulasan."
      );
      setDeleteDialogOpen(false);
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReviewId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const handleDeleteReview = (reviewId: number) => {
    setReviewToDelete(reviewId);
    setDeleteDialogOpen(true);
  };

  useEffect(() => {
    fetchAttraction();
    fetchCurrentUser();
  }, [params.id, fetchAttraction]);

  const hasValidCoordinates =
    attraction?.latitude !== undefined && attraction?.longitude !== undefined;

  if (loading) {
    return (
      <div className="min-h-screen pb-12">
        <header className="sticky top-0 z-10 shadow-sm">
          <div className="container px-4 py-4 mx-auto">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="flex items-center gap-2">
                <ChevronLeft size={20} />
                <span>Kembali ke Destinasi</span>
              </Link>
            </div>
          </div>
        </header>

        <div className="container px-4 py-6 mx-auto">
          <div className="flex flex-col gap-8">
            <div className="w-full">
              <Skeleton className="w-full aspect-[16/9] rounded-xl mb-4" />
              <div className="flex gap-2 pb-2 mb-6 overflow-x-auto">
                {[...Array(4)].map((_, index) => (
                  <Skeleton
                    key={index}
                    className="flex-shrink-0 w-32 h-20 rounded-lg"
                  />
                ))}
              </div>
              <Skeleton className="w-40 h-6 mb-2" />
              <Skeleton className="w-3/4 h-10 mb-3" />
              <Skeleton className="w-48 h-5 mb-6" />

              <div className="space-y-10">
                {[...Array(5)].map((_, index) => (
                  <div key={index}>
                    <Skeleton className="w-48 h-8 mb-4" />
                    <Skeleton className="w-full h-[200px] rounded-xl" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !attraction) {
    return (
      <div className="min-h-screen pb-12">
        <header className="sticky top-0 z-10 ">
          <div className="container px-4 py-4 mx-auto">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="flex items-center gap-2 ">
                <ChevronLeft size={20} />
                <span>Kembali ke Destinasi</span>
              </Link>
            </div>
          </div>
        </header>

        <div className="container px-4 py-12 mx-auto text-center">
          <Alert
            variant="destructive"
            className="max-w-md mx-auto mb-6">
            <AlertCircle className="w-4 h-4" />
            <AlertTitle>Kesalahan</AlertTitle>
            <AlertDescription>
              {error || "Destinasi wisata tidak ditemukan"}
            </AlertDescription>
          </Alert>
          <Link href="/">
            <Button>Kembali ke Beranda</Button>
          </Link>
        </div>
      </div>
    );
  }

  const averageRating =
    attraction.reviews.length > 0
      ? (
          attraction.reviews.reduce((acc, review) => acc + review.rating, 0) /
          attraction.reviews.length
        ).toFixed(1)
      : "0.0";

  return (
    <div className="min-h-screen pb-12">
      <header className="sticky top-0 z-10 shadow-sm">
        <div className="container px-4 py-4 mx-auto">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 ">
              <ChevronLeft size={20} />
              <span>Kembali ke Destinasi</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="container px-4 py-6 mx-auto">
        <div className="flex flex-col gap-8">
          {/* Images and main info */}
          <div className="w-full">
            <div className="relative rounded-xl overflow-hidden mb-4 aspect-[16/9]">
              <Image
                src={attraction.images[activeImageIndex] || "/placeholder.svg"}
                alt={attraction.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            <div className="flex gap-2 pb-2 mb-6 overflow-x-auto">
              {attraction.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`relative h-20 w-32 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                    activeImageIndex === index
                      ? "border-blue-600"
                      : "border-transparent"
                  }`}>
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${attraction.name} image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>

            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={18} />
                <span>{attraction.location}</span>
                <Badge
                  variant="outline"
                  className="ml-2">
                  {attraction.type}
                </Badge>
              </div>

              <h1 className="mb-3 text-3xl font-bold">{attraction.name}</h1>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="font-medium">{averageRating}</span>
                  <span className="text-muted-foreground">
                    ({attraction.reviews.length} ulasan)
                  </span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar size={16} />
                  <span>
                    Ditambahkan pada{" "}
                    {new Date(attraction.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="mb-10">
              <h2 className="mb-4 text-2xl font-bold">Deskripsi</h2>
              <div className="p-6 shadow-sm rounded-xl">
                <div className="leading-relaxed text-muted-foreground">
                  <p className="mb-4">{attraction.description}</p>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Nulla facilisi. Maecenas vel tincidunt nunc, eget tincidunt
                    nisl. Donec varius, nisi vel tincidunt ultrices, nunc nisl
                    aliquam nisl, eget aliquam nisl nunc vel nisi.
                  </p>
                </div>
              </div>
            </div>

            {/* Facilities Section */}
            <div className="mb-10">
              <h2 className="mb-4 text-2xl font-bold">Fasilitas</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[
                  { icon: "parking", name: "Parkir Tersedia" },
                  { icon: "toilet", name: "Toilet Umum" },
                ].map((facility, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-4 rounded-lg shadow-sm">
                    <div className="p-2 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-check">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span>{facility.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location Section with Leaflet Map */}
            <div className="mb-10">
              <h2 className="mb-4 text-2xl font-bold">Lokasi</h2>
              <div className="p-4 mb-4 shadow-sm rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-muted-foreground">
                      {attraction.location}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Coordinates: {attraction.latitude ?? "N/A"},{" "}
                      {attraction.longitude ?? "N/A"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1">
                    <Map size={16} />
                    <span>Dapatkan Arah</span>
                  </Button>
                </div>
                <div className="h-[400px] w-full rounded-lg overflow-hidden -z-50">
                  {hasValidCoordinates ? (
                    <LeafletMap
                      latitude={attraction.latitude!}
                      longitude={attraction.longitude!}
                      name={attraction.name}
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <p className="text-muted-foreground">
                        Peta tidak tersedia: Koordinat tidak disediakan
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Ulasan Section with Tabs */}
            <div className="mb-10">
              <h2 className="mb-6 text-2xl font-bold">Ulasan</h2>

              <Tabs
                defaultValue="previous"
                className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="previous">Ulasan Sebelumnya</TabsTrigger>
                  <TabsTrigger value="new">Berikan Ulasan</TabsTrigger>
                </TabsList>

                <TabsContent
                  value="previous"
                  className="mt-0">
                  <div className="p-6 shadow-sm rounded-xl">
                    {attraction.reviews.length > 0 ? (
                      <div className="h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        <div className="space-y-6">
                          {attraction.reviews.map((review) => (
                            <div
                              key={review.id}
                              className="p-6 border rounded-xl">
                              {editingReviewId === review.id ? (
                                // Edit Form (UPDATE)
                                <form onSubmit={handleUpdateReview}>
                                  <div className="mb-4">
                                    <Label
                                      htmlFor="edit-rating"
                                      className="block mb-2">
                                      Rating
                                    </Label>
                                    <StarRating
                                      rating={editRating}
                                      onRatingChange={setEditRating}
                                      size={24}
                                    />
                                  </div>
                                  <div className="mb-4">
                                    <Label
                                      htmlFor="edit-comment"
                                      className="block mb-2">
                                      Komentar
                                    </Label>
                                    <Textarea
                                      id="edit-comment"
                                      value={editComment}
                                      onChange={(e) =>
                                        setEditComment(e.target.value)
                                      }
                                      className="min-h-[100px]"
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <Button type="submit">Simpan</Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => setEditingReviewId(null)}>
                                      Batal
                                    </Button>
                                  </div>
                                </form>
                              ) : (
                                // Display Review (READ)
                                <div className="flex items-start gap-4">
                                  <Avatar>
                                    <AvatarImage
                                      src={
                                        review.pengguna.image ||
                                        "/placeholder.svg" ||
                                        "/placeholder.svg"
                                      }
                                    />
                                    <AvatarFallback>
                                      {review.pengguna.name
                                        .substring(0, 2)
                                        .toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                      <h4 className="font-medium">
                                        {review.pengguna.name}
                                      </h4>
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">
                                          {new Date(
                                            review.createdAt
                                          ).toLocaleDateString()}
                                        </span>
                                        {currentUserId ===
                                          review.pengguna.id && (
                                          <>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() =>
                                                handleEditReview(review)
                                              }>
                                              <Edit size={16} />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() =>
                                                handleDeleteReview(review.id)
                                              }>
                                              <Trash2 size={16} />
                                            </Button>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1 mb-2">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          size={16}
                                          className={
                                            i < review.rating
                                              ? "fill-yellow-400 text-yellow-400"
                                              : "text-gray-300"
                                          }
                                        />
                                      ))}
                                    </div>
                                    <p className="text-muted-foreground">
                                      {review.comment}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-muted-foreground">
                        <p>
                          Belum ada ulasan. Jadilah yang pertama memberikan
                          ulasan!
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent
                  value="new"
                  className="mt-0">
                  {currentUserId ? (
                    <div className="p-6 shadow-sm rounded-xl">
                      <form onSubmit={handleSubmitReview}>
                        <div className="mb-6">
                          <Label
                            htmlFor="rating"
                            className="block mb-3">
                            Rating
                          </Label>
                          <div className="flex items-center">
                            <StarRating
                              rating={reviewRating}
                              onRatingChange={setReviewRating}
                              size={24}
                            />
                            <span className="ml-2 text-muted-foreground">
                              {reviewRating}{" "}
                              {reviewRating === 1 ? "bintang" : "bintang"}
                            </span>
                          </div>
                        </div>

                        <div className="mb-6">
                          <Label
                            htmlFor="comment"
                            className="block mb-2">
                            Komentar
                          </Label>
                          <Textarea
                            id="comment"
                            placeholder="Bagikan pendapat Anda tentang wisata ini..."
                            className="min-h-[120px]"
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                          />
                        </div>

                        <Button type="submit">Kirim Ulasan</Button>
                      </form>
                    </div>
                  ) : (
                    <div className="p-6 text-center shadow-sm rounded-xl">
                      <p className="mb-4 text-muted-foreground">
                        Silakan login untuk memberikan ulasan
                      </p>
                      <Button asChild>
                        <Link href="/api/auth/signin">Login</Link>
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDeleteReview}
        title="Hapus Ulasan"
        description="Apakah Anda yakin ingin menghapus ulasan ini? Tindakan ini tidak dapat dibatalkan."
      />
    </div>
  );
}
