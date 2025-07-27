import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="space-y-16">
      <section className="relative h-[70vh] rounded-3xl overflow-hidden">
        <Image
          src="/images/Main/banner.webp"
          alt="Geopark Merangin"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-white bg-black/40">
          <h1 className="mb-4 text-4xl font-bold text-center md:text-6xl">
            Selamat Datang di Geopark Merangin
          </h1>
          <p className="max-w-3xl mb-8 text-lg text-center md:text-xl">
            Temukan keindahan alam, kekayaan budaya, dan keajaiban geologi
            Merangin
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="rounded-full">
              <Link href="/wisata">Jelajahi Destinasi</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full bg-white/10 backdrop-blur-sm">
              <Link href="/event">Lihat Acara Terdekat</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Seksi Unggulan */}
      <section className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="p-8 space-y-4 bg-primary/5 dark:bg-primary/10 rounded-2xl">
          <h2 className="text-2xl font-semibold">Destinasi Wisata</h2>
          <p className="text-muted-foreground">
            Jelajahi keindahan alam, situs sejarah, dan kekayaan budaya
            Merangin.
          </p>
          <Button
            asChild
            variant="outline">
            <Link href="/wisata">Lihat Semua Destinasi</Link>
          </Button>
        </div>

        <div className="p-8 space-y-4 bg-primary/5 dark:bg-primary/10 rounded-2xl">
          <h2 className="text-2xl font-semibold">Acara Mendatang</h2>
          <p className="text-muted-foreground">
            Temukan festival, pameran, dan acara budaya di wilayah Geopark
            Merangin.
          </p>
          <Button
            asChild
            variant="outline">
            <Link href="/event">Lihat Semua Acara</Link>
          </Button>
        </div>

        <div className="p-8 space-y-4 bg-primary/5 dark:bg-primary/10 rounded-2xl">
          <h2 className="text-2xl font-semibold">Artikel & Berita</h2>
          <p className="text-muted-foreground">
            Dapatkan informasi terbaru, cerita menarik, dan berita seputar
            Geopark Merangin.
          </p>
          <Button
            asChild
            variant="outline">
            <Link href="/artikel">Baca Artikel</Link>
          </Button>
        </div>
      </section>

      {/* Seksi Tentang */}
      <section className="p-8 bg-muted/50 rounded-2xl">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold text-center">
            Tentang Geopark Merangin
          </h2>
          <p className="text-lg text-center">
            Geopark Merangin adalah Geopark Global UNESCO yang terletak di
            Provinsi Jambi, Indonesia. Kawasan ini memiliki warisan geologi yang
            luar biasa, keanekaragaman hayati yang tinggi, serta kekayaan budaya
            yang mendalam.
          </p>
          <div className="flex justify-center"></div>
        </div>
      </section>
    </div>
  );
}
