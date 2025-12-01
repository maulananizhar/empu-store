"use client";

import useSWR, { mutate } from "swr";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

import {
  CashierMenuCard,
  CashierMenuCardSkeleton,
} from "@/components/cashier/CashierMenuCard";
import { Input } from "@/components/ui/input";
import {
  CategoryFilter,
  CategoryFilterDelete,
  CategoryFilterSkeleton,
} from "@/components/cashier/CategoryFilter";
import { fetchProducts } from "@/services/productsApi";
import { fetchCategories } from "@/services/categoriesApi";
import { fetchOrdersProducts } from "@/services/orderProductsApi";
import {
  OrdersProductsCard,
  OrdersProductsCardSkeleton,
} from "@/components/cashier/OrdersProducts";
import { fetchDiscounts } from "@/services/discountsApi";
import {
  calculateSubtotal,
  calculateTotalDiscount,
  calculateTotalItems,
} from "@/lib/cashier";
import { useOrder } from "@/store/orderStore";
import { createOrder, updateOrder } from "@/services/orderApi";
import { TotalCounter } from "@/components/cashier/TotalCounter";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { LucideCalculator } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Page() {
  // Session and router can be used here if needed
  const router = useRouter();
  const { data: session } = useSession();

  // Use state hooks
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [paymentAmount, setPaymentAmount] = useState<number>();
  const [isPaymentAmountInitialized, setIsPaymentAmountInitialized] =
    useState(false);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [totalDiscount, setTotalDiscount] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [changeAmount, setChangeAmount] = useState<number>(0);

  // Zustand store can be used here if needed
  const { orderId, setOrderId } = useOrder();

  // Debounce the name input to avoid excessive API calls
  const [debouncedName] = useDebounce(name, 500);
  const [debouncedPaymentAmount] = useDebounce(paymentAmount, 500);

  // Use SWR to manage data fetching and caching
  const {
    data: products,
    error: productsError,
    isLoading: productsLoading,
  } = useSWR("/api/products", () => fetchProducts(debouncedName, categoryId));

  const {
    data: categories,
    error: categoriesError,
    isLoading: categoriesLoading,
  } = useSWR("/api/categories", () => fetchCategories(""));

  const {
    data: ordersProducts,
    error: ordersProductsError,
    isLoading: ordersProductsLoading,
  } = useSWR("/api/orders-product", () => fetchOrdersProducts(orderId || 0));

  const { data: discounts } = useSWR("/api/discounts", () =>
    fetchDiscounts(ordersProducts?.createdAt ?? new Date(0, 0, 1))
  );

  // Mutate products data when filters change
  useEffect(() => {
    mutate("/api/products");
  }, [debouncedName, categoryId]);

  // Mutate ordersProducts data when orderId changes
  useEffect(() => {
    mutate("/api/orders-product");
    setIsPaymentAmountInitialized(false);
  }, [orderId]);

  // Set default payment amount from ordersProducts.cash only once when data is loaded
  useEffect(() => {
    if (
      ordersProducts &&
      ordersProducts.cash &&
      !isPaymentAmountInitialized &&
      orderId === ordersProducts.orderId
    ) {
      setPaymentAmount(ordersProducts.cash);
      setIsPaymentAmountInitialized(true);
    }
  }, [ordersProducts, isPaymentAmountInitialized, orderId]);

  // Calculate totals whenever ordersProducts or discounts change
  useEffect(() => {
    if (ordersProducts) {
      setSubtotal(calculateSubtotal(ordersProducts));
      setTotalItems(calculateTotalItems(ordersProducts));
      setTotalDiscount(calculateTotalDiscount(ordersProducts, discounts));
    }
  }, [ordersProducts, discounts]);

  // Update total when subtotal or totalDiscount change
  useEffect(() => {
    setTotal(subtotal - totalDiscount);
  }, [subtotal, totalDiscount]);

  // Update changeAmount when paymentAmount or total change
  useEffect(() => {
    if (debouncedPaymentAmount && total) {
      setChangeAmount(debouncedPaymentAmount - total);
      updateOrder(orderId || 0, {
        total: total,
        cash: debouncedPaymentAmount,
        status: "Pending",
      });
    }
  }, [debouncedPaymentAmount, total, orderId]);

  useEffect(() => {
    mutate("/api/discounts");
  }, [ordersProducts?.createdAt]);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-4 grid-rows-1 gap-4 h-full">
        <div className="col-span-3 flex flex-col">
          <div className="flex items-center mb-2 gap-2 overflow-x-auto modern-scrollbar pb-2">
            <CategoryFilterDelete
              categoryId={categoryId}
              setCategoryId={setCategoryId}
            />
            {categoriesLoading ? (
              <>
                {Array.from({ length: 5 }).map((_, i) => (
                  <CategoryFilterSkeleton key={i} />
                ))}
              </>
            ) : categoriesError ? (
              <div className="text-red-500">Gagal memuat kategori.</div>
            ) : categories ? (
              categories.map(category => (
                <CategoryFilter
                  key={category.categoryId}
                  category={category}
                  categoryId={categoryId}
                  setCategoryId={setCategoryId}
                />
              ))
            ) : null}
          </div>
          <div className="overflow-y-auto modern-scrollbar flex-1 border rounded-lg mb-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 divide-x">
              {productsLoading ? (
                <>
                  {Array.from({ length: 48 }).map((_, i) => (
                    <CashierMenuCardSkeleton key={i} />
                  ))}
                </>
              ) : productsError ? (
                <p className="text-center text-red-500">Gagal memuat produk.</p>
              ) : products ? (
                products.map(product => (
                  <CashierMenuCard key={product.productId} product={product} />
                ))
              ) : null}
            </div>
          </div>
        </div>
        <div className="col-span-1 row-span-1 flex flex-col">
          <div className="hidden lg:flex items-center mb-2 gap-2 pb-2 z-10 bg-white modern-scrollbar">
            <Input
              placeholder="Cari produk..."
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="modern-scrollbar overflow-y-auto flex-1 rounded-lg h-200">
            {ordersProductsLoading ? (
              <>
                {Array.from({ length: 10 }).map((_, i) => (
                  <OrdersProductsCardSkeleton key={i} />
                ))}
              </>
            ) : ordersProductsError ? (
              <p className="text-center text-red-500">Gagal memuat pesanan.</p>
            ) : ordersProducts && ordersProducts.orderId != 0 ? (
              ordersProducts.OrdersProducts.map((ordersProduct, index) => (
                <OrdersProductsCard
                  key={index}
                  ordersProduct={ordersProduct}
                  discounts={discounts}
                />
              ))
            ) : (
              <div className="flex h-full items-center">
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle>Transaksi kosong</EmptyTitle>
                    <EmptyDescription>
                      Buat transaksi baru dengan menekan tombol tambah transaksi
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button
                      variant="default"
                      className="flex items-center justify-center active:scale-105 duration-200 transition-transform"
                      onClick={() => {
                        createOrder(session?.user.id || 0).then(data => {
                          setOrderId(data.orderId);
                          router.push(`/cashier`);
                        });
                      }}>
                      <LucideCalculator className="h-5 w-5" />
                      <p>Transaksi baru</p>
                    </Button>
                  </EmptyContent>
                </Empty>
              </div>
            )}
          </div>
          <TotalCounter
            orderId={orderId || 0}
            subtotal={subtotal}
            totalDiscount={totalDiscount}
            total={total}
            totalItems={totalItems}
            paymentAmount={paymentAmount || 0}
            changeAmount={changeAmount}
            setPaymentAmount={setPaymentAmount}
          />
        </div>
      </div>
    </>
  );
}
