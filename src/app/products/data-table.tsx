"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
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
import * as LucideIcons from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
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
import { fetchCategories } from "@/services/categoriesApi";
import { Categories } from "@/types/categories";
import { addProduct } from "@/services/productsApi";
import { mutate } from "swr";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [showAddDialog, setShowAddDialog] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [categories, setCategories] = useState<Categories[]>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      columnFilters,
      globalFilter,
      sorting,
    },
  });

  useEffect(() => {
    fetchCategories("")
      .then(data => {
        const categoryNames = Array.isArray(data)
          ? data.map(category => category)
          : [];
        setCategories(categoryNames);
      })
      .catch(error => {
        console.error("Error fetching categories:", error);
      });
  }, [data]);

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
                typeof table.getColumn("category.name")?.getFilterValue() ===
                "string"
                  ? (table
                      .getColumn("category.name")
                      ?.getFilterValue() as string)
                  : "all"
              }
              onValueChange={value =>
                table
                  .getColumn("category.name")
                  ?.setFilterValue(value === "all" ? undefined : value)
              }>
              <DropdownMenuRadioItem key="all" value="all">
                Semua
              </DropdownMenuRadioItem>
              {Array.from(
                table
                  .getColumn("category.name")
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
          <LucideIcons.Box className="mr-1 h-4 w-4" />
          <span>Tambah Produk</span>
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
              <LucideIcons.ChevronDown className="h-4 w-4 ml-1" />
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
              addProduct(name, category, parseFloat(price)).then(() => {
                mutate("/api/products");
                setShowAddDialog(false);
                setName("");
                setCategory("");
                setPrice("");
              });
            }}>
            <DialogHeader className="mb-4">
              <DialogTitle>Tambah Produk</DialogTitle>
              <DialogDescription>
                Silakan isi informasi produk di bawah ini.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm">Nama Produk</label>
                <Input
                  defaultValue={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm">Nama Kategori</label>
                <Select defaultValue={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>

                  <SelectContent>
                    <div className="p-2">
                      <Input
                        placeholder="Cari kategori..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                      />
                    </div>
                    {categories
                      .filter(cat =>
                        cat.name.toLowerCase().includes(search.toLowerCase())
                      )
                      .map(cat => {
                        return (
                          <SelectItem key={cat.categoryId} value={cat.name}>
                            {cat.name}
                          </SelectItem>
                        );
                      })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm">Harga</label>
                <Input
                  value={Number(price).toLocaleString("id-ID")}
                  onChange={e =>
                    setPrice(e.target.value.replace(/[^0-9]/g, ""))
                  }
                />
              </div>
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
