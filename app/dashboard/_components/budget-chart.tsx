"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useDashboard } from "@/features/dashboard/context/dashboard-context";
import { useMemo } from "react";
import { Label, Pie, PieChart } from "recharts";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function BudgetChart() {
  const { budgetByProduct } = useDashboard();

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {
      budget: {
        label: "Budget",
      },
    };
    budgetByProduct.forEach((item, index) => {
      config[item.product] = {
        label: item.product,
        color: COLORS[index % COLORS.length],
      };
    });
    return config;
  }, [budgetByProduct]);

  const chartData = useMemo(() => {
    return budgetByProduct.map((item, index) => ({
      ...item,
      fill: COLORS[index % COLORS.length],
    }));
  }, [budgetByProduct]);

  const totalBudget = useMemo(() => {
    return budgetByProduct.reduce((acc, curr) => acc + curr.budget, 0);
  }, [budgetByProduct]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget par produit</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={(props) => (
                <ChartTooltipContent
                  hideLabel
                  {...props}
                  formatter={(value) => formatCurrency(value as number)}
                />
              )}
            />
            <Pie
              data={chartData}
              dataKey="budget"
              nameKey="product"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {formatCurrency(totalBudget)}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy as number) + 24}
                          className="fill-muted-foreground text-xs"
                        >
                          Budget total
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
