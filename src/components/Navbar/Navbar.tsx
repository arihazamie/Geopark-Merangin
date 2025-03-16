"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DarkModeButton } from "@/components/Reuseable/DarkMode";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { useSession } from "next-auth/react";
import { ProfileDialog } from "@/components/Reuseable/ProfileDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Define types for navigation items
interface NavItem {
  href: string;
  label: string;
}

const Listitem: NavItem[] = [
  { href: "/", label: "Beranda" },
  { href: "/wisata", label: "Wisata" },
  { href: "/event", label: "Event" },
  { href: "/artikel", label: "Artikel" },
];

// Props for NavbarItem
interface NavbarItemProps {
  isAdmin: boolean;
  isPengelola: boolean;
}

function NavbarItem({ isAdmin, isPengelola }: NavbarItemProps) {
  return (
    <NavigationMenu className="z-50 hidden md:flex">
      <NavigationMenuList className="flex items-center gap-1">
        {Listitem.map((item) => (
          <NavigationMenuItem key={item.href}>
            <Link
              href={item.href}
              legacyBehavior
              passHref>
              <NavigationMenuLink
                className={cn(
                  navigationMenuTriggerStyle(),
                  "text-base font-medium rounded-xl px-4 py-2"
                )}>
                {item.label}
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        ))}
        {isAdmin && (
          <NavigationMenuItem>
            <Link
              href="/dashboard/admin"
              legacyBehavior
              passHref>
              <NavigationMenuLink
                className={cn(
                  navigationMenuTriggerStyle(),
                  "text-base font-medium rounded-xl px-4 py-2"
                )}>
                Dashboard
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        )}
        {isPengelola && (
          <NavigationMenuItem>
            <Link
              href="/dashboard/pengelola"
              legacyBehavior
              passHref>
              <NavigationMenuLink
                className={cn(
                  navigationMenuTriggerStyle(),
                  "text-base font-medium rounded-xl px-4 py-2"
                )}>
                Dashboard
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger
        asChild
        className="md:hidden">
        <Button
          variant="ghost"
          size="icon">
          <Menu className="w-5 h-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="flex flex-col gap-6 pr-10">
        <div className="flex flex-col gap-3 mt-8">
          <h3 className="text-lg font-semibold">Menu</h3>
          <div className="flex flex-col gap-2 pl-2">
            {Listitem.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors text-muted-foreground hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Define user type based on your session structure
interface CurrentUser {
  name: string;
  email: string;
  notelp: string;
  image: string;
  role: "PENGGUNA" | "PENGELOLA" | "ADMIN";
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [profileOpen, setProfileOpen] = useState<boolean>(false);

  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const isAdmin = session?.user?.role === "ADMIN";
  const isPengelola = session?.user?.role === "PENGELOLA";

  const currentUser: CurrentUser = {
    name: session?.user?.name || session?.user?.email || "",
    email: session?.user?.email || "",
    notelp: session?.user?.notelp || "", // Type assertion if notelp isn't in default next-auth types
    image: session?.user?.image || "/placeholder.svg?height=100&width=100",
    role:
      (session?.user?.role as "PENGGUNA" | "PENGELOLA" | "ADMIN") || "PENGGUNA",
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={cn(
        "sticky z-50 px-4 py-3 mx-auto  transition-all duration-300 shadow-xl sm:px-6 top-5 rounded-2xl max-w-7xl ",
        { "shadow-md": scrolled }
      )}>
      <div className="relative flex items-center justify-between">
        {/* LOGO */}
        <div className="flex items-center gap-3">
          <Image
            src="/images/Logo/icon.webp"
            alt="logo"
            width={64}
            height={64}
            className="sm:w-[48px] sm:h-[48px] w-full h-full"
          />
          <Link
            href="/"
            className="ml-3 text-lg font-semibold sm:text-xl">
            Geopark Merangin
          </Link>
        </div>

        {/* NAVIGATION ITEMS */}
        <div className="flex justify-center flex-1">
          <NavbarItem
            isAdmin={isAdmin}
            isPengelola={isPengelola}
          />
        </div>

        {/* RIGHT SIDE - LOGIN */}
        <div className="flex items-center gap-3 sm:gap-4">
          {isLoggedIn ? (
            <ProfileDialog
              trigger={
                <Button
                  variant="outline"
                  size="icon"
                  className="w-10 h-10 rounded-full bg-whiteColor/10 text-whiteColor border-whiteColor/20 hover:bg-whiteColor/20 backdrop-blur-sm">
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src={currentUser.image}
                      alt={currentUser.name}
                    />
                    <AvatarFallback>
                      {currentUser.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              }
              open={profileOpen}
              onOpenChange={setProfileOpen}
            />
          ) : (
            <Button
              variant="outline"
              className="rounded-xl bg-whiteColor/10 text-whiteColor border-whiteColor/20 hover:bg-whiteColor/20 backdrop-blur-sm">
              <Link
                href="/auth/login"
                className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <span>Masuk</span>
              </Link>
            </Button>
          )}
          <DarkModeButton />
        </div>

        {/* MOBILE NAV */}
        <MobileNav />
      </div>
    </div>
  );
}
