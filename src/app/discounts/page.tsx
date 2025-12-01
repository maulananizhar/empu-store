"use client";

import { DataTable } from "./data-table";
import { columns } from "./columns";
import useSWR from "swr";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { fetchDiscounts } from "@/services/discountsApi";

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

  const { data } = useSWR("/api/discounts", () =>
    fetchDiscounts(new Date("2000-01-01"), true)
  );

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
