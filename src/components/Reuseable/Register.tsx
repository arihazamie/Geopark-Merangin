"use client";

import type React from "react";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Upload } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Register form state
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [noTelepon, setNoTelepon] = useState<string>("");
  const [isPengelola, setIsPengelola] = useState<boolean>(false);
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate form
    if (!name || !noTelepon) {
      setError("Nama dan nomor telepon wajib diisi");
      toast.error("Validasi gagal", {
        description: "Nama dan nomor telepon wajib diisi",
      });
      setIsLoading(false);
      return;
    }

    // Determine role based on checkbox
    const role = isPengelola ? "PENGELOLA" : "PENGGUNA";

    // Create form data
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("role", role);
    formData.append("name", name);
    formData.append("noTelepon", noTelepon);
    if (image) formData.append("image", image);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Pendaftaran gagal");
      }

      // Success
      toast.success("Pendaftaran berhasil", {
        description: "Akun Anda telah berhasil dibuat.",
      });

      // Redirect to login page
      router.push("/auth/login");
    } catch (error) {
      const errorMessage = (error as Error).message;
      setError(errorMessage);

      toast.error("Pendaftaran gagal", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="">
      <CardHeader className="text-center rounded-t-lg">
        <CardTitle className="text-xl">
          Bergabung dengan Geopark Merangin
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleRegister}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input
              id="name"
              placeholder="Nama Lengkap"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
              className="border-gray-200 focus-visible:ring-gray-500 dark:border-gray-800"
            />
          </div>

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
            <Label htmlFor="noTelepon">Nomor Telepon</Label>
            <Input
              id="noTelepon"
              type="tel"
              placeholder="081234567890"
              value={noTelepon}
              onChange={(e) => setNoTelepon(e.target.value)}
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

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPengelola"
              checked={isPengelola}
              onCheckedChange={(checked) => setIsPengelola(checked === true)}
              className="border-black text-black data-[state=checked]:bg-black data-[state=checked]:text-white dark:border-white dark:text-white dark:data-[state=checked]:bg-white dark:data-[state=checked]:text-black"
            />
            <Label
              htmlFor="isPengelola"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Daftar sebagai Pengelola Geopark
            </Label>
          </div>

          <div className="space-y-2">
            <Label>Foto Profil</Label>
            <div className="flex flex-col items-center gap-4">
              {previewUrl && (
                <div className="relative w-24 h-24 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
                  <Image
                    src={previewUrl || "/placeholder.svg"}
                    alt="Pratinjau profil"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={triggerFileInput}
                className="w-full text-black border-gray-200 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-800 dark:text-white dark:hover:bg-gray-900/30">
                <Upload className="w-4 h-4 mr-2" />
                {image ? "Ganti Foto" : "Unggah Foto"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full text-white bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 dark:text-black"
            disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Membuat akun...
              </>
            ) : (
              "Buat Akun"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
