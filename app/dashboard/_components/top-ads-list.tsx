"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboard } from "@/features/dashboard/context/dashboard-context";
import { formatRoas } from "@/features/dashboard/utils/calculations";
import { TrendingUp } from "lucide-react";

export function TopAdsList() {
  const { topAdsByRoas } = useDashboard();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="size-5" />
          Top 5 Créas par ROAS
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topAdsByRoas.map((ad, index) => (
            <div
              key={ad.id}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-full text-sm font-semibold">
                  {index + 1}
                </span>
                <div className="flex flex-col">
                  <span className="line-clamp-1 text-sm font-medium">
                    {ad.name}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {ad.secondaryValue}
                  </span>
                </div>
              </div>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {formatRoas(ad.value)}
              </span>
            </div>
          ))}
          {topAdsByRoas.length === 0 && (
            <p className="text-muted-foreground text-center text-sm">
              Aucune donnée disponible
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
