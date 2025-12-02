"use client";

import { useState } from "react";
import * as LucideIcons from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Row } from "@tanstack/react-table";
import useSWR, { mutate } from "swr";
import { Discounts } from "@/types/discounts";
import { fetchProducts } from "@/services/productsApi";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { format } from "date-fns";
import { Calendar } from "../ui/calendar";
import { deleteDiscount, updateDiscount } from "@/services/discountsApi";
import { toast } from "sonner";

export function DiscountsActionsCell({ row }: { row: Row<Discounts> }) {
  const discount = row.original;

  const [search, setSearch] = useState("");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [productId, setProductId] = useState(discount.productId.toString());
  const [percentage, setPercentage] = useState(discount.percentage.toString());
  const [expiredAt, setExpiredAt] = useState<Date>(
    new Date(discount.expiredAt)
  );

  const { data: product } = useSWR("/api/products", () => fetchProducts());

  const filteredProducts = product?.filter(prod =>
    prod.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <LucideIcons.MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Aksi</DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => {
              navigator.clipboard.writeText(discount.discountId.toString());
              toast.success("Diskon ID disalin ke clipboard");
            }}>
            Salin Diskon ID
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onSelect={() => setShowEditDialog(true)}>
            Edit Diskon
          </DropdownMenuItem>
          <DropdownMenuItem
            // disabled={new Date(discount.expiredAt) < new Date()}
            onSelect={() => {
              deleteDiscount(discount.discountId, discount.productId).then(
                () => {
                  mutate("/api/discounts");
                }
              );
            }}>
            Hapus Diskon
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <form
            onSubmit={e => {
              e.preventDefault();
              updateDiscount(
                discount.discountId,
                Number(productId),
                Number(percentage),
                expiredAt.toISOString()
              ).then(() => {
                mutate("/api/discounts");
                setShowEditDialog(false);
              });
            }}>
            <DialogHeader className="mb-4">
              <DialogTitle>Edit Kategori</DialogTitle>
              <DialogDescription>
                Silakan ubah informasi kategori di bawah ini.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm">Nama Produk</label>
                <Select defaultValue={productId} onValueChange={setProductId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih produk" />
                  </SelectTrigger>

                  <SelectContent>
                    <div className="p-2">
                      <Input
                        placeholder="Cari produk..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                      />
                    </div>

                    {filteredProducts?.map(prod => (
                      <SelectItem
                        key={prod.productId}
                        value={prod.productId.toString()}>
                        {prod.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm">Persentase Diskon</label>
                  <Input
                    defaultValue={percentage}
                    onChange={e => setPercentage(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col">
                  <label className="text-sm">Tanggal kadaluarsa</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        data-empty={!expiredAt}
                        className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal">
                        <LucideIcons.CalendarIcon />
                        {expiredAt ? (
                          format(expiredAt, "dd MMMM yyyy")
                        ) : (
                          <span>Pilih tanggal</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        required
                        selected={expiredAt}
                        onSelect={setExpiredAt}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}>
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
