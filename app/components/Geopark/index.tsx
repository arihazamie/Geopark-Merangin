"use client";
import Image from "next/image";
import { Fade } from "react-awesome-reveal";

const Geopark = () => {
  return (
    <div
      className="relative"
      id="geopark">
      <div className="px-6 mx-auto max-w-7xl lg:pt-20 sm:pb-24">
        {/* <div className="absolute right-0 bottom-[-18%] hidden lg:block">
          <Image
            src={"/images/Cook/burger.png"}
            alt="burger-image"
            width={463}
            height={622}
          />
        </div> */}

        <div className="grid grid-cols-1 my-16 space-x-5 lg:grid-cols-12">
          <div className="flex justify-start col-span-6">
            <Image
              src="/images/Geopark/arau.jpg"
              alt="Geopark"
              width={1577}
              height={578}
              className="object-cover shadow-2xl aspect-square rounded-3xl"
            />
          </div>

          <div className="flex flex-col justify-center col-span-6">
            <Fade
              direction={"up"}
              delay={400}
              cascade
              damping={1e-1}
              triggerOnce={true}>
              <h2 className="mb-3 text-lg font-normal uppercase text-pink ls-51 text-start">
                Unesco Global
              </h2>
            </Fade>
            <Fade
              direction={"up"}
              delay={800}
              cascade
              damping={1e-1}
              triggerOnce={true}>
              <h3 className="text-3xl font-semibold text-black lg:text-5xl text-start">
                Geopark Merangin Jambi
              </h3>
            </Fade>
            <Fade
              direction={"up"}
              delay={1000}
              cascade
              damping={1e-1}
              triggerOnce={true}>
              <p className="mt-2 mb-10 font-normal text-grey md:text-lg text-start">
                UNESCO Global Geopark Merangin menyimpan kekayaan alam dan
                geologi yang luar biasa, seperti fosil tanaman purba yang
                berusia lebih dari 300 juta tahun. Dikelilingi oleh pemandangan
                alam yang memukau, mulai dari sungai yang mengalir deras, air
                terjun yang indah, hingga hutan tropis yang asri, geopark ini
                adalah tempat yang sempurna untuk para pecinta alam dan
                petualangan. Selain itu, Anda juga bisa mengenal lebih dekat
                budaya masyarakat setempat yang hidup harmonis dengan alam.{" "}
              </p>
              <p className="mt-1 mb-10 font-normal text-grey md:text-lg text-start">
                Nikmati pengalaman yang tak terlupakan di Merangin!
              </p>
              <div className="flex justify-center align-middle md:justify-start">
                <button className="px-6 py-5 mr-6 text-xl font-medium text-white rounded-full bg-pink lg:px-10">
                  Explore
                </button>
              </div>
            </Fade>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Geopark;
