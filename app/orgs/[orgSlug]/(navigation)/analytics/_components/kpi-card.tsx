"use client";

import type { LucideIcon } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type KPICardProps = {
  title: string;
  value: string;
  exactValue?: string;
  icon: LucideIcon;
  description?: string;
  className?: string;
};

export function KPICard({
  title,
  value,
  exactValue,
  icon: Icon,
  description,
  className,
}: KPICardProps) {
  const content = (
    <Card className={cn("@container/card", className)}>
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center justify-between">
          <span>{title}</span>
          <Icon className="text-primary size-4" />
        </CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[200px]/card:text-3xl">
          {value}
        </CardTitle>
        {description && (
          <p className="text-muted-foreground text-xs">{description}</p>
        )}
      </CardHeader>
    </Card>
  );

  if (exactValue) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent>
          <p className="font-mono text-sm">{exactValue}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}
