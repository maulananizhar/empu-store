"use client";

import { DataTable } from "./data-table";
import { columns } from "./columns";
import useSWR from "swr";
import { fetchProducts } from "@/services/productsApi";

export default function Page() {
  const { data } = useSWR("/api/products", () => fetchProducts());

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
