"use client";

import type React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, Search, Clock, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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
  ticketPrice?: number;
  openingTime?: string;
  closingTime?: string;
}

export default function WisataPage() {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [filteredAttractions, setFilteredAttractions] = useState<Attraction[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const fetchAttractions = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Fetching attractions from /api/wisata...");

        const response = await fetch("/api/wisata", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("Response status:", response.status);
        console.log("Response headers:", response.headers);

        // Check if response is actually JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const textResponse = await response.text();
          console.error(
            "Non-JSON response received:",
            textResponse.substring(0, 200)
          );
          throw new Error(
            `API returned ${
              contentType || "unknown content type"
            } instead of JSON`
          );
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API error response:", errorText);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("API response data:", data);

        if (!data.success) {
          throw new Error(data.error || "Failed to load attractions");
        }

        // Only store verified attractions
        const verifiedAttractions = (data.data || []).filter(
          (attraction: Attraction) => attraction.isVerified
        );

        setAttractions(verifiedAttractions);
        setFilteredAttractions(verifiedAttractions);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err instanceof Error ? err.message : "An error occurred");

        // For development: use mock data if API fails
        if (process.env.NODE_ENV === "development") {
          console.log("Using mock data for development...");
          setError(null);
        } else {
          setAttractions([]);
          setFilteredAttractions([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAttractions();
  }, []);

  // Handle search functionality
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredAttractions(attractions);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = attractions.filter(
      (attraction) =>
        attraction.name.toLowerCase().includes(query) ||
        attraction.location.toLowerCase().includes(query) ||
        attraction.description.toLowerCase().includes(query) ||
        attraction.type?.toLowerCase().includes(query)
    );

    setFilteredAttractions(filtered);
  }, [searchQuery, attractions]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const getAverageRating = (reviews: Review[] | null | undefined) => {
    // Check if reviews exists and is an array
    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) return 0;

    try {
      return (
        reviews.reduce((acc, review) => acc + (review?.rating || 0), 0) /
        reviews.length
      );
    } catch (error) {
      console.error("Error calculating average rating:", error);
      return 0;
    }
  };

  const formatPrice = (price: number | null | undefined) => {
    if (!price || price === 0) return "Gratis";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatTime = (time: string | null | undefined) => {
    if (!time) return null;
    return time;
  };

  return (
    <div className="min-h-screen transition-colors">
      {/* Header Section */}
      <div className="transition-colors">
        <div className="container px-4 py-8 mx-auto">
          <div className="mb-8 text-center">
            <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
              Destinasi Wisata
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
              Temukan destinasi wisata terbaik yang telah terverifikasi
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2 dark:text-gray-500" />
              <Input
                type="text"
                placeholder="Cari destinasi wisata..."
                value={searchQuery}
                onChange={handleSearch}
                className="h-12 pl-10 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container px-4 py-8 mx-auto">
        {error && (
          <Alert
            variant="destructive"
            className="max-w-2xl mx-auto mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="overflow-hidden bg-white shadow-sm dark:bg-gray-800 rounded-2xl">
                <Skeleton className="w-full h-48" />
                <div className="p-6">
                  <Skeleton className="w-20 h-4 mb-3" />
                  <Skeleton className="w-full h-6 mb-2" />
                  <Skeleton className="w-full h-4 mb-4" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="w-16 h-4" />
                    <Skeleton className="w-12 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {filteredAttractions.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredAttractions.map((attraction) => {
                    const avgRating = getAverageRating(attraction.reviews);

                    return (
                      <Link
                        href={`/wisata/${attraction.id}`}
                        key={attraction.id}
                        className="block group">
                        <div className="overflow-hidden transition-all duration-300 bg-white border border-gray-100 shadow-sm dark:bg-gray-800 rounded-2xl hover:shadow-md dark:hover:shadow-lg group-hover:-translate-y-1 dark:border-gray-700">
                          <div className="relative h-48 overflow-hidden">
                            <Image
                              src={
                                attraction.images[0] ||
                                "/placeholder.svg?height=200&width=300"
                              }
                              alt={attraction.name}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            {attraction.type && (
                              <Badge className="absolute bg-blue-500 top-3 left-3 hover:bg-blue-600">
                                {attraction.type}
                              </Badge>
                            )}
                          </div>

                          <div className="p-6">
                            <div className="flex items-center mb-2 text-sm text-gray-500 dark:text-gray-400">
                              <MapPin className="w-4 h-4 mr-1" />
                              {attraction.location}
                            </div>

                            <h3 className="mb-2 text-lg font-semibold text-gray-900 transition-colors dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                              {attraction.name}
                            </h3>

                            <p className="mb-4 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                              {attraction.description}
                            </p>

                            {/* Price and Operating Hours */}
                            <div className="mb-4 space-y-2">
                              {attraction.ticketPrice !== undefined && (
                                <div className="flex items-center text-sm">
                                  <DollarSign className="w-4 h-4 mr-1 text-green-500" />
                                  <span className="font-medium text-green-600 dark:text-green-400">
                                    {formatPrice(attraction.ticketPrice)}
                                  </span>
                                </div>
                              )}

                              {(attraction.openingTime ||
                                attraction.closingTime) && (
                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                  <Clock className="w-4 h-4 mr-1 text-blue-500" />
                                  <span>
                                    {formatTime(attraction.openingTime) ||
                                      "00:00"}{" "}
                                    -{" "}
                                    {formatTime(attraction.closingTime) ||
                                      "24:00"}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between">
                              {Array.isArray(attraction.reviews) &&
                              attraction.reviews.length > 0 ? (
                                <div className="flex items-center">
                                  <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    {avgRating.toFixed(1)}
                                  </span>
                                  <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                                    ({attraction.reviews.length})
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400 dark:text-gray-500">
                                  Belum ada ulasan
                                </span>
                              )}

                              <span className="text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                                Lihat Detail →
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="py-16 text-center">
                <div className="max-w-md mx-auto">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full dark:bg-gray-700">
                    <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                    {searchQuery.trim() !== ""
                      ? "Tidak ada hasil ditemukan"
                      : "Belum ada destinasi wisata"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {searchQuery.trim() !== ""
                      ? "Coba sesuaikan kata kunci pencarian atau jelajahi semua destinasi."
                      : "Periksa kembali nanti untuk destinasi wisata terverifikasi yang baru."}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
