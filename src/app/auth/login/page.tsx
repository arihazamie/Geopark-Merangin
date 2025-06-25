"use client";

import { useState } from "react";
import { LoginForm } from "@/components/Reuseable/Login";
import { ForgotPasswordModal } from "@/components/Reuseable/LupaPassword";
import Link from "next/link";

export default function LoginPage() {
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 -mt-[4.5rem]">
      <div className="w-full max-w-md">
        <LoginForm />
        <div className="mt-4 space-y-2 text-sm text-center">
          <button
            onClick={() => setShowForgotPassword(true)}
            className="block w-full text-primary hover:underline">
            Lupa password?
          </button>
          <p className="text-muted-foreground">
            Belum memiliki akun?{" "}
            <Link
              href="/auth/register"
              className="font-medium hover:underline text-primary">
              Daftar
            </Link>
          </p>
        </div>
      </div>

      <ForgotPasswordModal
        open={showForgotPassword}
        onOpenChange={setShowForgotPassword}
      />
    </main>
  );
}
