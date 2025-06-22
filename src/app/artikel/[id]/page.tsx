"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  Calendar,
  Clock,
  Share2,
  Heart,
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

interface Pengelola {
  id: number;
  name: string;
}

interface UpdatedBy {
  id: number;
  name: string;
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

interface Article {
  id: number;
  title: string;
  content: string;
  image: string;
  createdAt: string;
  updatedAt?: string;
  pengelolaId?: number;
  updatedById?: number;
  pengelola?: Pengelola;
  updatedBy?: UpdatedBy;
  category?: string;
  tags?: string[];
}

export default function ArticleDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = React.use(paramsPromise);
  const [article, setArticle] = useState<Article | null>(null);
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

  const fetchArticle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/artikel?id=${params.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch article");
      }

      const result = await response.json();

      if (!result.data) {
        throw new Error("Article not found");
      }

      setArticle(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setArticle(null);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  const fetchReviews = useCallback(async () => {
    try {
      const response = await fetch(`/api/ulasan?artikelId=${params.id}`, {
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
          artikelId: Number(params.id),
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
    fetchArticle();
    fetchReviews();
    fetchCurrentUser();
  }, [params.id, fetchArticle, fetchReviews]);

  if (loading) {
    return (
      <div className="min-h-screen pb-12">
        <header className="sticky top-0 z-10 shadow-sm">
          <div className="container px-4 py-4 mx-auto">
            <div className="flex items-center justify-between">
              <Link
                href="/artikel"
                className="flex items-center gap-2">
                <ChevronLeft size={20} />
                <span>Kembali ke Artikel</span>
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

  if (error || !article) {
    return (
      <div className="min-h-screen pb-12">
        <header className="sticky top-0 z-10 shadow-sm">
          <div className="container px-4 py-4 mx-auto">
            <div className="flex items-center justify-between">
              <Link
                href="/artikel"
                className="flex items-center gap-2">
                <ChevronLeft size={20} />
                <span>Kembali ke Artikel</span>
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
            <AlertDescription>{error || "Article not found"}</AlertDescription>
          </Alert>
          <Link href="/artikel">
            <Button>Kembali ke Artikel</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(article.createdAt).toLocaleDateString(
    "id-ID",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  let parsedContent = article.content;
  try {
    const contentObj = JSON.parse(article.content);
    if (typeof contentObj === "object") {
      parsedContent =
        contentObj.blocks?.map((block: any) => block.text).join("\n\n") ||
        article.content;
    }
  } catch (e) {
    parsedContent = article.content;
  }

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, review) => acc + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : "0.0";

  return (
    <div className="min-h-screen pb-12">
      <header className="sticky top-0 z-10 shadow-sm">
        <div className="container px-4 py-4 mx-auto">
          <div className="flex items-center justify-between">
            <Link
              href="/artikel"
              className="flex items-center gap-2">
              <ChevronLeft size={20} />
              <span>Kembali ke Artikel</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="container px-4 py-6 mx-auto">
        <div className="flex flex-col gap-8">
          <div className="w-full">
            <div className="relative rounded-xl overflow-hidden mb-4 aspect-[16/9]">
              <Image
                src={article.image || "/placeholder.svg?height=600&width=1200"}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
              {article.category && (
                <Badge className="absolute text-white bg-blue-600 top-4 left-4">
                  {article.category}
                </Badge>
              )}
            </div>

            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={18} />
                <span>{formattedDate}</span>
                {article.category && (
                  <Badge
                    variant="outline"
                    className="ml-2">
                    {article.category}
                  </Badge>
                )}
              </div>

              <h1 className="mb-3 text-3xl font-bold">{article.title}</h1>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="font-medium">{averageRating}</span>
                  <span className="text-muted-foreground">
                    ({reviews.length} ulasan)
                  </span>
                </div>
                {article.pengelola && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Avatar className="w-5 h-5">
                      <AvatarFallback className="text-xs">
                        {article.pengelola.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>Oleh {article.pengelola.name}</span>
                  </div>
                )}
                {article.updatedAt && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock size={16} />
                    <span>
                      Diperbarui{" "}
                      {new Date(article.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Content Section */}
            <div className="mb-10">
              <h2 className="mb-4 text-2xl font-bold">Konten Artikel</h2>
              <div className="p-6 shadow-sm rounded-xl">
                <div className="leading-relaxed prose text-muted-foreground prose-blue max-w-none">
                  {parsedContent.split("\n").map((paragraph, index) => (
                    <p
                      key={index}
                      className="mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Tags Section */}
            {article.tags && article.tags.length > 0 && (
              <div className="mb-10">
                <h2 className="mb-4 text-2xl font-bold">Tag</h2>
                <div className="p-6 shadow-sm rounded-xl">
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Author Section */}
            {article.pengelola && (
              <div className="mb-10">
                <h2 className="mb-4 text-2xl font-bold">Tentang Penulis</h2>
                <div className="p-6 shadow-sm rounded-xl">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback>
                        {article.pengelola.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="mb-1 font-medium">
                        {article.pengelola.name}
                      </h3>
                      <p className="text-muted-foreground">
                        Penulis konten dan ahli destinasi dengan passion dalam
                        berbagi pengalaman perjalanan.
                      </p>
                    </div>
                  </div>
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
                            placeholder="Bagikan pendapat Anda tentang artikel ini..."
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
