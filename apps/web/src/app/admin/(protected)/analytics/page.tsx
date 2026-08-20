import Link from "next/link";
import { Eye, MousePointerClick, Percent, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { serverApiFetch } from "@/lib/api-server";

interface AnalyticsSummary {
  range: string;
  totalViews: number;
  totalClicks: number;
  clickThroughRate: number;
  topLinks: Array<{ linkId: string; title: string; clicks: number }>;
}

interface AnalyticsInsights {
  insights: string[];
}

const RANGES = [
  { value: "1d", label: "24h" },
  { value: "7d", label: "7 días" },
  { value: "30d", label: "30 días" },
  { value: "90d", label: "90 días" },
];

interface AnalyticsPageProps {
  searchParams: Promise<{ range?: string }>;
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const { range = "7d" } = await searchParams;
  const [summary, insights] = await Promise.all([
    serverApiFetch<AnalyticsSummary>(`/admin/analytics/summary?range=${range}`),
    // Nunca debería fallar (siempre tiene fallback por reglas), pero si
    // igual pasa algo raro no vale la pena romper toda la página por esto.
    serverApiFetch<AnalyticsInsights>(`/admin/analytics/insights?range=${range}`).catch(() => null),
  ]);

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 px-1 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-semibold">Analítica</h1>
        <div className="glass flex gap-1 rounded-xl p-1">
          {RANGES.map((r) => (
            <Link
              key={r.value}
              href={`/admin/analytics?range=${r.value}`}
              className={cn(
                "rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors",
                range === r.value
                  ? "bg-gradient-aura text-white shadow-[0_2px_12px_rgba(124,58,237,0.4)]"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {r.label}
            </Link>
          ))}
        </div>
      </div>

      {insights && insights.insights.length > 0 && (
        <Card className="border-brand-purple/30 bg-gradient-to-br from-brand-purple/10 to-transparent">
          <CardHeader className="flex-row items-center gap-2">
            <Sparkles className="size-4 text-brand-purple-light" />
            <CardTitle className="text-sm font-medium">Lo que dicen tus números</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              {insights.insights.map((insight, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-brand-purple-light">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm font-normal text-muted-foreground">Visitas</CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-brand-purple/20 text-brand-purple-light">
              <Eye className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="font-heading text-3xl font-semibold">{summary.totalViews}</CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm font-normal text-muted-foreground">Clics</CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-brand-blue/20 text-brand-blue-light">
              <MousePointerClick className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="font-heading text-3xl font-semibold">{summary.totalClicks}</CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm font-normal text-muted-foreground">CTR</CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-brand-cyan/20 text-brand-cyan">
              <Percent className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="font-heading text-3xl font-semibold">
            {(summary.clickThroughRate * 100).toFixed(1)}%
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enlaces con más clics</CardTitle>
        </CardHeader>
        <CardContent>
          {summary.topLinks.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Aún no hay clics en este rango.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {summary.topLinks.map((link, index) => (
                <li
                  key={link.linkId}
                  className="flex min-w-0 items-center gap-3 rounded-xl border border-border-subtle bg-surface-1 px-4 py-3 text-sm"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-surface-5 text-xs font-semibold text-muted-foreground">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{link.title}</span>
                  <span className="shrink-0 font-heading font-semibold text-brand-purple-light">
                    {link.clicks} clics
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
