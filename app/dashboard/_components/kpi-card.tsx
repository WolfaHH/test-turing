import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type KPICardProps = {
  title: string;
  value: string;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
};

export function KPICard({
  title,
  value,
  icon: Icon,
  description,
  className,
}: KPICardProps) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-sm font-medium">
              {title}
            </span>
            <span className="text-2xl font-bold tracking-tight">{value}</span>
            {description && (
              <span className="text-muted-foreground text-xs">
                {description}
              </span>
            )}
          </div>
          <div className="bg-primary/10 flex size-12 items-center justify-center rounded-full">
            <Icon className="text-primary size-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
