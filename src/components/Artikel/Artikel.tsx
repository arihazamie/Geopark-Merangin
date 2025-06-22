"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Search, User, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
    <div className="min-h-screen transition-colors">
      {/* Header Section */}
      <div className="transition-colors">
        <div className="container px-4 py-8 mx-auto">
          {/* Search Bar */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2 dark:text-gray-500" />
              <Input
                type="text"
                placeholder="Search articles..."
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
            {filteredArticles.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredArticles.map((article) => (
                  <Link
                    href={`/artikel/${article.id}`}
                    key={article.id}
                    className="block group">
                    <div className="overflow-hidden transition-all duration-300 bg-white border border-gray-100 shadow-sm dark:bg-gray-800 rounded-2xl hover:shadow-md dark:hover:shadow-lg group-hover:-translate-y-1 dark:border-gray-700">
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={
                            article.image ||
                            "/placeholder.svg?height=200&width=300" ||
                            "/placeholder.svg"
                          }
                          alt={article.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {article.category && (
                          <div className="absolute top-3 left-3">
                            <Badge className="text-white bg-blue-600/90">
                              {article.category}
                            </Badge>
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                        <div className="flex items-center mb-2 text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(article.createdAt).toLocaleDateString()}
                        </div>

                        <h3 className="mb-2 text-lg font-semibold text-gray-900 transition-colors dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {article.title}
                        </h3>

                        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                          {getExcerpt(article.content)}
                        </p>

                        <div className="flex items-center justify-between">
                          {article.pengelola ? (
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-1 text-gray-400" />
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {article.pengelola.name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400 dark:text-gray-500">
                              By Admin
                            </span>
                          )}

                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                            Baca →
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
                    {searchQuery.trim() !== ""
                      ? "No results found"
                      : "No articles available"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {searchQuery.trim() !== ""
                      ? "Try adjusting your search terms or browse all articles."
                      : "Check back later for new articles."}
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
