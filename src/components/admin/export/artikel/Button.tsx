"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { TourismPdfDocument } from "./artikelPdf";

// Define the API response type (matches the artikel API)
interface ArticleData {
  id: number;
  title: string;
  isVerified: boolean; // Fixed typo from 'isVeried' to 'isVerified'
  pengelola: {
    name: string;
  };
  createdAt: string;
}

// Define the type expected by TourismPdfDocument (assuming this is what it needs)
interface FormattedArticleData {
  id: string;
  title: string;
  pengelolaName: string;
  status: string;
  createdDate: string;
}

export function ArtikelPdfButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/artikel", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.data) {
        throw new Error(result.error || "No data returned from API");
      }

      // Transform ArticleData to FormattedArticleData
      const formattedData: FormattedArticleData[] = result.data.map(
        (item: ArticleData) => ({
          id: item.id.toString(),
          title: item.title,
          pengelolaName: item.pengelola.name,
          status: item.isVerified ? "Verified" : "Not Verified",
          createdDate: new Date(item.createdAt).toLocaleDateString("id-ID"), // Using Indonesian locale
        })
      );

      // Generate and download PDF
      const blob = await pdf(
        <TourismPdfDocument data={formattedData} />
      ).toBlob();
      const today = new Date().toISOString().split("T")[0];
      saveAs(blob, `laporan-data-artikel-${today}.pdf`);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert(
        error instanceof Error
          ? `Gagal mengekspor PDF: ${error.message}`
          : "Terjadi kesalahan tak terduga saat mengekspor PDF"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isLoading}
      className="disabled:opacity-50 disabled:cursor-not-allowed">
      {isLoading ? (
        <Loader2
          size={18}
          className="animate-spin"
        />
      ) : (
        <Download size={18} />
      )}
      <span>{isLoading ? "Memproses..." : "Ekspor Artikel ke PDF"}</span>
    </Button>
  );
}
