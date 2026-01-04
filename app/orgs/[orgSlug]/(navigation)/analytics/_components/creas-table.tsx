"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { getProductIcon } from "@/features/dashboard/utils/product-icons";
import type { Advertisement } from "@/features/dashboard/types";

const PAGE_SIZE_OPTIONS = [25, 50, 100] as const;

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
  const params = useParams();
  const orgSlug = params.orgSlug as string;
  const { filteredAds } = useDashboard();
  const [sortField, setSortField] = useState<SortField>("roas");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(25);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
    setCurrentPage(1); // Reset to first page on sort change
  };

  const sortedAds = useMemo(() => {
    return [...filteredAds].sort((a, b) => {
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
  }, [filteredAds, sortField, sortDirection]);

  // Pagination calculations
  const totalItems = sortedAds.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  // Clamp current page to valid range (handles when filters reduce total pages)
  const effectivePage = Math.min(currentPage, Math.max(1, totalPages));
  const startIndex = (effectivePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedAds = sortedAds.slice(startIndex, endIndex);

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10">
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
            {paginatedAds.map((ad, index) => (
              <TableRow
                key={ad.id}
                className={index % 2 === 0 ? "bg-muted/30" : ""}
              >
                <TableCell>
                  <Link
                    href={`/orgs/${orgSlug}/analytics/creas/${ad.id}`}
                    className="hover:text-primary line-clamp-1 max-w-[300px] font-medium hover:underline"
                  >
                    {ad.name}
                  </Link>
                </TableCell>
                <TableCell>
                  {(() => {
                    const icon = getProductIcon(ad.product);
                    return (
                      <span className="flex items-center gap-2">
                        {icon && (
                          <Image
                            src={icon}
                            alt=""
                            width={16}
                            height={16}
                            className="size-4 object-contain"
                          />
                        )}
                        {ad.product}
                      </span>
                    );
                  })()}
                </TableCell>
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
                  <Badge variant={getStatusVariant(ad.status)}>
                    {ad.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {paginatedAds.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Aucune créa trouvée
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalItems > 0 && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-muted-foreground text-sm">
            {startIndex + 1}-{endIndex} sur {totalItems} créas
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">Par page:</span>
              <Select
                value={String(pageSize)}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => setCurrentPage(effectivePage - 1)}
                disabled={effectivePage <= 1}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="text-muted-foreground min-w-[80px] text-center text-sm">
                Page {effectivePage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => setCurrentPage(effectivePage + 1)}
                disabled={effectivePage >= totalPages}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
