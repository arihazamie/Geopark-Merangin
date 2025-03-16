"use client";

import type React from "react";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { Search, Calendar, User, Clock, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  summary?: string;
  image?: string;
  images?: string[];
  category?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  pengelola?: {
    id: number;
    name: string;
    email?: string;
  } | null;
  updatedBy?: {
    id: number;
    name: string;
    email?: string;
  } | null;
}

export default function ArtikelPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Update the fetchArticles function to handle the updated API response format
  const fetchArticles = useCallback(async () => {
    try {
      setIsLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetch(`${apiUrl}/api/artikel`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch articles: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.data || !Array.isArray(result.data)) {
        throw new Error("Received invalid data format from API");
      }

      // Transform API data to match our component's expected format
      const transformedArticles = result.data.map((article: any) => ({
        id: article.id || 0,
        title: article.title || "",
        slug: article.slug || `artikel-${article.id}`,
        content: article.content || "",
        summary:
          article.summary ||
          (article.content ? article.content.substring(0, 150) + "..." : ""),
        image:
          article.image ||
          article.images?.[0] ||
          "/placeholder.svg?height=400&width=600",
        images: article.images || ["/placeholder.svg?height=400&width=600"],
        category: article.category || "Umum",
        tags: article.tags || [],
        createdAt: article.createdAt || new Date().toISOString(),
        updatedAt: article.updatedAt || new Date().toISOString(),
        pengelola: article.pengelola,
        updatedBy: article.updatedBy,
      }));

      setArticles(transformedArticles);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("Error fetching articles:", err);
      setError(`Failed to load articles: ${errorMessage}`);
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Filter articles based on search term
  const filteredArticles = articles.filter((article) => {
    const title = article.title || "";
    const content = article.content || "";
    const summary = article.summary || "";

    const searchTermLower = searchTerm.toLowerCase();

    return (
      searchTerm === "" ||
      title.toLowerCase().includes(searchTermLower) ||
      content.toLowerCase().includes(searchTermLower) ||
      summary.toLowerCase().includes(searchTermLower)
    );
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "d MMMM yyyy", { locale: id });
    } catch (err) {
      return `Tanggal tidak valid ${err}`;
    }
  };

  // Calculate read time
  const calculateReadTime = (content: string): string => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readTime} menit`;
  };

  // Get a featured article (first article or null if none)
  const featuredArticle =
    filteredArticles.length > 0 ? filteredArticles[0] : null;

  // Get remaining articles (skip the featured one)
  const remainingArticles =
    filteredArticles.length > 0 ? filteredArticles.slice(1) : [];

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
    <div className="container px-4 py-8 mx-auto space-y-8">
      <header className="space-y-4 text-center">
        <h1 className="text-4xl font-bold">Artikel dan Berita</h1>
        <p className="max-w-3xl mx-auto text-xl text-muted-foreground">
          Baca artikel dan berita terbaru tentang Geopark Merangin
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
                  placeholder="Cari artikel..."
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
      </section>

      {isLoading && (
        <div
          className="py-12 text-center"
          aria-live="polite">
          <div className="w-10 h-10 mx-auto mb-4 border-2 rounded-full border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground">Memuat artikel...</p>
        </div>
      )}

      {error && (
        <div
          className="py-12 text-center"
          aria-live="polite">
          <p className="mb-4 text-destructive">{error}</p>
          <Button
            onClick={fetchArticles}
            className="mx-auto">
            Coba Lagi
          </Button>
        </div>
      )}

      {!isLoading && !error && filteredArticles.length === 0 && (
        <div
          className="py-12 text-center"
          aria-live="polite">
          <p className="mb-2 text-muted-foreground">
            Tidak ada artikel yang ditemukan
          </p>
          {searchTerm && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
              }}
              className="mx-auto">
              Reset Pencarian
            </Button>
          )}
        </div>
      )}

      {!isLoading && !error && filteredArticles.length > 0 && (
        <>
          {/* Featured Article */}
          {featuredArticle && (
            <div className="mb-12">
              <Card className="overflow-hidden transition-all duration-300 border-0 shadow-md hover:shadow-xl">
                <div className="relative aspect-[21/9] w-full">
                  <Image
                    src={
                      featuredArticle.image ||
                      "/placeholder.svg?height=600&width=1200"
                    }
                    alt={featuredArticle.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 1200px"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  <div className="absolute z-10 flex gap-2 top-4 left-4">
                    <Badge className="bg-primary hover:bg-primary/90">
                      {featuredArticle.category}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-6">
                  <h2 className="mb-2 text-2xl font-bold md:text-3xl">
                    {featuredArticle.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        {formatDate(featuredArticle.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span className="text-sm">
                        {featuredArticle.pengelola?.name || "Admin"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">
                        {calculateReadTime(featuredArticle.content)}
                      </span>
                    </div>
                  </div>

                  <p className="mb-6 text-muted-foreground line-clamp-3">
                    {featuredArticle.summary}
                  </p>
                </CardContent>

                <CardFooter className="flex justify-center px-6 pt-0 pb-6">
                  <Button
                    asChild
                    className="w-full sm:w-auto">
                    <Link href={`/artikel/${featuredArticle.id}`}>
                      Baca Artikel
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* Remaining Articles - Grid View */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {remainingArticles.map((article) => (
              <Card
                key={article.id}
                className="overflow-hidden transition-all duration-300">
                <div className="relative overflow-hidden h-60">
                  <Image
                    src={
                      article.image || "/placeholder.svg?height=400&width=600"
                    }
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                  <Badge className="absolute z-10 top-3 right-3 bg-primary/90 hover:bg-primary">
                    {article.category}
                  </Badge>
                </div>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-2">
                    <h2 className="text-xl font-bold">{article.title}</h2>
                  </div>
                  <div className="flex items-center mb-3 text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span className="text-sm">
                      {formatDate(article.createdAt)}
                    </span>
                  </div>
                  <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                    {article.summary}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10">
                      <User className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-muted-foreground">
                      {article.pengelola?.name || "Admin"}
                    </span>
                    <span className="mx-2">•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {calculateReadTime(article.content)}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button
                    asChild
                    className="w-full">
                    <Link href={`/artikel/${article.id}`}>Baca Artikel</Link>
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
