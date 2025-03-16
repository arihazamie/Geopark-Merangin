"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Login form state
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        // Handle specific error messages
        let errorMessage =
          "Gagal masuk. Silakan periksa email dan kata sandi Anda.";

        if (result.error.includes("not verified")) {
          errorMessage = "Akun Pengelola Anda belum diverifikasi.";
        } else if (result.error.includes("User not found")) {
          errorMessage = "Pengguna tidak ditemukan.";
        } else if (result.error.includes("does not have a password")) {
          errorMessage =
            "Akun ini tidak memiliki kata sandi. Silakan gunakan metode masuk lainnya.";
        }

        setError(errorMessage);
        toast.error("Gagal masuk", {
          description: errorMessage,
        });
        setIsLoading(false);
        return;
      }

      // Success
      toast.success("Berhasil masuk", {
        description: "Anda telah berhasil masuk ke akun Anda.",
      });

      // Redirect based on user role (you can get this from the session)
      router.push("/");
      router.refresh();
    } catch (err) {
      const errorMessage = `Terjadi kesalahan: ${err}`;
      setError(errorMessage);
      toast.error("Gagal masuk", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-gray-200 dark:border-gray-800">
      <CardHeader className="text-center rounded-t-lg bg-gray-50 dark:bg-gray-900/30">
        <CardTitle className="text-2xl text-black dark:text-white">
          Selamat Datang Kembali
        </CardTitle>
        <CardDescription>
          Masuk untuk mengakses portal UNESCO Global Geopark Merangin
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="pt-6 space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@contoh.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="border-gray-200 focus-visible:ring-gray-500 dark:border-gray-800"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Kata Sandi</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs text-black hover:text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-900/30"
                onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="border-gray-200 focus-visible:ring-gray-500 dark:border-gray-800"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full text-white bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 dark:text-black"
            disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sedang masuk...
              </>
            ) : (
              "Masuk"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
