// app/providers.tsx
"use client";

import { SWRConfig } from "swr";
import { Prefetcher } from "./swr";
import { SessionProvider } from "next-auth/react";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <SWRConfig value={{ revalidateOnFocus: false }}>
        <Prefetcher />
        {children}
      </SWRConfig>
    </SessionProvider>
  );
}
