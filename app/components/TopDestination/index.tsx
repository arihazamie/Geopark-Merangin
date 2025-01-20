"use client";
import Slider from "react-slick";
import React, { Component } from "react";
import Image from "next/image";
import { Fade } from "react-awesome-reveal";

// CAROUSEL DATA

interface DataType {
  profession: string;
  name: string;
  imgSrc: string;
  alt: string;
}

const postData: DataType[] = [
  {
    profession: "Contoh",
    name: "Contoh",
    imgSrc: "/images/Top/kaldera_masurai.jpg",
    alt: "top-satu",
  },
  {
    profession: "Contoh",
    name: "Contoh",
    imgSrc: "/images/Top/panas.jpg",
    alt: "top-dua",
  },
  {
    profession: "Contoh",
    name: "Contoh",
    imgSrc: "/images/Top/karst.jpg",
    alt: "top-tiga",
  },
];

// CAROUSEL SETTINGS

export default class MultipleItems extends Component {
  render() {
    const settings = {
      dots: false,
      infinite: true,
      slidesToShow: 3,
      // centerMode: true,
      slidesToScroll: 1,
      arrows: false,
      autoplay: false,
      speed: 4000,
      autoplaySpeed: 2000,
      cssEase: "linear",
      responsive: [
        {
          breakpoint: 1200,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 1,
            infinite: true,
            dots: false,
          },
        },
        {
          breakpoint: 800,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1,
            infinite: true,
            dots: false,
          },
        },
        {
          breakpoint: 450,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
            infinite: true,
            dots: false,
          },
        },
      ],
    };

    return (
      <div className="py-10 sm:py-20 bg-darkpink">
        <div className="max-w-2xl mx-auto lg:max-w-7xl sm:py-4 lg:px-8">
          <div className="text-center">
            <Fade
              direction={"up"}
              delay={400}
              cascade
              damping={1e-1}
              triggerOnce={true}>
              <h2 className="mb-3 text-lg font-normal tracking-widest uppercase text-pink ls-51">
                TOP DESTINATIONS
              </h2>
            </Fade>
            <Fade
              direction={"up"}
              delay={800}
              cascade
              damping={1e-1}
              triggerOnce={true}>
              <h3 className="text-3xl font-semibold text-black lg:text-5xl">
                Lets explore Top Destinations
              </h3>
            </Fade>
          </div>

          <Slider {...settings}>
            {postData.map((items, i) => (
              <div key={i}>
                <div className="m-3 my-10 text-center py-14">
                  <div className="relative">
                    <Image
                      src={items.imgSrc}
                      alt={items.alt}
                      width={500}
                      height={500}
                      className="inline-block w-full h-52 rounded-2xl bg-bgpink"
                    />
                  </div>
                  <h3 className="text-2xl font-semibold text-lightblack">
                    {items.name}
                  </h3>
                  <h4 className="pt-4 pb-2 text-lg font-normal opacity-50 text-lightblack">
                    {items.profession}
                  </h4>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    );
  }
}
