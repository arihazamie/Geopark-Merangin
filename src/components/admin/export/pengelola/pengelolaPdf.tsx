import { Document, Page, Text, View } from "@react-pdf/renderer";
import { styles, dayNames, monthNames } from "../style";

interface WisataData {
  id: string;
  name: string;
  email: string;
  notelp: string;
  role: string;
  isVerified: string;
}

interface TourismPdfDocumentProps {
  data: WisataData[];
}

export function TourismPdfDocument({ data }: TourismPdfDocumentProps) {
  // Get current date with proper Indonesian formatting
  const currentDate = new Date();

  const formattedDay = dayNames[currentDate.getDay()];
  const formattedDate = `${formattedDay}, ${currentDate.getDate()} ${
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
            <View style={styles.titleContainer}>
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
        </View>

        <Text style={styles.reportTitle}>LAPORAN DATA WISATA</Text>

        {/* Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeaderRow}>
            <View style={[styles.tableColHeader, styles.noCol]}>
              <Text>No</Text>
            </View>
            <View style={[styles.tableColHeader, styles.nameCol]}>
              <Text>Nama</Text>
            </View>
            <View style={[styles.tableColHeader, styles.addressCol]}>
              <Text>Email</Text>
            </View>
            <View style={[styles.tableColHeader, styles.typeCol]}>
              <Text>Telepon</Text>
            </View>
            <View style={[styles.tableColHeader, styles.typeCol]}>
              <Text>Role</Text>
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
                <Text>{item.name}</Text>
              </View>
              <View style={[styles.tableCol, styles.addressCol]}>
                <Text>{item.email}</Text>
              </View>
              <View style={[styles.tableCol, styles.typeCol]}>
                <Text>{item.notelp}</Text>
              </View>
              <View style={[styles.tableCol, styles.typeCol]}>
                <Text>{item.role}</Text>
              </View>
              <View style={[styles.tableCol, styles.verificationCol]}>
                <Text>
                  {item.isVerified ? "Terverifikasi" : "Belum Terverifikasi"}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Footer with signature */}
        <View style={styles.footer}>
          <Text>{formattedDate}</Text>
          <Text>Kepala Dinas</Text>

          <View style={styles.signature}>
            <Text style={styles.signatureName}>Sukoso, S.STP</Text>
            <Text style={styles.signatureTitle}>NIP. 198104061999121001</Text>
          </View>
        </View>

        {/* Page Number */}
        <Text style={styles.pageNumber}>Halaman 1</Text>
      </Page>
    </Document>
  );
}
