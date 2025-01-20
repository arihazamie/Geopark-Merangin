import React from "react";
import Link from "next/link";
import Signin from "./Signindialog";

interface NavigationItem {
  name: string;
  href: string;
  current: boolean;
}

const navigation: NavigationItem[] = [
  { name: "Home", href: "#home-section", current: false },
  { name: "About us", href: "#about-section", current: false },
  { name: "Recipe", href: "#cook-section", current: false },
  { name: "Gallery", href: "#gallery-section", current: false },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const Data = () => {
  return (
    <div className="w-full max-w-sm mx-auto rounded-md">
      <div className="flex-1 py-1 space-y-4">
        <div className="sm:block">
          <div className="px-5 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={classNames(
                  item.current
                    ? "bg-gray-900 text-purple"
                    : "text-black hover:bg-gray-700 hover:text-purple",
                  "block  py-2 rounded-md text-base font-medium"
                )}
                aria-current={item.current ? "page" : undefined}>
                {item.name}
              </Link>
            ))}
            <div className="mt-4">
              <Signin />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Data;
