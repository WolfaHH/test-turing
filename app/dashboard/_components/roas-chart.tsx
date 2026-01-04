"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useDashboard } from "@/features/dashboard/context/dashboard-context";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

const chartConfig = {
  roas: {
    label: "ROAS",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function RoasChart() {
  const { roasByMonth } = useDashboard();

  return (
    <Card>
      <CardHeader>
        <CardTitle>ROAS par mois</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer className="h-[300px] w-full" config={chartConfig}>
          <BarChart data={roasByMonth} margin={{ left: 12, right: 12 }}>
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${value.toFixed(1)}`}
            />
            <ChartTooltip
              cursor={{ fill: "var(--muted)", opacity: 0.3 }}
              content={(props) => (
                <ChartTooltipContent
                  {...props}
                  formatter={(value) => `${(value as number).toFixed(2)}`}
                />
              )}
            />
            <Bar
              dataKey="roas"
              fill="var(--color-roas)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
