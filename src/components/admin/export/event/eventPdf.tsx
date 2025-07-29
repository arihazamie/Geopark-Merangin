import { Document, Page, Text, View } from "@react-pdf/renderer";
import { styles, dayNames, monthNames } from "../style";

interface FormattedEventData {
  id: string;
  title: string;
  description: string;
  wisataName: string;
  pengelolaName: string;
  status: string; // "Verified" or "Not Verified"
  startDate: string;
  endDate: string;
  createdDate: string;
  updatedBy: string;
}

interface EventPdfDocumentProps {
  data: FormattedEventData[];
}

export function EventPdfDocument({ data }: EventPdfDocumentProps) {
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

        {/* Title */}
        <Text style={styles.reportTitle}>LAPORAN DATA EVENT</Text>

        {/* Table Header */}
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <View style={[styles.tableColHeader, styles.noCol]}>
              <Text>No</Text>
            </View>
            <View style={[styles.tableColHeader, styles.nameCol]}>
              <Text>Nama Event</Text>
            </View>
            <View style={[styles.tableColHeader, styles.addressCol]}>
              <Text>Lokasi Event Wisata</Text>
            </View>
            <View style={[styles.tableColHeader, styles.dateCol]}>
              <Text>Tanggal Mulai</Text>
            </View>
            <View style={[styles.tableColHeader, styles.dateCol]}>
              <Text>Tanggal Selesai</Text>
            </View>
            <View style={[styles.tableColHeader, styles.verificationCol]}>
              <Text>Status Verifikasi</Text>
            </View>
          </View>

          {/* Table Rows */}
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
                <Text>{item.wisataName}</Text>
              </View>
              <View style={[styles.tableCol, styles.dateCol]}>
                <Text>{item.startDate}</Text>
              </View>
              <View style={[styles.tableCol, styles.dateCol]}>
                <Text>{item.endDate}</Text>
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
            <View style={styles.signatureSection}>
              <Text style={styles.dateText}>Bangko, {formattedDate}</Text>
              <Text style={styles.signatureTitle}>Kepala Dinas</Text>
              <Text style={styles.signatureName}>Sukoso, S.STP</Text>
              <Text style={styles.signatureNip}>NIP. 198104061999121001</Text>
            </View>
          </View>
        </View>

        {/* Page Number */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber }) => `Halaman ${pageNumber}`}
          fixed
        />
      </Page>
    </Document>
  );
}
