import "./globals.css";
import { Providers } from "@/lib/providers";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { GlobalToastProvider } from "@/components/ui/global-toast-provider";
import DashboardLayout from "@/components/Reuseable/Layout";

export const metadata = {
  title: "Geopark Merangin Jambi",
  description:
    "Merangin Jambi UNESCO Global Geopark menyimpan kekayaan alam dan geologi yang luar biasa seperti fosil tanaman purba yang berusia lebih dari 300 juta tahun",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning={true}>
      <body>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem>
            <DashboardLayout>{children}</DashboardLayout>
            <GlobalToastProvider />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
