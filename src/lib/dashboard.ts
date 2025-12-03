import { PrismaClient } from "@/generated/prisma/client";

const prisma = new PrismaClient();

async function getSalesSummaryLast3Months() {
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

export { getSalesSummaryLast3Months };
