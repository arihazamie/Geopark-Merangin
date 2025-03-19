"use client";

import type React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Settings, RefreshCw } from "lucide-react";
import { ProfileUpdateForm } from "./ProfileUpdateForm";
import { toast } from "sonner";

interface ProfileDialogProps {
  trigger: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ProfileDialog({
  trigger,
  open,
  onOpenChange,
}: ProfileDialogProps) {
  const { data: session, update } = useSession();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  // Use a ref to track if we've already fetched data
  const hasInitiallyFetched = useRef(false);
  // Use a ref to track manual refresh requests
  const manualRefreshRequested = useRef(false);

  // Fetch user data from API
  const fetchUserData = useCallback(async () => {
    if (!session?.user || !(session.user as any)?.id) return;

    setIsRefreshing(true);
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
      setUserData(data);

      // Only update session on manual refresh or initial fetch
      if (manualRefreshRequested.current) {
        await update({
          ...session,
          user: {
            ...session.user,
            ...data,
          },
        });
        manualRefreshRequested.current = false;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Gagal mengambil data pengguna");
    } finally {
      setIsRefreshing(false);
    }
  }, [session, update]);

  // Fetch user data when dialog opens for the first time
  useEffect(() => {
    if (open && !hasInitiallyFetched.current && session?.user) {
      hasInitiallyFetched.current = true;
      fetchUserData();
    }

    // Reset the flag when dialog closes
    if (!open) {
      hasInitiallyFetched.current = false;
    }
  }, [open, session?.user, fetchUserData]);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/login" });
  };

  const handleEditProfile = () => {
    setIsEditing(true);
    setActiveTab("edit");
  };

  const handleUpdateSuccess = () => {
    setIsEditing(false);
    setActiveTab("profile");
    // Refresh user data after update
    manualRefreshRequested.current = true;
    fetchUserData();
  };

  const handleCancel = () => {
    setIsEditing(false);
    setActiveTab("profile");
  };

  const handleRefresh = () => {
    manualRefreshRequested.current = true;
    fetchUserData();
  };

  // Use userData if available, otherwise fall back to session data
  const displayData = userData || session?.user;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Profil Pengguna</DialogTitle>
          <DialogDescription>
            Lihat dan kelola informasi profil Anda
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="edit">Edit Profil</TabsTrigger>
          </TabsList>

          <TabsContent
            value="profile"
            className="py-4 space-y-4">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage
                    src={
                      displayData?.image ||
                      "/placeholder.svg?height=100&width=100"
                    }
                    alt={displayData?.name || "User"}
                  />
                  <AvatarFallback>
                    {displayData?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute w-8 h-8 rounded-full -bottom-2 -right-2"
                  onClick={handleRefresh}
                  disabled={isRefreshing}>
                  <RefreshCw
                    className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>

              <div className="text-center">
                <h3 className="text-xl font-semibold">{displayData?.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {displayData?.email}
                </p>
                <p className="text-sm text-muted-foreground">
                  {displayData?.notelp || "No phone number"}
                </p>
                <div className="inline-block px-2 py-1 mt-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                  {displayData?.role || "PENGGUNA"}
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={handleEditProfile}>
                <Settings className="w-4 h-4 mr-2" />
                Edit Profil
              </Button>
              <Button
                variant="destructive"
                className="w-full sm:w-auto"
                onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Keluar
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent
            value="edit"
            className="py-4">
            <ProfileUpdateForm
              onSuccess={handleUpdateSuccess}
              onCancel={handleCancel}
              initialData={userData}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
