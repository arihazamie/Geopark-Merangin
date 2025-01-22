"use client";
import Image from "next/image";
import { Fade } from "react-awesome-reveal";
import Link from "next/link";

const Banner = () => {
  return (
    <div
      id="home-section"
      className="bg-lightpink">
      <div className="px-6 pt-12 mx-auto max-w-7xl sm:pb-24">
        <div className="grid grid-cols-1 space-x-1 lg:grid-cols-12">
          <div className="flex flex-col justify-center col-span-6">
            <Fade
              direction={"up"}
              delay={400}
              cascade
              damping={1e-1}
              triggerOnce={true}>
              <h1 className="mb-5 text-4xl font-semibold text-center lg:text-7xl text-lightgrey md:4px lg:text-start">
                Lets Explore <br />{" "}
                <span className="text-4xl lg:text-7xl">Geopark Merangin</span>
              </h1>
            </Fade>
            <Fade
              direction={"up"}
              delay={800}
              cascade
              damping={1e-1}
              triggerOnce={true}>
              <p className="mb-10 font-normal text-center text-grey lg:text-lg lg:text-start">
                Merangin Jambi UNESCO Global Geopark <br /> Fosil Flora Permian
                Awal Terakhir yang Terbaik dan Terlengkap
              </p>
            </Fade>
            <Fade
              direction={"up"}
              delay={1000}
              cascade
              damping={1e-1}
              triggerOnce={true}>
              <div className="justify-center align-middle md:flex lg:justify-start">
                <button className="w-full px-6 py-5 mr-6 text-xl font-medium text-white rounded-full md:w-auto bg-pink lg:px-14">
                  <Link href="#cook-section">Lets See</Link>
                </button>
                <button className="flex items-center justify-center w-full px-10 py-5 mt-5 text-xl font-medium border rounded-full md:w-auto md:mt-0 border-pink text-pink hover:text-white hover:bg-pink">
                  <Link href="#about-section">Explore now</Link>
                </button>
              </div>
            </Fade>
          </div>

          <div className="relative flex justify-center col-span-6 mt-10 lg:mt-0">
            <div className="absolute flex items-center gap-5 bottom-10 left-10">
              <Image
                src={"/images/Logo/unesco.webp"}
                alt="Banner-satu"
                width={68}
                height={68}
                className="hidden md:block"
              />
            </div>
            <Image
              src="/images/Main/banner.png"
              alt="Banner-Dua"
              width={896}
              height={670}
              className="object-cover hidden md:block rounded-3xl shadow-2xl aspect-square lg:w-[35rem] lg:h-[33rem]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
