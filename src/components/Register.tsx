"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

const registerSchema = z
  .object({
    email: z.string().email("Email tidak valid"),
    password: z
      .string()
      .min(6, "Password harus terdiri dari minimal 6 karakter"),
    isPengelola: z.boolean().default(false),
    notelp: z
      .string()
      .optional()
      .refine((val) => val === undefined || val.length === 12, {
        message: "Nomor telepon harus terdiri dari 12 digit",
      }),
  })
  .refine((data) => !data.isPengelola || (data.isPengelola && data.notelp), {
    message: "Nomor telepon harus diisi jika mendaftar sebagai Pengelola",
    path: ["notelp"],
  });

// Mendefinisikan tipe data dari form berdasarkan schema Zod di atas
type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  // State untuk menyimpan pesan error dari API
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Hook untuk navigasi halaman (misalnya, redirect ke halaman login)
  const { push } = useRouter();
  // Inisialisasi React Hook Form dengan zodResolver untuk validasi
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { isPengelola: false },
  });
  // Memantau nilai checkbox isPengelola untuk menentukan apakah field notelp perlu ditampilkan
  const isPengelola = watch("isPengelola");

  const onSubmit = async (data: RegisterFormData) => {
    try {
      // Menentukan role berdasarkan nilai isPengelola
      const role = data.isPengelola ? "PENGELOLA" : "PENGGUNA";
      // Menyiapkan payload:
      // - Jika mendaftar sebagai Pengelola, kirim seluruh data (termasuk notelp).
      // - Jika tidak, hanya kirim email, password, dan role.
      const payload = data.isPengelola
        ? { ...data, role }
        : { email: data.email, password: data.password, role };
      // Mengirim POST request ke endpoint /api/register
      const response = await axios.post("/api/register", payload);
      // Jika berhasil (status 201), redirect ke halaman login
      if (response.status === 201) {
        push("/auth/login");
      }
    } catch (error) {
      // Penanganan error: jika error adalah AxiosError, ambil pesan dari response
      if (error instanceof AxiosError) {
        setErrorMessage(
          error.response?.data?.message || "Terjadi kesalahan, coba lagi."
        );
      } else {
        setErrorMessage("Terjadi kesalahan, coba lagi.");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen mx-2 text-white bg-lightpink">
      <div className="w-full max-w-sm p-6 shadow-xl rounded-2xl bg-lightgrey">
        <h2 className="mb-4 text-2xl font-semibold text-center">Daftar Akun</h2>
        <h2 className="mb-2 text-center">Silahkan buat akun!</h2>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4">
          {/* Input untuk Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register("email")}
              className="w-full px-4 py-2 text-black border rounded-md focus:ring-2 focus:ring-indigo-600"
            />
            {/* Menampilkan pesan error validasi untuk email */}
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>
          {/* Input untuk Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register("password")}
              className="w-full px-4 py-2 text-black border rounded-md focus:ring-2 focus:ring-indigo-600"
            />
            {/* Menampilkan pesan error validasi untuk password */}
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>
          {/* Checkbox untuk memilih role Pengelola */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPengelola"
              {...register("isPengelola")}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
            />
            <label
              htmlFor="isPengelola"
              className="text-sm font-medium text-gray-700">
              Daftar sebagai Pengelola
            </label>
          </div>
          {/* Input untuk Nomor Telepon, hanya muncul jika mendaftar sebagai Pengelola */}
          {isPengelola && (
            <div>
              <label
                htmlFor="notelp"
                className="block text-sm font-medium text-gray-700">
                Nomor Telepon (Pengelola)
              </label>
              <input
                id="notelp"
                type="text"
                {...register("notelp")}
                className="w-full px-4 py-2 text-black border rounded-md focus:ring-2 focus:ring-indigo-600"
              />
              {/* Menampilkan pesan error validasi untuk notelp */}
              {errors.notelp && (
                <p className="text-xs text-red-500">{errors.notelp.message}</p>
              )}
            </div>
          )}
          {/* Tombol submit untuk mendaftar */}

          {/* Menampilkan pesan error jika ada */}
          {errorMessage && (
            <p className="py-4 mb-4 text-center text-red-500">{errorMessage}</p>
          )}

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center w-full px-4 py-2 font-bold text-white rounded-md shadow-md bg-pink/70 hover:bg-pink/40 disabled:bg-pink/10">
              {isSubmitting ? (
                <>
                  <svg
                    className="w-5 h-5 mr-2 text-white animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Mendaftar...
                </>
              ) : (
                "Daftar"
              )}
            </button>
          </div>
          <div className="flex justify-center">
            <p className="mt-2 text-sm text-gray-600">
              Sudah punya akun?{" "}
              <Link
                href="/auth/login"
                className="hover:underline">
                Masuk
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
