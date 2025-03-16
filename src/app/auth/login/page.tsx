import { LoginForm } from "@/components/Reuseable/Login";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 -mt-[4.5rem]">
      <div className="w-full max-w-md">
        <LoginForm />
        <p className="mt-4 text-sm text-center text-muted-foreground">
          Belum memiliki akun?{" "}
          <Link
            href="/auth/register"
            className="font-medium hover:underline">
            Daftar
          </Link>
        </p>
      </div>
    </main>
  );
}
