"use client";

import Image from "next/image";
import { useMemo } from "react";
import { Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import { useDashboard } from "@/features/dashboard/context/dashboard-context";
import { formatCurrency } from "@/features/dashboard/utils/calculations";
import { getProductIcon } from "@/features/dashboard/utils/product-icons";

// Chart-1 color with decreasing opacity for cohesive gradient
const getChartColor = (index: number, total: number) => {
  const baseOpacity = 1;
  const minOpacity = 0.35;
  const step = (baseOpacity - minOpacity) / Math.max(total - 1, 1);
  const opacity = baseOpacity - index * step;
  // Use chart-1 base color (oklch 0.5583 0.1276 42.9956) with opacity
  return `oklch(0.5583 0.1276 42.9956 / ${opacity.toFixed(2)})`;
};

export function BudgetChart() {
  const { budgetByProduct } = useDashboard();

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {
      budget: {
        label: "Budget",
      },
    };
    const total = budgetByProduct.length;
    budgetByProduct.forEach((item, index) => {
      config[item.product] = {
        label: item.product,
        color: getChartColor(index, total),
      };
    });
    return config;
  }, [budgetByProduct]);

  const chartData = useMemo(() => {
    const total = budgetByProduct.length;
    return budgetByProduct.map((item, index) => ({
      ...item,
      fill: getChartColor(index, total),
    }));
  }, [budgetByProduct]);

  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader>
        <CardTitle>Budget par produit</CardTitle>
        <CardDescription>
          Répartition des dépenses publicitaires
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 p-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-square w-full max-w-[180px] sm:max-w-[220px]"
        >
          <PieChart>
            <ChartTooltip
              content={(props) => {
                const firstPayload = props.payload;
                if (firstPayload.length === 0) return null;
                const payload = firstPayload[0];
                if (!payload.payload) return null;
                const product = payload.payload.product as string;
                const budget = payload.payload.budget as number;
                const icon = getProductIcon(product);
                return (
                  <div className="bg-background border-border flex items-center gap-2 rounded-md border px-3 py-2 shadow-md">
                    {icon && (
                      <Image
                        src={icon}
                        alt=""
                        width={20}
                        height={20}
                        className="size-5 object-contain"
                      />
                    )}
                    <span className="font-medium">{product}</span>
                    <span className="text-muted-foreground">
                      {formatCurrency(budget)}
                    </span>
                  </div>
                );
              }}
            />
            <Pie
              data={chartData}
              dataKey="budget"
              nameKey="product"
              innerRadius={50}
              strokeWidth={2}
              stroke="hsl(var(--background))"
            />
          </PieChart>
        </ChartContainer>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
          {chartData.map((item) => {
            const icon = getProductIcon(item.product);
            return (
              <div key={item.product} className="flex items-center gap-1.5">
                <div
                  className="size-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: item.fill }}
                />
                {icon && (
                  <Image
                    src={icon}
                    alt=""
                    width={14}
                    height={14}
                    className="size-3.5 shrink-0 object-contain"
                  />
                )}
                <span className="text-muted-foreground text-xs">
                  {item.product}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
