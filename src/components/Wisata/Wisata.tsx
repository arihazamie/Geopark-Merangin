"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, Calendar, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Define the types based on your Prisma schema and API response
interface Review {
  rating: number;
  comment: string;
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

export default function HomePage() {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttractions = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/wisata", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch attractions");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to load attractions");
        }

        setAttractions(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setAttractions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttractions();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <section className="px-4 py-12">
        <div className="container mx-auto">
          {error && (
            <Alert
              variant="destructive"
              className="mb-6">
              <AlertCircle className="w-4 h-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden bg-white shadow-md rounded-xl">
                  <Skeleton className="w-full h-60" />
                  <div className="p-5">
                    <Skeleton className="w-24 h-4 mb-2" />
                    <Skeleton className="w-full h-6 mb-2" />
                    <Skeleton className="w-full h-4 mb-2" />
                    <Skeleton className="w-3/4 h-4 mb-4" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="w-20 h-4" />
                      <Skeleton className="w-24 h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {attractions.map((attraction) => (
                <Link
                  href={`/wisata/${attraction.id}`}
                  key={attraction.id}
                  className="block group">
                  <div className="overflow-hidden transition-shadow duration-300 bg-white shadow-md rounded-xl hover:shadow-lg">
                    <div className="relative overflow-hidden h-60">
                      <Image
                        src={attraction.images[0] || "/placeholder.svg"}
                        alt={attraction.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {attraction.isVerified && (
                        <div className="absolute flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded-full top-3 right-3">
                          <CheckCircle size={12} />
                          <span>Verified</span>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2 text-sm text-blue-600">
                        <MapPin size={16} />
                        <span>{attraction.location}</span>
                      </div>
                      <h3 className="mb-2 text-xl font-bold transition-colors group-hover:text-blue-600">
                        {attraction.name}
                      </h3>
                      <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                        {attraction.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="font-medium">
                            {attraction.reviews.length > 0
                              ? (
                                  attraction.reviews.reduce(
                                    (acc, review) => acc + review.rating,
                                    0
                                  ) / attraction.reviews.length
                                ).toFixed(1)
                              : "N/A"}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ({attraction.reviews.length} reviews)
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar size={14} />
                          <span>
                            {new Date(
                              attraction.createdAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!loading && attractions.length === 0 && !error && (
            <div className="py-12 text-center">
              <h3 className="mb-2 text-xl font-medium">No attractions found</h3>
              <p className="mb-6 text-muted-foreground">
                There are no tourist attractions available at the moment.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
