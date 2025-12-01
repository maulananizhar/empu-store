"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuLabel,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioItem,
  DropdownMenuRadioGroup,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFacetedUniqueValues,
  useReactTable,
} from "@tanstack/react-table";

import { useState } from "react";
import { ChevronDown, ChevronDownIcon } from "lucide-react";
import { type DateRange } from "react-day-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { dateRange } from "@/lib/dateRange";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [range, setRange] = useState<DateRange | undefined>(undefined);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFacetedUniqueValues: getFacetedUniqueValues(),
    state: {
      sorting,
      columnFilters,
      globalFilter,
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
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={
                typeof table.getColumn("methodName")?.getFilterValue() ===
                "string"
                  ? (table.getColumn("methodName")?.getFilterValue() as string)
                  : "all"
              }
              onValueChange={value =>
                table
                  .getColumn("methodName")
                  ?.setFilterValue(value === "all" ? undefined : value)
              }>
              <DropdownMenuRadioItem key="all" value="all">
                Semua
              </DropdownMenuRadioItem>
              {Array.from(
                table
                  .getColumn("methodName")
                  ?.getFacetedUniqueValues()
                  .entries() || []
              ).map(([value]) => (
                <DropdownMenuRadioItem key={value} value={String(value)}>
                  {String(value)}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={
                typeof table.getColumn("status")?.getFilterValue() === "string"
                  ? (table.getColumn("status")?.getFilterValue() as string)
                  : "all"
              }
              onValueChange={value =>
                table
                  .getColumn("status")
                  ?.setFilterValue(value === "all" ? undefined : value)
              }>
              <DropdownMenuRadioItem key="all" value="all">
                Semua
              </DropdownMenuRadioItem>
              {Array.from(
                table.getColumn("status")?.getFacetedUniqueValues().entries() ||
                  []
              ).map(([value]) => (
                <DropdownMenuRadioItem key={value} value={String(value)}>
                  {String(value)}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="dates"
              className="w-56 justify-between font-normal">
              {range?.from && range?.to
                ? `${range.from.toLocaleDateString()} - ${range.to.toLocaleDateString()}`
                : "Pilih tanggal"}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="overflow-hidden p-0 w-64 flex flex-col items-center"
            align="end">
            <Calendar
              mode="range"
              selected={range}
              captionLayout="dropdown"
              onSelect={range => {
                setRange(range);
                table.getColumn("createdAt")?.setFilterValue(range);
              }}
            />
            <Separator className="m-0" />
            <div className="flex p-2 flex-wrap gap-2 justify-center">
              {dateRange.map(preset => (
                <Button
                  key={preset.label}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setRange(preset.range);
                    table.getColumn("createdAt")?.setFilterValue(preset.range);
                  }}>
                  {preset.label}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="overflow-hidden rounded-md border">
        <div className="mx-4">
          <Table className="">
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
    </>
  );
}
