import Link from "next/link";
import { Globe, MessageCircle, Rss } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Container } from "./container";

const COLUMNS = [
  {
    title: "Producto",
    links: [
      { label: "Características", href: "#caracteristicas" },
      { label: "Plantillas", href: "#plantillas" },
      { label: "Cómo funciona", href: "#producto" },
      { label: "Demo interactiva", href: "#demo" },
    ],
  },
  {
    title: "Recursos",
    links: [
      { label: "Preguntas frecuentes", href: "#faq" },
      { label: "Panel de administración", href: "/admin/login" },
    ],
  },
  {
    title: "Contacto",
    links: [
      { label: "hola@aura.app", href: "mailto:hola@aura.app" },
      { label: "Soporte", href: "mailto:soporte@aura.app" },
    ],
  },
];

const SOCIALS = [
  { icon: Globe, href: "#", label: "Sitio web" },
  { icon: MessageCircle, href: "#", label: "Comunidad" },
  { icon: Rss, href: "#", label: "Actualizaciones" },
];

export function MarketingFooter() {
  return (
    <footer className="relative border-t border-border-subtle py-16">
      <Container className="flex flex-col gap-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="max-w-xs text-sm text-muted-foreground">
              Tu identidad digital, diseñada como un producto. Una sola
              página para todo lo que eres.
            </p>
            <div className="flex items-center gap-2">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex size-9 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-surface-5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
                >
                  <social.icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title} className="flex flex-col gap-3">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {col.title}
              </p>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-2 border-t border-border-subtle pt-8 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Aura. Todos los derechos reservados.</p>
          <p>Diseñado con identidad propia.</p>
        </div>
      </Container>
    </footer>
  );
}
