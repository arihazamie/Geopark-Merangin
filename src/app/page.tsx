import MainOne from "../components/Home/Main/index";
import Features from "../components/Home/features";
import Geopark from "../components/Home/geopark";
import TopDestinations from "../components/Home/topdestination";
import Gallery from "../components/Home/gallery";

export default function Home() {
  return (
    <main className="pt-20">
      <MainOne />
      <Geopark />
      <Features />
      <TopDestinations />
      <Gallery />
    </main>
  );
}
