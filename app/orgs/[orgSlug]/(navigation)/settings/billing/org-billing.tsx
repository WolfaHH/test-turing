"use client";

import { Typography } from "@/components/nowts/typography";
import { Button } from "@/components/ui/button";
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
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingButton } from "@/features/form/submit-button";
import {
  Layout,
  LayoutActions,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import { Pricing } from "@/features/plans/pricing-section";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { LIMITS_CONFIG, getPlanLimits } from "@/lib/auth/stripe/auth-plans";
import type { CurrentOrgPayload } from "@/lib/organizations/get-org";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { dayjs } from "@/lib/dayjs";
import {
  AlertCircle,
  ArrowUpCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { toast } from "sonner";
import { openStripePortalAction } from "./billing.action";

type Invoice = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  description: string;
  invoicePdf: string | null;
};

export function OrgBilling(props: {
  subscription: CurrentOrgPayload["subscription"];
  orgId: string;
  orgSlug: string;
  invoices: Invoice[];
}) {
  const subscription = props.subscription;
  const router = useRouter();

  const planLimits = getPlanLimits(subscription?.plan);

  const fakeUsage = useMemo(
    () => ({
      projects: Math.floor(planLimits.projects * 0.6),
      storage: Math.floor(planLimits.storage * 0.45),
      members: Math.floor(planLimits.members * 0.8),
    }),
    [planLimits],
  );

  const usageChartData = useMemo(
    () => [
      { month: "Jan", projects: 2, storage: 3, members: 1 },
      { month: "Feb", projects: 3, storage: 4, members: 2 },
      { month: "Mar", projects: 4, storage: 5, members: 2 },
      { month: "Apr", projects: 5, storage: 6, members: 3 },
      { month: "May", projects: 5, storage: 7, members: 3 },
      {
        month: "Jun",
        projects: fakeUsage.projects,
        storage: fakeUsage.storage,
        members: fakeUsage.members,
      },
    ],
    [fakeUsage],
  );

  const usageChartConfig = {
    projects: {
      label: "Projects",
      color: "var(--chart-1)",
    },
    storage: {
      label: "Storage (GB)",
      color: "var(--chart-2)",
    },
    members: {
      label: "Members",
      color: "var(--chart-3)",
    },
  } satisfies ChartConfig;

  const manageSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const stripeCustomerId = subscription?.stripeCustomerId;

      if (!stripeCustomerId) {
        throw new Error("No stripe customer id found");
      }

      const stripeBilling = await resolveActionResult(openStripePortalAction());

      router.push(stripeBilling.url);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const statusConfig = subscription
    ? STATUS_CONFIG[subscription.status as keyof typeof STATUS_CONFIG]
    : null;
  const StatusIcon = statusConfig?.icon;

  const daysRemaining =
    subscription?.status === "trialing"
      ? dayjs(subscription.periodEnd ?? new Date()).diff(dayjs(), "day")
      : 0;

  const trialProgress =
    subscription?.status === "trialing" ? 100 - (daysRemaining / 14) * 100 : 0;

  const hasPaidSubscription = !!subscription;

  return (
    <Layout size="lg">
      <LayoutHeader>
        <LayoutTitle>Billing</LayoutTitle>
      </LayoutHeader>
      <LayoutActions>
        {hasPaidSubscription && (
          <>
            <LoadingButton
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => manageSubscriptionMutation.mutate()}
              loading={manageSubscriptionMutation.isPending}
            >
              <ArrowUpCircle className="mr-2 size-4" />
              Manage Subscription
            </LoadingButton>

            {subscription.status === "trialing" ? null : subscription.status ===
              "active" ? (
              <>
                {!subscription.cancelAtPeriodEnd && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      router.push(
                        `/orgs/${props.orgSlug}/settings/billing/cancel`,
                      )
                    }
                  >
                    <XCircle className="mr-2 size-4" />
                    Cancel Subscription
                  </Button>
                )}
              </>
            ) : (
              <Button className="w-full sm:w-auto">
                <CreditCard className="mr-2 size-4" />
                Reactivate Subscription
              </Button>
            )}
          </>
        )}
      </LayoutActions>
      <LayoutContent>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            {hasPaidSubscription && (
              <TabsTrigger value="payments">Payments</TabsTrigger>
            )}
            <TabsTrigger value="plans">Plans</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="flex flex-col gap-6">
            {hasPaidSubscription && statusConfig && StatusIcon && (
              <Card>
                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                  <StatusIcon
                    className={cn("size-5", statusConfig.textColor)}
                  />
                  <CardTitle>{statusConfig.description}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {subscription.status === "trialing" && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <Typography>
                          Trial period: {daysRemaining} days remaining
                        </Typography>
                      </div>
                      <Progress value={trialProgress} className="h-2" />
                    </div>
                  )}
                  {subscription.cancelAtPeriodEnd && (
                    <Typography variant="muted">
                      Your subscription will end on{" "}
                      {dayjs(subscription.periodEnd ?? new Date()).format(
                        "MMMM D, YYYY",
                      )}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>
                  {subscription
                    ? `You are on the ${subscription.plan} plan`
                    : "Upgrade to unlock all features"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ItemGroup>
                  {Object.entries(planLimits).map(([key, total]) => {
                    const limitConfig =
                      LIMITS_CONFIG[key as keyof typeof LIMITS_CONFIG];
                    const Icon = limitConfig.icon;
                    const used = fakeUsage[key as keyof typeof fakeUsage];
                    const percentage = (used / total) * 100;

                    return (
                      <Item key={key} variant="outline">
                        <ItemMedia variant="icon">
                          <Icon />
                        </ItemMedia>
                        <ItemContent>
                          <ItemTitle>{limitConfig.getLabel(total)}</ItemTitle>
                          <ItemDescription>
                            {limitConfig.description} • {used.toLocaleString()}{" "}
                            / {total.toLocaleString()} used
                          </ItemDescription>
                          <Progress value={percentage} className="h-1" />
                        </ItemContent>
                      </Item>
                    );
                  })}
                </ItemGroup>
              </CardContent>
            </Card>

            {hasPaidSubscription && (
              <Card>
                <CardHeader>
                  <CardTitle>Usage Trends</CardTitle>
                  <CardDescription>
                    Your resource usage over the last 6 months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={usageChartConfig}>
                    <AreaChart
                      data={usageChartData}
                      margin={{ left: 12, right: 12 }}
                    >
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={(props) => (
                          <ChartTooltipContent {...props} indicator="dot" />
                        )}
                      />
                      <Area
                        dataKey="projects"
                        type="natural"
                        fill="var(--color-projects)"
                        fillOpacity={0.4}
                        stroke="var(--color-projects)"
                        stackId="a"
                      />
                      <Area
                        dataKey="storage"
                        type="natural"
                        fill="var(--color-storage)"
                        fillOpacity={0.4}
                        stroke="var(--color-storage)"
                        stackId="a"
                      />
                      <Area
                        dataKey="members"
                        type="natural"
                        fill="var(--color-members)"
                        fillOpacity={0.4}
                        stroke="var(--color-members)"
                        stackId="a"
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="usage" className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Resource Usage</CardTitle>
                <CardDescription>
                  Detailed breakdown of your current usage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ItemGroup>
                  {Object.entries(planLimits).map(([key, total]) => {
                    const limitConfig =
                      LIMITS_CONFIG[key as keyof typeof LIMITS_CONFIG];
                    const Icon = limitConfig.icon;
                    const used = fakeUsage[key as keyof typeof fakeUsage];
                    const percentage = (used / total) * 100;
                    const remaining = total - used;

                    return (
                      <Item key={key} variant="muted">
                        <ItemMedia variant="icon">
                          <Icon />
                        </ItemMedia>
                        <ItemContent>
                          <ItemTitle>{limitConfig.getLabel(total)}</ItemTitle>
                          <ItemDescription>
                            {used.toLocaleString()} used •{" "}
                            {remaining.toLocaleString()} remaining
                          </ItemDescription>
                          <Progress value={percentage} className="h-2" />
                        </ItemContent>
                      </Item>
                    );
                  })}
                </ItemGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Over Time</CardTitle>
                <CardDescription>
                  Track how your usage has changed over the past 6 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={usageChartConfig}>
                  <AreaChart
                    data={usageChartData}
                    margin={{ left: 12, right: 12 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <ChartTooltip
                      content={(props) => (
                        <ChartTooltipContent {...props} indicator="line" />
                      )}
                    />
                    <Area
                      dataKey="projects"
                      type="monotone"
                      fill="var(--color-projects)"
                      fillOpacity={0.4}
                      stroke="var(--color-projects)"
                    />
                    <Area
                      dataKey="storage"
                      type="monotone"
                      fill="var(--color-storage)"
                      fillOpacity={0.4}
                      stroke="var(--color-storage)"
                    />
                    <Area
                      dataKey="members"
                      type="monotone"
                      fill="var(--color-members)"
                      fillOpacity={0.4}
                      stroke="var(--color-members)"
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {hasPaidSubscription && (
            <TabsContent value="payments" className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>
                    View all your invoices and payment records
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {props.invoices.length === 0 ? (
                    <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-8 text-center">
                      <CreditCard className="size-8" />
                      <Typography variant="muted">
                        No payment history available
                      </Typography>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Invoice</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {props.invoices.map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell>
                              {dayjs(invoice.created * 1000).format(
                                "MMM D, YYYY",
                              )}
                            </TableCell>
                            <TableCell>{invoice.description}</TableCell>
                            <TableCell>
                              {(invoice.amount / 100).toLocaleString("en-US", {
                                style: "currency",
                                currency: invoice.currency.toUpperCase(),
                              })}
                            </TableCell>
                            <TableCell>
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                                  invoice.status === "paid" &&
                                    "bg-green-500/10 text-green-500",
                                  invoice.status === "open" &&
                                    "bg-blue-500/10 text-blue-500",
                                  invoice.status === "void" &&
                                    "bg-gray-500/10 text-gray-500",
                                  invoice.status === "uncollectible" &&
                                    "bg-red-500/10 text-red-500",
                                )}
                              >
                                {invoice.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              {invoice.invoicePdf ? (
                                <Button variant="ghost" size="sm" asChild>
                                  <Link
                                    href={invoice.invoicePdf}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Download className="mr-2 size-4" />
                                    PDF
                                  </Link>
                                </Button>
                              ) : (
                                <Typography variant="muted">N/A</Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="plans" className="flex flex-col gap-6">
            {hasPaidSubscription && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Subscription Details</CardTitle>
                    <CardDescription>
                      Manage your current subscription
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ItemGroup>
                      <Item variant="outline">
                        <ItemContent>
                          <ItemTitle>Plan</ItemTitle>
                          <ItemDescription className="capitalize">
                            {subscription.plan}
                          </ItemDescription>
                        </ItemContent>
                      </Item>
                      <Item variant="outline">
                        <ItemContent>
                          <ItemTitle>Start date</ItemTitle>
                          <ItemDescription>
                            {dayjs(
                              subscription.periodStart ?? new Date(),
                            ).format("MMMM D, YYYY")}
                          </ItemDescription>
                        </ItemContent>
                      </Item>
                      <Item variant="outline">
                        <ItemContent>
                          <ItemTitle>Renew at</ItemTitle>
                          <ItemDescription>
                            {dayjs(subscription.periodEnd ?? new Date()).format(
                              "MMMM D, YYYY",
                            )}
                          </ItemDescription>
                        </ItemContent>
                      </Item>
                    </ItemGroup>
                  </CardContent>
                </Card>

                <Separator />
              </>
            )}

            <Card>
              <CardHeader>
                <CardTitle>
                  {hasPaidSubscription ? "Change Plan" : "Choose a Plan"}
                </CardTitle>
                <CardDescription>
                  {hasPaidSubscription
                    ? "Upgrade or downgrade your subscription"
                    : "Select the perfect plan for your needs"}
                </CardDescription>
              </CardHeader>
            </Card>

            <Pricing />
          </TabsContent>
        </Tabs>
      </LayoutContent>
    </Layout>
  );
}

const STATUS_CONFIG = {
  trialing: {
    label: "Trial",
    description: "Your free trial is active",
    color: "bg-blue-500",
    textColor: "text-blue-500",
    icon: Clock,
  },
  active: {
    label: "Active",
    description: "Your subscription is active",
    color: "bg-green-500",
    textColor: "text-green-500",
    icon: CheckCircle2,
  },
  canceled: {
    label: "Canceled",
    description: "Your subscription has been canceled",
    color: "bg-orange-500",
    textColor: "text-orange-500",
    icon: XCircle,
  },
  past_due: {
    label: "Past Due",
    description: "Your payment is past due",
    color: "bg-red-500",
    textColor: "text-red-500",
    icon: AlertCircle,
  },
  unpaid: {
    label: "Unpaid",
    description: "Your subscription is unpaid",
    color: "bg-red-500",
    textColor: "text-red-500",
    icon: AlertCircle,
  },
  incomplete: {
    label: "Incomplete",
    description: "Your subscription setup is incomplete",
    color: "bg-yellow-500",
    textColor: "text-yellow-500",
    icon: AlertCircle,
  },
};
