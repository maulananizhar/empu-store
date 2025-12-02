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
import { fetchCategories } from "@/services/categoriesApi";
import useSWR, { mutate } from "swr";
import { ProductsIcons } from "@/types/products";
import { deleteProduct, updateProduct } from "@/services/productsApi";
import { toast } from "sonner";

export function ProductsActionsCell({ row }: { row: Row<ProductsIcons> }) {
  const product = row.original;

  const [search, setSearch] = useState("");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(product.price);
  const [stok, setStok] = useState(product.stock);
  const [category, setCategory] = useState(product.category.name);

  const { data: categories } = useSWR("/api/categories", () =>
    fetchCategories("")
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
              navigator.clipboard.writeText(product.productId.toString());
              toast.success("Produk ID disalin ke clipboard");
            }}>
            Salin Produk ID
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onSelect={() => setShowEditDialog(true)}>
            Edit Produk
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              deleteProduct(product.productId).then(() => {
                mutate("/api/products");
              });
            }}>
            Hapus Produk
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <form
            onSubmit={e => {
              e.preventDefault();
              updateProduct(
                product.productId,
                name,
                category,
                price,
                stok
              ).then(() => {
                mutate("/api/products");
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
                <Input
                  defaultValue={product.name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm">Nama Kategori</label>
                <Select defaultValue={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder={product.category.name} />
                  </SelectTrigger>

                  <SelectContent>
                    <div className="p-2">
                      <Input
                        placeholder="Cari kategori..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                      />
                    </div>

                    {categories?.map(cat => (
                      <SelectItem key={cat.categoryId} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm">Harga Produk</label>
                <Input
                  defaultValue={product.price}
                  onChange={e => setPrice(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="text-sm">Stok Produk</label>
                <Input
                  defaultValue={product.stock}
                  onChange={e => setStok(Number(e.target.value))}
                />
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
