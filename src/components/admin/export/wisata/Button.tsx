"use client";

import { useState } from "react";
import { Download, Filter, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { TourismPdfDocument } from "./wisataPdf";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

type FilterType = "all" | "popular";

export const WisataPdfButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  const handleExport = async () => {
    try {
      setIsLoading(true);

      // Build API URL based on filter
      let apiUrl = "/api/wisata";
      if (filter === "popular") {
        apiUrl += "?populer=true";
        // Add date range if selected
        if (dateFrom && dateTo) {
          const fromDate = format(dateFrom, "yyyy-MM-dd");
          const toDate = format(dateTo, "yyyy-MM-dd");
          apiUrl += `&dateFrom=${fromDate}&dateTo=${toDate}`;
        }
      }

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
        isVerified: Boolean(item.isVerified),
        location: item.location || "Tidak ada alamat",
      }));

      // Determine title based on filter
      const pdfTitle =
        filter === "popular"
          ? "LAPORAN DATA WISATA PALING POPULER"
          : "LAPORAN DATA WISATA";

      // Generate PDF document
      const blob = await pdf(
        <TourismPdfDocument
          data={formattedData}
          title={pdfTitle}
          dateFrom={filter === "popular" ? dateFrom : undefined}
          dateTo={filter === "popular" ? dateTo : undefined}
        />
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

      {/* Date Picker - Only show when popular filter is selected */}
      {filter === "popular" && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Periode:</span>

          {/* Date From */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[140px] justify-start text-left font-normal">
                <CalendarIcon className="w-4 h-4 mr-2" />
                {dateFrom
                  ? format(dateFrom, "dd/MM/yyyy", { locale: id })
                  : "Dari"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateFrom}
                onSelect={setDateFrom}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <span className="text-muted-foreground">-</span>

          {/* Date To */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[140px] justify-start text-left font-normal">
                <CalendarIcon className="w-4 h-4 mr-2" />
                {dateTo
                  ? format(dateTo, "dd/MM/yyyy", { locale: id })
                  : "Sampai"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateTo}
                onSelect={setDateTo}
                initialFocus
                disabled={(date) => (dateFrom ? date < dateFrom : false)}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}

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
};
