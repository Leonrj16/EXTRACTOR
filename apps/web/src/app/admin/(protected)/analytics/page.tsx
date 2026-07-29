import Link from "next/link";
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
  const summary = await serverApiFetch<AnalyticsSummary>(`/admin/analytics/summary?range=${range}`);

  return (
    <main className="mx-auto max-w-3xl px-8 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Analítica</h1>
        <div className="flex gap-1 rounded-lg border p-1">
          {RANGES.map((r) => (
            <Link
              key={r.value}
              href={`/admin/analytics?range=${r.value}`}
              className={cn(
                "rounded-md px-3 py-1 text-sm",
                range === r.value ? "bg-muted font-medium" : "text-muted-foreground",
              )}
            >
              {r.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted-foreground">Visitas</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{summary.totalViews}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted-foreground">Clics</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{summary.totalClicks}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted-foreground">CTR</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
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
            <p className="text-sm text-muted-foreground">Aún no hay clics en este rango.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {summary.topLinks.map((link) => (
                <li key={link.linkId} className="flex items-center justify-between text-sm">
                  <span>{link.title}</span>
                  <span className="font-medium">{link.clicks}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
