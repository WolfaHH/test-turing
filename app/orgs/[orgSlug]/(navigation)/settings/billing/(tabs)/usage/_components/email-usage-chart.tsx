"use client";

import { useMemo } from "react";
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

type EmailUsageChartProps = {
  data: {
    date: string;
    emails: number;
  }[];
  totalEmails: number;
  limit: number;
  includedEmailsLimit: number;
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
};

const chartConfig = {
  includedEmails: {
    label: "Included Emails",
    color: "var(--chart-1)",
  },
  extraEmails: {
    label: "Extra Charged Emails",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function EmailUsageChart({
  data,
  totalEmails,
  limit: _limit,
  includedEmailsLimit,
  billingPeriodStart,
  billingPeriodEnd,
}: EmailUsageChartProps) {
  const formattedPeriod = `${billingPeriodStart.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })} - ${billingPeriodEnd.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;

  const transformedData = useMemo(() => {
    let cumulativeTotal = 0;

    return data.map(({ date, emails }) => {
      const previousTotal = cumulativeTotal;
      cumulativeTotal += emails;

      let includedEmails = 0;
      let extraEmails = 0;

      if (previousTotal >= includedEmailsLimit) {
        extraEmails = emails;
      } else if (cumulativeTotal <= includedEmailsLimit) {
        includedEmails = emails;
      } else {
        includedEmails = includedEmailsLimit - previousTotal;
        extraEmails = emails - includedEmails;
      }

      return {
        date,
        includedEmails,
        extraEmails,
      };
    });
  }, [data, includedEmailsLimit]);

  const totalIncluded = Math.min(totalEmails, includedEmailsLimit);
  const totalExtra = Math.max(0, totalEmails - includedEmailsLimit);

  return (
    <Card className="py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-6">
          <CardTitle>Email Usage</CardTitle>
          <CardDescription>Billing period: {formattedPeriod}</CardDescription>
        </div>
        <div className="flex">
          <div className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left sm:border-t-0 sm:border-l sm:px-8 sm:py-6">
            <Typography variant="muted" className="text-xs">
              Total Emails Sent
            </Typography>
            <Typography variant="h2" className="font-bold">
              {totalEmails.toLocaleString()}
            </Typography>
            <div className="flex flex-col gap-1 pt-1">
              <Typography variant="small" className="text-muted-foreground">
                Included: {totalIncluded.toLocaleString()}
              </Typography>
              <Typography variant="small" className="text-muted-foreground">
                Extra: {totalExtra.toLocaleString()}
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
            data={transformedData}
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
            <Bar
              dataKey="includedEmails"
              fill="var(--color-includedEmails)"
              stackId="stack"
            />
            <Bar
              dataKey="extraEmails"
              fill="var(--color-extraEmails)"
              stackId="stack"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
