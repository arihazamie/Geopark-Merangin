import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { LockClosedIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import Image from "next/image";

const Signin = () => {
  const [isOpen, setIsOpen] = useState(false);

  const closeModal = () => {
    setIsOpen(false);
  };

  const openModal = () => {
    setIsOpen(true);
  };

  return (
    <>
      <div className="absolute inset-y-0 flex items-center pr-2 md:right-0 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
        <button
          type="button"
          className="flex justify-end py-4 font-medium rounded-full px-[7.5rem] py-autext-xl bg-bgpink text-pink lg:px-8 navbutton hover:text-white hover:bg-pink"
          onClick={openModal}>
          Sign in
        </button>
      </div>

      <Transition
        appear
        show={isOpen}
        as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-full p-4 text-center sm:p-6">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-sm p-6 bg-white shadow-xl sm:max-w-md rounded-2xl">
                  <div className="flex items-center justify-center min-h-full px-4 py-12 sm:px-6 lg:px-8">
                    <div className="w-full max-w-md space-y-8">
                      <div>
                        <div className="flex items-center justify-center">
                          <Image
                            src="/images/Logo/icon.webp"
                            alt="logo"
                            width={64}
                            height={64}
                          />
                          <Link
                            href="/"
                            className="ml-4 text-xl font-semibold text-black lg:text-2xl">
                            Geopark Merangin
                          </Link>
                        </div>
                        <h2 className="mt-6 text-2xl font-bold tracking-tight text-center lg:mt-10 lg:text-3xl text-lightgrey">
                          Login to your account
                        </h2>
                      </div>
                      <form
                        className="mt-8 space-y-6"
                        action="#"
                        method="POST">
                        <div className="-space-y-px rounded-md shadow-sm">
                          <div>
                            <label
                              htmlFor="email-address"
                              className="sr-only">
                              Email address
                            </label>
                            <input
                              id="email-address"
                              name="email"
                              type="email"
                              autoComplete="email"
                              required
                              className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border rounded-t-md focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                              placeholder="Email address"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="password"
                              className="sr-only">
                              Password
                            </label>
                            <input
                              id="password"
                              name="password"
                              type="password"
                              autoComplete="current-password"
                              required
                              className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border rounded-b-md focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                              placeholder="Password"
                            />
                          </div>
                        </div>

                        <div>
                          <button
                            type="submit"
                            className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white rounded-md bg-pink hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                              <LockClosedIcon
                                className="w-5 h-5 text-indigo-500 group-hover:text-indigo-400"
                                aria-hidden="true"
                              />
                            </span>
                            Login
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      onClick={closeModal}>
                      Back
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default Signin;
