"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function SearchInput({
  initialQuery,
}: {
  initialQuery: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      if (query) params.set("q", query);
      else params.delete("q");
      router.replace(`?${params.toString()}`);
    }, 500); // debounce 500ms

    return () => clearTimeout(timeout);
  }, [query, router]);

  return (
    <Input
      placeholder="Cari produk..."
      value={query}
      onChange={e => setQuery(e.target.value)}
      className="w-64"
    />
  );
}
