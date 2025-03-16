"use client";

import type React from "react";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import StarRating from "@/components/Wisata/id/star-rating";
import type { Review } from "@/types/wisata";

export default function ReviewSection({
  wisataId,
  initialReviews,
}: {
  wisataId: string;
  initialReviews: Review[];
}) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reviewComment.trim()) {
      alert("Please enter a comment for your review");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/ulasan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment,
          wisataId: Number(wisataId),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit review");
      }

      const newReview = await response.json();

      // Add the new review to the reviews state
      setReviews((prevReviews) => [newReview, ...prevReviews]);
      setReviewComment("");
      alert(
        `Thank you for your ${reviewRating}-star review! Your feedback has been submitted.`
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-10">
      <h2 className="mb-6 text-2xl font-bold">Ulasan</h2>

      {/* Review Form */}
      <div className="p-6 mb-8 bg-white shadow-sm rounded-xl">
        <h3 className="mb-4 text-xl font-medium">Berikan Ulasan Anda</h3>
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
                {reviewRating} {reviewRating === 1 ? "star" : "stars"}
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
              placeholder="Bagikan pengalaman Anda mengunjungi tempat ini..."
              className="min-h-[120px]"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}>
            {isSubmitting ? "Mengirim..." : "Kirim Ulasan"}
          </Button>
        </form>
      </div>

      {/* Existing Reviews - Scrollable */}
      <div className="p-6 bg-white shadow-sm rounded-xl">
        <h3 className="mb-4 text-xl font-medium">Ulasan Sebelumnya</h3>
        {reviews.length > 0 ? (
          <div className="h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-6">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-6 border bg-gray-50 rounded-xl">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage
                        src={review.pengguna.image || "/placeholder.svg"}
                      />
                      <AvatarFallback>
                        {review.pengguna.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">{review.pengguna.name}</h4>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
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
                      <p className="text-muted-foreground">{review.comment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <p>No reviews yet. Be the first to leave a review!</p>
          </div>
        )}
      </div>
    </div>
  );
}
