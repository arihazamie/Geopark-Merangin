"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LogOut, Mail, Phone, Shield } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

interface ProfileDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ProfileDialog({
  trigger,
  open,
  onOpenChange,
}: ProfileDialogProps) {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  const user = session.user;

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "PENGELOLA":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      default:
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/auth/login" });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Profil Pengguna</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center py-4">
          <Avatar className="w-24 h-24 mb-4">
            <AvatarImage
              src={user.image || ""}
              alt={user.name || ""}
            />
            <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>

          <h2 className="text-xl font-semibold">{user.name}</h2>

          {user.role && (
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium mt-2 ${getRoleBadgeColor(
                user.role
              )}`}>
              {user.role}
            </div>
          )}
        </div>

        <Separator />

        <div className="py-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-full bg-primary/10">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
          </div>

          {user.notelp && (
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-full bg-primary/10">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nomor Telepon</p>
                <p className="font-medium">{user.notelp}</p>
              </div>
            </div>
          )}

          {user.role && (
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-full bg-primary/10">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Peran</p>
                <p className="font-medium">{user.role}</p>
              </div>
            </div>
          )}
        </div>

        <Separator />

        <div className="">
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="w-full">
            <LogOut className="w-4 h-4 mr-2" />
            Keluar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
