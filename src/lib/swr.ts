"use client";

import { useEffect } from "react";
import { useSWRConfig } from "swr";

export function Prefetcher() {
  const { mutate } = useSWRConfig();

  useEffect(() => {
    async function fetchAll() {
      await Promise.all([
        mutate(
          "/api/wisata",
          fetch("/api/wisata").then((res) => res.json())
        ),
        mutate(
          "/api/artikel",
          fetch("/api/artikel").then((res) => res.json())
        ),
        mutate(
          "/api/event",
          fetch("/api/event").then((res) => res.json())
        ),
      ]);
    }

    fetchAll();
  }, [mutate]);

  return null;
}
