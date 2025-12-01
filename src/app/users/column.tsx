"use client";

import { UsersActionsCell } from "@/components/users/UsersActionsCell";
import { Users } from "@/types/users";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<Users>[] = [
  {
    accessorKey: "userId",
    header: "User ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    id: "role.name",
    accessorKey: "role.name",
    header: "Role",
  },
  {
    accessorKey: "createdAt",
    header: "Tanggal Dibuat",
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
    id: "aksi",
    header: "Aksi",
    cell: UsersActionsCell,
  },
];
