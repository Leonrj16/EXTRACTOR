"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Container } from "./container";

const NAV_LINKS = [
  { href: "#producto", label: "Producto" },
  { href: "#plantillas", label: "Plantillas" },
  { href: "#caracteristicas", label: "Características" },
  { href: "#faq", label: "Recursos" },
];

export function MarketingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <Container>
        <motion.div
          initial={false}
          animate={{
            marginTop: scrolled ? 12 : 0,
            paddingLeft: scrolled ? 20 : 0,
            paddingRight: scrolled ? 20 : 0,
          }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "flex items-center justify-between rounded-2xl py-3.5 transition-colors duration-300",
            scrolled ? "glass-strong px-2" : "bg-transparent px-2",
          )}
        >
          <Link href="/" className="flex items-center gap-2.5">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground outline-none transition-colors hover:bg-surface-5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/admin/login"
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Iniciar sesión
            </Link>
            <Link href="/admin/login" className={buttonVariants({ size: "sm" })}>
              Crear mi página
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            className="flex size-10 items-center justify-center rounded-xl text-foreground outline-none transition-colors hover:bg-surface-5 focus-visible:ring-2 focus-visible:ring-ring/40 lg:hidden"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </motion.div>
      </Container>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden"
          >
            <Container>
              <div className="glass-strong mt-2 flex flex-col gap-1 rounded-2xl p-3">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-5 hover:text-foreground"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="mt-1 flex flex-col gap-2 border-t border-border-subtle pt-3">
                  <Link
                    href="/admin/login"
                    className="rounded-lg px-3.5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    Iniciar sesión
                  </Link>
                  <Link href="/admin/login" className={buttonVariants({ className: "w-full" })}>
                    Crear mi página
                  </Link>
                </div>
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
