"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboard } from "@/features/dashboard/context/dashboard-context";
import { formatRoas } from "@/features/dashboard/utils/calculations";

export function TopAdsList() {
  const { topAdsByRoas } = useDashboard();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">
          Top 5 Créas par ROAS
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {topAdsByRoas.map((ad, index) => (
            <div
              key={ad.id}
              className="flex items-center justify-between gap-4 py-1"
            >
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground w-5 text-sm font-medium">
                  {index + 1}.
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
              <span className="text-primary shrink-0 text-sm font-semibold">
                {formatRoas(ad.value)}
              </span>
            </div>
          ))}
          {topAdsByRoas.length === 0 && (
            <p className="text-muted-foreground py-4 text-center text-sm">
              Aucune donnée disponible
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
