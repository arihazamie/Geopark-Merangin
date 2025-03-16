import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./auth";

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  notelp?: string | null;
  role: "ADMIN" | "PENGELOLA" | "PENGGUNA";
}

export interface Session {
  user: User;
  expires: string;
}

export type Role = User["role"];

interface SessionOptions {
  allowedRoles?: Role[];
  redirectTo?: string;
}

export async function getSession(
  options: SessionOptions = {}
): Promise<Session> {
  const { allowedRoles, redirectTo = "/" } = options; // Default redirectTo to "/" if undefined

  const session = (await getServerSession(authOptions)) as Session | null;

  if (!session) {
    redirect(redirectTo); // redirectTo is now guaranteed to be a string
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    redirect(redirectTo); // Use redirectTo directly instead of fallback
  }

  return session;
}

export async function getOptionalSession(): Promise<Session | null> {
  return (await getServerSession(authOptions)) as Session | null;
}
