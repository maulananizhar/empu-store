"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Categories } from "@/types/categories";
import * as LucideIcons from "lucide-react";
import { CategoryActionsCell } from "@/components/categories/CategoryActionsCell";
import { Button } from "@/components/ui/button";

type LucideIconName = keyof typeof LucideIcons;

function isLucideIconName(name: string): name is LucideIconName {
  return name in LucideIcons;
}

export const columns: ColumnDef<Categories>[] = [
  {
    accessorKey: "categoryId",
    header: "Kategori ID",
  },
  {
    accessorKey: "icon",
    header: "Icon",
    cell: ({ row }) => {
      const category = row.original;
      const Icon = isLucideIconName(category.icon)
        ? (LucideIcons[category.icon] as React.ComponentType<{
            className?: string;
          }>)
        : LucideIcons.CircleAlert;
      return <Icon className="h-7 w-7 border px-1.5 py-0.5 rounded mr-2" />;
    },
  },
  { accessorKey: "name", header: "Name" },
  {
    accessorKey: "_count.products",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting()}>
        Jumlah Produk
        {column.getIsSorted() === "desc" ? (
          <LucideIcons.ArrowDown className="ml-2 h-4 w-4" />
        ) : column.getIsSorted() === "asc" ? (
          <LucideIcons.ArrowUp className="ml-2 h-4 w-4" />
        ) : (
          <LucideIcons.ArrowUpDown className="ml-2 h-4 w-4" />
        )}
      </Button>
    ),
  },
  {
    id: "actions",
    header: "Aksi",
    cell: CategoryActionsCell,
  },
];
