"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Lock, CheckCircle } from "lucide-react";

interface ForgotPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "email" | "token" | "success";

export function ForgotPasswordModal({
  open,
  onOpenChange,
}: ForgotPasswordModalProps) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [storedToken, setStoredToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setStep("email");
    setEmail("");
    setToken("");
    setNewPassword("");
    setConfirmPassword("");
    setStoredToken("");
    setError("");
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(resetForm, 300); // Reset after modal closes
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("email", email);

      const response = await fetch("/api/password", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Terjadi kesalahan");
      }

      // Store token in localStorage and component state
      localStorage.setItem("resetToken", data.token);
      setStoredToken(data.token);
      setStep("token");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password tidak cocok");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Password minimal 6 karakter");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          token,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Terjadi kesalahan");
      }

      // Clear stored token
      localStorage.removeItem("resetToken");
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const renderEmailStep = () => (
    <form
      onSubmit={handleEmailSubmit}
      className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute w-4 h-4 left-3 top-3 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="masukkan@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button
        type="submit"
        className="w-full"
        disabled={loading}>
        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Kirim Token Reset
      </Button>
    </form>
  );

  const renderTokenStep = () => (
    <form
      onSubmit={handlePasswordReset}
      className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="token">Token (4 digit)</Label>
        <Input
          id="token"
          type="text"
          placeholder="1234"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          maxLength={4}
          className="text-lg tracking-widest text-center"
          required
        />
        <p className="text-xs text-muted-foreground">
          Token Anda: <span className="font-mono font-bold">{storedToken}</span>
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="newPassword">Password Baru</Label>
        <div className="relative">
          <Lock className="absolute w-4 h-4 left-3 top-3 text-muted-foreground" />
          <Input
            id="newPassword"
            type="password"
            placeholder="Password baru"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
        <div className="relative">
          <Lock className="absolute w-4 h-4 left-3 top-3 text-muted-foreground" />
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Konfirmasi password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep("email")}
          className="flex-1">
          Kembali
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Reset Password
        </Button>
      </div>
    </form>
  );

  const renderSuccessStep = () => (
    <div className="space-y-4 text-center">
      <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full">
        <CheckCircle className="w-6 h-6 text-green-600" />
      </div>
      <div className="space-y-2">
        <h3 className="font-semibold">Password Berhasil Direset!</h3>
        <p className="text-sm text-muted-foreground">
          Password Anda telah berhasil diubah. Silakan login dengan password
          baru.
        </p>
      </div>
      <Button
        onClick={handleClose}
        className="w-full">
        Tutup
      </Button>
    </div>
  );

  const getTitle = () => {
    switch (step) {
      case "email":
        return "Lupa Password";
      case "token":
        return "Reset Password";
      case "success":
        return "Berhasil";
      default:
        return "Lupa Password";
    }
  };

  const getDescription = () => {
    switch (step) {
      case "email":
        return "Masukkan email Anda untuk mendapatkan token reset password";
      case "token":
        return "Masukkan token dan password baru Anda";
      case "success":
        return "";
      default:
        return "";
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          {getDescription() && (
            <DialogDescription>{getDescription()}</DialogDescription>
          )}
        </DialogHeader>
        <div className="py-4">
          {step === "email" && renderEmailStep()}
          {step === "token" && renderTokenStep()}
          {step === "success" && renderSuccessStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
