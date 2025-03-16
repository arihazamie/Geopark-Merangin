"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Search, Filter, ArrowRight } from "lucide-react";
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
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // Filter articles based on search query
  const filteredArticles = articles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.content &&
        article.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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

  if (loading) {
    return (
      <div className="min-h-screen pb-12 bg-gradient-to-b from-blue-50 to-white">
        <div className="container px-4 py-8 mx-auto">
          <h1 className="mb-6 text-3xl font-bold">Articles</h1>

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

  if (error && articles.length === 0) {
    return (
      <div className="min-h-screen pb-12 bg-gradient-to-b from-blue-50 to-white">
        <div className="container px-4 py-8 mx-auto">
          <h1 className="mb-6 text-3xl font-bold">Articles</h1>

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
        <h1 className="mb-6 text-3xl font-bold">Articles</h1>

        {/* Search and Filter */}
        <div className="flex flex-col gap-4 mb-8 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute w-5 h-5 text-muted-foreground left-3 top-2.5" />
            <Input
              placeholder="Search articles..."
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

        {/* Articles Grid */}
        {filteredArticles.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map((article) => (
              <Link
                key={article.id}
                href={`/artikel/${article.id}`}
                className="overflow-hidden transition-transform bg-white rounded-lg shadow-sm hover:shadow-md hover:-translate-y-1">
                <div className="relative w-full aspect-[16/9]">
                  <Image
                    src={
                      article.image || "/placeholder.svg?height=300&width=500"
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
        ) : (
          <div className="p-8 text-center bg-white rounded-lg">
            <p className="mb-4 text-lg text-muted-foreground">
              No articles found matching your search.
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
