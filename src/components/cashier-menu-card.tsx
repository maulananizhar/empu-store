import { Products } from "@/generated/prisma/client";
import { LucideSoup } from "lucide-react";

function CashierMenuCard({ product }: { product: Products }) {
  return (
    <>
      <div className="flex flex-col p-4 hover:bg-gray-200 cursor-pointer duration-200 border-b">
        <div className="flex text-sm justify-between">
          <p>{product.name}</p>
          <LucideSoup className="h-7 w-7 border px-1.5 py-0.5 rounded" />
        </div>
        <p className="text-sm font-semibold">Rp{product.price}</p>
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
