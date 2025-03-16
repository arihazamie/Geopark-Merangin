import Link from "next/link"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, Send } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-muted/30 dark:bg-muted/10 mt-20">
      <div className="container px-4 py-12 mx-auto">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo and About */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Image src="/placeholder.svg?height=40&width=40" alt="Geopark Merangin Logo" width={40} height={40} />
              <span className="text-xl font-semibold">Geopark Merangin</span>
            </div>
            <p className="text-muted-foreground">
              Jelajahi keindahan alam, warisan budaya, dan keajaiban geologi Merangin. Sebuah UNESCO Global Geopark
              dengan keanekaragaman hayati dan kekayaan budaya yang luar biasa.
            </p>
            <div className="flex items-center gap-3">
              <Link href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                  <Facebook className="h-5 w-5" />
                  <span className="sr-only">Facebook</span>
                </Button>
              </Link>
              <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                  <Instagram className="h-5 w-5" />
                  <span className="sr-only">Instagram</span>
                </Button>
              </Link>
              <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                  <Twitter className="h-5 w-5" />
                  <span className="sr-only">Twitter</span>
                </Button>
              </Link>
              <Link href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                  <Youtube className="h-5 w-5" />
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
                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/wisata" className="text-muted-foreground hover:text-foreground transition-colors">
                  Destinasi Wisata
                </Link>
              </li>
              <li>
                <Link href="/event" className="text-muted-foreground hover:text-foreground transition-colors">
                  Acara
                </Link>
              </li>
              <li>
                <Link href="/artikel" className="text-muted-foreground hover:text-foreground transition-colors">
                  Artikel
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Kontak
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
                  Jl. Jendral Sudirman No. 1, Bangko, Merangin, Jambi, Indonesia 37313
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5" />
                <Link
                  href="tel:+6282112345678"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  +62 821 1234 5678
                </Link>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5" />
                <Link
                  href="mailto:info@geoparkmerangin.id"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  info@geoparkmerangin.id
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Buletin</h3>
            <p className="text-muted-foreground">
              Berlangganan buletin kami untuk menerima informasi terbaru tentang acara, berita, dan penawaran khusus.
            </p>
            <div className="flex gap-2">
              <Input type="email" placeholder="Alamat email Anda" className="rounded-lg" />
              <Button size="icon" className="rounded-lg">
                <Send className="h-4 w-4" />
                <span className="sr-only">Subscribe</span>
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()} Geopark Merangin. Seluruh hak cipta dilindungi.
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="/privacy-policy" className="text-muted-foreground hover:text-foreground transition-colors">
              Kebijakan Privasi
            </Link>
            <Link href="/terms-of-service" className="text-muted-foreground hover:text-foreground transition-colors">
              Ketentuan Layanan
            </Link>
            <Link href="/sitemap" className="text-muted-foreground hover:text-foreground transition-colors">
              Peta Situs
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

