import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";
import { DashboardData } from "@/types/dashboard";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const now = new Date();
    // get this month's transactions
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const lastStartOfMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastEndOfMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Fetch transactions from the database
    const transactions = await prisma.orders.aggregate({
      _sum: {
        total: true,
      },
      where: {
        status: "Sukses",
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    // Fetch last month's transactions from the database
    const lastTransactions = await prisma.orders.aggregate({
      _sum: {
        total: true,
      },
      where: {
        status: "Sukses",
        createdAt: {
          gte: lastStartOfMonth,
          lte: lastEndOfMonth,
        },
      },
    });

    // Fetch transactions counts from the database
    const transactionCounts = await prisma.orders.count({
      where: {
        status: "Sukses",
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    // Fetch last month's transactions counts from the database
    const lastTransactionCounts = await prisma.orders.count({
      where: {
        status: "Sukses",
        createdAt: {
          gte: lastStartOfMonth,
          lte: lastEndOfMonth,
        },
      },
    });

    const orderedProductsCountThisMonth = await prisma.ordersProducts.aggregate(
      {
        _sum: {
          quantity: true,
        },
        where: {
          order: {
            status: "Sukses",
          },
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      }
    );

    const orderedProductsCountLastMonth = await prisma.ordersProducts.aggregate(
      {
        _sum: {
          quantity: true,
        },
        where: {
          order: {
            status: "Sukses",
          },
          createdAt: {
            gte: lastStartOfMonth,
            lte: lastEndOfMonth,
          },
        },
      }
    );

    const sumHighestSellingProduct = await prisma.ordersProducts.groupBy({
      by: ["productId"],
      _sum: {
        quantity: true,
      },
      where: {
        order: {
          status: "Sukses",
        },
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    const namedHighestSellingProduct = await prisma.products.findUnique({
      where: {
        productId: sumHighestSellingProduct[0].productId,
      },
    });

    // Return the discounts in the response
    return NextResponse.json(
      {
        status: "success",
        message: "Dashboard data retrieved successfully",
        data: {
          startOfMonth,
          endOfMonth,
          lastStartOfMonth,
          lastEndOfMonth,
          total: {
            thisMonth: transactions._sum.total || 0,
            lastMonth: lastTransactions._sum.total || 0,
            change:
              transactions._sum.total && lastTransactions._sum.total
                ? Math.round(
                    ((transactions._sum.total - lastTransactions._sum.total) /
                      lastTransactions._sum.total) *
                      100
                  )
                : transactions._sum.total || 0,
          },
          transactionCount: {
            thisMonth: transactionCounts,
            lastMonth: lastTransactionCounts,
            change:
              transactionCounts && lastTransactionCounts
                ? Math.round(
                    ((transactionCounts - lastTransactionCounts) /
                      lastTransactionCounts) *
                      100
                  )
                : transactionCounts || 0,
          },
          orderedProductsCount: {
            thisMonth: orderedProductsCountThisMonth._sum.quantity || 0,
            lastMonth: orderedProductsCountLastMonth._sum.quantity || 0,
            change:
              orderedProductsCountThisMonth._sum.quantity &&
              orderedProductsCountLastMonth._sum.quantity
                ? Math.round(
                    ((orderedProductsCountThisMonth._sum.quantity -
                      orderedProductsCountLastMonth._sum.quantity) /
                      orderedProductsCountLastMonth._sum.quantity) *
                      100
                  )
                : orderedProductsCountThisMonth._sum.quantity || 0,
          },
          highestSellingProduct: {
            product:
              namedHighestSellingProduct?.name || "No products sold this month",
            quantity: sumHighestSellingProduct[0]?._sum.quantity || 0,
          },
          graphData: await getSalesSummaryLast3Months(),
        } as DashboardData,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to retrieve discounts",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function getSalesSummaryLast3Months() {
  const today = new Date();
  const threeMonthsAgo = new Date(today);
  threeMonthsAgo.setDate(today.getDate() - 89); // 90 hari terakhir termasuk hari ini

  // Ambil semua orders dalam 3 bulan terakhir
  const orders = await prisma.orders.findMany({
    where: {
      createdAt: {
        gte: threeMonthsAgo,
        lte: today,
      },
    },
    include: {
      method: true, // relasi ke Payments
    },
  });

  // ---- STEP 1: Generate semua tanggal dalam range ----
  const dates: string[] = [];
  const current = new Date(threeMonthsAgo);

  while (current <= today) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  // ---- STEP 2: Map tanggal → qris & cash == 0 ----
  const result: Record<string, { date: string; qris: number; cash: number }> =
    {};

  dates.forEach(d => {
    result[d] = { date: d, qris: 0, cash: 0 }; // default 0
  });

  // ---- STEP 3: Isi nilai dari database ----
  for (const order of orders) {
    const date = order.createdAt.toISOString().split("T")[0];
    const pay = order.method.method.toLowerCase(); // "qris" / "cash"

    if (pay === "qris") {
      result[date].qris += Number(order.total);
    } else if (pay === "cash") {
      result[date].cash += Number(order.cash);
    }
  }

  // ---- STEP 4: Ubah ke array dan sort ----
  return Object.values(result).sort((a, b) => a.date.localeCompare(b.date));
}
