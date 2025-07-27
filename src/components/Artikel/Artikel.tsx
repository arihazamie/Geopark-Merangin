"use client";

import type React from "react";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import useSWR from "swr";

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
  isVerified: boolean;
  pengelolaId?: number;
  updatedById?: number;
  pengelola?: Pengelola;
  updatedBy?: UpdatedBy;
  category?: string;
}

const fetcher = (url: string) =>
  fetch(url)
    .then((res) => res.json())
    .then((json) =>
      (json.data || []).filter((item: Article) => item.isVerified)
    );

export default function ArticlesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: articles = [],
    error,
    isLoading,
  } = useSWR<Article[]>("/api/artikel", fetcher, {
    dedupingInterval: 300000,
    revalidateOnFocus: false,
  });

  const filteredArticles = useMemo(() => {
    if (!articles) return [];
    if (searchQuery.trim() === "") return articles;

    const query = searchQuery.toLowerCase();
    return articles.filter(
      (article) =>
        article.title.toLowerCase().includes(query) ||
        article.content?.toLowerCase().includes(query)
    );
  }, [articles, searchQuery]);

  const getExcerpt = (content: string, maxLength = 150) => {
    try {
      const parsed = JSON.parse(content);
      if (typeof parsed === "object" && parsed.blocks) {
        const text = parsed.blocks.map((block: any) => block.text).join(" ");
        return text.length > maxLength
          ? text.substring(0, maxLength) + "..."
          : text;
      }
    } catch (_) {}
    return content.length > maxLength
      ? content.substring(0, maxLength) + "..."
      : content;
  };

  return (
    <div className="min-h-screen transition-colors">
      {/* Header */}
      <div className="container px-4 py-8 mx-auto">
        <div className="max-w-md mx-auto">
          <div className="mb-4 text-center">
            <h1 className="text-3xl font-bold">Artikel</h1>
          </div>
          <div className="relative">
            <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2 dark:text-gray-500" />
            <Input
              type="text"
              placeholder="Cari artikel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
              {error.message || "Gagal memuat data artikel."}
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
            {!articles ? (
              <div className="text-center">Memuat data...</div>
            ) : filteredArticles.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredArticles.map((article) => (
                  <Link
                    href={`/artikel/${article.id}`}
                    key={article.id}
                    className="block group">
                    <div className="overflow-hidden transition-all duration-300 bg-white border border-gray-100 shadow-sm dark:bg-gray-800 rounded-2xl hover:shadow-md dark:hover:shadow-lg group-hover:-translate-y-1 dark:border-gray-700">
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={article.image || "/placeholder.svg"}
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
                          {new Date(article.createdAt).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                          {getExcerpt(article.content)}
                        </p>
                        <div className="flex items-center justify-between">
                          {article.pengelola ? (
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                              <User className="w-4 h-4 mr-1 text-gray-400" />
                              {article.pengelola.name}
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
                      ? "Tidak ada hasil ditemukan"
                      : "Belum ada artikel tersedia"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {searchQuery.trim() !== ""
                      ? "Coba periksa kembali kata kunci pencarian Anda."
                      : "Silakan kembali lagi nanti untuk membaca artikel terbaru."}
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
