"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Loader2, Filter } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { TourismPdfDocument } from "./wisataPdf";

type FilterType = "all" | "popular";

export function WisataPdfButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");

  const handleExport = async () => {
    try {
      setIsLoading(true);

      // Build API URL based on filter
      const apiUrl =
        filter === "popular" ? "/api/wisata?populer=true" : "/api/wisata";

      // Fetch data from API
      const response = await fetch(apiUrl);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch data");
      }

      // Map the API data to match the expected format for the PDF document
      const formattedData = result.data.map((item: any) => ({
        id: item.id,
        name: item.name || "Tidak ada nama",
        type: item.type || "Tidak diketahui",
        isVerified: item.isVerified ? "Terverifikasi" : "Belum Terverifikasi",
        location: item.location || "Tidak ada alamat",
      }));

      // Generate PDF document
      const blob = await pdf(
        <TourismPdfDocument data={formattedData} />
      ).toBlob();

      // Save the PDF file with current date and filter type in the filename
      const today = new Date().toISOString().split("T")[0];
      const filterSuffix = filter === "popular" ? "-populer" : "";
      saveAs(blob, `laporan-data-wisata${filterSuffix}-${today}.pdf`);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Gagal mengunduh PDF. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Filter
          size={16}
          className="text-muted-foreground"
        />
        <Select
          value={filter}
          onValueChange={(value: FilterType) => setFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Pilih filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Wisata</SelectItem>
            <SelectItem value="popular">Wisata Populer</SelectItem>
          </SelectContent>
        </Select>
      </div>

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
        <span>Cetak Laporan</span>
      </Button>
    </div>
  );
}
