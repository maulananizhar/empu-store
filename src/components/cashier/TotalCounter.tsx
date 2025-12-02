import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Payments } from "@/generated/prisma/client";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useState } from "react";
import { updateOrder } from "@/services/orderApi";
import { mutate } from "swr";
import { useRouter } from "next/navigation";

function TotalCounter({
  orderId,
  subtotal,
  totalDiscount,
  total,
  totalItems,
  paymentAmount,
  changeAmount,
  paymentMethods,
  paymentMethodId,
  status,
  setPaymentAmount,
  setPaymentMethodId,
}: {
  orderId: number;
  subtotal: number;
  totalDiscount: number;
  total: number;
  totalItems: number;
  paymentAmount: number;
  changeAmount: number;
  paymentMethods: Payments[];
  paymentMethodId: number;
  status: string;
  setPaymentAmount: (amount: number) => void;
  setPaymentMethodId: (method: number) => void;
}) {
  const router = useRouter();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col">
        <div className="my-2">
          <div className="flex justify-between text-lg font-semibold mb-2">
            <p>Invoice</p>
            <p>#{orderId}</p>
          </div>
          <hr className="border-dashed border-gray-300 my-2" />
          <div className="flex justify-between text-sm text-gray-500">
            <p>Product ({totalItems} pcs)</p>
            <p>Rp{subtotal.toLocaleString("id-ID") || 0}</p>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <p>Diskon</p>
            <p>Rp{totalDiscount.toLocaleString("id-ID") || 0}</p>
          </div>
          <hr className="border-dashed border-gray-300 my-2" />
          <div className="flex justify-between text-lg font-semibold">
            <p>Total</p>
            <p>Rp{total.toLocaleString("id-ID") || 0}</p>
          </div>
          <hr className="border-dashed border-gray-300 my-2" />
          <div className="flex text-sm text-gray-500 items-center">
            <p>Terbayar</p>
            <p className="ml-auto">Rp</p>
            <Input
              className="text-right w-24 h-6 py-0 px-1"
              placeholder="0"
              value={paymentAmount?.toLocaleString("id-ID")}
              onChange={e => {
                const value = e.target.value.replace(/[^0-9]/g, "");
                setPaymentAmount(Number(value) || 0);
              }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <p>Kembali</p>
            <p>Rp{changeAmount.toLocaleString("id-ID") || 0}</p>
          </div>
        </div>
        <div></div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full mt-2">
                {paymentMethods.find(
                  method => method.paymentId === paymentMethodId
                )?.method || "Pilih Metode"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Metode Pembayaran</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {paymentMethods.map(method => (
                <DropdownMenuItem
                  key={method.paymentId}
                  onClick={() => setPaymentMethodId(method.paymentId)}>
                  {method.method}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            className="w-full mt-2"
            disabled={
              !(paymentMethodId === 1 || paymentMethodId === 2) ||
              paymentAmount < total ||
              status === "Sukses"
            }
            onClick={() => {
              setIsDialogOpen(true);
            }}>
            Bayar
          </Button>
        </div>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Pembayaran</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin memproses pembayaran ini?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button
              onClick={() => {
                updateOrder(orderId, {
                  total: total,
                  cash: paymentAmount,
                  methodId: paymentMethodId,
                  status: "Sukses",
                }).then(() => {
                  setIsDialogOpen(false);
                  mutate("/api/orders-product");
                  mutate("/api/orders");
                  router.push(`/transactions/${orderId}`);
                });
              }}>
              Konfirmasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export { TotalCounter };
