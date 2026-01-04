"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDashboard } from "@/features/dashboard/context/dashboard-context";
import {
  formatCurrency,
  formatNumber,
  formatRoas,
} from "@/features/dashboard/utils/calculations";
import type { Advertisement } from "@/features/dashboard/types";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type SortField =
  | "name"
  | "product"
  | "roas"
  | "budget"
  | "conversions"
  | "status";
type SortDirection = "asc" | "desc";

function getStatusVariant(status: string) {
  switch (status) {
    case "En ligne":
      return "default";
    case "Arrêtée":
      return "destructive";
    case "En pause":
      return "secondary";
    case "Archivée":
      return "outline";
    default:
      return "secondary";
  }
}

function SortIcon({
  field,
  sortField,
  sortDirection,
}: {
  field: SortField;
  sortField: SortField;
  sortDirection: SortDirection;
}) {
  if (sortField !== field) {
    return <ArrowUpDown className="ml-1 inline size-4 opacity-50" />;
  }
  return sortDirection === "asc" ? (
    <ArrowUp className="ml-1 inline size-4" />
  ) : (
    <ArrowDown className="ml-1 inline size-4" />
  );
}

export function CreasTable() {
  const { filteredAds } = useDashboard();
  const [sortField, setSortField] = useState<SortField>("roas");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedAds = [...filteredAds].sort((a, b) => {
    const getValue = (ad: Advertisement, field: SortField) => {
      switch (field) {
        case "name":
          return ad.name;
        case "product":
          return ad.product;
        case "roas":
          return ad.roas;
        case "budget":
          return ad.budget;
        case "conversions":
          return ad.conversions;
        case "status":
          return ad.status;
        default:
          return ad.roas;
      }
    };

    const aValue = getValue(a, sortField);
    const bValue = getValue(b, sortField);

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="hover:bg-muted/50 cursor-pointer"
              onClick={() => handleSort("name")}
            >
              Nom de la créa
              <SortIcon
                field="name"
                sortField={sortField}
                sortDirection={sortDirection}
              />
            </TableHead>
            <TableHead
              className="hover:bg-muted/50 cursor-pointer"
              onClick={() => handleSort("product")}
            >
              Produit
              <SortIcon
                field="product"
                sortField={sortField}
                sortDirection={sortDirection}
              />
            </TableHead>
            <TableHead>Créateur</TableHead>
            <TableHead>Type</TableHead>
            <TableHead
              className="hover:bg-muted/50 cursor-pointer text-right"
              onClick={() => handleSort("roas")}
            >
              ROAS
              <SortIcon
                field="roas"
                sortField={sortField}
                sortDirection={sortDirection}
              />
            </TableHead>
            <TableHead
              className="hover:bg-muted/50 cursor-pointer text-right"
              onClick={() => handleSort("budget")}
            >
              Budget
              <SortIcon
                field="budget"
                sortField={sortField}
                sortDirection={sortDirection}
              />
            </TableHead>
            <TableHead
              className="hover:bg-muted/50 cursor-pointer text-right"
              onClick={() => handleSort("conversions")}
            >
              Conversions
              <SortIcon
                field="conversions"
                sortField={sortField}
                sortDirection={sortDirection}
              />
            </TableHead>
            <TableHead
              className="hover:bg-muted/50 cursor-pointer"
              onClick={() => handleSort("status")}
            >
              Statut
              <SortIcon
                field="status"
                sortField={sortField}
                sortDirection={sortDirection}
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedAds.map((ad) => (
            <TableRow key={ad.id}>
              <TableCell>
                <Link
                  href={`/dashboard/creas/${ad.id}`}
                  className="hover:text-primary line-clamp-1 max-w-[300px] font-medium hover:underline"
                >
                  {ad.name}
                </Link>
              </TableCell>
              <TableCell>{ad.product}</TableCell>
              <TableCell>{ad.creator}</TableCell>
              <TableCell>{ad.contentType}</TableCell>
              <TableCell className="text-right font-medium">
                {formatRoas(ad.roas)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(ad.budget)}
              </TableCell>
              <TableCell className="text-right">
                {formatNumber(ad.conversions)}
              </TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(ad.status)}>{ad.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
          {sortedAds.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                Aucune créa trouvée
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
