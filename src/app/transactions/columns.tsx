"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Orders } from "@/generated/prisma/browser";
import { useOrder } from "@/store/orderStore";
import { ColumnDef } from "@tanstack/react-table";
import {
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpDown,
  MoreHorizontal,
} from "lucide-react";
import Link from "next/link";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";

export const columns: ColumnDef<Orders>[] = [
  {
    accessorKey: "orderId",
    header: "Order ID",
    cell: ({ row }) => <span className="ml-2">{row.original.orderId}</span>,
  },
  {
    accessorKey: "cashierName",
    header: "Kasir",
  },
  {
    accessorKey: "methodName",
    header: "Metode",
  },
  {
    accessorKey: "total",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Total
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return `Rp${row.original.total.toLocaleString("id-ID")}`;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const statusConfig: Record<
        string,
        { color: string; icon: React.ReactNode }
      > = {
        Sukses: {
          color: "bg-green-100 text-green-800",
          icon: <CheckCircle className="w-3 h-3 mr-1 inline" />,
        },
        Gagal: {
          color: "bg-red-100 text-red-800",
          icon: <XCircle className="w-3 h-3 mr-1 inline" />,
        },
        Pending: {
          color: "bg-yellow-100 text-yellow-800",
          icon: <Clock className="w-3 h-3 mr-1 inline" />,
        },
      };
      const config = statusConfig[status] || {
        color: "bg-gray-100 text-gray-800",
        icon: null,
      };
      return (
        <div
          className={`rounded-full px-2 w-min flex items-center gap-1 ${config.color}`}>
          {config.icon}
          {status}
        </div>
      );
    },
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Tanggal
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
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
    filterFn: (row, columnId, filterValue: DateRange) => {
      // 'filterValue' adalah object 'range' yang kita kirim
      if (!filterValue) return true;

      // Ambil tanggal dari baris data
      // Penting: Pastikan ini adalah objek Date.
      // Jika data Anda string (seperti "2025-06-01"), ubah jadi:
      const date = new Date(row.getValue(columnId) as string);

      // Ambil 'from' dan 'to' dari filter
      const { from, to } = filterValue;

      // Logika filter (mirip seperti di useMemo Anda)
      if (!from && !to) {
        return true; // Tidak ada range, tampilkan semua
      }

      // Jika HANYA 'from' yang ada
      if (from && !to) {
        return date.getTime() >= from.getTime();
      }

      // Jika HANYA 'to' yang ada
      if (!from && to) {
        // Atur 'to' ke akhir hari (agar inklusif)
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        return date.getTime() <= toDate.getTime();
      }

      // Jika 'from' dan 'to' ada
      if (from && to) {
        // Atur 'to' ke akhir hari (agar inklusif)
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);

        // Cek apakah tanggal berada di dalam range
        return (
          date.getTime() >= from.getTime() && date.getTime() <= toDate.getTime()
        );
      }

      return true;
    },
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => {
      const payment = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() =>
                navigator.clipboard
                  .writeText(payment.orderId.toString())
                  .then(() => {
                    toast.success("Order ID disalin ke clipboard");
                  })
              }>
              Salin Order ID
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href={`/transactions/${row.original.orderId}`}
                className="cursor-pointer">
                Lihat Detail
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href={row.original.status == "Pending" ? "/cashier" : "#"}
                className="cursor-pointer"
                onClick={() => {
                  if (row.original.status == "Sukses") {
                    return toast.error(
                      "Transaksi sudah selesai dan tidak dapat diedit.",
                      {
                        richColors: true,
                      }
                    );
                  } else if (row.original.status == "Gagal") {
                    return toast.error(
                      "Transaksi gagal dan tidak dapat diedit.",
                      {
                        richColors: true,
                      }
                    );
                  } else {
                    useOrder.getState().setOrderId(row.original.orderId);
                  }
                }}>
                Edit Transaksi
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>Hapus Transaksi</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
