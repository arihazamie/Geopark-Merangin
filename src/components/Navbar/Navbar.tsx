"use client";
import { Disclosure } from "@headlessui/react";
import React from "react";
import { Bars3Icon } from "@heroicons/react/24/outline";
import Drawer from "./Drawer";
import Drawerdata from "./Drawerdata";
import Image from "next/image";
import Link from "@/components/Link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "../ui/button";

interface NavigationItem {
  name: string;
  href: string;
  current: boolean;
}

const navigation: NavigationItem[] = [
  { name: "Home", href: "/", current: false },
  { name: "About us", href: "#geopark", current: false },
  { name: "Recipe", href: "#features", current: false },
  { name: "Gallery", href: "#gallery-section", current: false },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);

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
    <Disclosure
      as="nav"
      className="navbar">
      <>
        <div className="p-3 mx-auto max-w-7xl md:p-6 lg:px-8">
          <div className="relative flex items-center h-12 sm:h-12">
            <div className="flex items-center flex-1 sm:justify-between">
              {/* LOGO */}

              <div className="flex items-center flex-shrink-0 sm:hidden border-right">
                <Image
                  src="/images/Logo/icon.webp"
                  alt="logo"
                  width={36}
                  height={36}
                />
                <Link
                  href="/"
                  className="ml-4 text-xl font-semibold text-black lg:text-2xl">
                  Geopark Merangin
                </Link>
              </div>
              <div className="items-center flex-shrink-0 hidden sm:flex border-right">
                <Image
                  src="/images/Logo/icon.webp"
                  alt="logo"
                  width={56}
                  height={56}
                />
                <Link
                  href="/"
                  className="ml-4 text-xl font-semibold text-black lg:text-2xl">
                  Geopark Merangin
                </Link>
              </div>

              {/* LINKS */}

              <div className="items-center hidden lg:flex border-right ">
                <div className="flex justify-end space-x-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="px-2 rounded-lg hover:bg-lightgrey/10">
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="hidden gap-6 lg:flex">
                {/* Konten Berdasarkan Status Session */}
                {session ? (
                  <Button onClick={() => signOut()}>Logout</Button>
                ) : (
                  <div className="space-y-4">
                    <Link href="/auth/login">Login</Link>
                  </div>
                )}
              </div>
            </div>

            {/* DRAWER FOR MOBILE VIEW */}

            {/* DRAWER ICON */}

            <div className="block lg:hidden">
              <Bars3Icon
                className="block w-6 h-6"
                aria-hidden="true"
                onClick={() => setIsOpen(true)}
              />
            </div>

            {/* DRAWER LINKS DATA */}

            <Drawer
              isOpen={isOpen}
              setIsOpen={setIsOpen}>
              <Drawerdata />
            </Drawer>
          </div>
        </div>
      </>
    </Disclosure>
  );
};

export default Navbar;
