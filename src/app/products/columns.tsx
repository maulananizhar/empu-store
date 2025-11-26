import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProductsIcons } from "@/types/products";
import { ColumnDef } from "@tanstack/react-table";
import * as LucideIcons from "lucide-react";
import { toast } from "sonner";

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
    header: "Stok",
  },
  {
    accessorKey: "price",
    header: "Harga",
    cell: ({ row }) => {
      return `Rp${row.original.price.toLocaleString("id-ID")}`;
    },
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => {
      const product = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <LucideIcons.MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() =>
                navigator.clipboard
                  .writeText(product.productId.toString())
                  .then(() => {
                    toast.success("Product ID disalin ke clipboard");
                  })
              }>
              Copy product ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
