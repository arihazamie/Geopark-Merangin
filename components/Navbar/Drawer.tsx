import React, { ReactNode } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";

interface DrawerProps {
  children: ReactNode;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Drawer = ({ children, isOpen, setIsOpen }: DrawerProps) => {
  return (
    <main
      className={
        " fixed overflow-hidden z-10 bg-gray-900 bg-opacity-25 inset-0 transform ease-in-out " +
        (isOpen
          ? " transition-opacity opacity-100 duration-500 translate-x-0  "
          : " transition-all delay-500 opacity-0 -translate-x-full  ")
      }>
      <section
        className={
          "w-340px max-w-lg left-0 absolute bg-white h-full shadow-xl delay-400 duration-500 ease-in-out transition-all transform " +
          (isOpen ? "translate-x-0" : "-translate-x-full")
        }>
        <article className="relative flex flex-col h-full max-w-lg pb-10 space-y-6 w-340px">
          <header className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center flex-shrink-0 border-right">
              <Image
                src="/images/Logo/icon.webp"
                alt="logo"
                width={36}
                height={36}
              />
              <Link
                href="/"
                className="ml-4 text-xl font-semibold text-black">
                Geopark Merangin
              </Link>
            </div>

            <XMarkIcon
              className="block w-6 h-6"
              onClick={() => {
                setIsOpen(false);
              }}
            />
          </header>
          <div
            onClick={() => {
              setIsOpen(false);
            }}>
            {children}
          </div>
        </article>
      </section>
      <section
        className="w-screen h-full cursor-pointer "
        onClick={() => {
          setIsOpen(false);
        }}></section>
    </main>
  );
};

export default Drawer;
