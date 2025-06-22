"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  Calendar,
  MapPin,
  Share2,
  Heart,
  User,
  ExternalLink,
  Edit,
  Trash2,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import StarRating from "@/components/Wisata/id/star-rating";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { toast } from "sonner";

interface Wisata {
  id: number;
  name: string;
}

interface Pengelola {
  id: number;
  name: string;
}

interface UpdatedBy {
  id: number;
  name: string;
}

interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  image: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt?: string;
  wisataId?: number;
  pengelolaId?: number;
  updatedById?: number;
  wisata?: Wisata;
  pengelola?: Pengelola;
  updatedBy?: UpdatedBy;
  category?: string;
  ticketPrice?: string;
  registrationLink?: string;
  contactInfo?: string;
}

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

export default function EventDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = React.use(paramsPromise);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
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

  const fetchReviews = React.useCallback(async () => {
    try {
      const response = await fetch(`/api/ulasan?eventId=${params.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }

      const reviewsData = await response.json();
      setReviews(reviewsData);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setReviews([]);
    }
  }, [params.id]);

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
          eventId: Number(params.id),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit review");
      }

      toast.success("Ulasan berhasil dikirim!");
      await fetchReviews();
      setReviewComment("");
      setReviewRating(5);
    } catch (err) {
      toast.error("Terjadi kesalahan saat mengirim ulasan.");
    }
  };

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

      toast.success("Ulasan berhasil diperbarui!");
      await fetchReviews();
      setEditingReviewId(null);
      setEditRating(5);
      setEditComment("");
    } catch (err) {
      toast.error("Terjadi kesalahan saat memperbarui ulasan.");
    }
  };

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

      toast.success("Ulasan berhasil dihapus!");
      await fetchReviews();
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
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/event?id=${params.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch event");
        }

        const result = await response.json();

        if (result.error) {
          throw new Error(result.error);
        }

        setEvent(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
    fetchReviews();
    fetchCurrentUser();
  }, [params.id, fetchReviews]);

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, review) => acc + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : "0.0";

  if (loading) {
    return (
      <div className="min-h-screen pb-12">
        <header className="sticky top-0 z-10 shadow-sm">
          <div className="container px-4 py-4 mx-auto">
            <div className="flex items-center justify-between">
              <Link
                href="/event"
                className="flex items-center gap-2">
                <ChevronLeft size={20} />
                <span>Kembali ke Event</span>
              </Link>
            </div>
          </div>
        </header>

        <div className="container px-4 py-6 mx-auto">
          <div className="flex flex-col gap-8">
            <div className="w-full">
              <Skeleton className="w-full aspect-[16/9] rounded-xl mb-4" />
              <Skeleton className="w-3/4 h-10 mb-3" />
              <div className="flex gap-4 mb-6">
                <Skeleton className="w-32 h-6" />
                <Skeleton className="w-32 h-6" />
              </div>
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

  if (error || !event) {
    return (
      <div className="min-h-screen pb-12">
        <header className="sticky top-0 z-10 shadow-sm">
          <div className="container px-4 py-4 mx-auto">
            <div className="flex items-center justify-between">
              <Link
                href="/event"
                className="flex items-center gap-2">
                <ChevronLeft size={20} />
                <span>Kembali ke Event</span>
              </Link>
            </div>
          </div>
        </header>

        <div className="container px-4 py-12 mx-auto text-center">
          <Alert
            variant="destructive"
            className="max-w-md mx-auto mb-6">
            <AlertCircle className="w-4 h-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error || "Event not found"}</AlertDescription>
          </Alert>
          <Link href="/event">
            <Button>Kembali ke Event</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Format dates
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  const formattedStartDate = startDate.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedEndDate = endDate.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedStartTime = startDate.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const formattedEndTime = endDate.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const dateRangeDisplay =
    startDate.toDateString() === endDate.toDateString()
      ? `${formattedStartDate}, ${formattedStartTime} - ${formattedEndTime}`
      : `${formattedStartDate}, ${formattedStartTime} - ${formattedEndDate}, ${formattedEndTime}`;

  return (
    <div className="min-h-screen pb-12">
      <header className="sticky top-0 z-10 shadow-sm">
        <div className="container px-4 py-4 mx-auto">
          <div className="flex items-center justify-between">
            <Link
              href="/event"
              className="flex items-center gap-2">
              <ChevronLeft size={20} />
              <span>Kembali ke Event</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="container px-4 py-6 mx-auto">
        <div className="flex flex-col gap-8">
          <div className="w-full">
            <div className="relative rounded-xl overflow-hidden mb-4 aspect-[16/9]">
              <Image
                src={event.image || "/placeholder.svg?height=600&width=1200"}
                alt={event.title}
                fill
                className="object-cover"
                priority
              />
              {event.category && (
                <Badge className="absolute text-white bg-blue-600 top-4 left-4">
                  {event.category}
                </Badge>
              )}
            </div>

            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={18} />
                <span>{event.location}</span>
                {event.category && (
                  <Badge
                    variant="outline"
                    className="ml-2">
                    {event.category}
                  </Badge>
                )}
              </div>

              <h1 className="mb-3 text-3xl font-bold">{event.title}</h1>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="font-medium">{averageRating}</span>
                  <span className="text-muted-foreground">
                    ({reviews.length} ulasan)
                  </span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar size={16} />
                  <span>{dateRangeDisplay}</span>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="mb-10">
              <h2 className="mb-4 text-2xl font-bold">Deskripsi Event</h2>
              <div className="p-6 shadow-sm rounded-xl">
                <div className="leading-relaxed text-muted-foreground">
                  {event.description.split("\n").map((paragraph, index) => (
                    <p
                      key={index}
                      className="mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Event Details Section */}
            <div className="mb-10">
              <h2 className="mb-4 text-2xl font-bold">Detail Event</h2>
              <div className="p-6 shadow-sm rounded-xl">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 text-blue-600 bg-blue-100 rounded-full">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <h3 className="font-medium">Tanggal & Waktu</h3>
                      <p className="text-muted-foreground">
                        {dateRangeDisplay}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 text-blue-600 bg-blue-100 rounded-full">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <h3 className="font-medium">Lokasi</h3>
                      <p className="text-muted-foreground">{event.location}</p>
                    </div>
                  </div>

                  {event.ticketPrice && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 text-blue-600 bg-blue-100 rounded-full">
                        <span className="text-sm font-bold">Rp</span>
                      </div>
                      <div>
                        <h3 className="font-medium">Harga Tiket</h3>
                        <p className="text-muted-foreground">
                          {event.ticketPrice}
                        </p>
                      </div>
                    </div>
                  )}

                  {event.contactInfo && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 text-blue-600 bg-blue-100 rounded-full">
                        <User size={18} />
                      </div>
                      <div>
                        <h3 className="font-medium">Informasi Kontak</h3>
                        <p className="text-muted-foreground">
                          {event.contactInfo}
                        </p>
                      </div>
                    </div>
                  )}

                  {event.wisata && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 text-blue-600 bg-blue-100 rounded-full">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <h3 className="font-medium">Destinasi Terkait</h3>
                        <Link
                          href={`/wisata/${event.wisata.id}`}
                          className="text-blue-600 hover:underline">
                          {event.wisata.name}
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Organizer Section */}
            {event.pengelola && (
              <div className="mb-10">
                <h2 className="mb-4 text-2xl font-bold">Penyelenggara</h2>
                <div className="p-6 shadow-sm rounded-xl">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback>
                        {event.pengelola.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="mb-1 font-medium">
                        {event.pengelola.name}
                      </h3>
                      <p className="text-muted-foreground">
                        Penyelenggara event dan pengelola destinasi dengan
                        keahlian dalam menciptakan pengalaman yang berkesan.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Registration CTA */}
            {event.registrationLink && (
              <div className="mb-10">
                <div className="p-6 text-center shadow-sm rounded-xl">
                  <h2 className="mb-2 text-xl font-bold">
                    Siap bergabung dengan event ini?
                  </h2>
                  <p className="mb-4 text-muted-foreground">
                    Amankan tempat Anda sekarang sebelum tiket habis!
                  </p>
                  <Link
                    href={event.registrationLink}
                    target="_blank"
                    rel="noopener noreferrer">
                    <Button
                      size="lg"
                      className="gap-2">
                      <span>Daftar Sekarang</span>
                      <ExternalLink size={16} />
                    </Button>
                  </Link>
                </div>
              </div>
            )}

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
                    {reviews.length > 0 ? (
                      <div className="h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        <div className="space-y-6">
                          {reviews.map((review) => (
                            <div
                              key={review.id}
                              className="p-6 border rounded-xl">
                              {editingReviewId === review.id ? (
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
                                <div className="flex items-start gap-4">
                                  <Avatar>
                                    <AvatarImage
                                      src={
                                        review.pengguna.image ||
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
                            placeholder="Bagikan pendapat Anda tentang event ini..."
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
