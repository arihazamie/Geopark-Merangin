"use client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

export default function SignOutButton() {
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Berhasil keluar!");
    } catch (err) {
      toast.error(`Gagal keluar: ${err}`);
    }
  };
  return (
    <Button
      variant="default"
      className="w-full md:w-auto"
      size="sm"
      onClick={handleSignOut}>
      <LogOut className="w-4 h-4 mr-2" />
      Keluar
    </Button>
  );
}
