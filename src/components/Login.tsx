"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const LoginPage = () => {
  // State untuk menyimpan nilai input email dan password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // State untuk menyimpan pesan error jika login gagal
  const [error, setError] = useState<string | null>(null);

  // State untuk mengontrol loading saat proses autentikasi berlangsung
  const [isLoading, setIsLoading] = useState(false);

  // Hook useRouter untuk melakukan navigasi setelah login berhasil
  const router = useRouter();

  /**
   * Fungsi untuk menangani submit form login.
   *
   * @param e Event form submission.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Mencegah perilaku default form (refresh halaman)

    // Reset pesan error sebelum mencoba login
    setError(null);

    // Aktifkan loading state
    setIsLoading(true);

    try {
      // Memanggil fungsi signIn dari NextAuth.js dengan provider "credentials"
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false, // Tidak mengarahkan pengguna secara otomatis
      });

      // Jika terjadi error, tampilkan pesan error
      if (result?.error) {
        setError(result.error);
      } else {
        // Jika login berhasil, arahkan pengguna ke halaman utama
        router.push("/");
      }
    } catch (err) {
      // Tangkap error tak terduga
      setError("Terjadi kesalahan saat login. Silakan coba lagi." + err);
    } finally {
      // Nonaktifkan loading state setelah proses selesai
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen mx-2 text-white bg-lightpink">
      <div className="w-full max-w-sm p-6 rounded-lg shadow-md bg-lightgrey">
        <h1 className="mb-4 text-2xl font-bold text-center">Login</h1>
        <h2 className="mb-2 text-center">Silahkan masuk dengan akun Anda!</h2>
        <form
          onSubmit={handleSubmit}
          className="space-y-4">
          {/* Input Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700">
              Email:
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading} // Nonaktifkan input saat loading
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Input Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700">
              Password:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading} // Nonaktifkan input saat loading
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Error Message */}
          {error && <p className="text-sm text-center text-red-500">{error}</p>}

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading} // Nonaktifkan tombol saat loading
            className="flex items-center justify-center w-full px-4 py-2 font-bold text-white rounded-md shadow-md bg-pink/70 hover:bg-pink/40 disabled:bg-pink/10">
            {isLoading ? (
              <span className="flex items-center">
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
                Masuk...
              </span>
            ) : (
              "Login"
            )}
          </button>
          <p className="text-sm text-center text-gray-600">
            Belum punya akun?{" "}
            <Link
              href="/auth/register"
              className="font-medium text-indigo-600 hover:text-indigo-500">
              Daftar
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
