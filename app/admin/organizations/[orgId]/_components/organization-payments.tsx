"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { dayjs } from "@/lib/dayjs";
import { upfetch } from "@/lib/up-fetch";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, DollarSign } from "lucide-react";
import { z } from "zod";

const PaymentSchema = z.object({
  id: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: z.string(),
  created: z.number(),
  description: z.string(),
  invoice: z
    .object({
      invoice_pdf: z.string().optional(),
    })
    .optional(),
});

export function OrganizationPayments({
  organizationId,
}: {
  organizationId: string;
}) {
  const { data: payments = [], isLoading: loading } = useQuery({
    queryKey: ["admin", "organization-payments", organizationId],
    queryFn: async () => {
      const data = await upfetch(
        `/api/admin/organizations/${organizationId}/payments`,
        {
          schema: z.object({ payments: z.array(PaymentSchema) }),
        },
      );
      return data.payments;
    },
  });

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "succeeded":
        return "default";
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading payments...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment History ({payments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Invoice</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  {dayjs(payment.created * 1000).format("MMM DD, YYYY")}
                </TableCell>
                <TableCell>
                  <div className="font-medium">{payment.description}</div>
                  <div className="text-muted-foreground text-sm">
                    {payment.id}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <DollarSign className="text-muted-foreground h-4 w-4" />
                    <span className="font-medium">
                      {formatAmount(payment.amount, payment.currency)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(payment.status)}>
                    {payment.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {payment.invoice?.invoice_pdf ? (
                    <a
                      href={payment.invoice.invoice_pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary text-sm hover:underline"
                    >
                      View Invoice
                    </a>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {payments.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No payments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
