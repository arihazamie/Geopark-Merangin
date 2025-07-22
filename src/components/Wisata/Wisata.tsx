"use client";

import type React from "react";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin,
  Star,
  Search,
  Clock,
  DollarSign,
  Map,
  List,
  Filter,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Dynamic import of LeafletMap with SSR disabled
const LeafletMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full dark:bg-gray-700 animate-pulse">
          <Map className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
        <p className="text-gray-500 dark:text-gray-400">Memuat peta...</p>
      </div>
    </div>
  ),
});

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

type FilterType = "all" | "Geologi" | "Biologi" | "Budaya";

export default function WisataTabs() {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [filteredAttractions, setFilteredAttractions] = useState<Attraction[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [activeTab, setActiveTab] = useState<string>("list");

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
          // Mock data for development
          const mockAttractions: Attraction[] = [
            {
              id: 1,
              name: "Geopark Ciletuh",
              description:
                "Kawasan geopark dengan formasi batuan unik dan pemandangan alam yang menakjubkan",
              location: "Sukabumi, Jawa Barat",
              images: ["/placeholder.svg?height=200&width=300"],
              reviews: [{ rating: 4.5, comment: "Bagus sekali" }],
              isVerified: true,
              createdAt: "2024-01-01",
              latitude: -7.0051,
              longitude: 106.4426,
              type: "Geologi",
              ticketPrice: 15000,
              openingTime: "08:00",
              closingTime: "17:00",
            },
            {
              id: 2,
              name: "Taman Nasional Ujung Kulon",
              description:
                "Habitat alami badak bercula satu dan keanekaragaman hayati yang luar biasa",
              location: "Banten",
              images: ["/placeholder.svg?height=200&width=300"],
              reviews: [{ rating: 4.8, comment: "Luar biasa" }],
              isVerified: true,
              createdAt: "2024-01-01",
              latitude: -6.7661,
              longitude: 105.3639,
              type: "Biologi",
              ticketPrice: 25000,
              openingTime: "07:00",
              closingTime: "18:00",
            },
            {
              id: 3,
              name: "Candi Borobudur",
              description:
                "Candi Buddha terbesar di dunia dengan arsitektur yang memukau",
              location: "Magelang, Jawa Tengah",
              images: ["/placeholder.svg?height=200&width=300"],
              reviews: [
                { rating: 4.9, comment: "Warisan dunia yang menakjubkan" },
              ],
              isVerified: true,
              createdAt: "2024-01-01",
              latitude: -7.6079,
              longitude: 110.2038,
              type: "Budaya",
              ticketPrice: 50000,
              openingTime: "06:00",
              closingTime: "17:00",
            },
          ];
          setAttractions(mockAttractions);
          setFilteredAttractions(mockAttractions);
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

  // Handle search and filter functionality
  useEffect(() => {
    let filtered = attractions;

    // Apply category filter
    if (activeFilter !== "all") {
      filtered = filtered.filter(
        (attraction) => attraction.type === activeFilter
      );
    }

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (attraction) =>
          attraction.name.toLowerCase().includes(query) ||
          attraction.location.toLowerCase().includes(query) ||
          attraction.description.toLowerCase().includes(query) ||
          attraction.type?.toLowerCase().includes(query)
      );
    }

    setFilteredAttractions(filtered);
  }, [searchQuery, attractions, activeFilter]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
  };

  const getAverageRating = (reviews: Review[] | null | undefined) => {
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

  const getFilterCounts = () => {
    const counts = {
      all: attractions.length,
      Geologi: attractions.filter((a) => a.type === "Geologi").length,
      Biologi: attractions.filter((a) => a.type === "Biologi").length,
      Budaya: attractions.filter((a) => a.type === "Budaya").length,
    };
    return counts;
  };

  const filterCounts = getFilterCounts();

  return (
    <div className="min-h-screen transition-colors">
      {/* Header Section */}
      <div className="transition-colors bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container px-4 py-8 mx-auto">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
              Destinasi Wisata
            </h1>
          </div>

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-6">
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

          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <Button
              variant={activeFilter === "all" ? "default" : "outline"}
              onClick={() => handleFilterChange("all")}
              className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Semua ({filterCounts.all})
            </Button>
            <Button
              variant={activeFilter === "Geologi" ? "default" : "outline"}
              onClick={() => handleFilterChange("Geologi")}
              className="flex items-center gap-2">
              🏔️ Geologi ({filterCounts.Geologi})
            </Button>
            <Button
              variant={activeFilter === "Biologi" ? "default" : "outline"}
              onClick={() => handleFilterChange("Biologi")}
              className="flex items-center gap-2">
              🌿 Biologi ({filterCounts.Biologi})
            </Button>
            <Button
              variant={activeFilter === "Budaya" ? "default" : "outline"}
              onClick={() => handleFilterChange("Budaya")}
              className="flex items-center gap-2">
              🏛️ Budaya ({filterCounts.Budaya})
            </Button>
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

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto mb-8">
            <TabsTrigger
              value="list"
              className="flex items-center gap-2">
              <List className="w-4 h-4" />
              Daftar
            </TabsTrigger>
            <TabsTrigger
              value="map"
              className="flex items-center gap-2">
              <Map className="w-4 h-4" />
              Peta
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="list"
            className="space-y-6">
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
                                  "/placeholder.svg?height=200&width=300" ||
                                  "/placeholder.svg"
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
              </>
            )}
          </TabsContent>

          <TabsContent
            value="map"
            className="space-y-6">
            <div className="w-full overflow-hidden border border-gray-200 rounded-lg h-96 dark:border-gray-700">
              <LeafletMap
                attractions={filteredAttractions.map((attraction) => ({
                  id: attraction.id,
                  name: attraction.name,
                  latitude: attraction.latitude,
                  longitude: attraction.longitude,
                  type: attraction.type,
                  location: attraction.location,
                }))}
                zoom={8}
                isVisible={activeTab === "map"}
              />
            </div>

            {/* Map Legend - only show if there are attractions */}
            {!loading && filteredAttractions.length > 0 && (
              <div className="p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
                <h4 className="mb-3 font-semibold text-gray-900 dark:text-white">
                  Lokasi Wisata ({filteredAttractions.length})
                </h4>

                {/* Legend for marker types */}
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center justify-center w-6 h-6 text-xs text-white bg-red-500 rounded-full">
                      🏔️
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Geologi
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center justify-center w-6 h-6 text-xs text-white bg-green-500 rounded-full">
                      🌿
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Biologi
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center justify-center w-6 h-6 text-xs text-white bg-orange-500 rounded-full">
                      🏛️
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Budaya
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {filteredAttractions.slice(0, 6).map((attraction) => {
                    let markerColor = "bg-blue-500";
                    let emoji = "📍";

                    switch (attraction.type) {
                      case "Geologi":
                        markerColor = "bg-red-500";
                        emoji = "🏔️";
                        break;
                      case "Biologi":
                        markerColor = "bg-green-500";
                        emoji = "🌿";
                        break;
                      case "Budaya":
                        markerColor = "bg-orange-500";
                        emoji = "🏛️";
                        break;
                    }

                    return (
                      <div
                        key={attraction.id}
                        className="flex items-center space-x-3">
                        <div
                          className={`w-6 h-6 ${markerColor} rounded-full flex items-center justify-center text-white text-xs flex-shrink-0`}>
                          {emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                            {attraction.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate dark:text-gray-400">
                            {attraction.location}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {filteredAttractions.length > 6 && (
                  <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                    +{filteredAttractions.length - 6} lokasi lainnya
                  </p>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
