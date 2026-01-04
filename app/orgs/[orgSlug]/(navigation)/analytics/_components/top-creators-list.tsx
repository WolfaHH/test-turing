"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboard } from "@/features/dashboard/context/dashboard-context";
import { formatNumber } from "@/features/dashboard/utils/calculations";

export function TopCreatorsList() {
  const { topCreators } = useDashboard();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">
          Top 5 Créateurs par conversions
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {topCreators.map((creator, index) => (
            <div
              key={creator.creator}
              className="flex items-center justify-between gap-4 py-1"
            >
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground w-5 text-sm font-medium">
                  {index + 1}.
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{creator.creator}</span>
                  <span className="text-muted-foreground text-xs">
                    ROAS: {creator.roas.toFixed(2)}
                  </span>
                </div>
              </div>
              <span className="text-primary shrink-0 text-sm font-semibold">
                {formatNumber(creator.conversions)}
              </span>
            </div>
          ))}
          {topCreators.length === 0 && (
            <p className="text-muted-foreground py-4 text-center text-sm">
              Aucune donnée disponible
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
