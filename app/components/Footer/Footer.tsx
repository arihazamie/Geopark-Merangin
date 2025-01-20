import Link from "next/link";
import Image from "next/image";

interface ProductType {
  id: number;
  section: string;
  link: string[];
}

interface socialLinks {
  imgSrc: string;
  link: string;
  width: number;
}

const socialLinks: socialLinks[] = [
  {
    imgSrc: "/images/Footer/facebook.svg",
    link: "https://www.facebook.com/geopark.jambi?_rdc=1&_rdr",
    width: 10,
  },
  {
    imgSrc: "/images/Footer/insta.svg",
    link: "https://www.instagram.com/geoparkmeranginjambi/",
    width: 14,
  },
  {
    imgSrc: "/images/Footer/twitter.svg",
    link: "https://www.youtube.com/watch?v=lqGwKNvdSm0",
    width: 14,
  },
];

const products: ProductType[] = [
  {
    id: 1,
    section: "Company",
    link: ["About"],
  },
  {
    id: 2,
    section: "Contact",
    link: ["meranginjambigeopark@gmail.com", "0746 322503"],
  },
];

const footer = () => {
  return (
    <div className="max-w-2xl px-4 pt-24 mx-auto sm:px-6 lg:max-w-7xl lg:px-8">
      <div className="grid grid-cols-1 my-12 gap-y-10 sm:grid-cols-6 lg:grid-cols-12">
        {/* COLUMN-1 */}

        <div className="sm:col-span-6 lg:col-span-5">
          <div className="flex items-center flex-shrink-0 border-right">
            <Image
              src="/images/Logo/icon.webp"
              alt="logo"
              width={56}
              height={56}
            />
            <Link
              href="/"
              className="ml-4 text-2xl font-semibold text-black">
              Geopark Merangin
            </Link>
          </div>
          <h3 className="mt-5 mb-4 text-xs font-medium text-textbl lg:mb-16">
            {" "}
            "UNESCO Global Geopark Merangin Jambi <br />
          </h3>
          <div className="flex gap-4">
            {socialLinks.map((items, i) => (
              <Link
                href={items.link}
                key={i}>
                <div className="flex items-center justify-center w-10 h-10 text-base bg-white rounded-full shadow-xl footer-icons hover:bg-pink">
                  <Image
                    src={items.imgSrc}
                    alt={items.imgSrc}
                    width={items.width}
                    height={2}
                    className="sepiaa"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* CLOUMN-2/3/4 */}

        {products.map((product) => (
          <div
            key={product.id}
            className="sm:col-span-2">
            <p className="text-xl font-semibold text-black mb-9">
              {product.section}
            </p>
            <ul>
              {product.link.map((link: string, index: number) => (
                <li
                  key={index}
                  className="mb-5">
                  <Link
                    href="/"
                    className="mb-6 text-base font-normal text-footerlinks space-links">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* All Rights Reserved */}

      <div className="py-10 border-t md:flex border-t-bordertop ">
        <h4 className="text-sm font-normal text-center text-darkgrey md:text-start">
          @2025 - Geopark Merangin. All Rights Reserved by Geopark Merangin
        </h4>
      </div>
    </div>
  );
};

export default footer;
