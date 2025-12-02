import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp } from "lucide-react";

export function StatisticCard({
  title,
  value,
  trend,
  description,
  subDescription,
}: {
  title: string;
  value: number | string;
  trend: number;
  description: string;
  subDescription: string;
}) {
  return (
    <>
      <div className="w-full">
        <div className="rounded-lg border py-4 bg-gradient-to-t from-primary/10 to-white flex-1 h-full flex flex-col">
          <div className="flex justify-between items-center">
            <p className="px-4 py-2 text-sm text-gray-700">{title}</p>
            <Badge className={"mx-4 text-black"} variant="outline">
              {trend >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              &nbsp;
              <p>
                {trend > 0 ? "+" : ""}
                {trend}%
              </p>
            </Badge>
          </div>
          <p className="px-4 py-2 text-black font-bold text-3xl flex-grow">
            {typeof value === "number" && value > 10000
              ? `Rp${value.toLocaleString("id-ID")}`
              : `${value}`}
          </p>
          <div className="px-4 mt-auto">
            <p className="text-black text-sm mt-4 font-medium">{description}</p>
            <p className="text-gray-700 text-sm mt-1">{subDescription}</p>
          </div>
        </div>
      </div>
    </>
  );
}
