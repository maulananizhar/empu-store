/* eslint-disable @next/next/no-img-element */
"use client";

import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { use, useEffect, useRef } from "react";
import useSWR, { mutate } from "swr";
import { fetchOrdersProducts } from "@/services/orderProductsApi";
import { fetchDiscounts } from "@/services/discountsApi";
import { Discounts } from "@/generated/prisma/browser";
import { OrdersProductsExtended } from "@/types/ordersProducts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";

export default function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const printRef = useRef(null);

  const handleDownloadPdf = async () => {
    const element = printRef.current;
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 1 });
    const data = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "px", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(data, "PNG", 0, 0, pdfWidth, pdfHeight);

    pdf.save(`invoice-${await params.then(p => p.slug)}.pdf`);
  };

  const { slug } = use(params);

  const {
    data: ordersProducts,
    error: ordersProductsError,
    isLoading: ordersProductsLoading,
  } = useSWR("/api/orders-product", () =>
    fetchOrdersProducts(Number(slug) || 0)
  );

  // Format harga ke Rupiah
  function formatRupiah(value: number | undefined) {
    return `Rp${(value ?? 0).toLocaleString("id-ID")}`;
  }

  // Hitung diskon untuk satu produk
  function getDiscountAmount(
    product: OrdersProductsExtended["OrdersProducts"][number]["product"],
    quantity: number,
    discounts: Discounts[]
  ) {
    if (!discounts) return 0;
    const discount = discounts.find(d => d.productId === product.productId);
    return discount
      ? (discount.percentage / 100) * product.price * quantity
      : 0;
  }

  // Hitung total untuk satu produk
  function getProductTotal(
    product: OrdersProductsExtended["OrdersProducts"][number]["product"],
    quantity: number,
    discounts: Discounts[]
  ) {
    return (
      quantity * product.price - getDiscountAmount(product, quantity, discounts)
    );
  }

  // Hitung total seluruh order
  function getOrderTotal(
    orderProducts: OrdersProductsExtended["OrdersProducts"],
    discounts: Discounts[]
  ) {
    if (!orderProducts) return 0;
    return orderProducts.reduce((sum, item) => {
      return sum + getProductTotal(item.product, item.quantity, discounts);
    }, 0);
  }

  const { data: discounts } = useSWR("/api/discounts", () =>
    fetchDiscounts(ordersProducts?.createdAt ?? new Date(0, 0, 1))
  );

  useEffect(() => {
    mutate("/api/discounts");
  }, [ordersProducts?.createdAt]);

  return (
    <>
      <div
        className="flex flex-col w-1/2 mx-auto border"
        ref={printRef}
        style={{ width: "700px" }}>
        <div className="flex w-full justify-between px-8 pt-4">
          <div className="flex flex-col justify-center">
            <p className="text-2xl font-bold">INVOICE</p>
            <p className="font-semibold">#{slug}</p>
            <p className="font-semibold text-xs">
              Empu Store - SMKN 40 Jakarta
            </p>
          </div>

          <div>
            <img
              src="/logo-smkn-40.png"
              alt="Logo"
              width={100}
              height={100}
              style={{
                width: "100px",
                height: "100px",
                objectFit: "contain",
              }}></img>
          </div>
        </div>
        <Separator orientation="horizontal" className="mx-auto my-4 w-11/12" />
        <div className="flex px-8 justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">
              Kasir
            </p>
            {ordersProductsLoading ? (
              <div className="h-5 w-24 bg-gray-200 animate-pulse rounded" />
            ) : ordersProductsError ? (
              <p className="text-sm font-medium text-red-500">
                Gagal memuat data kasir.
              </p>
            ) : ordersProducts ? (
              <p className="text-sm font-medium">
                {ordersProducts.cashier.name}
              </p>
            ) : null}
            <p className="text-sm font-medium"></p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase text-right">
              Waktu
            </p>
            {ordersProductsLoading ? (
              <div className="h-5 w-32 bg-gray-200 animate-pulse rounded ml-auto" />
            ) : ordersProductsError ? (
              <p className="text-sm font-medium text-red-500">
                Gagal memuat data waktu.
              </p>
            ) : ordersProducts ? (
              <p className="text-right text-sm font-medium">
                {new Date(ordersProducts.createdAt).toLocaleString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                WIB
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex px-8 justify-between mt-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">
              Metode Pembayaran
            </p>
            {ordersProductsLoading ? (
              <div className="h-5 w-32 bg-gray-200 animate-pulse rounded" />
            ) : ordersProductsError ? (
              <p className="text-sm font-medium text-red-500">
                Gagal memuat data metode pembayaran.
              </p>
            ) : ordersProducts ? (
              <p className="text-sm font-medium">
                {ordersProducts.method.method}
              </p>
            ) : null}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase text-right">
              Tanggal
            </p>
            {ordersProductsLoading ? (
              <div className="h-5 w-32 bg-gray-200 animate-pulse rounded ml-auto" />
            ) : ordersProductsError ? (
              <p className="text-sm font-medium text-red-500">
                Gagal memuat data tanggal.
              </p>
            ) : ordersProducts ? (
              <p className="text-right text-sm font-medium">
                {new Date(ordersProducts.createdAt).toLocaleDateString(
                  "id-ID",
                  {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  }
                )}
              </p>
            ) : null}
          </div>
        </div>
        <Separator orientation="horizontal" className="mx-auto my-4 w-11/12" />
        <div className="px-8 pb-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produk</TableHead>
                <TableHead className="w-[100px]">Kuantitas</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Diskon</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordersProductsLoading ? (
                <>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="h-5 w-24 bg-gray-200 animate-pulse rounded" />
                      </TableCell>
                      <TableCell>
                        <div className="h-5 w-10 bg-gray-200 animate-pulse rounded" />
                      </TableCell>
                      <TableCell>
                        <div className="h-5 w-16 bg-gray-200 animate-pulse rounded" />
                      </TableCell>
                      <TableCell>
                        <div className="h-5 w-16 bg-gray-200 animate-pulse rounded" />
                      </TableCell>
                      <TableCell>
                        <div className="h-5 w-16 bg-gray-200 animate-pulse rounded ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ) : ordersProducts ? (
                ordersProducts.OrdersProducts.map(product => (
                  <TableRow key={product.orderProductId}>
                    <TableCell className="font-medium">
                      {product.product.name}
                    </TableCell>
                    <TableCell>{product.quantity}</TableCell>
                    <TableCell>{formatRupiah(product.product.price)}</TableCell>
                    <TableCell>
                      {formatRupiah(
                        getDiscountAmount(
                          product.product,
                          product.quantity,
                          discounts || []
                        )
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatRupiah(
                        getProductTotal(
                          product.product,
                          product.quantity,
                          discounts || []
                        )
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : null}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={2}>Total</TableCell>
                <TableCell>
                  {formatRupiah(
                    (ordersProducts?.OrdersProducts || []).reduce(
                      (sum, item) => sum + item.product.price * item.quantity,
                      0
                    )
                  )}
                </TableCell>
                <TableCell>
                  {formatRupiah(
                    (ordersProducts?.OrdersProducts || []).reduce(
                      (sum, item) =>
                        sum +
                        getDiscountAmount(
                          item.product,
                          item.quantity,
                          discounts || []
                        ),
                      0
                    )
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {formatRupiah(
                    getOrderTotal(
                      ordersProducts?.OrdersProducts || [],
                      discounts || []
                    )
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={4}>Terbayar</TableCell>
                <TableCell className="text-right">
                  {formatRupiah(ordersProducts ? ordersProducts.cash : 0)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={4}>Kembali</TableCell>
                <TableCell className="text-right">
                  {formatRupiah(
                    ordersProducts
                      ? ordersProducts.cash -
                          getOrderTotal(
                            ordersProducts.OrdersProducts || [],
                            discounts || []
                          )
                      : 0
                  )}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>
      <div className="mt-4 w-1/2 mx-auto">
        <Button
          onClick={() => {
            handleDownloadPdf();
          }}
          className="w-full">
          Download PDF
        </Button>
      </div>
    </>
  );
}
