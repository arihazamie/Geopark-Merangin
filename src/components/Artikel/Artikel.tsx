"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface Pengelola {
  id: number;
  name: string;
}

interface UpdatedBy {
  id: number;
  name: string;
}

interface Article {
  id: number;
  title: string;
  content: string;
  image: string;
  createdAt: string;
  updatedAt?: string;
  pengelolaId?: number;
  updatedById?: number;
  pengelola?: Pengelola;
  updatedBy?: UpdatedBy;
  category?: string;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/artikel", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch articles");
        }

        const result = await response.json();

        if (!result.data) {
          throw new Error("No articles found");
        }

        setArticles(result.data);
        setFilteredArticles(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setArticles([]);
        setFilteredArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // Get excerpt from content
  const getExcerpt = (content: string, maxLength = 150) => {
    try {
      // Try to parse JSON content
      const parsed = JSON.parse(content);
      if (typeof parsed === "object" && parsed.blocks) {
        const text = parsed.blocks.map((block: any) => block.text).join(" ");
        return text.length > maxLength
          ? text.substring(0, maxLength) + "..."
          : text;
      }
    } catch (e) {
      // Not JSON, use as is
    }

    // Plain text handling
    return content.length > maxLength
      ? content.substring(0, maxLength) + "..."
      : content;
  };

  // Handle search functionality
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredArticles(articles);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = articles.filter(
      (article) =>
        article.title.toLowerCase().includes(query) ||
        (article.content && article.content.toLowerCase().includes(query))
    );

    setFilteredArticles(filtered);
  }, [searchQuery, articles]);

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
              placeholder="Cari artikel..."
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

        {/* Articles Grid */}
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
          <>
            {filteredArticles.length > 0 ? (
              <div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredArticles.map((article) => (
                    <Link
                      key={article.id}
                      href={`/artikel/${article.id}`}
                      className="overflow-hidden transition-transform bg-white rounded-lg shadow-sm hover:shadow-md hover:-translate-y-1">
                      <div className="relative w-full aspect-[16/9]">
                        <Image
                          src={
                            article.image ||
                            "/placeholder.svg?height=300&width=500" ||
                            "/placeholder.svg"
                          }
                          alt={article.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-4">
                        {article.category && (
                          <Badge
                            variant="outline"
                            className="mb-2">
                            {article.category}
                          </Badge>
                        )}
                        <h2 className="mb-2 text-xl font-medium line-clamp-2">
                          {article.title}
                        </h2>
                        <p className="mb-4 text-sm text-muted-foreground line-clamp-3">
                          {getExcerpt(article.content)}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar size={14} />
                            <span>
                              {new Date(article.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 p-0 hover:bg-transparent">
                            <span className="text-blue-600">Read more</span>
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
              </div>
            ) : (
              <div className="py-12 text-center">
                <h3 className="mb-2 text-xl font-medium">No articles found</h3>
                <p className="mb-6 text-muted-foreground">
                  {searchQuery.trim() !== ""
                    ? "No articles match your search criteria."
                    : "There are no articles available at the moment."}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
