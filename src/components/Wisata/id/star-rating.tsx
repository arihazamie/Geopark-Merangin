"use client";

import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
  readonly?: boolean;
}

export default function StarRating({
  rating,
  onRatingChange,
  size = 20,
  readonly = false,
}: StarRatingProps) {
  const handleClick = (selectedRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(selectedRating);
    }
  };

  const handleMouseEnter = (star: HTMLDivElement, index: number) => {
    if (readonly) return;

    // Fill stars up to the hovered one
    const stars = star.parentElement?.children;
    if (stars) {
      for (let i = 0; i < stars.length; i++) {
        const starElement = stars[i] as HTMLElement;
        if (i <= index) {
          starElement.classList.add("star-hover");
        } else {
          starElement.classList.remove("star-hover");
        }
      }
    }
  };

  const handleMouseLeave = (star: HTMLDivElement) => {
    if (readonly) return;

    // Reset to the actual rating
    const stars = star.parentElement?.children;
    if (stars) {
      for (let i = 0; i < stars.length; i++) {
        const starElement = stars[i] as HTMLElement;
        starElement.classList.remove("star-hover");
      }
    }
  };

  return (
    <div className="flex">
      <style
        jsx
        global>{`
        .star-hover .star-icon {
          fill: #facc15;
          color: #facc15;
        }
      `}</style>

      {[1, 2, 3, 4, 5].map((star) => (
        <div
          key={star}
          className={`cursor-pointer transition-colors ${
            readonly ? "cursor-default" : ""
          }`}
          onClick={() => handleClick(star)}
          onMouseEnter={(e) => handleMouseEnter(e.currentTarget, star - 1)}
          onMouseLeave={(e) => handleMouseLeave(e.currentTarget)}>
          <Star
            size={size}
            className={`star-icon ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        </div>
      ))}
    </div>
  );
}
