import { Document, Page, Text, View } from "@react-pdf/renderer";
import { styles, dayNames, monthNames } from "../style";

interface WisataData {
  id: string;
  name: string;
  email: string;
  notelp: string;
  isVerified: string;
}

interface TourismPdfDocumentProps {
  data: WisataData[];
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

        {/* Judul */}
        <Text style={styles.reportTitle}>LAPORAN DATA PENGELOLA</Text>

        {/* Tabel */}
        <View style={styles.table}>
          {/* Header Tabel */}
          <View style={styles.tableHeaderRow}>
            <View style={[styles.tableColHeader, styles.noCol]}>
              <Text>No</Text>
            </View>
            <View style={[styles.tableColHeader, styles.nameCol]}>
              <Text>Nama Pengelola</Text>
            </View>
            <View style={[styles.tableColHeader, styles.addressCol]}>
              <Text>Email</Text>
            </View>
            <View style={[styles.tableColHeader, styles.typeCol]}>
              <Text>Telepon</Text>
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
                <Text>{item.name}</Text>
              </View>
              <View style={[styles.tableCol, styles.addressCol]}>
                <Text>{item.email}</Text>
              </View>
              <View style={[styles.tableCol, styles.typeCol]}>
                <Text>{item.notelp}</Text>
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

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerRight}>
            <View style={styles.signatureSection}>
              <Text style={styles.dateText}>{formattedDate}</Text>
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
