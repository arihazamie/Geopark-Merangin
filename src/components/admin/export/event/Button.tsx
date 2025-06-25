"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { EventPdfDocument } from "./eventPdf";

// Define the API response type (matches the event API)
interface EventData {
  id: number;
  title: string;
  description: string;
  image: string;
  isVerified: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  wisataId: number;
  pengelolaId: number;
  updatedById: number;
  wisata: {
    id: number;
    name: string;
  };
  pengelola: {
    id: number;
    name: string;
  };
  updatedBy: {
    id: number;
    name: string;
  };
}

// Define the type expected by EventPdfDocument
interface FormattedEventData {
  id: string;
  title: string;
  description: string;
  wisataName: string;
  pengelolaName: string;
  status: string;
  startDate: string;
  endDate: string;
  createdDate: string;
  updatedBy: string;
}

export function EventPdfButton() {
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to format date as dd/mm/yy
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yy = String(date.getFullYear()).slice(-2);
    return `${dd}/${mm}/${yy}`;
  };

  const handleExport = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/event", {
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
      const eventData = Array.isArray(result) ? result : result.data;

      if (!eventData || !Array.isArray(eventData)) {
        throw new Error("No event data returned from API");
      }

      const formattedData: FormattedEventData[] = eventData.map(
        (item: EventData) => ({
          id: item.id.toString(),
          title: item.title,
          description: item.description,
          wisataName: item.wisata.name,
          pengelolaName: item.pengelola.name,
          status: item.isVerified ? "Verified" : "Not Verified",
          startDate: formatDate(item.startDate),
          endDate: formatDate(item.endDate),
          createdDate: formatDate(item.createdAt),
          updatedBy: item.updatedBy.name,
        })
      );

      const blob = await pdf(
        <EventPdfDocument data={formattedData} />
      ).toBlob();

      const today = new Date();
      const fileDate = formatDate(today.toISOString());
      saveAs(blob, `laporan-data-event-${fileDate}.pdf`);
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
      <span className="ml-2">
        {isLoading ? "Memproses..." : "Ekspor Event ke PDF"}
      </span>
    </Button>
  );
}
