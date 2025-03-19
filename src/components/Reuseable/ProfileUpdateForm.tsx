"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface ProfileUpdateFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: any;
}

export function ProfileUpdateForm({
  onSuccess,
  onCancel,
  initialData,
}: ProfileUpdateFormProps) {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const hasFetched = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: initialData?.name || session?.user?.name || "",
    email: initialData?.email || session?.user?.email || "",
    notelp: initialData?.notelp || (session?.user as any)?.notelp || "",
    image: initialData?.image || session?.user?.image || "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        email: initialData.email || "",
        notelp: initialData.notelp || "",
        image: initialData.image || "",
      });
    }
  }, [initialData]);

  // Fetch user data from API only once when component mounts and no initialData is provided
  useEffect(() => {
    const fetchUserData = async () => {
      if (
        !session?.user ||
        !(session.user as any)?.id ||
        initialData ||
        hasFetched.current
      ) {
        return;
      }

      hasFetched.current = true;
      setIsFetching(true);

      try {
        const userId = (session.user as any).id;
        const userRole = (session.user as any).role || "PENGGUNA";

        // Determine API endpoint based on user role
        let endpoint = "/api/pengguna";
        if (userRole === "PENGELOLA") {
          endpoint = "/api/pengelola";
        } else if (userRole === "ADMIN") {
          endpoint = "/api/admin";
        }

        const response = await fetch(`${endpoint}/${userId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const { data } = await response.json();

        // Update form with fresh data from API
        setFormData({
          name: data.name || "",
          email: data.email || "",
          notelp: data.notelp || "",
          image: data.image || "",
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Gagal mengambil data pengguna");

        // Fallback to session data if API fails
        setFormData({
          name: session.user.name || "",
          email: session.user.email || "",
          notelp: (session.user as any)?.notelp || "",
          image: session.user.image || "",
        });
      } finally {
        setIsFetching(false);
      }
    };

    fetchUserData();
  }, [session, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.match(/^image\/(jpeg|png|jpg|webp)$/)) {
      toast.error("Format file tidak didukung. Gunakan JPG, PNG, atau WebP");
      return;
    }

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file terlalu besar. Maksimal 5MB");
      return;
    }

    setImageFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearImageSelection = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Get user ID from session
      const userId = (session?.user as any)?.id;
      const userRole = (session?.user as any)?.role || "PENGGUNA";

      if (!userId) {
        toast.error("User ID not found in session");
        setIsLoading(false);
        return;
      }

      console.log("Updating user with ID:", userId);

      // Determine API endpoint based on user role
      let endpoint = "/api/pengguna";
      if (userRole === "PENGELOLA") {
        endpoint = "/api/pengelola";
      } else if (userRole === "ADMIN") {
        endpoint = "/api/admin";
      }

      let response;
      let result;

      // If we have a new image file, use FormData
      if (imageFile) {
        const formDataToSend = new FormData();
        formDataToSend.append("name", formData.name);
        formDataToSend.append("email", formData.email);
        formDataToSend.append("notelp", formData.notelp);
        formDataToSend.append("image", imageFile);
        formDataToSend.append("oldImageUrl", formData.image); // Send old image URL for cleanup

        response = await fetch(`${endpoint}/${userId}`, {
          method: "PUT",
          body: formDataToSend,
        });
      } else {
        // Otherwise use JSON
        response = await fetch(`${endpoint}/${userId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
      }

      result = await response.json();
      console.log("API response:", result);

      if (!response.ok) {
        throw new Error(result.error || "Failed to update profile");
      }

      // Update the session with new user data from API response
      // This will trigger the jwt callback with trigger="update"
      await update({
        ...session,
        user: {
          ...session?.user,
          ...result.data, // Use the data returned from the API
        },
      });

      // Clear image selection
      clearImageSelection();

      // Refresh the router to ensure all components have the latest session data
      router.refresh();

      toast.success("Berhasil update profile");

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Update error:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal update profile"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nama</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Masukkan nama lengkap"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Masukkan email"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notelp">Nomor Telepon</Label>
        <Input
          id="notelp"
          name="notelp"
          value={formData.notelp}
          onChange={handleChange}
          placeholder="Masukkan nomor telepon"
        />
      </div>

      <div className="space-y-2">
        <Label>Foto Profil</Label>

        <div className="flex flex-col items-center gap-4">
          {/* Current or preview image */}
          <div className="relative w-24 h-24 overflow-hidden border-2 rounded-full border-primary/20">
            <Image
              src={
                imagePreview ||
                formData.image ||
                "/placeholder.svg?height=100&width=100" ||
                "/placeholder.svg"
              }
              alt="Profile"
              fill
              className="object-cover"
            />
          </div>

          {/* Image upload controls */}
          <div className="flex flex-col items-center w-full gap-2">
            {imageFile ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                  {imageFile.name}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={clearImageSelection}
                  className="w-8 h-8">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                Pilih Foto
              </Button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground">
              Format: JPG, PNG, WebP. Maks: 5MB
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}>
          Batal
        </Button>
        <Button
          type="submit"
          disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Menyimpan...
            </>
          ) : (
            "Simpan Perubahan"
          )}
        </Button>
      </div>
    </form>
  );
}
