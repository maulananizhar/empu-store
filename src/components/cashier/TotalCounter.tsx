import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function TotalCounter({
  orderId,
  subtotal,
  totalDiscount,
  total,
  totalItems,
  paymentAmount,
  changeAmount,
  setPaymentAmount,
}: {
  orderId: number;
  subtotal: number;
  totalDiscount: number;
  total: number;
  totalItems: number;
  paymentAmount: number;
  changeAmount: number;
  setPaymentAmount: (amount: number) => void;
}) {
  return (
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
        <Button className="w-full mt-2">Metode Pembayaran</Button>
        <Button className="w-full mt-2">Bayar</Button>
      </div>
    </div>
  );
}

export { TotalCounter };
