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
            Welcome to Geopark Merangin
          </h1>
          <p className="max-w-3xl mb-8 text-lg text-center md:text-xl">
            Discover the natural beauty, cultural heritage, and geological
            wonders of Merangin
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="rounded-full">
              <Link href="/wisata">Explore Destinations</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full bg-white/10 backdrop-blur-sm">
              <Link href="/event">Upcoming Events</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Sections */}
      <section className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="p-8 space-y-4 bg-primary/5 dark:bg-primary/10 rounded-2xl">
          <h2 className="text-2xl font-semibold">Tourism Destinations</h2>
          <p className="text-muted-foreground">
            Explore the breathtaking natural landscapes, historical sites, and
            cultural attractions of Merangin.
          </p>
          <Button
            asChild
            variant="outline">
            <Link href="/wisata">View All Destinations</Link>
          </Button>
        </div>

        <div className="p-8 space-y-4 bg-primary/5 dark:bg-primary/10 rounded-2xl">
          <h2 className="text-2xl font-semibold">Upcoming Events</h2>
          <p className="text-muted-foreground">
            Discover festivals, exhibitions, and cultural events happening in
            the Geopark Merangin area.
          </p>
          <Button
            asChild
            variant="outline">
            <Link href="/event">View All Events</Link>
          </Button>
        </div>

        <div className="p-8 space-y-4 bg-primary/5 dark:bg-primary/10 rounded-2xl">
          <h2 className="text-2xl font-semibold">Articles & News</h2>
          <p className="text-muted-foreground">
            Stay updated with the latest news, stories, and information about
            Geopark Merangin.
          </p>
          <Button
            asChild
            variant="outline">
            <Link href="/artikel">Read Articles</Link>
          </Button>
        </div>
      </section>

      {/* About Section */}
      <section className="p-8 bg-muted/50 rounded-2xl">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold text-center">
            About Geopark Merangin
          </h2>
          <p className="text-lg text-center">
            Geopark Merangin is a UNESCO Global Geopark located in Jambi
            Province, Indonesia. It features exceptional geological heritage,
            biodiversity, and cultural richness.
          </p>
          <div className="flex justify-center">
            <Button
              asChild
              variant="secondary">
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
