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
import { Categories } from "@/types/categories";
import { deleteCategory, updateCategory } from "@/services/categoriesApi";
import { mutate } from "swr";
import { AxiosError } from "axios";
import { toast } from "sonner";

type LucideIconName = keyof typeof LucideIcons;

function isLucideIconName(name: string): name is LucideIconName {
  return name in LucideIcons;
}

const iconNames = Object.keys(LucideIcons).filter(isLucideIconName);

export function CategoryActionsCell({ row }: { row: Row<Categories> }) {
  const categories = row.original;

  const [search, setSearch] = useState("");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [name, setName] = useState(categories.name);
  const [icon, setIcon] = useState(categories.icon);

  const filteredIcons = iconNames.filter(icon =>
    icon.toLowerCase().includes(search.toLowerCase())
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
            onClick={() =>
              navigator.clipboard.writeText(categories.categoryId.toString())
            }>
            Salin Kategori ID
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onSelect={() => setShowEditDialog(true)}>
            Edit Kategori
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() =>
              deleteCategory(categories.categoryId)
                .then(() => mutate("/api/categories"))
                .catch(
                  (error: AxiosError<{ status: string; message: string }>) => {
                    console.log(error.response?.data.message);
                    toast.error(`${error.response?.data.message}`, {
                      richColors: true,
                    });
                  }
                )
            }>
            Hapus Kategori
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Kategori</DialogTitle>
            <DialogDescription>
              Silakan ubah informasi kategori di bawah ini.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm">Nama Kategori</label>
              <Input
                defaultValue={categories.name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm">Icon Kategori</label>
              <Select defaultValue={icon} onValueChange={setIcon}>
                <SelectTrigger>
                  <SelectValue placeholder={categories.icon} />
                </SelectTrigger>

                <SelectContent>
                  <div className="p-2">
                    <Input
                      placeholder="Cari ikon..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>

                  {filteredIcons.slice(0, 50).map(iconName => {
                    const IconComp = LucideIcons[
                      iconName
                    ] as React.ComponentType<React.SVGProps<SVGSVGElement>>;

                    return (
                      <SelectItem key={iconName} value={iconName}>
                        <div className="flex items-center gap-2">
                          <IconComp className="h-4 w-4" />
                          <span>{iconName}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Batal
            </Button>
            <Button
              onClick={() => {
                updateCategory(categories.categoryId, name, icon).then(() => {
                  setShowEditDialog(false);
                  mutate("/api/categories");
                });
              }}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
