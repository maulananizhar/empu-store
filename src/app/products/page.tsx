"use client";

import { DataTable } from "./data-table";
import { columns } from "./columns";
import useSWR from "swr";
import { fetchProducts } from "@/services/productsApi";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Session } from "next-auth";
import { useEffect } from "react";

export default function Page() {
  const { data: session }: { data: Session | null; status: string } =
    useSession({
      required: true,
      onUnauthenticated() {
        router.push("/auth/signin");
      },
    });

  // Get router and pathname
  const router = useRouter();

  const { data } = useSWR("/api/products", () => fetchProducts());

  // Redirect if the user is not a Manager
  useEffect(() => {
    if (session && session.user.role !== "Manager") {
      router.push("/dashboard");
    }
  }, [session, router]);

  return (
    <>
      <div>
        <div className="container mx-auto">
          <DataTable columns={columns} data={data || []} />
        </div>
      </div>
    </>
  );
}
