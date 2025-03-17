"use client";

import type React from "react";

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
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
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
        setFilteredEvents(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setEvents([]);
        setFilteredEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Handle search functionality
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredEvents(events);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = events.filter(
      (event) =>
        event.title?.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.location?.toLowerCase().includes(query)
    );

    setFilteredEvents(filtered);
  }, [searchQuery, events]);

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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="min-h-screen pb-12">
      <div className="container px-4 py-8 mx-auto">
        {/* Search and Filter */}
        <div className="relative max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <Alert
            variant="destructive"
            className="mb-6">
            <AlertCircle className="w-4 h-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Events Grid */}
        {loading ? (
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
        ) : (
          <>
            {filteredEvents.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/event/${event.id}`}
                    className="overflow-hidden transition-transform bg-white rounded-lg shadow-sm hover:shadow-md hover:-translate-y-1">
                    <div className="relative w-full aspect-[16/9]">
                      <Image
                        src={
                          event.image || "/placeholder.svg?height=300&width=500"
                        }
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
                  {searchQuery.trim() !== ""
                    ? "No events found matching your search."
                    : "There are no verified tourist attractions available at the moment."}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
