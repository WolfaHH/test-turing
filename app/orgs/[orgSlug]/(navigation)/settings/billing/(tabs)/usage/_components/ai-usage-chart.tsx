"use client";

import { Typography } from "@/components/nowts/typography";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

type AiUsageChartProps = {
  data: {
    date: string;
    credits: number;
  }[];
  totalCredits: number;
  limit: number;
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
};

const chartConfig = {
  credits: {
    label: "AI Credits",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export function AiUsageChart({
  data,
  totalCredits,
  limit,
  billingPeriodStart,
  billingPeriodEnd,
}: AiUsageChartProps) {
  const formattedPeriod = `${billingPeriodStart.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })} - ${billingPeriodEnd.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;

  return (
    <Card className="py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-6">
          <CardTitle>AI Credits Usage</CardTitle>
          <CardDescription>Billing period: {formattedPeriod}</CardDescription>
        </div>
        <div className="flex">
          <div className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left sm:border-t-0 sm:border-l sm:px-8 sm:py-6">
            <Typography variant="muted" className="text-xs">
              Total Credits Used
            </Typography>
            <Typography variant="h2" className="font-bold">
              {totalCredits.toLocaleString()}
            </Typography>
            <div className="flex flex-col gap-1 pt-1">
              <Typography variant="small" className="text-muted-foreground">
                Limit: {limit.toLocaleString()}
              </Typography>
              <Typography variant="small" className="text-muted-foreground">
                Remaining: {Math.max(0, limit - totalCredits).toLocaleString()}
              </Typography>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              content={(props) => <ChartTooltipContent {...props} />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="credits" fill="var(--color-credits)" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
