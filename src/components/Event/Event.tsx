"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Search, MapPin, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  isVerified?: boolean;
  createdAt: string;
  updatedAt?: string;
  wisataId?: number;
  pengelolaId?: number;
  updatedById?: number;
  wisata?: Wisata;
  pengelola?: Pengelola;
  updatedBy?: UpdatedBy;
  category?: string;
}

const fetcher = (url: string) =>
  fetch(url)
    .then((res) => res.json())
    .then((json: Event[]) => json.filter((item) => item.isVerified));

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const {
    data: events = [],
    error,
    isLoading,
  } = useSWR<Event[]>("/api/event", fetcher, {
    dedupingInterval: 300000,
    revalidateOnFocus: false,
  });

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    if (searchQuery.trim() === "") return events;

    const query = searchQuery.toLowerCase();
    return events.filter(
      (event) =>
        event.title?.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.location?.toLowerCase().includes(query)
    );
  }, [events, searchQuery]);

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start.toDateString() === end.toDateString()) {
      return start.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }

    return `${start.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
    })} - ${end.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}`;
  };

  const getExcerpt = (text: string, maxLength = 150) =>
    !text
      ? ""
      : text.length > maxLength
      ? text.slice(0, maxLength) + "..."
      : text;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="min-h-screen transition-colors">
      {/* Header */}
      <div className="container px-4 py-8 mx-auto">
        <div className="max-w-md mx-auto">
          <div className="mb-4 text-center">
            <h1 className="text-3xl font-bold">Daftar Event</h1>
          </div>
          <div className="relative">
            <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2 dark:text-gray-500" />
            <Input
              type="text"
              placeholder="Cari event..."
              value={searchQuery}
              onChange={handleSearch}
              className="h-12 pl-10 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Konten */}
      <div className="container px-4 py-8 mx-auto">
        {error && (
          <Alert
            variant="destructive"
            className="max-w-2xl mx-auto mb-6">
            <AlertDescription>
              {error.message || "Gagal memuat data event."}
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
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
        ) : (
          <>
            {filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/event/${event.id}`}
                    className="block group">
                    <div className="overflow-hidden transition-all duration-300 bg-white border border-gray-100 shadow-sm dark:bg-gray-800 rounded-2xl hover:shadow-md dark:hover:shadow-lg group-hover:-translate-y-1 dark:border-gray-700">
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={event.image || "/placeholder.svg"}
                          alt={event.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {event.category && (
                          <div className="absolute top-3 left-3">
                            <Badge className="text-white bg-purple-600/90">
                              {event.category}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <div className="flex items-center mb-2 text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDateRange(event.startDate, event.endDate)}
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2">
                          {event.title}
                        </h3>
                        <div className="flex items-center mb-3 text-sm text-gray-500 dark:text-gray-400">
                          <MapPin className="w-4 h-4 mr-1" />
                          {event.location}
                        </div>
                        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                          {getExcerpt(event.description)}
                        </p>
                        <div className="flex items-center justify-between">
                          {event.wisata ? (
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                              <CheckCircle2 className="w-4 h-4 mr-1 text-green-500" />
                              {event.wisata.name}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400 dark:text-gray-500">
                              Event Umum
                            </span>
                          )}
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                            Lihat Detail →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="max-w-md mx-auto">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full dark:bg-gray-700">
                    <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                    {searchQuery.trim()
                      ? "Tidak ada hasil ditemukan"
                      : "Belum ada event tersedia"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {searchQuery.trim()
                      ? "Coba periksa kembali kata kunci pencarian Anda."
                      : "Silakan kembali lagi nanti untuk melihat event terbaru."}
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
