"use client";

import { StatisticCard } from "@/components/statistic-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchDashboard } from "@/services/dashboardApi";
import { useState } from "react";
import { Area, AreaChart, XAxis } from "recharts";
import useSWR from "swr";

const chartConfig = {
  date: {
    label: "Tanggal",
  },
  qris: {
    label: "QRIS",
    color: "hsl(14 87% 53%)",
  },
  cash: {
    label: "Cash",
    color: "hsl(34 87% 53%)",
  },
} satisfies ChartConfig;

export default function Page() {
  const [timeRange, setTimeRange] = useState("7d");

  const { data } = useSWR("/api/dashboard", () => fetchDashboard());

  const filteredData = data?.graphData.filter(item => {
    const date = new Date(item.date);
    const referenceDate = new Date();
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatisticCard
          title="Total Pendapatan"
          value={data?.total.thisMonth || 0}
          trend={data?.total.change || 0}
          description="Pendapatan bulan ini"
          subDescription="Dibandingkan bulan lalu"
        />
        <StatisticCard
          title="Pesanan Baru"
          value={data?.transactionCount.thisMonth || 0}
          trend={data?.transactionCount.change || 0}
          description="Pesanan sebulan terakhir"
          subDescription="Semua status pesanan"
        />
        <StatisticCard
          title="Produk Terjual"
          value={data?.orderedProductsCount.thisMonth || 0}
          trend={data?.orderedProductsCount.change || 0}
          description="Jumlah unit terjual bulan ini"
          subDescription="Dari semua transaksi berhasil"
        />
        <StatisticCard
          title="Produk Terlaris"
          value={data?.highestSellingProduct.product || 0}
          trend={0}
          description={`Jumlah unit terjual: ${
            data?.highestSellingProduct.quantity || 0
          }`}
          subDescription="Dari satu produk"
        />
      </div>
      <Card className="mt-6">
        <CardHeader className="flex items-center justify-between space-y-0 pb-4 sm:flex-row sm:space-y-0 border-b">
          <div>
            <CardTitle>{`Ringkasan Penjualan ${
              timeRange === "90d"
                ? "3 Bulan"
                : timeRange === "30d"
                ? "30 Hari"
                : "7 Hari"
            } Terakhir`}</CardTitle>
            <CardDescription>
              Data penjualan berdasarkan perangkat
            </CardDescription>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
              aria-label="Select a value">
              <SelectValue placeholder="3 bulan terakhir" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                3 bulan terakhir
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                30 hari terakhir
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                7 hari terakhir
              </SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <AreaChart accessibilityLayer data={filteredData}>
              <defs>
                <linearGradient id="qrisGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={chartConfig.qris.color}
                    stopOpacity={0.1}
                  />
                  <stop
                    offset="100%"
                    stopColor={chartConfig.qris.color}
                    stopOpacity={0.05}
                  />
                </linearGradient>
                <linearGradient id="cashGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={chartConfig.cash.color}
                    stopOpacity={0.1}
                  />
                  <stop
                    offset="100%"
                    stopColor={chartConfig.cash.color}
                    stopOpacity={0.05}
                  />
                </linearGradient>
              </defs>
              <ChartTooltip
                content={<ChartTooltipContent />}
                labelFormatter={value => {
                  const date = new Date(value);
                  return date
                    .toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                    .replace(/\//g, "-");
                }}
              />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={value => {
                  const date = new Date(value);
                  return date.toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                  });
                }}
              />
              <Area
                type="monotone"
                dataKey="qris"
                stroke={chartConfig.qris.color}
                fill="url(#qrisGradient)"
                radius={4}
              />
              <Area
                type="monotone"
                dataKey="cash"
                stroke={chartConfig.cash.color}
                fill="url(#cashGradient)"
                radius={4}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </>
  );
}
