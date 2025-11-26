"use client";

import { StatisticCard } from "@/components/statistic-card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, XAxis } from "recharts";

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
  { month: "July", desktop: 270, mobile: 220 },
  { month: "August", desktop: 250, mobile: 200 },
  { month: "September", desktop: 300, mobile: 230 },
  { month: "October", desktop: 320, mobile: 250 },
  { month: "November", desktop: 400, mobile: 300 },
  { month: "December", desktop: 450, mobile: 350 },
];
const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#000",
  },
  mobile: {
    label: "Mobile",
    color: "#000",
  },
} satisfies ChartConfig;

export default function Page() {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatisticCard
          title="Total Pendapatan"
          value={15750000}
          trend={10}
          description="Pendapatan bulan ini"
          subDescription="Dibandingkan bulan lalu"
        />
        <StatisticCard
          title="Pesanan Baru"
          value={89}
          trend={-5}
          description="Pesanan sebulan terakhir"
          subDescription="Semua status pesanan"
        />
        <StatisticCard
          title="Produk Terjual"
          value={247}
          trend={-56}
          description="Jumlah unit terjual bulan ini"
          subDescription="Dari semua transaksi berhasil"
        />
        <StatisticCard
          title="Produk Habis Stok"
          value={14}
          trend={15}
          description="Jumlah produk kosong"
          subDescription="Perlu segera diisi ulang"
        />
      </div>
      <div className="rounded-lg border py-4 bg-gradient-to-t bg-white flex flex-col mt-4 px-4">
        <div className="flex">
          <div className="flex-col">
            <p></p>
          </div>
          <div></div>
        </div>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <AreaChart accessibilityLayer data={chartData}>
            <defs>
              <linearGradient id="desktopGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={chartConfig.desktop.color}
                  stopOpacity={0.4}
                />
                <stop
                  offset="100%"
                  stopColor={chartConfig.desktop.color}
                  stopOpacity={0.05}
                />
              </linearGradient>
              <linearGradient id="mobileGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={chartConfig.mobile.color}
                  stopOpacity={0.4}
                />
                <stop
                  offset="100%"
                  stopColor={chartConfig.mobile.color}
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <ChartTooltip content={<ChartTooltipContent />} />
            <XAxis dataKey="month" />
            <Area
              type="monotone"
              dataKey="desktop"
              stroke={chartConfig.desktop.color}
              fill="url(#desktopGradient)"
              radius={4}
            />
            <Area
              type="monotone"
              dataKey="mobile"
              stroke={chartConfig.mobile.color}
              fill="url(#mobileGradient)"
              radius={4}
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </>
  );
}
