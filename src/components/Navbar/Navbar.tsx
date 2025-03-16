"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Home, MapPin, Calendar, FileText, Menu, LogIn } from "lucide-react";
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
import { usePathname } from "next/navigation";

// Define types for navigation items
interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const Listitem: NavItem[] = [
  { href: "/", label: "Beranda", icon: <Home className="w-5 h-5" /> },
  { href: "/wisata", label: "Wisata", icon: <MapPin className="w-5 h-5" /> },
  { href: "/event", label: "Event", icon: <Calendar className="w-5 h-5" /> },
  {
    href: "/artikel",
    label: "Artikel",
    icon: <FileText className="w-5 h-5" />,
  },
];

// Props for NavbarItem
interface NavbarItemProps {
  isAdmin: boolean;
  isPengelola: boolean;
}

function NavbarItem({ isAdmin, isPengelola }: NavbarItemProps) {
  const pathname = usePathname();

  return (
    <NavigationMenu className="z-50 hidden md:flex">
      <NavigationMenuList className="flex items-center gap-2">
        {Listitem.map((item) => {
          const isActive = pathname === item.href;
          return (
            <NavigationMenuItem key={item.href}>
              <Link
                href={item.href}
                legacyBehavior
                passHref>
                <NavigationMenuLink
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "text-base font-medium rounded-xl px-4 py-2 transition-all duration-200",
                    isActive ? "bg-primary/10 text-primary" : ""
                  )}>
                  {item.label}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          );
        })}
        {isAdmin && (
          <NavigationMenuItem>
            <Link
              href="/dashboard/admin"
              legacyBehavior
              passHref>
              <NavigationMenuLink
                className={cn(
                  navigationMenuTriggerStyle(),
                  "text-base font-medium rounded-xl px-4 py-2",
                  pathname.startsWith("/dashboard/admin")
                    ? "bg-primary/10 text-primary"
                    : ""
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
                  "text-base font-medium rounded-xl px-4 py-2",
                  pathname.startsWith("/dashboard/pengelola")
                    ? "bg-primary/10 text-primary"
                    : ""
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

function MobileNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}>
      <SheetTrigger
        asChild
        className="md:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="border rounded-full shadow-sm bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90">
          <Menu className="w-5 h-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="flex flex-col gap-6 pr-10 border-r border-border/50 bg-background/95 backdrop-blur-md w-[280px]">
        <div className="flex items-center gap-3 pl-1 mt-4 mb-6">
          <Image
            src="/images/Logo/logo.webp"
            alt="Geopark Merangin Logo"
            width={48}
            height={48}
            className="object-contain w-12 h-12"
          />
          <span className="font-bold text-transparent text-md bg-gradient-to-r from-primary to-primary/70 bg-clip-text">
            Geopark Merangin
          </span>
        </div>

        <div className="flex flex-col gap-5 mt-2">
          <div className="flex flex-col gap-1">
            {Listitem.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 py-3 px-4 transition-all rounded-lg",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}>
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {!isLoggedIn && (
            <div className="px-4 mt-4">
              <Button
                className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => setOpen(false)}>
                <Link
                  href="/auth/login"
                  className="flex items-center justify-center w-full gap-2">
                  <LogIn className="w-4 h-4" />
                  <span>Masuk</span>
                </Link>
              </Button>
            </div>
          )}
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
        "sticky z-50 px-4 py-3 mx-auto transition-all duration-300 sm:px-6 top-5 rounded-2xl max-w-7xl bg-background/80 backdrop-blur-md",
        scrolled
          ? "shadow-lg shadow-primary/5 border border-border/30"
          : "shadow-md shadow-primary/5"
      )}>
      <div className="relative flex items-center justify-between">
        {/* LOGO */}
        <div className="flex items-center gap-2">
          <Image
            src="/images/Logo/logo.webp"
            alt="Geopark Merangin Logo"
            width={40}
            height={40}
            className="object-contain w-10 h-10"
          />
          <Link
            href="/"
            className="hidden text-lg font-semibold text-transparent sm:block bg-gradient-to-r from-primary to-primary/70 bg-clip-text">
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
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <ProfileDialog
              trigger={
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full shadow-sm w-9 h-9 sm:w-10 sm:h-10 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 backdrop-blur-sm">
                  <Avatar className="w-7 h-7 sm:w-8 sm:h-8">
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
              variant="default"
              size="sm"
              className="hidden rounded-full shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground md:flex">
              <Link
                href="/auth/login"
                className="flex items-center gap-1.5">
                <LogIn className="w-4 h-4" />
                <span>Masuk</span>
              </Link>
            </Button>
          )}
          <DarkModeButton />
        </div>

        {/* MOBILE NAV */}
        <MobileNav isLoggedIn={isLoggedIn} />
      </div>
    </div>
  );
}
