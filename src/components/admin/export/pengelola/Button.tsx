"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { TourismPdfDocument } from "./pengelolaPdf";

// Define the API response type (matches your backend)
interface PengelolaData {
  id: string;
  name: string;
  email: string;
  notelp: string;
  role: string;
  isVerified: boolean; // From API
}

// Define the type expected by TourismPdfDocument
interface WisataData {
  id: string;
  name: string;
  email: string;
  notelp: string;
  role: string;
  isVerified: string; // Expected by TourismPdfDocument
}

export function PengelolaPdfButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/pengelola", {
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

      if (!result.data?.pengelola) {
        throw new Error(result.message || "No data returned from API");
      }

      // Transform PengelolaData to WisataData
      const formattedData: WisataData[] = result.data.pengelola.map(
        (item: PengelolaData) => ({
          id: item.id,
          name: item.name,
          email: item.email,
          notelp: item.notelp,
          role: item.role,
          isVerified: item.isVerified,
        })
      );

      // Generate and download PDF
      const blob = await pdf(
        <TourismPdfDocument data={formattedData} />
      ).toBlob();
      const today = new Date().toISOString().split("T")[0];
      saveAs(blob, `laporan-data-pengelola-${today}.pdf`);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert(
        error instanceof Error
          ? `Failed to export PDF: ${error.message}`
          : "An unexpected error occurred while exporting the PDF"
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
      <span>{isLoading ? "Processing..." : "Export to PDF"}</span>
    </Button>
  );
}
