"use client";

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
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useDashboard } from "@/features/dashboard/context/dashboard-context";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";

const chartConfig = {
  roas: {
    label: "ROAS",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function RoasChart() {
  const { roasByMonth } = useDashboard();

  // Format ROAS values for display
  const chartData = useMemo(() => {
    return roasByMonth.map((item) => ({
      ...item,
      roasFormatted: item.roas.toFixed(2),
    }));
  }, [roasByMonth]);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>ROAS par mois</CardTitle>
        <CardDescription>
          Évolution de la rentabilité publicitaire
        </CardDescription>
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        <ChartContainer
          className="h-[200px] w-full sm:h-[280px]"
          config={chartConfig}
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 24, left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={(props) => (
                <ChartTooltipContent
                  {...props}
                  hideLabel
                  formatter={(value) => (value as number).toFixed(2)}
                />
              )}
            />
            <Bar dataKey="roas" fill="var(--color-roas)" radius={8}>
              <LabelList
                dataKey="roasFormatted"
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
