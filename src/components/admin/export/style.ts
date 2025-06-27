import { StyleSheet } from "@react-pdf/renderer";

// Nama hari dan bulan Indonesia
export const dayNames = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

export const monthNames = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

// Styles diperbarui
export const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
    fontSize: 10,
    fontFamily: "Helvetica",
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 25,
    borderBottom: 2,
    borderBottomColor: "#1e3a8a",
    paddingBottom: 15,
    alignItems: "center",
  },
  dateRangeText: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 20,
    color: "#374151",
    fontStyle: "italic",
    backgroundColor: "#f3f4f6",
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  headerContent: {
    alignItems: "center",
    textAlign: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 6,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 9,
    color: "#374151",
    textAlign: "center",
    marginBottom: 3,
    lineHeight: 1.3,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#1e3a8a",
    letterSpacing: 1,
    textDecoration: "underline",
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    marginBottom: 25,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#1e3a8a",
    borderBottomWidth: 1,
    borderBottomColor: "#1e3a8a",
    minHeight: 35,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    minHeight: 30,
  },
  tableRowEven: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    minHeight: 30,
  },
  tableColHeader: {
    borderRightWidth: 1,
    borderRightColor: "#ffffff",
    padding: 8,
    fontWeight: "bold",
    textAlign: "center",
    color: "#ffffff",
    fontSize: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  tableCol: {
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
    padding: 8,
    fontSize: 9,
    justifyContent: "center",
  },
  noCol: {
    width: "8%",
    alignItems: "center",
  },
  nameCol: {
    width: "27%",
    alignItems: "flex-start",
  },
  addressCol: {
    width: "33%",
    alignItems: "flex-start",
  },
  typeCol: {
    width: "12%",
    alignItems: "center",
  },
  verificationCol: {
    width: "20%",
    alignItems: "center",
  },
  statusVerified: {
    color: "#047857",
    fontWeight: "bold",
    backgroundColor: "#d1fae5",
    paddingVertical: 3,
    paddingHorizontal: 5,
    borderRadius: 3,
    textAlign: "center",
  },
  statusNotVerified: {
    color: "#b91c1c",
    fontWeight: "bold",
    backgroundColor: "#fee2e2",
    paddingVertical: 3,
    paddingHorizontal: 5,
    borderRadius: 3,
    textAlign: "center",
  },
  footer: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-start",
  },
  footerRight: {
    alignItems: "flex-end",
    flex: 1,
  },
  dateText: {
    fontSize: 11,
    textAlign: "right",
    marginBottom: 5,
  },
  dateCol: {
    width: "12%",
    alignItems: "center",
  },

  signatureSection: {
    alignItems: "center",
    marginTop: 40,
  },
  signatureTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 60, // ruang untuk tanda tangan
    color: "#1e3a8a",
  },
  signatureName: {
    fontWeight: "bold",
    textDecoration: "underline",
    fontSize: 10,
    marginBottom: 3,
  },
  roleCol: {
    width: "12%",
    alignItems: "center",
  },

  signatureNip: {
    fontSize: 8,
    color: "#6b7280",
  },
  pageNumber: {
    position: "absolute",
    fontSize: 8,
    bottom: 15,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "#6b7280",
  },
});
