import { NextResponse } from "next/server";
import { json2csv } from "json-2-csv";
import { PrismaClient } from "@/generated/prisma/client";
import { subMonths } from "date-fns";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    // Get parameters from the request URL
    const { searchParams } = new URL(request.url);

    // Retrieve name and categoryId from query parameters
    const from = searchParams.get("from") || "";
    const to = searchParams.get("to") || "";

    const startDate = from ? new Date(from) : subMonths(new Date(), 3);
    const endDate = to ? new Date(to) : new Date();

    const result = await prisma.orders.findMany({
      where: {
        status: "Sukses",
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        orderId: true,
        cash: true,
        total: true,
        status: true,
        createdAt: true,
        cashier: {
          select: {
            name: true,
          },
        },
        method: {
          select: {
            method: true,
          },
        },
      },
    });

    const data = Object.values(result).map(order => ({
      "Order ID": order.orderId,
      Kasir: order.cashier.name,
      "Uang Pembayaran": order.cash,
      "Total Pembayaran": order.total,
      Status: order.status,
      "Metode Pembayaran": order.method.method,
      Tanggal: order.createdAt,
    }));

    const csv = json2csv(data);

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="transactions-${from}-to-${to}.csv"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to update category",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
