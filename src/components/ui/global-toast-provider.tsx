"use client";

import { Toaster } from "sonner";

export function GlobalToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      duration={3000}
      toastOptions={{
        style: {
          background: "var(--background)",
          color: "var(--foreground)",
          border: "1px solid var(--border)",
        },
      }}
    />
  );
}
