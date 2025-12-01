"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as LucideIcons from "lucide-react";
import useSWR, { mutate } from "swr";
import { createUsers, fetchRoles } from "@/services/usersApi";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  const [search, setSearch] = useState("");

  const { data: roles } = useSWR("/api/roles", () => fetchRoles());

  const filteredRoles = roles?.filter(role =>
    role.name.toLowerCase().includes(search.toLowerCase())
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedRowModel: getFacetedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    state: {
      columnFilters,
      globalFilter,
      sorting,
    },
  });

  return (
    <>
      <div className="flex items-center py-4">
        <div className="flex items-center py-4">
          <Input
            placeholder="Pencarian..."
            value={globalFilter ?? ""}
            onChange={event => setGlobalFilter(event.target.value)}
            className="max-w-sm"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto mr-4">
              Filter
              <LucideIcons.ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={
                typeof table.getColumn("role.name")?.getFilterValue() ===
                "string"
                  ? (table.getColumn("role.name")?.getFilterValue() as string)
                  : "all"
              }
              onValueChange={value =>
                table
                  .getColumn("role.name")
                  ?.setFilterValue(value === "all" ? undefined : value)
              }>
              <DropdownMenuRadioItem key="all" value="all">
                Semua
              </DropdownMenuRadioItem>
              {Array.from(
                table
                  .getColumn("role.name")
                  ?.getFacetedUniqueValues()
                  .entries() || []
              ).map(([value]) => (
                <DropdownMenuRadioItem key={value} value={String(value)}>
                  {String(value)}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          className="flex items-center"
          variant="default"
          onClick={() => setShowAddDialog(true)}>
          <LucideIcons.User className="mr-1 h-4 w-4" />
          <span>Tambah Pengguna</span>
        </Button>
      </div>
      <div className="overflow-hidden rounded-md border">
        <div className="mx-4">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center space-x-2 py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="mr-auto">
              {table.getState().pagination.pageIndex *
                table.getState().pagination.pageSize +
                1}
              -
              {Math.min(
                (table.getState().pagination.pageIndex + 1) *
                  table.getState().pagination.pageSize,
                data.length
              )}{" "}
              dari {data.length} data
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {[1, 5, 10, 20, 50, 100].map(pageSize => (
              <DropdownMenuItem
                key={pageSize}
                onClick={() => table.setPageSize(pageSize)}>
                Menampilkan {pageSize} data
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}>
          Sebelumnya
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}>
          Selanjutnya
        </Button>
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <form
            onSubmit={e => {
              e.preventDefault();
              createUsers(
                name,
                username,
                email,
                password,
                confirmPassword,
                Number(roleId)
              ).then(() => {
                mutate("/api/users");
                setShowAddDialog(false);
                setName("");
                setUsername("");
                setEmail("");
                setPassword("");
                setConfirmPassword("");
                setRoleId("");
              });
            }}>
            <DialogHeader className="mb-4">
              <DialogTitle>Tambah Pengguna</DialogTitle>
              <DialogDescription>
                Silakan isi informasi pengguna di bawah ini.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm">Nama Pengguna</label>
                <Input
                  defaultValue={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm">Username</label>
                <Input
                  defaultValue={username}
                  onChange={e => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm">Email</label>
                <Input
                  defaultValue={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm">Kata Sandi</label>
                <Input
                  type="password"
                  defaultValue={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm">Konfirmasi Kata Sandi</label>
                <Input
                  type="password"
                  defaultValue={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-sm">Role</label>
              <Select defaultValue={roleId} onValueChange={setRoleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>

                <SelectContent>
                  <div className="p-2">
                    <Input
                      placeholder="Cari role..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>

                  {filteredRoles?.map(role => (
                    <SelectItem
                      key={role.roleId}
                      value={role.roleId.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Batal
              </Button>
              <Button type="submit">Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
