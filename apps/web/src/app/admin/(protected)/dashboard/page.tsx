import Link from "next/link";
import { Eye, MousePointerClick, Percent, Link2, Palette, BarChart3, ArrowUpRight } from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { CopyLinkButton } from "@/components/admin/copy-link-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { serverApiFetch } from "@/lib/api-server";

interface Profile {
  username: string;
  displayName: string;
  isPublished: boolean;
  avatarUrl: string | null;
}

interface AnalyticsSummary {
  totalViews: number;
  totalClicks: number;
  clickThroughRate: number;
  topLinks: Array<{ linkId: string; title: string; clicks: number }>;
}

interface LinkItem {
  id: string;
  isActive: boolean;
}

const QUICK_ACTIONS = [
  {
    href: "/admin/links",
    icon: Link2,
    title: "Gestionar enlaces",
    description: "Agrega, reordena y personaliza tus bloques.",
    color: "purple" as const,
  },
  {
    href: "/admin/design",
    icon: Palette,
    title: "Editor visual",
    description: "Colores, tipografía, layout y animaciones.",
    color: "blue" as const,
  },
  {
    href: "/admin/analytics",
    icon: BarChart3,
    title: "Ver analítica",
    description: "Visitas, clics y rendimiento por enlace.",
    color: "cyan" as const,
  },
];

const CARD_ACCENTS: Record<string, string> = {
  purple: "group-hover:border-brand-purple/40",
  blue: "group-hover:border-brand-blue/40",
  cyan: "group-hover:border-brand-cyan/40",
};

const ICON_ACCENTS: Record<string, string> = {
  purple: "bg-brand-purple/15 text-brand-purple-light",
  blue: "bg-brand-blue/15 text-brand-blue-light",
  cyan: "bg-brand-cyan/15 text-brand-cyan",
};

export default async function DashboardPage() {
  const [profile, links, summary] = await Promise.all([
    serverApiFetch<Profile>("/admin/profile"),
    serverApiFetch<LinkItem[]>("/admin/links"),
    serverApiFetch<AnalyticsSummary>("/admin/analytics/summary?range=7d"),
  ]);

  const activeLinks = links.filter((link) => link.isActive).length;
  const publicUrl = `/${profile.username}`;

  return (
    <main className="flex flex-col gap-6 px-1 pb-8">
      <div className="glass flex flex-wrap items-center justify-between gap-4 rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-aura text-sm font-semibold text-white">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              profile.displayName.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <p className="font-heading text-sm font-semibold">{profile.displayName}</p>
            <p className="text-xs text-muted-foreground">tuapp.com{publicUrl}</p>
          </div>
          {!profile.isPublished && <Badge variant="warning">Sin publicar</Badge>}
        </div>
        <div className="flex items-center gap-2">
          <CopyLinkButton path={publicUrl} />
          <Link
            href={publicUrl}
            target="_blank"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Ver página
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Visitas (7 días)"
          value={summary.totalViews}
          icon={<Eye className="size-4.5" />}
          color="purple"
          delay={0}
        />
        <StatCard
          label="Clics (7 días)"
          value={summary.totalClicks}
          icon={<MousePointerClick className="size-4.5" />}
          color="blue"
          delay={0.05}
        />
        <StatCard
          label="CTR"
          value={Math.round(summary.clickThroughRate * 100)}
          suffix="%"
          icon={<Percent className="size-4.5" />}
          color="cyan"
          delay={0.1}
        />
        <StatCard
          label="Enlaces activos"
          value={activeLinks}
          icon={<Link2 className="size-4.5" />}
          color="success"
          delay={0.15}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="glass flex min-w-0 flex-col gap-4 rounded-2xl p-6">
          <h3 className="font-heading text-base font-semibold">Enlaces con más clics</h3>
          {summary.topLinks.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Todavía no hay clics registrados esta semana.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {summary.topLinks.map((link, index) => (
                <li
                  key={link.linkId}
                  className="flex min-w-0 items-center gap-3 rounded-xl border border-border-subtle bg-surface-1 px-4 py-3"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-surface-5 text-xs font-semibold text-muted-foreground">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{link.title}</span>
                  <span className="shrink-0 font-heading text-sm font-semibold text-brand-purple-light">
                    {link.clicks} clics
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          {QUICK_ACTIONS.map(({ href, icon: Icon, title, description, color }) => (
            <Link
              key={href}
              href={href}
              className={`group glass flex items-center gap-4 rounded-2xl border border-transparent p-6 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/40 ${CARD_ACCENTS[color]}`}
            >
              <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${ICON_ACCENTS[color]}`}>
                <Icon className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{title}</p>
                <p className="truncate text-xs text-muted-foreground">{description}</p>
              </div>
              <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
