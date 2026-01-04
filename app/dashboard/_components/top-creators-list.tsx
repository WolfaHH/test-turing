"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboard } from "@/features/dashboard/context/dashboard-context";
import { formatNumber } from "@/features/dashboard/utils/calculations";
import { Users } from "lucide-react";

export function TopCreatorsList() {
  const { topCreators } = useDashboard();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="size-5" />
          Top 5 Créateurs par conversions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topCreators.map((creator, index) => (
            <div
              key={creator.creator}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-full text-sm font-semibold">
                  {index + 1}
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{creator.creator}</span>
                  <span className="text-muted-foreground text-xs">
                    ROAS: {creator.roas.toFixed(2)}
                  </span>
                </div>
              </div>
              <span className="font-semibold">
                {formatNumber(creator.conversions)} conv.
              </span>
            </div>
          ))}
          {topCreators.length === 0 && (
            <p className="text-muted-foreground text-center text-sm">
              Aucune donnée disponible
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
