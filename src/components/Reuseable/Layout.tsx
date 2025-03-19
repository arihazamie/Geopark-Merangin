"use client";
import "../../app/globals.css";
import { usePathname } from "next/navigation";
import Footer from "@/components/Reuseable/Footer";
import Navbar from "../Navbar/Navbar";
import { GlobalToastProvider } from "../ui/global-toast-provider";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");

  return (
    <>
      {isDashboard ? (
        <>{children}</>
      ) : (
        <>
          <Navbar />
          <main
            className="container z-0 px-4 py-8 mx-auto mt-5"
            suppressHydrationWarning>
            {children}
          </main>
          <GlobalToastProvider />
          <Footer />
        </>
      )}
    </>
  );
};

export default DashboardLayout;
