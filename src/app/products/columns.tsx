import { ProductsActionsCell } from "@/components/products/ProductsActionsCell";
import { Button } from "@/components/ui/button";
import { ProductsIcons } from "@/types/products";
import { ColumnDef } from "@tanstack/react-table";
import * as LucideIcons from "lucide-react";

type LucideIconName = keyof typeof LucideIcons;

function isLucideIconName(name: string): name is LucideIconName {
  return name in LucideIcons;
}

export const columns: ColumnDef<ProductsIcons>[] = [
  {
    accessorKey: "productId",
    header: "Produk ID",
    cell: ({ row }) => <span className="ml-2">{row.original.productId}</span>,
  },
  {
    accessorKey: "name",
    header: "Produk",
  },
  {
    accessorKey: "category.name",
    id: "category.name",
    header: "Kategori",
    cell: ({ row }) => {
      const product = row.original;
      const Icon = isLucideIconName(product.category.icon)
        ? (LucideIcons[product.category.icon] as React.ComponentType<{
            className?: string;
          }>)
        : LucideIcons.CircleAlert;

      return (
        <div className="flex items-center">
          <Icon className="h-7 w-7 border px-1.5 py-0.5 rounded mr-2" />
          <span>{row.original.category?.name || "Uncategorized"}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "stock",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting()}>
        Stok
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
    accessorKey: "price",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting()}>
        Harga
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
      return `Rp${row.original.price.toLocaleString("id-ID")}`;
    },
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ProductsActionsCell,
  },
];
