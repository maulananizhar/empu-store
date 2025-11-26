"use client";

import { DataTable } from "./data-table";
import { columns } from "./columns";
import useSWR from "swr";
import { fetchOrders } from "@/services/orderApi";

export default function Page() {
  const { data } = useSWR("/api/orders", fetchOrders);

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
