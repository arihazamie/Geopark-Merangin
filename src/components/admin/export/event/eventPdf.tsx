import { Document, Page, Text, View } from "@react-pdf/renderer"
import { styles } from "../style"
import { dayNames, monthNames } from "../style"

// Define the type expected by EventPdfDocument
interface FormattedEventData {
  id: string
  title: string
  description: string
  wisataName: string
  pengelolaName: string
  status: string // "Verified" or "Not Verified"
  startDate: string
  endDate: string
  createdDate: string
  updatedBy: string
}

// Props interface for EventPdfDocument
interface EventPdfDocumentProps {
  data: FormattedEventData[]
}

export function EventPdfDocument({ data }: EventPdfDocumentProps) {
  // Get current date with proper Indonesian formatting
  const currentDate = new Date()
  const formattedDay = dayNames[currentDate.getDay()]
  const formattedDate = `${formattedDay}, ${currentDate.getDate()} ${
    monthNames[currentDate.getMonth()]
  } ${currentDate.getFullYear()}`

  // Calculate statistics
  const totalEvents = data.length
  const verifiedEvents = data.filter((item) => item.status === "Verified").length
  const unverifiedEvents = totalEvents - verifiedEvents

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>DINAS PARIWISATA DAN KEBUDAYAAN</Text>
              <Text style={styles.title}>KABUPATEN MERANGIN</Text>
              <Text style={styles.subtitle}>
                Jl. H. Syamsudin Uban 1, Ps. Bangko, Kec. Bangko, Kabupaten Merangin, Jambi 37313
              </Text>
              <Text style={styles.subtitle}>Email: dispar.merangin@gmail.com | Telp: (0746) 21024</Text>
            </View>
          </View>
        </View>

        <Text style={styles.reportTitle}>LAPORAN DATA EVENT PARIWISATA</Text>

        {/* Summary Statistics */}
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>RINGKASAN DATA</Text>
          <View style={styles.summaryText}>
            <Text style={styles.summaryLabel}>Total Event:</Text>
            <Text style={styles.summaryValue}>{totalEvents} Event</Text>
          </View>
          <View style={styles.summaryText}>
            <Text style={styles.summaryLabel}>Event Terverifikasi:</Text>
            <Text style={styles.summaryValue}>{verifiedEvents} Event</Text>
          </View>
          <View style={styles.summaryText}>
            <Text style={styles.summaryLabel}>Event Belum Terverifikasi:</Text>
            <Text style={styles.summaryValue}>{unverifiedEvents} Event</Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeaderRow}>
            <View style={[styles.tableColHeader, styles.noCol]}>
              <Text>NO</Text>
            </View>
            <View style={[styles.tableColHeader, styles.nameCol]}>
              <Text>NAMA EVENT</Text>
            </View>
            <View style={[styles.tableColHeader, styles.addressCol]}>
              <Text>LOKASI WISATA</Text>
            </View>
            <View style={[styles.tableColHeader, styles.typeCol]}>
              <Text>PENGELOLA</Text>
            </View>
            <View style={[styles.tableColHeader, styles.dateCol]}>
              <Text>TANGGAL MULAI</Text>
            </View>
            <View style={[styles.tableColHeader, styles.dateCol]}>
              <Text>TANGGAL SELESAI</Text>
            </View>
            <View style={[styles.tableColHeader, styles.verificationCol]}>
              <Text>STATUS</Text>
            </View>
          </View>

          {/* Table Rows */}
          {data.map((item, index) => (
            <View key={item.id} style={index % 2 === 0 ? styles.tableRow : styles.tableRowEven}>
              <View style={[styles.tableCol, styles.noCol]}>
                <Text>{index + 1}</Text>
              </View>
              <View style={[styles.tableCol, styles.nameCol]}>
                <Text>{item.title}</Text>
              </View>
              <View style={[styles.tableCol, styles.addressCol]}>
                <Text>{item.wisataName}</Text>
              </View>
              <View style={[styles.tableCol, styles.typeCol]}>
                <Text>{item.pengelolaName}</Text>
              </View>
              <View style={[styles.tableCol, styles.dateCol]}>
                <Text>{item.startDate}</Text>
              </View>
              <View style={[styles.tableCol, styles.dateCol]}>
                <Text>{item.endDate}</Text>
              </View>
              <View style={[styles.tableCol, styles.verificationCol]}>
                <Text style={item.status === "Verified" ? styles.statusVerified : styles.statusNotVerified}>
                  {item.status === "Verified" ? "✓ Verified" : "✗ Pending"}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Footer with signature */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Text style={styles.dateText}>Dicetak pada: {formattedDate}</Text>
            <Text style={styles.dateText}>Jumlah halaman: 1</Text>
          </View>
          <View style={styles.footerRight}>
            <Text style={styles.dateText}>Bangko, {formattedDate}</Text>
            <Text style={styles.signatureTitle}>Kepala Dinas Pariwisata dan Kebudayaan</Text>
            <Text style={styles.signatureTitle}>Kabupaten Merangin</Text>
            <View style={styles.signature}>
              <Text style={styles.signatureName}>Sukoso, S.STP</Text>
              <Text style={styles.signatureNip}>NIP. 198104061999121001</Text>
            </View>
          </View>
        </View>

        {/* Page Number */}
        <Text style={styles.pageNumber}>
          Halaman 1 dari 1 | Laporan Data Event Pariwisata - Dinas Pariwisata Kabupaten Merangin
        </Text>
      </Page>
    </Document>
  )
}
