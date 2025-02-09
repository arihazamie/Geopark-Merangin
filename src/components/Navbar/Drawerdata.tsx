import React from "react";
import Link from "@/components/Link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "../ui/button";

interface NavigationItem {
  name: string;
  href: string;
  current: boolean;
}

const navigation: NavigationItem[] = [
  { name: "Home", href: "#/", current: false },
  { name: "About us", href: "#about-section", current: false },
  { name: "Recipe", href: "#cook-section", current: false },
  { name: "Gallery", href: "#gallery-section", current: false },
];

const Data = () => {
  // Menggunakan hook useSession untuk mendapatkan status session
  const { data: session, status } = useSession();

  // Menampilkan loading state jika session sedang dimuat
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }
  return (
    <div className="w-full max-w-sm mx-auto rounded-md">
      <div className="flex-1 py-1 space-y-4">
        <div className="sm:block">
          <div className="px-5 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex px-2 py-2 text-lg font-medium rounded-lg hover:bg-lightgrey/10">
                {item.name}
              </Link>
            ))}
            <div className="mt-4">
              {session ? (
                <Button onClick={() => signOut()}>Logout</Button>
              ) : (
                <div className="space-y-4">
                  <Link href="/auth/login">Login</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Data;
