import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { serverApiFetch } from "@/lib/api-server";

interface Profile {
  username: string;
  displayName: string;
  isPublished: boolean;
}

interface AnalyticsSummary {
  totalViews: number;
  totalClicks: number;
  clickThroughRate: number;
}

interface LinkItem {
  id: string;
  isActive: boolean;
}

export default async function DashboardPage() {
  const [profile, links, summary] = await Promise.all([
    serverApiFetch<Profile>("/admin/profile"),
    serverApiFetch<LinkItem[]>("/admin/links"),
    serverApiFetch<AnalyticsSummary>("/admin/analytics/summary?range=7d"),
  ]);

  const activeLinks = links.filter((link) => link.isActive).length;

  return (
    <main className="mx-auto max-w-5xl px-8 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Hola, {profile.displayName}</h1>
          <p className="text-sm text-muted-foreground">
            Tu página:{" "}
            <Link href={`/${profile.username}`} target="_blank" className="underline">
              /{profile.username}
            </Link>
            {!profile.isPublished && (
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                Sin publicar
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted-foreground">
              Visitas (7 días)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{summary.totalViews}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted-foreground">
              Clics (7 días)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{summary.totalClicks}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted-foreground">
              Enlaces activos
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {activeLinks} / {links.length}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
