import { RegisterForm } from "@/components/Reuseable/Register";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 -mt-[4.5rem]">
      <div className="w-full max-w-md mt-5">
        <RegisterForm />
        <p className="mt-4 text-sm text-center text-muted-foreground">
          Sudah memiliki akun?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-black hover:underline dark:text-white">
            Masuk
          </Link>
        </p>
      </div>
    </main>
  );
}
