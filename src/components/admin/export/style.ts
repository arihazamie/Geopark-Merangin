import { StyleSheet, Font } from "@react-pdf/renderer";

// Register fonts with italic variants
export const fonts = Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
      fontWeight: 300,
      fontStyle: "normal",
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-lightitalic-webfont.ttf",
      fontWeight: 300,
      fontStyle: "italic",
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
      fontWeight: 400,
      fontStyle: "normal",
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf",
      fontWeight: 400,
      fontStyle: "italic",
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf",
      fontWeight: 500,
      fontStyle: "normal",
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-mediumitalic-webfont.ttf",
      fontWeight: 500,
      fontStyle: "italic",
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
      fontWeight: 700,
      fontStyle: "normal",
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bolditalic-webfont.ttf",
      fontWeight: 700,
      fontStyle: "italic",
    },
  ],
});

export const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Roboto",
    fontSize: 10,
    lineHeight: 1.5,
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 10,
    textAlign: "center",
    borderBottom: "1px solid #000",
    paddingBottom: 10,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  titleContainer: {
    flexDirection: "column",
    alignItems: "center", // Center all text in the title container
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333333",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 10,
    marginBottom: 2,
    color: "#555555",
    textAlign: "center", // Center the subtitle text
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 15,
  },
  date: {
    fontSize: 10,
    fontWeight: 500,
    color: "#555555",
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 15,
    textAlign: "center",
    color: "#333333",
    textDecoration: "underline",
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#666666",
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: "row",
    minHeight: 25,
    alignItems: "center",
  },
  tableRowEven: {
    flexDirection: "row",
    minHeight: 25,
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  tableHeaderRow: {
    flexDirection: "row",
    minHeight: 30,
    alignItems: "center",
    backgroundColor: "#e6e6e6",
    borderBottomWidth: 1,
    borderBottomColor: "#666666",
  },
  tableColHeader: {
    borderRightWidth: 1,
    borderRightColor: "#666666",
    padding: 6,
    fontWeight: "bold",
    fontSize: 10,
    color: "#333333",
  },
  tableCol: {
    borderRightWidth: 1,
    borderRightColor: "#666666",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    padding: 6,
    fontSize: 9,
  },
  noCol: {
    width: "5%",
    textAlign: "center",
  },
  nameCol: {
    width: "25%",
  },
  addressCol: {
    width: "35%",
  },
  typeCol: {
    width: "15%",
  },
  verificationCol: {
    width: "20%",
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    right: 40,
    textAlign: "right",
    fontSize: 9,
    color: "#555555",
  },
  signature: {
    marginTop: 60,
    marginBottom: 10,
  },
  signatureName: {
    fontWeight: "bold",
  },
  signatureTitle: {
    fontSize: 8,
  },
  pageNumber: {
    position: "absolute",
    bottom: 30,
    left: 40,
    fontSize: 9,
    color: "#555555",
  },
  verifiedBadge: {
    color: "#2e7d32",
    fontWeight: "bold",
  },
  unverifiedBadge: {
    color: "#c62828",
    fontWeight: "bold",
  },
});


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