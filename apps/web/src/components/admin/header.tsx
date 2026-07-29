"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, BellOff, Menu, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import type { ProfileData } from "@/types/profile";

const PAGE_LABELS: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/links": "Enlaces",
  "/admin/design": "Diseño",
  "/admin/analytics": "Analítica",
};

const ROUTES = [
  { match: ["dashboard", "inicio", "home"], href: "/admin/dashboard" },
  { match: ["enlaces", "links"], href: "/admin/links" },
  { match: ["diseño", "diseno", "design", "apariencia"], href: "/admin/design" },
  { match: ["analitica", "analítica", "analytics", "estadisticas"], href: "/admin/analytics" },
];

function useGreeting(name: string) {
  const [greeting, setGreeting] = useState("Hola");

  useEffect(() => {
    const hour = new Date().getHours();
    const prefix = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";
    setGreeting(`${prefix}, ${name.split(" ")[0]}`);
  }, [name]);

  return greeting;
}

export function AdminHeader({
  profile,
  onMenuClick,
}: {
  profile: ProfileData;
  onMenuClick?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const greeting = useGreeting(profile.displayName);
  const [query, setQuery] = useState("");

  function handleSearchKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    const normalized = query.trim().toLowerCase();
    const route = ROUTES.find((r) => r.match.some((m) => normalized.includes(m)));
    if (route) {
      router.push(route.href);
      setQuery("");
    }
  }

  return (
    <header className="glass flex items-center gap-3 rounded-2xl px-4 py-3.5 sm:gap-4 sm:px-5">
      <button
        onClick={onMenuClick}
        className="flex size-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground outline-none transition-colors hover:bg-white/[0.06] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 lg:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="size-5" />
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {PAGE_LABELS[pathname] ?? "Aura"}
        </p>
        <h2 className="truncate font-heading text-base font-semibold">{greeting}</h2>
      </div>

      <div className="relative hidden w-full max-w-xs sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder="Ir a… (enlaces, diseño, analítica)"
          className="border-white/10 bg-white/[0.03] pl-9"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex size-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground outline-none transition-colors hover:bg-white/[0.06] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
          aria-label="Notificaciones"
        >
          <Bell className="size-4.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-default flex-col gap-1.5 py-6 text-center">
              <BellOff className="size-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">No tienes notificaciones nuevas.</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-aura text-xs font-semibold text-white outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring/40"
          aria-label="Menú de cuenta"
        >
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            profile.displayName.charAt(0).toUpperCase()
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>{profile.displayName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/admin/design")}>
              Editar perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.open(`/${profile.username}`, "_blank")}>
              Ver página pública
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
