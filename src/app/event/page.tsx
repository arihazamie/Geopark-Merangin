"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Search, Filter, ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/event", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }

        const result = await response.json();

        if (!result || result.error) {
          throw new Error(result?.error || "No events found");
        }

        setEvents(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Filter events based on search query
  const filteredEvents = events.filter(
    (event) =>
      event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format date range
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // If same day event
    if (start.toDateString() === end.toDateString()) {
      return new Date(startDate).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }

    // If different days
    return `${new Date(startDate).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
    })} - ${new Date(endDate).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}`;
  };

  // Get excerpt from description
  const getExcerpt = (description: string, maxLength = 150) => {
    if (!description) return "";
    return description.length > maxLength
      ? description.substring(0, maxLength) + "..."
      : description;
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-12 bg-gradient-to-b from-blue-50 to-white">
        <div className="container px-4 py-8 mx-auto">
          <h1 className="mb-6 text-3xl font-bold">Events</h1>

          <div className="flex flex-col gap-4 mb-8 md:flex-row">
            <div className="flex-1">
              <Skeleton className="w-full h-10" />
            </div>
            <Skeleton className="w-32 h-10" />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="overflow-hidden bg-white rounded-lg shadow-sm">
                <Skeleton className="w-full aspect-[16/9]" />
                <div className="p-4">
                  <Skeleton className="w-20 h-5 mb-2" />
                  <Skeleton className="w-full h-6 mb-2" />
                  <Skeleton className="w-full h-4 mb-2" />
                  <Skeleton className="w-3/4 h-4 mb-4" />
                  <Skeleton className="w-32 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && events.length === 0) {
    return (
      <div className="min-h-screen pb-12 bg-gradient-to-b from-blue-50 to-white">
        <div className="container px-4 py-8 mx-auto">
          <h1 className="mb-6 text-3xl font-bold">Events</h1>

          <Alert
            variant="destructive"
            className="max-w-md mx-auto mb-6">
            <AlertCircle className="w-4 h-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>

          <div className="text-center">
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12 bg-gradient-to-b from-blue-50 to-white">
      <div className="container px-4 py-8 mx-auto">
        <h1 className="mb-6 text-3xl font-bold">Events</h1>

        {/* Search and Filter */}
        <div className="flex flex-col gap-4 mb-8 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute w-5 h-5 text-muted-foreground left-3 top-2.5" />
            <Input
              placeholder="Search events..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            className="gap-2">
            <Filter size={16} />
            <span>Filter</span>
          </Button>
        </div>

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <Link
                key={event.id}
                href={`/event/${event.id}`}
                className="overflow-hidden transition-transform bg-white rounded-lg shadow-sm hover:shadow-md hover:-translate-y-1">
                <div className="relative w-full aspect-[16/9]">
                  <Image
                    src={event.image || "/placeholder.svg?height=300&width=500"}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                  {event.category && (
                    <Badge className="absolute text-white bg-blue-600 top-3 left-3">
                      {event.category}
                    </Badge>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="mb-2 text-xl font-medium line-clamp-2">
                    {event.title}
                  </h2>

                  <div className="flex items-center gap-1 mb-2 text-sm text-muted-foreground">
                    <Calendar size={14} />
                    <span>
                      {formatDateRange(event.startDate, event.endDate)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 mb-3 text-sm text-muted-foreground">
                    <MapPin size={14} />
                    <span>{event.location}</span>
                  </div>

                  <p className="mb-4 text-sm text-muted-foreground line-clamp-3">
                    {getExcerpt(event.description)}
                  </p>

                  <div className="flex items-center justify-between">
                    {event.wisata && (
                      <Badge variant="outline">{event.wisata.name}</Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 p-0 hover:bg-transparent">
                      <span className="text-blue-600">View details</span>
                      <ArrowRight
                        size={14}
                        className="text-blue-600"
                      />
                    </Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-lg">
            <p className="mb-4 text-lg text-muted-foreground">
              No events found matching your search.
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
