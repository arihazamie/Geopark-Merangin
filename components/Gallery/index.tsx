"use client";
import Image from "next/image";
import { Fade } from "react-awesome-reveal";

const Gallery = () => {
  return (
    <div id="gallery-section">
      <div className="max-w-2xl mx-auto mt-20 lg:max-w-7xl sm:py-4 lg:px-8 md:pt-24">
        <div className="text-center">
          <Fade
            direction={"up"}
            delay={400}
            cascade
            damping={1e-1}
            triggerOnce={true}>
            <h2 className="mb-3 text-lg font-normal tracking-widest uppercase text-pink ls-51">
              Our Gallery
            </h2>
          </Fade>
          <Fade
            direction={"up"}
            delay={800}
            cascade
            damping={1e-1}
            triggerOnce={true}>
            <h3 className="text-3xl font-semibold text-black lg:text-5xl">
              Gallery of our Destination.
            </h3>
          </Fade>
        </div>

        <div className="grid grid-cols-1 px-6 my-16 space-y-6 md:grid-cols-12 sm:space-x-6 md:space-y-0">
          <div className="flex justify-center col-span-6 overflow-hidden shadow-2xl rounded-3xl">
            <Image
              src="/images/Features/geologi.webp"
              alt="foto-satu"
              width={1000}
              height={805}
              className="w-full h-full inner-img"
            />
          </div>

          <div className="flex justify-center col-span-6">
            <div className="grid grid-flow-row grid-rows-1 gap-4">
              <div className="row-span-1 overflow-hidden rounded-3xl">
                <Image
                  src="/images/Geopark/arau.jpg"
                  alt="foto-dua"
                  width={1000}
                  height={1000}
                  className="w-full h-full inner-img bg-bgpink"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="overflow-hidden rounded-3xl">
                  <Image
                    src="/images/Main/banner.png"
                    alt="foto-tiga"
                    width={1000}
                    height={1000}
                    className="w-full h-full inner-img bg-bgpink"
                  />
                </div>
                <div className="overflow-hidden rounded-3xl">
                  <Image
                    src="/images/Features/budaya.jpg"
                    alt="foto-empat"
                    width={500}
                    height={405}
                    className="w-full h-full inner-img"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gallery;
