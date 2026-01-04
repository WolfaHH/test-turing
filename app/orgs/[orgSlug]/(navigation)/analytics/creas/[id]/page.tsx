"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  DollarSign,
  ExternalLink,
  MousePointer,
  MousePointerClick,
  Receipt,
  ShoppingCart,
  Target,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDashboard } from "@/features/dashboard/context/dashboard-context";
import {
  formatCurrency,
  formatCurrencyFull,
  formatNumber,
  formatNumberFull,
  formatPercent,
  formatRoas,
} from "@/features/dashboard/utils/calculations";
import { getProductIcon } from "@/features/dashboard/utils/product-icons";

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

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-12 w-80" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  exactValue,
  icon: Icon,
}: {
  label: string;
  value: string;
  exactValue?: string;
  icon: LucideIcon;
}) {
  const content = (
    <Card className="hover:bg-muted/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              {label}
            </span>
            <span className="text-xl font-semibold tabular-nums">{value}</span>
          </div>
          <Icon className="text-primary size-4" />
        </div>
      </CardContent>
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

export default function CreaDetailPage() {
  const params = useParams();
  const orgSlug = params.orgSlug as string;
  const { getAdById, isLoading, error } = useDashboard();

  const ad = getAdById(params.id as string);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-destructive">Erreur: {error}</p>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/orgs/${orgSlug}/analytics/creas`}>
            <ArrowLeft className="mr-2 size-4" />
            Retour
          </Link>
        </Button>
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Créa non trouvée</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2" asChild>
        <Link href={`/orgs/${orgSlug}/analytics/creas`}>
          <ArrowLeft className="mr-2 size-4" />
          Retour
        </Link>
      </Button>

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-xl font-semibold">{ad.name}</h1>
          {(() => {
            const icon = getProductIcon(ad.product);
            return (
              <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-sm">
                {icon && (
                  <Image
                    src={icon}
                    alt=""
                    width={16}
                    height={16}
                    className="size-4 object-contain"
                  />
                )}
                {ad.product} · {ad.creator}
              </p>
            );
          })()}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant={getStatusVariant(ad.status)}>{ad.status}</Badge>
            <Badge variant="outline">{ad.contentType}</Badge>
          </div>
        </div>
        {ad.previewLink && ad.previewLink !== "—" && (
          <Button variant="outline" size="sm" asChild>
            <a href={ad.previewLink} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 size-4" />
              Voir la créa
            </a>
          </Button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="ROAS"
          value={formatRoas(ad.roas)}
          icon={TrendingUp}
        />
        <MetricCard
          label="Budget"
          value={formatCurrency(ad.budget)}
          exactValue={formatCurrencyFull(ad.budget)}
          icon={DollarSign}
        />
        <MetricCard
          label="Conversions"
          value={formatNumber(ad.conversions)}
          exactValue={formatNumberFull(ad.conversions)}
          icon={ShoppingCart}
        />
        <MetricCard
          label="Coût / conv."
          value={formatCurrency(ad.costPerConversion)}
          exactValue={formatCurrencyFull(ad.costPerConversion)}
          icon={Target}
        />
        <MetricCard
          label="Impressions"
          value={formatNumber(ad.impressions)}
          exactValue={formatNumberFull(ad.impressions)}
          icon={BarChart3}
        />
        <MetricCard
          label="CTR"
          value={formatPercent(ad.ctr)}
          icon={MousePointerClick}
        />
        <MetricCard
          label="Revenus"
          value={formatCurrency(ad.revenue)}
          exactValue={formatCurrencyFull(ad.revenue)}
          icon={Receipt}
        />
        <MetricCard
          label="Clics"
          value={formatNumber(ad.clicks)}
          exactValue={formatNumberFull(ad.clicks)}
          icon={MousePointer}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">
              Informations
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between py-1">
                <dt className="text-muted-foreground">Créateur</dt>
                <dd className="font-medium">{ad.creator}</dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="text-muted-foreground">Angle marketing</dt>
                <dd className="max-w-[180px] truncate font-medium">
                  {ad.marketingAngle}
                </dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="text-muted-foreground">Hook</dt>
                <dd className="max-w-[180px] truncate font-medium">
                  {ad.hook}
                </dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="text-muted-foreground">Audience</dt>
                <dd className="font-medium">{ad.audience}</dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="text-muted-foreground">Mois</dt>
                <dd className="font-medium">{ad.month}</dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="text-muted-foreground">Campagne</dt>
                <dd className="max-w-[180px] truncate font-medium">
                  {ad.campaignName}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">
              Métriques détaillées
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between py-1">
                <dt className="text-muted-foreground">Impressions</dt>
                <dd className="font-medium">{formatNumber(ad.impressions)}</dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="text-muted-foreground">Clics</dt>
                <dd className="font-medium">{formatNumber(ad.clicks)}</dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="text-muted-foreground">Fréquence</dt>
                <dd className="font-medium">{ad.frequency.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="text-muted-foreground">CPM</dt>
                <dd className="font-medium">{formatCurrency(ad.cpm)}</dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="text-muted-foreground">CPC</dt>
                <dd className="font-medium">{formatCurrency(ad.cpc)}</dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="text-muted-foreground">Taux de conversion</dt>
                <dd className="font-medium">
                  {formatPercent(ad.conversionRate)}
                </dd>
              </div>
              {ad.hookRate !== null && (
                <div className="flex justify-between py-1">
                  <dt className="text-muted-foreground">Hook Rate</dt>
                  <dd className="font-medium">{formatPercent(ad.hookRate)}</dd>
                </div>
              )}
              <div className="flex justify-between py-1">
                <dt className="text-muted-foreground">Panier moyen</dt>
                <dd className="font-medium">
                  {formatCurrency(ad.averageBasket)}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
