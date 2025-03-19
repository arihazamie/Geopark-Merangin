import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Send,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-20 bg-muted/30 dark:bg-muted/10">
      <div className="container px-4 py-12 mx-auto">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo and About */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Image
                src="/images/Logo/logo.webp"
                alt="Geopark Merangin Logo"
                width={40}
                height={40}
              />
              <span className="text-xl font-semibold">Geopark Merangin</span>
            </div>
            <p className="text-muted-foreground">
              Jelajahi keindahan alam, warisan budaya, dan keajaiban geologi
              Merangin. Sebuah UNESCO Global Geopark dengan keanekaragaman
              hayati dan kekayaan budaya yang luar biasa.
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="https://www.facebook.com/geopark.jambi?_rdc=1&_rdr"
                target="_blank"
                rel="noopener noreferrer">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-9 w-9">
                  <Facebook className="w-5 h-5" />
                  <span className="sr-only">Facebook</span>
                </Button>
              </Link>
              <Link
                href="https://www.instagram.com/geoparkmeranginjambi/"
                target="_blank"
                rel="noopener noreferrer">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-9 w-9">
                  <Instagram className="w-5 h-5" />
                  <span className="sr-only">Instagram</span>
                </Button>
              </Link>
              <Link
                href="https://www.youtube.com/channel/UC3AApvWJEY4vJOTgT0Pvt8g"
                target="_blank"
                rel="noopener noreferrer">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-9 w-9">
                  <Youtube className="w-5 h-5" />
                  <span className="sr-only">YouTube</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Tautan Cepat</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="transition-colors text-muted-foreground hover:text-foreground">
                  Beranda
                </Link>
              </li>
              <li>
                <Link
                  href="/wisata"
                  className="transition-colors text-muted-foreground hover:text-foreground">
                  Destinasi Wisata
                </Link>
              </li>
              <li>
                <Link
                  href="/event"
                  className="transition-colors text-muted-foreground hover:text-foreground">
                  Acara
                </Link>
              </li>
              <li>
                <Link
                  href="/artikel"
                  className="transition-colors text-muted-foreground hover:text-foreground">
                  Artikel
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Hubungi Kami</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-0.5" />
                <span className="text-muted-foreground">
                  Jl. Jendral Sudirman No. 1, Bangko, Merangin, Jambi, Indonesia
                  37313
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5" />
                <Link
                  href="tel:+6282112345678"
                  className="transition-colors text-muted-foreground hover:text-foreground">
                  +62 821 1234 5678
                </Link>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5" />
                <Link
                  href="mailto:info@geoparkmerangin.id"
                  className="transition-colors text-muted-foreground hover:text-foreground">
                  info@geoparkmerangin.id
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Buletin</h3>
            <p className="text-muted-foreground">
              Berlangganan buletin kami untuk menerima informasi terbaru tentang
              acara, berita, dan penawaran khusus.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Alamat email Anda"
                className="rounded-lg"
              />
              <Button
                size="icon"
                className="rounded-lg">
                <Send className="w-4 h-4" />
                <span className="sr-only">Subscribe</span>
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-center text-muted-foreground md:text-left">
            © {new Date().getFullYear()} Geopark Merangin. Seluruh hak cipta
            dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}
