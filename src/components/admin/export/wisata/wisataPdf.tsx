"use client";

import { Document, Page, Text, View } from "@react-pdf/renderer";
import { styles, dayNames, monthNames } from "../style";

interface WisataData {
  id: number;
  name: string;
  type: string;
  isVerified: boolean;
  location: string;
}

interface TourismPdfDocumentProps {
  data: WisataData[];
  title?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export function TourismPdfDocument({
  data,
  title = "LAPORAN DATA WISATA",
  dateFrom,
  dateTo,
}: TourismPdfDocumentProps) {
  const getCurrentFormattedDate = () => {
    try {
      const currentDate = new Date();
      const dayIndex = currentDate.getDay();
      const monthIndex = currentDate.getMonth();

      const formattedDay = dayNames[dayIndex] || "Senin";
      const formattedMonth = monthNames[monthIndex] || "Januari";

      return `${formattedDay}, ${currentDate.getDate()} ${formattedMonth} ${currentDate.getFullYear()}`;
    } catch {
      return "Senin, 1 Januari 2024";
    }
  };

  const formattedDate = getCurrentFormattedDate();

  const formatDateRange = () => {
    if (!dateFrom || !dateTo) return "";

    const formatDate = (date: Date) => {
      const day = date.getDate();
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    };

    return `Periode: ${formatDate(dateFrom)} - ${formatDate(dateTo)}`;
  };

  const dateRangeText = formatDateRange();

  return (
    <Document>
      <Page
        size="A4"
        style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>
              DINAS PARIWISATA PEMUDA DAN OLAHRAGA KABUPATEN MERANGIN
            </Text>
            <Text style={styles.subtitle}>
              Jl. H. Syamsudin Uban 1, Ps. Bangko, Kec. Bangko, Kabupaten
              Merangin, Jambi 37313
            </Text>
            <Text style={styles.subtitle}>
              Email: disparpora.meranginkab.go.id | Telp: (0746) 21892
            </Text>
          </View>
        </View>

        {/* Judul Laporan */}
        <Text style={styles.reportTitle}>{title}</Text>

        {/* Periode Tanggal - hanya tampil jika ada dateFrom dan dateTo */}
        {dateRangeText && (
          <Text style={styles.dateRangeText}>{dateRangeText}</Text>
        )}

        {/* Tabel */}
        <View style={styles.table}>
          {/* Header Tabel */}
          <View style={styles.tableHeaderRow}>
            <View style={[styles.tableColHeader, styles.noCol]}>
              <Text>No</Text>
            </View>
            <View style={[styles.tableColHeader, styles.nameCol]}>
              <Text>Nama Wisata</Text>
            </View>
            <View style={[styles.tableColHeader, styles.typeCol]}>
              <Text>Tipe Wisata</Text>
            </View>
            <View style={[styles.tableColHeader, styles.addressCol]}>
              <Text>Lokasi</Text>
            </View>
            <View style={[styles.tableColHeader, styles.verificationCol]}>
              <Text>Status Verifikasi</Text>
            </View>
          </View>

          {/* Isi Tabel */}
          {data.map((item, index) => (
            <View
              key={item.id}
              style={index % 2 === 0 ? styles.tableRow : styles.tableRowEven}>
              <View style={[styles.tableCol, styles.noCol]}>
                <Text>{index + 1}</Text>
              </View>
              <View style={[styles.tableCol, styles.nameCol]}>
                <Text>{item.name}</Text>
              </View>
              <View style={[styles.tableCol, styles.typeCol]}>
                <Text>{item.type}</Text>
              </View>
              <View style={[styles.tableCol, styles.addressCol]}>
                <Text>{item.location}</Text>
              </View>
              <View style={[styles.tableCol, styles.verificationCol]}>
                <Text
                  style={
                    item.isVerified
                      ? styles.statusVerified
                      : styles.statusNotVerified
                  }>
                  {item.isVerified ? "Terverifikasi" : "Belum Terverifikasi"}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Footer - Tanggal dan Tanda Tangan */}
        <View style={styles.footer}>
          <View style={styles.footerRight}>
            <View style={styles.signatureSection}>
              <Text style={styles.dateText}>{formattedDate}</Text>~
              <Text style={styles.signatureTitle}>Kepala Dinas</Text>
              <Text style={styles.signatureName}>Sukoso, S.STP</Text>
              <Text style={styles.signatureNip}>NIP. 198104061999121001</Text>
            </View>
          </View>
        </View>

        {/* Nomor Halaman */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber }) => `Halaman ${pageNumber}`}
          fixed
        />
      </Page>
    </Document>
  );
}
