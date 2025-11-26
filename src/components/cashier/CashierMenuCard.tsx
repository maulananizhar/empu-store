import { addProductToOrder } from "@/services/orderProductsApi";
import { useOrder } from "@/store/orderStore";
import { ProductsIcons } from "@/types/products";
import * as LucideIcons from "lucide-react";
import { toast } from "sonner";
import { mutate } from "swr";

type LucideIconName = keyof typeof LucideIcons;

function isLucideIconName(name: string): name is LucideIconName {
  return name in LucideIcons;
}

function CashierMenuCard({ product }: { product: ProductsIcons }) {
  const { orderId } = useOrder();

  const Icon = isLucideIconName(product.category.icon)
    ? (LucideIcons[product.category.icon] as React.ComponentType<{
        className?: string;
      }>)
    : LucideIcons.CircleAlert;

  return (
    <>
      <div
        className="flex flex-col p-4 hover:bg-gray-200 cursor-pointer duration-200 border-b"
        onClick={async () => {
          if (!orderId)
            return toast.error("Belum ada transaksi.", {
              richColors: true,
            });
          await addProductToOrder(orderId || 0, product.productId);
          await mutate("/api/products");
          await mutate("/api/orders-product");
        }}>
        <div className="flex text-sm justify-between">
          <p>{product.name}</p>
          <Icon className="h-7 w-7 border px-1.5 py-0.5 rounded" />
        </div>
        <p className="text-sm font-semibold">
          Rp{product.price.toLocaleString("id-ID")}
        </p>
        <p className="text-xs mt-2">Stok: {product.stock}</p>
      </div>
    </>
  );
}

function CashierMenuCardSkeleton() {
  return (
    <>
      <div className="flex flex-col p-4 border-b animate-pulse">
        <div className="flex text-sm justify-between">
          <div className="h-4 w-24 bg-gray-300 rounded"></div>
          <div className="h-7 w-7 bg-gray-300 rounded"></div>
        </div>
        <div className="h-4 w-16 bg-gray-300 rounded mt-2"></div>
        <div className="h-3 w-12 bg-gray-300 rounded mt-2"></div>
      </div>
    </>
  );
}

export { CashierMenuCard, CashierMenuCardSkeleton };
