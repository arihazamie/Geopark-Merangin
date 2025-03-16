"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { TourismPdfDocument } from "./wisataPdf";

export function WisataPdfButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    try {
      setIsLoading(true);

      // Fetch data from API
      const response = await fetch("/api/wisata");
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch data");
      }

      // Map the API data to match the expected format for the PDF document
      const formattedData = result.data.map((item: any) => ({
        id: item.id,
        name: item.name || "Tidak ada nama",
        type: item.type || "Tidak diketahui",
        isVerified:
          item.isVerified === "Aktif" || item.status === "Terverifikasi",
        location: item.location || "Tidak ada alamat",
      }));

      // Generate PDF document
      const blob = await pdf(
        <TourismPdfDocument data={formattedData} />
      ).toBlob();

      // Save the PDF file with current date in the filename
      const today = new Date().toISOString().split("T")[0];
      saveAs(blob, `laporan-data-wisata-${today}.pdf`);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Gagal mengunduh PDF. Silakan coba lagi.");
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
      <span>{isLoading ? "Processing..." : "Export to PDF"}</span>
    </Button>
  );
}
