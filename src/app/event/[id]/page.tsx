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

  // Add these states for reviews
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

  // Memoize the fetchReviews function to prevent infinite loops
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
  }, [params.id]); // Only depend on params.id

  // Add function to submit a new review
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

      // Success notification
      toast.success("Ulasan berhasil dikirim!");

      // Refresh the reviews
      await fetchReviews();

      // Reset form
      setReviewComment("");
      setReviewRating(5);
    } catch (err) {
      toast.error(`Terjadi kesalahan saat mengirim ulasan: ${err}`);
    }
  };

  // Add function to update a review
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
      await fetchReviews();

      // Reset edit state
      setEditingReviewId(null);
      setEditRating(5);
      setEditComment("");
    } catch (err) {
      toast.error("Terjadi kesalahan saat memperbarui ulasan.");
    }
  };

  // Add function to delete a review
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
      await fetchReviews();

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

  // Add helper functions for review editing and deletion
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
  }, [params.id, fetchReviews]); // Add fetchReviews to the dependency array

  // Add calculation for average rating
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, review) => acc + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : "0.0";

  if (loading) {
    return (
      <div className="min-h-screen pb-12 bg-gradient-to-b from-blue-50 to-white">
        <header className="sticky top-0 z-10 bg-white shadow-sm">
          <div className="container px-4 py-4 mx-auto">
            <div className="flex items-center justify-between">
              <Link
                href="/event"
                className="flex items-center gap-2 text-blue-600">
                <ChevronLeft size={20} />
                <span>Back to Events</span>
              </Link>
            </div>
          </div>
        </header>

        <div className="container px-4 py-6 mx-auto">
          <div className="max-w-3xl mx-auto">
            <Skeleton className="w-full aspect-[16/9] rounded-xl mb-6" />
            <Skeleton className="w-3/4 h-10 mb-3" />
            <div className="flex gap-4 mb-6">
              <Skeleton className="w-32 h-6" />
              <Skeleton className="w-32 h-6" />
            </div>
            <Skeleton className="w-full h-4 mb-2" />
            <Skeleton className="w-full h-4 mb-2" />
            <Skeleton className="w-full h-4 mb-2" />
            <Skeleton className="w-full h-4 mb-2" />
            <Skeleton className="w-3/4 h-4 mb-6" />

            <Skeleton className="w-full h-4 mb-2" />
            <Skeleton className="w-full h-4 mb-2" />
            <Skeleton className="w-full h-4 mb-2" />
            <Skeleton className="w-full h-4 mb-2" />
            <Skeleton className="w-full h-4 mb-2" />
            <Skeleton className="w-full h-4 mb-2" />
            <Skeleton className="w-full h-4 mb-2" />
            <Skeleton className="w-2/3 h-4 mb-6" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen pb-12 bg-gradient-to-b from-blue-50 to-white">
        <header className="sticky top-0 z-10 bg-white shadow-sm">
          <div className="container px-4 py-4 mx-auto">
            <div className="flex items-center justify-between">
              <Link
                href="/event"
                className="flex items-center gap-2 text-blue-600">
                <ChevronLeft size={20} />
                <span>Back to Events</span>
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
            <Button>Back to Events</Button>
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

  // Format date range for display
  const dateRangeDisplay =
    startDate.toDateString() === endDate.toDateString()
      ? `${formattedStartDate}, ${formattedStartTime} - ${formattedEndTime}`
      : `${formattedStartDate}, ${formattedStartTime} - ${formattedEndDate}, ${formattedEndTime}`;

  return (
    <div className="min-h-screen pb-12 bg-gradient-to-b from-blue-50 to-white">
      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="container px-4 py-4 mx-auto">
          <div className="flex items-center justify-between">
            <Link
              href="/event"
              className="flex items-center gap-2 text-blue-600">
              <ChevronLeft size={20} />
              <span>Back to Events</span>
            </Link>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon">
                <Share2 size={18} />
              </Button>
              <Button
                variant="outline"
                size="icon">
                <Heart size={18} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container px-4 py-6 mx-auto">
        <article className="max-w-3xl mx-auto">
          {/* Featured Image */}
          <div className="relative w-full mb-6 overflow-hidden rounded-xl aspect-[16/9]">
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

          {/* Event Header */}
          <div className="mb-8">
            <h1 className="mb-4 text-3xl font-bold md:text-4xl">
              {event.title}
            </h1>

            <div className="flex flex-col gap-3 mb-6 md:flex-row md:items-center md:gap-6">
              <div className="flex items-center gap-2">
                <div className="p-2 text-blue-600 bg-blue-100 rounded-full">
                  <Calendar size={18} />
                </div>
                <span>{dateRangeDisplay}</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-2 text-blue-600 bg-blue-100 rounded-full">
                  <MapPin size={18} />
                </div>
                <span>{event.location}</span>
              </div>
            </div>

            {event.ticketPrice && (
              <div className="p-4 mb-6 rounded-lg bg-blue-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Ticket Price:</span>
                    <span>{event.ticketPrice}</span>
                  </div>
                  {event.registrationLink && (
                    <Link
                      href={event.registrationLink}
                      target="_blank"
                      rel="noopener noreferrer">
                      <Button className="gap-2">
                        <span>Register Now</span>
                        <ExternalLink size={16} />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 mt-2">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="font-medium">{averageRating}</span>
              <span className="text-muted-foreground">
                ({reviews.length} reviews)
              </span>
            </div>
          </div>

          <Tabs
            defaultValue="description"
            className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent
              value="description"
              className="space-y-4">
              {/* Event Description */}
              <div className="mb-8">
                <h2 className="mb-4 text-2xl font-bold">About This Event</h2>
                <div className="prose prose-blue max-w-none">
                  {event.description.split("\n").map((paragraph, index) => (
                    <p
                      key={index}
                      className="mb-4 leading-relaxed text-muted-foreground">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              {/* Event Details */}
              <div className="p-6 mb-8 bg-white rounded-xl">
                <h2 className="mb-4 text-xl font-bold">Event Details</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 text-blue-600 bg-blue-100 rounded-full">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <h3 className="font-medium">Date & Time</h3>
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
                      <h3 className="font-medium">Location</h3>
                      <p className="text-muted-foreground">{event.location}</p>
                    </div>
                  </div>

                  {event.contactInfo && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 text-blue-600 bg-blue-100 rounded-full">
                        <User size={18} />
                      </div>
                      <div>
                        <h3 className="font-medium">Contact Information</h3>
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
                        <h3 className="font-medium">Related Destination</h3>
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

              {/* Organizer Info */}
              {event.pengelola && (
                <div className="p-6 mb-8 bg-white rounded-xl">
                  <h2 className="mb-4 text-xl font-bold">Organizer</h2>
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
                        Event organizer and destination manager with expertise
                        in creating memorable experiences.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
            <TabsContent
              value="reviews"
              className="space-y-4">
              <div className="mb-8">
                <h2 className="mb-4 text-2xl font-bold">Reviews</h2>
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-xl font-semibold">{averageRating}</span>
                  <span className="text-muted-foreground">
                    ({reviews.length} reviews)
                  </span>
                </div>

                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-6 mb-4 bg-white rounded-xl">
                    <div className="flex justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>
                            {review.pengguna.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">
                            {review.pengguna.name}
                          </h3>
                          <div className="flex items-center gap-1">
                            <StarRating
                              rating={review.rating}
                              readonly={true}
                            />
                          </div>
                        </div>
                      </div>
                      {currentUserId === review.pengguna.id && (
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditReview(review)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteReview(review.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    {editingReviewId === review.id ? (
                      <form
                        onSubmit={handleUpdateReview}
                        className="mt-4 space-y-4">
                        <div>
                          <Label htmlFor="editRating">Rating</Label>
                          <StarRating
                            rating={editRating}
                            onRatingChange={(value) => setEditRating(value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="editComment">Comment</Label>
                          <Textarea
                            id="editComment"
                            value={editComment}
                            onChange={(e) => setEditComment(e.target.value)}
                            placeholder="Edit your comment"
                          />
                        </div>
                        <Button type="submit">Update Review</Button>
                      </form>
                    ) : (
                      <p className="mt-4 text-muted-foreground">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {currentUserId && (
                <div className="p-6 mb-8 bg-white rounded-xl">
                  <h2 className="mb-4 text-xl font-bold">Add a Review</h2>
                  <form
                    onSubmit={handleSubmitReview}
                    className="space-y-4">
                    <div>
                      <Label htmlFor="rating">Rating</Label>
                      <StarRating
                        rating={reviewRating}
                        onRatingChange={(value) => setReviewRating(value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="comment">Comment</Label>
                      <Textarea
                        id="comment"
                        placeholder="Write your review here"
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                      />
                    </div>
                    <Button type="submit">Submit Review</Button>
                  </form>
                </div>
              )}

              {!currentUserId && (
                <div className="p-6 mb-8 text-center bg-blue-50 rounded-xl">
                  <h2 className="mb-2 text-xl font-bold">
                    Want to leave a review?
                  </h2>
                  <p className="mb-4 text-muted-foreground">
                    Please log in to leave a review.
                  </p>
                  <Link href="/login">
                    <Button size="lg">Log In</Button>
                  </Link>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Reviews Section with Tabs */}
          <div className="mt-10">
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
                <div className="p-6 bg-white shadow-sm rounded-xl">
                  {reviews.length > 0 ? (
                    <div className="h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      <div className="space-y-6">
                        {reviews.map((review) => (
                          <div
                            key={review.id}
                            className="p-6 border bg-gray-50 rounded-xl">
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
                                      {currentUserId === review.pengguna.id && (
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
                <div className="p-6 bg-white shadow-sm rounded-xl">
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
              </TabsContent>
            </Tabs>
          </div>

          {/* Call to Action */}
          {event.registrationLink && (
            <div className="p-6 mb-8 text-center bg-blue-50 rounded-xl">
              <h2 className="mb-2 text-xl font-bold">
                Ready to join this event?
              </h2>
              <p className="mb-4 text-muted-foreground">
                Secure your spot now before tickets run out!
              </p>
              <Link
                href={event.registrationLink}
                target="_blank"
                rel="noopener noreferrer">
                <Button
                  size="lg"
                  className="gap-2">
                  <span>Register Now</span>
                  <ExternalLink size={16} />
                </Button>
              </Link>
            </div>
          )}
        </article>
      </div>
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDeleteReview}
        itemName="review"
      />
    </div>
  );
}
