import "./globals.css";
import Navbar from "../components/Navbar/index";
import Footer from "../components/Footer";

export const metadata = {
  title: "Geopark Merangin Jambi",
  description:
    "Merangin Jambi UNESCO Global Geopark enyimpan kekayaan alam dan geologi yang luar biasa seperti fosil tanaman purba yang berusia lebih dari 300 juta tahun",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
