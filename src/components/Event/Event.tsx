"use client";

import type React from "react";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { Search, Calendar, MapPin, Clock, CalendarDays, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format, parseISO, isAfter, isBefore } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Event {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  image: string;
  images?: string[];
  wisata?: {
    id: number;
    name: string;
  } | null;
  pengelola?: {
    id: number;
    name: string;
  } | null;
  category?: string;
  isFree?: boolean;
  price?: string;
  status?: string;
}

export default function EventPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetch(`${apiUrl}/api/event`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.statusText}`);
      }

      const result = await response.json();

      if (!Array.isArray(result)) {
        throw new Error("Received invalid data format from API");
      }

      // Transform API data to match our component's expected format
      const transformedEvents = result.map((event: any) => ({
        id: event.id || 0,
        title: event.title || event.name || "",
        description: event.description || "",
        startDate: event.startDate || new Date().toISOString(),
        endDate: event.endDate || new Date().toISOString(),
        location: event.location || "",
        image:
          event.image ||
          event.images?.[0] ||
          "/placeholder.svg?height=400&width=600",
        images: event.images || ["/placeholder.svg?height=400&width=600"],
        wisata: event.wisata,
        pengelola: event.pengelola,
        category: event.category || "Umum",
        isFree: event.isFree || false,
        price: event.price || "Rp 0",
        status: getEventStatus(event.startDate, event.endDate),
      }));

      setEvents(transformedEvents);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("Error fetching events:", err);
      setError(`Failed to load events: ${errorMessage}`);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Helper function to determine event status based on dates
  function getEventStatus(startDate: string, endDate: string): string {
    try {
      const now = new Date();
      const start = parseISO(startDate || new Date().toISOString());
      const end = parseISO(endDate || new Date().toISOString());

      if (isBefore(now, start)) {
        return "upcoming";
      } else if (isAfter(now, end)) {
        return "past";
      } else {
        return "ongoing";
      }
    } catch (error) {
      console.error("Error determining event status:", error);
      return "upcoming"; // Default fallback
    }
  }

  // Filter events based on search term and status
  const filteredEvents = events.filter((event) => {
    // Safely check if properties exist before calling toLowerCase()
    const title = event.title || "";
    const description = event.description || "";
    const location = event.location || "";

    const searchTermLower = searchTerm.toLowerCase();

    const matchesSearch =
      searchTerm === "" ||
      title.toLowerCase().includes(searchTermLower) ||
      description.toLowerCase().includes(searchTermLower) ||
      location.toLowerCase().includes(searchTermLower);

    const matchesStatus =
      statusFilter === "all" || event.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Get status label for display
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "upcoming":
        return "Akan Datang";
      case "ongoing":
        return "Sedang Berlangsung";
      case "past":
        return "Telah Selesai";
      default:
        return "Semua Event";
    }
  };

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "upcoming":
        return "outline";
      case "ongoing":
        return "default";
      case "past":
        return "secondary";
      default:
        return "outline";
    }
  };

  // Format date range for display
  const formatDateRange = (startDate: string, endDate: string) => {
    try {
      const start = parseISO(startDate);
      const end = parseISO(endDate);

      // If same day
      if (format(start, "yyyy-MM-dd") === format(end, "yyyy-MM-dd")) {
        return `${format(start, "d MMMM yyyy", { locale: id })}`;
      }

      // If same month and year
      if (format(start, "yyyy-MM") === format(end, "yyyy-MM")) {
        return `${format(start, "d")} - ${format(end, "d MMMM yyyy", {
          locale: id,
        })}`;
      }

      // If same year
      if (format(start, "yyyy") === format(end, "yyyy")) {
        return `${format(start, "d MMMM")} - ${format(end, "d MMMM yyyy", {
          locale: id,
        })}`;
      }

      // Different years
      return `${format(start, "d MMMM yyyy")} - ${format(end, "d MMMM yyyy", {
        locale: id,
      })}`;
    } catch (error) {
      console.error("Error formatting date range:", error);
      return "Tanggal tidak valid";
    }
  };

  // Get a featured event (first ongoing or upcoming event, or first event if none)
  const getFeaturedEvent = () => {
    const ongoingEvent = filteredEvents.find(
      (event) => event.status === "ongoing"
    );
    if (ongoingEvent) return ongoingEvent;

    const upcomingEvent = filteredEvents.find(
      (event) => event.status === "upcoming"
    );
    if (upcomingEvent) return upcomingEvent;

    return filteredEvents.length > 0 ? filteredEvents[0] : null;
  };

  const featuredEvent = getFeaturedEvent();
  // Get remaining events (skip the featured one)
  const remainingEvents = featuredEvent
    ? filteredEvents.filter((event) => event.id !== featuredEvent.id)
    : [];

  // Get time until event starts
  const getTimeUntilEvent = (startDate: string) => {
    try {
      const now = new Date();
      const start = parseISO(startDate);

      if (isBefore(now, start)) {
        const diffDays = Math.ceil(
          (start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 0) {
          return "Hari ini";
        } else if (diffDays === 1) {
          return "Besok";
        } else if (diffDays < 7) {
          return `${diffDays} hari lagi`;
        } else if (diffDays < 30) {
          return `${Math.floor(diffDays / 7)} minggu lagi`;
        } else {
          return `${Math.floor(diffDays / 30)} bulan lagi`;
        }
      }
      return null;
    } catch (error) {
      console.error("Error calculating time until event:", error);
      return null;
    }
  };

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // The search is already reactive with the input change, but this prevents form submission
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="container px-4 mx-auto">
      <header className="space-y-4 text-center">
        <h1 className="text-4xl font-bold">Event dan Kegiatan</h1>
        <p className="max-w-3xl mx-auto text-xl text-muted-foreground">
          Jelajahi berbagai event dan kegiatan menarik di Geopark Merangin
        </p>
      </header>

      <section className="space-y-6">
        <div className="text-center">
          <form
            onSubmit={handleSearchSubmit}
            className="flex justify-center">
            <div className="relative flex items-center w-full max-w-md">
              <div className="relative flex-1">
                <Search className="absolute w-5 h-5 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Cari event..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-12 pl-10 pr-10 border-r-0 rounded-l-full focus-visible:ring-primary"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute -translate-y-1/2 right-3 top-1/2 text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                    <span className="sr-only">Clear search</span>
                  </button>
                )}
              </div>
              <Button
                type="submit"
                className="h-12 px-6 rounded-r-full bg-primary hover:bg-primary/90">
                <Search className="w-5 h-5 mr-2" />
                <span>Cari</span>
              </Button>
            </div>
          </form>
        </div>

        <div className="text-center">
          <div
            className="flex justify-center"
            role="tablist">
            <div className="inline-flex flex-wrap justify-center gap-3 mx-auto">
              {["all", "upcoming", "ongoing", "past"].map((status) => {
                const isActive = statusFilter === status;
                let icon;

                switch (status) {
                  case "all":
                    icon = <CalendarDays className="w-5 h-5 mr-2" />;
                    break;
                  case "upcoming":
                    icon = <Clock className="w-5 h-5 mr-2" />;
                    break;
                  case "ongoing":
                    icon = <Calendar className="w-5 h-5 mr-2" />;
                    break;
                  case "past":
                    icon = <Calendar className="w-5 h-5 mr-2" />;
                    break;
                }

                return (
                  <Button
                    key={status}
                    variant={isActive ? "default" : "outline"}
                    size="lg"
                    className={cn(
                      "rounded-full px-6 py-6 transition-all duration-300 shadow-sm",
                      isActive
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground scale-105"
                        : "hover:bg-primary/10 hover:text-primary hover:border-primary"
                    )}
                    onClick={() => setStatusFilter(status)}
                    aria-selected={isActive}
                    role="tab">
                    <div className="flex items-center">
                      {icon}
                      <span>{getStatusLabel(status)}</span>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {isLoading && (
        <div
          className="py-12 text-center"
          aria-live="polite">
          <div className="w-10 h-10 mx-auto mb-4 border-2 rounded-full border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground">Memuat event...</p>
        </div>
      )}

      {error && (
        <div
          className="py-12 text-center"
          aria-live="polite">
          <p className="mb-4 text-destructive">{error}</p>
          <Button
            onClick={fetchEvents}
            className="mx-auto">
            Coba Lagi
          </Button>
        </div>
      )}

      {!isLoading && !error && filteredEvents.length === 0 && (
        <div
          className="py-12 text-center"
          aria-live="polite">
          <p className="mb-2 text-muted-foreground">
            Tidak ada event yang ditemukan
          </p>
          {(searchTerm || statusFilter !== "all") && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
              className="mx-auto">
              Reset Filter
            </Button>
          )}
        </div>
      )}

      {!isLoading && !error && filteredEvents.length > 0 && (
        <>
          {/* Featured Event */}
          {featuredEvent && (
            <div className="mb-12">
              <Card className="overflow-hidden transition-all duration-300 border-0 shadow-md hover:shadow-xl">
                <div className="relative aspect-[21/9] w-full">
                  <Image
                    src={
                      featuredEvent.image ||
                      "/placeholder.svg?height=600&width=1200" ||
                      "/placeholder.svg"
                    }
                    alt={featuredEvent.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 1200px"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  <div className="absolute z-10 flex gap-2 top-4 left-4">
                    <Badge className="bg-primary hover:bg-primary/90">
                      {featuredEvent.category}
                    </Badge>
                    <Badge
                      variant={getStatusVariant(
                        featuredEvent.status || "upcoming"
                      )}>
                      {getStatusLabel(featuredEvent.status || "upcoming")}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-6">
                  <h2 className="mb-2 text-2xl font-bold md:text-3xl">
                    {featuredEvent.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        {formatDateRange(
                          featuredEvent.startDate,
                          featuredEvent.endDate
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{featuredEvent.location}</span>
                    </div>
                    {featuredEvent.status === "upcoming" && (
                      <div className="flex items-center gap-1 text-primary">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {getTimeUntilEvent(featuredEvent.startDate)}
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="mb-6 text-muted-foreground line-clamp-3">
                    {featuredEvent.description}
                  </p>
                </CardContent>

                <CardFooter className="flex justify-center px-6 pt-0 pb-6">
                  <Button
                    asChild
                    className="w-full sm:w-auto">
                    <Link href={`/event/${featuredEvent.id}`}>
                      Lihat Detail Event
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* Remaining Events - Grid View */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {remainingEvents.map((event) => (
              <Card
                key={event.id}
                className="overflow-hidden transition-all duration-300 hover:shadow-lg">
                <div className="relative overflow-hidden h-60">
                  <Image
                    src={
                      event.image ||
                      "/placeholder.svg?height=400&width=600" ||
                      "/placeholder.svg"
                    }
                    alt={event.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <Badge className="absolute z-10 top-3 right-3 bg-primary/90 hover:bg-primary">
                    {event.category || "Event"}
                  </Badge>
                  <Badge
                    className="absolute z-10 top-3 left-3"
                    variant={getStatusVariant(event.status || "upcoming")}>
                    {getStatusLabel(event.status || "upcoming")}
                  </Badge>
                </div>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-3 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>
                      {formatDateRange(event.startDate, event.endDate)}
                    </span>
                  </div>
                  <h3 className="mb-2 text-xl font-bold">{event.title}</h3>
                  <div className="flex items-center gap-1 mb-3 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                  <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                    {event.description}
                  </p>
                  {event.status === "upcoming" && (
                    <div className="flex items-center gap-1 mb-3 text-sm font-medium text-primary">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{getTimeUntilEvent(event.startDate)}</span>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-center pt-0">
                  <Button
                    asChild
                    className="w-full">
                    <Link href={`/event/${event.id}`}>Lihat Detail</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
