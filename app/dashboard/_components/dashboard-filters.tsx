"use client";

import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDashboard } from "@/features/dashboard/context/dashboard-context";

type DashboardFiltersProps = {
  showSearch?: boolean;
  showCreator?: boolean;
  showContentType?: boolean;
};

export function DashboardFilters({
  showSearch = false,
  showCreator = false,
  showContentType = false,
}: DashboardFiltersProps) {
  const { filters, updateFilter, resetFilters, filterOptions } = useDashboard();

  const hasActiveFilters =
    filters.product ||
    filters.creator ||
    filters.contentType ||
    filters.month ||
    filters.status ||
    filters.search;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Product Filter */}
      <Select
        value={filters.product ?? "all"}
        onValueChange={(value) =>
          updateFilter("product", value === "all" ? null : value)
        }
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Produit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les produits</SelectItem>
          {filterOptions.products.map((product) => (
            <SelectItem key={product} value={product}>
              {product}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Month Filter */}
      <Select
        value={filters.month ?? "all"}
        onValueChange={(value) =>
          updateFilter("month", value === "all" ? null : value)
        }
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Mois" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les mois</SelectItem>
          {filterOptions.months.map((month) => (
            <SelectItem key={month} value={month}>
              {month}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select
        value={filters.status ?? "all"}
        onValueChange={(value) =>
          updateFilter("status", value === "all" ? null : value)
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les statuts</SelectItem>
          {filterOptions.statuses.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Creator Filter (optional) */}
      {showCreator && (
        <Select
          value={filters.creator ?? "all"}
          onValueChange={(value) =>
            updateFilter("creator", value === "all" ? null : value)
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Créateur" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les créateurs</SelectItem>
            {filterOptions.creators.map((creator) => (
              <SelectItem key={creator} value={creator}>
                {creator}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Content Type Filter (optional) */}
      {showContentType && (
        <Select
          value={filters.contentType ?? "all"}
          onValueChange={(value) =>
            updateFilter("contentType", value === "all" ? null : value)
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {filterOptions.contentTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Search Input (optional) */}
      {showSearch && (
        <div className="relative min-w-[200px] flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Rechercher..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {/* Reset Button */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={resetFilters}>
          <X className="mr-1 size-4" />
          Réinitialiser
        </Button>
      )}
    </div>
  );
}
