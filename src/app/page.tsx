import Home from "@/components/Home/Home";
import { Seo } from "@/components/Seo";

export default function HomePage() {
  return (
    <main>
      <Seo
        title="Geopark Merangin"
        description="Merangin Jambi UNESCO Global Geopark"
      />
      <Home />
    </main>
  );
}
