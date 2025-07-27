import Head from "next/head";

interface SeoProps {
  title: string;
  description: string;
  url?: string;
  image?: string;
}

export const Seo = ({
  title,
  description,
  url = "https://geoparkmerangin.vercel.app",
  image = "/images/og-image.jpg",
}: SeoProps) => {
  return (
    <Head>
      <title>{title}</title>
      <meta
        name="description"
        content={description}
      />
      <meta
        name="keywords"
        content="Geopark Merangin, wisata Jambi, wisata alam, fosil, sejarah, geowisata"
      />
      <meta
        name="robots"
        content="index, follow"
      />
      <link
        rel="canonical"
        href={url}
      />

      {/* Open Graph */}
      <meta
        property="og:type"
        content="website"
      />
      <meta
        property="og:title"
        content={title}
      />
      <meta
        property="og:description"
        content={description}
      />
      <meta
        property="og:url"
        content={url}
      />
      <meta
        property="og:image"
        content={image}
      />

      {/* Twitter */}
      <meta
        name="twitter:card"
        content="summary_large_image"
      />
      <meta
        name="twitter:title"
        content={title}
      />
      <meta
        name="twitter:description"
        content={description}
      />
      <meta
        name="twitter:image"
        content={image}
      />
    </Head>
  );
};
