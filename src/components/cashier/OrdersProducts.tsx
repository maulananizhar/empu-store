import { Discounts } from "@/generated/prisma/browser";
import { addQuantityToOrderProduct } from "@/services/orderProductsApi";
import { OrdersProductsExtended } from "@/types/ordersProducts";
import * as LucideIcons from "lucide-react";
import { toast } from "sonner";
import { mutate } from "swr";

type LucideIconName = keyof typeof LucideIcons;

function isLucideIconName(name: string): name is LucideIconName {
  return name in LucideIcons;
}

function PriceDisplay({
  product,
  quantity,
  discounts,
}: {
  product: OrdersProductsExtended["OrdersProducts"][number]["product"];
  quantity: number;
  discounts?: Discounts[];
}) {
  const discount = discounts?.find(
    (d: Discounts) => d.productId === product.productId
  );
  const originalPrice = product.price * quantity;
  const discountedPrice = discount
    ? ((100 - discount.percentage) / 100) * originalPrice
    : null;

  return (
    <>
      <p
        className={`ml-auto ${
          discount ? "line-through text-red-600 mr-1" : ""
        }`}>
        Rp{originalPrice.toLocaleString("id-ID")}
      </p>
      {discountedPrice && <p>Rp{discountedPrice.toLocaleString("id-ID")}</p>}
    </>
  );
}

function OrdersProductsCard({
  ordersProduct,
  discounts,
  status,
}: {
  ordersProduct: OrdersProductsExtended["OrdersProducts"][number];
  discounts?: Discounts[];
  status?: string;
}) {
  const Icon = isLucideIconName(ordersProduct.product.category.icon)
    ? (LucideIcons[ordersProduct.product.category.icon] as React.ComponentType<{
        className?: string;
      }>)
    : LucideIcons.CircleAlert;

  return (
    <div className="flex flex-col mb-4">
      <div className="flex items-center">
        <p>{ordersProduct.product.name}</p>
        {discounts &&
          (() => {
            const discount = discounts.find(
              (d: Discounts) => d.productId === ordersProduct.product.productId
            );
            return discount ? (
              <p className="ml-2 text-xs text-red-600">
                -{discount.percentage}%
              </p>
            ) : null;
          })()}
        <Icon className="ml-auto h-7 w-7 border px-1.5 py-0.5 rounded" />
      </div>
      <div className="flex text-sm mt-2 items-center">
        <div className="flex justify-center items-center gap-2">
          <LucideIcons.Minus
            className={`h-7 w-7 inline-block mr-1 border px-1.5 py-0.5 rounded cursor-pointer hover:bg-gray-200 duration-200 active:scale-110 ${
              status === "Sukses" ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={async () => {
              if (status === "Sukses") {
                return toast.error("Transaksi sudah selesai.", {
                  richColors: true,
                });
              }
              await addQuantityToOrderProduct(ordersProduct.orderProductId, -1);
              mutate("/api/orders-product");
              mutate("/api/products");
            }}
          />
          <p className="mr-0.5">{ordersProduct.quantity}</p>
          <LucideIcons.Plus
            className={`h-7 w-7 inline-block bg-gray-800 text-white mr-1 border px-1.5 py-0.5 rounded cursor-pointer hover:bg-gray-950 duration-200 active:scale-110 ${
              status === "Sukses" ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={async () => {
              if (status === "Sukses") {
                return toast.error("Transaksi sudah selesai.", {
                  richColors: true,
                });
              }
              await addQuantityToOrderProduct(ordersProduct.orderProductId, 1);
              mutate("/api/orders-product");
              mutate("/api/products");
            }}
          />
        </div>
        <PriceDisplay
          product={ordersProduct.product}
          quantity={ordersProduct.quantity}
          discounts={discounts}
        />
      </div>
    </div>
  );
}

function OrdersProductsCardSkeleton() {
  return (
    <div className="flex flex-col mb-4 animate-pulse">
      <div className="flex items-center">
        <div className="h-4 w-32 bg-gray-300 rounded"></div>
        <div className="ml-auto h-7 w-7 bg-gray-300 rounded"></div>
      </div>
      <div className="flex text-sm mt-2 items-center">
        <div className="flex justify-center items-center gap-2">
          <div className="h-6 w-6 bg-gray-300 rounded mr-1"></div>
          <div className="h-4 w-4 bg-gray-300 rounded mr-1"></div>
          <div className="h-6 w-6 bg-gray-300 rounded mr-1"></div>
        </div>
        <div className="ml-auto h-4 w-16 bg-gray-300 rounded"></div>
      </div>
    </div>
  );
}

export { OrdersProductsCard, OrdersProductsCardSkeleton };
