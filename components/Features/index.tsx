"use client";
import Image from "next/image";
import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { Fade } from "react-awesome-reveal";

interface cardDataType {
  imgSrc: string;
  imgAlt: string;
  heading: string;
  subheading: string;
  link: string;
}

const cardData: cardDataType[] = [
  {
    imgSrc: "/images/Features/geologi.webp",
    imgAlt: "Geologi",
    heading: "Situs Geologi",
    subheading: "Geopark Merangin, keajaiban fosil purba yang menakjubkan.",
    link: "See More",
  },
  {
    imgSrc: "/images/Features/biologi.webp",
    imgAlt: "Biologi",
    heading: "Situs Biologi",
    subheading: "Geopark Merangin, rumah bagi keanekaragaman hayati unik.",
    link: "See More",
  },
  {
    imgSrc: "/images/Features/budaya.webp",
    imgAlt: "Budaya",
    heading: "Situs Budaya",
    subheading: "Geopark Merangin, jejak budaya lokal yang memikat.",
    link: "See More",
  },
];

const Work = () => {
  return (
    <div>
      <div
        className="px-6 py-40 mx-auto max-w-7xl"
        id="features">
        <div className="text-center mb-14">
          <Fade
            direction={"up"}
            delay={400}
            cascade
            damping={1e-1}
            triggerOnce={true}>
            <h3 className="mb-3 text-lg font-normal uppercase text-pink ls-51">
              Features
            </h3>
          </Fade>
          <Fade
            direction={"up"}
            delay={800}
            cascade
            damping={1e-1}
            triggerOnce={true}>
            <p className="text-3xl font-semibold lg:text-5xl text-lightgrey">
              Get a many of interesting <br /> features.
            </p>
          </Fade>
        </div>

        <div className="grid mt-32 sm:grid-cols-1 lg:grid-cols-3 gap-y-20 gap-x-5">
          <Fade
            direction={"up"}
            delay={1000}
            cascade
            damping={1e-1}
            triggerOnce={true}>
            {cardData.map((items, i) => (
              <div
                className="relative p-8 card-b rounded-3xl"
                key={i}>
                <div className="work-img-bg rounded-full flex justify-center absolute top-[-25%] sm:top-[-40%] md:top-[-55%] lg:top-[-35%] left-[27%] md:left-[27%] shadow-lg">
                  <Image
                    src={items.imgSrc}
                    alt={items.imgAlt}
                    width={400}
                    height={400}
                    className="object-cover w-40 h-40 rounded-full md:w-44 md:h-44 aspect-square"
                  />
                </div>

                <h3 className="mt-16 text-2xl font-semibold text-center text-black">
                  {items.heading}
                </h3>
                <p className="mt-2 text-lg font-normal text-center text-black text-opacity-50">
                  {items.subheading}
                </p>
                <div className="flex items-center justify-center">
                  <Link href="/">
                    <p className="mt-2 text-lg font-medium text-center text-pink hover-underline">
                      {items.link}
                      <ChevronRightIcon
                        width={20}
                        height={20}
                      />
                    </p>
                  </Link>
                </div>
              </div>
            ))}
          </Fade>
        </div>
      </div>
    </div>
  );
};

export default Work;
