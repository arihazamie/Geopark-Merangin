import { Document, Page, Text, View } from "@react-pdf/renderer";
import { styles, dayNames, monthNames } from "../style";

interface FormattedArticleData {
  id: string;
  title: string;
  pengelolaName: string;
  status: string; // "Verified" or "Not Verified"
  createdDate: string;
}

interface TourismPdfDocumentProps {
  data: FormattedArticleData[];
}

export function TourismPdfDocument({ data }: TourismPdfDocumentProps) {
  const currentDate = new Date();
  const formattedDate = `${
    dayNames[currentDate.getDay()]
  }, ${currentDate.getDate()} ${
    monthNames[currentDate.getMonth()]
  } ${currentDate.getFullYear()}`;

  return (
    <Document>
      <Page
        size="A4"
        style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>
              DINAS PARIWISATA DAN KEBUDAYAAN KABUPATEN MERANGIN
            </Text>
            <Text style={styles.subtitle}>
              Jl. H. Syamsudin Uban 1, Ps. Bangko, Kec. Bangko, Kabupaten
              Merangin, Jambi 37313
            </Text>
            <Text style={styles.subtitle}>
              Email: dispar.merangin@gmail.com | Telp: (0746) 21024
            </Text>
          </View>
        </View>

        {/* Judul Dokumen */}
        <Text style={styles.reportTitle}>LAPORAN DATA ARTIKEL PARIWISATA</Text>

        {/* Tabel Artikel */}
        <View style={styles.table}>
          {/* Header */}
          <View style={styles.tableHeaderRow}>
            <View style={[styles.tableColHeader, styles.noCol]}>
              <Text>No</Text>
            </View>
            <View style={[styles.tableColHeader, styles.nameCol]}>
              <Text>Judul Artikel</Text>
            </View>
            <View style={[styles.tableColHeader, styles.addressCol]}>
              <Text>Nama Penulis</Text>
            </View>
            <View style={[styles.tableColHeader, styles.dateCol]}>
              <Text>Tanggal Dibuat</Text>
            </View>
            <View style={[styles.tableColHeader, styles.verificationCol]}>
              <Text>Status Verifikasi</Text>
            </View>
          </View>

          {/* Baris Tabel */}
          {data.map((item, index) => (
            <View
              key={item.id}
              style={index % 2 === 0 ? styles.tableRow : styles.tableRowEven}>
              <View style={[styles.tableCol, styles.noCol]}>
                <Text>{index + 1}</Text>
              </View>
              <View style={[styles.tableCol, styles.nameCol]}>
                <Text>{item.title}</Text>
              </View>
              <View style={[styles.tableCol, styles.addressCol]}>
                <Text>{item.pengelolaName}</Text>
              </View>
              <View style={[styles.tableCol, styles.dateCol]}>
                <Text>{item.createdDate}</Text>
              </View>
              <View style={[styles.tableCol, styles.verificationCol]}>
                <Text
                  style={
                    item.status === "Verified"
                      ? styles.statusVerified
                      : styles.statusNotVerified
                  }>
                  {item.status === "Verified" ? "✓ Terverifikasi" : "✗ Belum"}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerRight}>
            <Text style={styles.dateText}>{formattedDate}</Text>
            <View style={styles.signatureSection}>
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
