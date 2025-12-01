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
import { Users } from "@/types/users";
import { deleteUsers, fetchRoles, updateUser } from "@/services/usersApi";

export function UsersActionsCell({ row }: { row: Row<Users> }) {
  const user = row.original;

  const [search, setSearch] = useState("");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [roleId, setRoleId] = useState(user.role.roleId.toString());

  const { data: roles } = useSWR("/api/roles", () => fetchRoles());

  const filteredRoles = roles?.filter(role =>
    role.name.toLowerCase().includes(search.toLowerCase())
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
              navigator.clipboard.writeText(user.userId.toString())
            }>
            Salin User ID
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onSelect={() => setShowEditDialog(true)}>
            Edit Pengguna
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              deleteUsers(user.userId).then(() => {
                mutate("/api/users");
              });
            }}>
            Hapus Pengguna
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <form
            onSubmit={e => {
              e.preventDefault();
              updateUser(
                user.userId,
                name,
                username,
                email,
                password,
                confirmPassword,
                parseInt(roleId)
              ).then(() => {
                mutate("/api/users");
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
