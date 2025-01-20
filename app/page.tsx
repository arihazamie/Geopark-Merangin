import MainOne from "./components/Main/index";
import Features from "./components/Features/index";
import Geopark from "./components/Geopark/index";
import TopDestinations from "./components/TopDestination/index";
import Gallery from "./components/Gallery/index";

export default function Home() {
  return (
    <main>
      <MainOne />
      <Geopark />
      <Features />
      <TopDestinations />
      <Gallery />
    </main>
  );
}
