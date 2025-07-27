"use client";

import type React from "react";
import { useState, useMemo } from "react";
import useSWR from "swr";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Star, Search, Clock, DollarSign, Filter } from "lucide-react";

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

type FilterType = "all" | "Geologi" | "Biologi" | "Budaya";

const fetcher = (url: string) =>
  fetch(url)
    .then((res) => res.json())
    .then((json) => {
      if (!json.success) throw new Error(json.error || "Gagal mengambil data");
      return (json.data || []).filter((item: Attraction) => item.isVerified);
    });

export default function WisataTabs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const {
    data: attractions = [],
    error,
    isLoading,
  } = useSWR<Attraction[]>("/api/wisata", fetcher, {
    dedupingInterval: 300000,
    revalidateOnFocus: false,
  });

  const filteredAttractions = useMemo(() => {
    let result = attractions;

    if (activeFilter !== "all") {
      result = result.filter((a) => a.type === activeFilter);
    }

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(query) ||
          a.location.toLowerCase().includes(query) ||
          a.description.toLowerCase().includes(query) ||
          a.type?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [attractions, searchQuery, activeFilter]);

  const filterCounts = useMemo(
    () => ({
      all: attractions.length,
      Geologi: attractions.filter((a) => a.type === "Geologi").length,
      Biologi: attractions.filter((a) => a.type === "Biologi").length,
      Budaya: attractions.filter((a) => a.type === "Budaya").length,
    }),
    [attractions]
  );

  const getAverageRating = (reviews: Review[] | null | undefined) => {
    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) return 0;
    return (
      reviews.reduce((acc, review) => acc + (review?.rating || 0), 0) /
      reviews.length
    );
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
    return time || null;
  };

  return (
    <div className="min-h-screen transition-colors">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container px-4 py-8 mx-auto">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
              Destinasi Wisata
            </h1>
          </div>

          {/* Search */}
          <div className="max-w-md mx-auto mb-6">
            <div className="relative">
              <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2 dark:text-gray-500" />
              <Input
                type="text"
                placeholder="Cari destinasi wisata..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 pl-10 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              />
            </div>
          </div>

          {/* Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {(["all", "Geologi", "Biologi", "Budaya"] as FilterType[]).map(
              (type) => (
                <Button
                  key={type}
                  variant={activeFilter === type ? "default" : "outline"}
                  onClick={() => setActiveFilter(type)}
                  className="flex items-center gap-2">
                  {type === "all" && <Filter className="w-4 h-4" />}
                  {type === "Geologi" && "🏔️"}
                  {type === "Biologi" && "🌿"}
                  {type === "Budaya" && "🏛️"}
                  <span>
                    {type.charAt(0).toUpperCase() + type.slice(1)} (
                    {filterCounts[type]})
                  </span>
                </Button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container px-4 py-8 mx-auto">
        {error && (
          <Alert
            variant="destructive"
            className="max-w-2xl mx-auto mb-6">
            <AlertDescription>
              {error.message || "Gagal memuat data."}
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="overflow-hidden bg-white shadow-sm dark:bg-gray-800 rounded-2xl">
                <Skeleton className="w-full h-48" />
                <div className="p-6 space-y-3">
                  <Skeleton className="w-20 h-4" />
                  <Skeleton className="w-full h-6" />
                  <Skeleton className="w-full h-4" />
                  <div className="flex justify-between">
                    <Skeleton className="w-16 h-4" />
                    <Skeleton className="w-12 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredAttractions.length > 0 ? (
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
                        src={attraction.images[0] || "/placeholder.svg"}
                        alt={attraction.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {attraction.type && (
                        <Badge className="absolute text-white bg-blue-500 top-3 left-3 hover:bg-blue-600">
                          {attraction.type}
                        </Badge>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-center mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <MapPin className="w-4 h-4 mr-1" />
                        {attraction.location}
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-1">
                        {attraction.name}
                      </h3>
                      <p className="mb-4 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {attraction.description}
                      </p>
                      <div className="mb-4 space-y-2">
                        {attraction.ticketPrice !== undefined && (
                          <div className="flex items-center text-sm">
                            <DollarSign className="w-4 h-4 mr-1 text-green-500" />
                            <span className="font-medium text-green-600 dark:text-green-400">
                              {formatPrice(attraction.ticketPrice)}
                            </span>
                          </div>
                        )}
                        {(attraction.openingTime || attraction.closingTime) && (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                            <Clock className="w-4 h-4 mr-1 text-blue-500" />
                            <span>
                              {formatTime(attraction.openingTime) || "00:00"} -{" "}
                              {formatTime(attraction.closingTime) || "24:00"}
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
        ) : (
          <div className="py-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full dark:bg-gray-700">
                <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                {searchQuery.trim() !== "" || activeFilter !== "all"
                  ? "Tidak ada hasil ditemukan"
                  : "Belum ada destinasi wisata"}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {searchQuery.trim() !== "" || activeFilter !== "all"
                  ? "Coba sesuaikan kata kunci pencarian atau filter kategori."
                  : "Periksa kembali nanti untuk destinasi wisata terverifikasi yang baru."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
