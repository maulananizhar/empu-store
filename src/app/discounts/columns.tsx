"use client";

import { DiscountsActionsCell } from "@/components/discounts/DiscountsActionsCell";
import { Button } from "@/components/ui/button";
import { Discounts } from "@/types/discounts";
import { ColumnDef } from "@tanstack/react-table";
import * as LucideIcons from "lucide-react";

export const columns: ColumnDef<Discounts>[] = [
  {
    accessorKey: "discountId",
    header: "Diskon ID",
  },
  {
    accessorKey: "product.name",
    header: "Nama Produk",
  },
  {
    accessorKey: "percentage",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting()}>
        Persentase Diskon
        {column.getIsSorted() === "desc" ? (
          <LucideIcons.ArrowDown className="ml-2 h-4 w-4" />
        ) : column.getIsSorted() === "asc" ? (
          <LucideIcons.ArrowUp className="ml-2 h-4 w-4" />
        ) : (
          <LucideIcons.ArrowUpDown className="ml-2 h-4 w-4" />
        )}
      </Button>
    ),
    cell: ({ row }) => `${row.getValue("percentage")}%`,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting()}>
        Tanggal Dibuat
        {column.getIsSorted() === "desc" ? (
          <LucideIcons.ArrowDown className="ml-2 h-4 w-4" />
        ) : column.getIsSorted() === "asc" ? (
          <LucideIcons.ArrowUp className="ml-2 h-4 w-4" />
        ) : (
          <LucideIcons.ArrowUpDown className="ml-2 h-4 w-4" />
        )}
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      const time = date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      const dayName = date.toLocaleDateString("id-ID", { weekday: "long" });
      const day = date.getDate();
      const monthName = date.toLocaleDateString("id-ID", { month: "long" });
      const year = date.getFullYear();
      return `${time} - ${dayName}, ${day} ${monthName} ${year}`;
    },
  },
  {
    accessorKey: "expiredAt",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting()}>
        Tanggal Kadaluarsa
        {column.getIsSorted() === "desc" ? (
          <LucideIcons.ArrowDown className="ml-2 h-4 w-4" />
        ) : column.getIsSorted() === "asc" ? (
          <LucideIcons.ArrowUp className="ml-2 h-4 w-4" />
        ) : (
          <LucideIcons.ArrowUpDown className="ml-2 h-4 w-4" />
        )}
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.original.expiredAt);
      const time = date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      const dayName = date.toLocaleDateString("id-ID", { weekday: "long" });
      const day = date.getDate();
      const monthName = date.toLocaleDateString("id-ID", { month: "long" });
      const year = date.getFullYear();
      return `${time} - ${dayName}, ${day} ${monthName} ${year}`;
    },
  },
  {
    id: "status",
    accessorFn: row =>
      new Date(row.expiredAt) > new Date() ? "Aktif" : "Kadaluarsa",
    filterFn: "equals",
    header: "Status",
    cell: ({ row }) => row.getValue("status"),
  },
  {
    header: "Aksi",
    cell: DiscountsActionsCell,
  },
];
