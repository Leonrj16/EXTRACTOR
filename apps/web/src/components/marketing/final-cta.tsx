"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "./container";
import { Reveal } from "./reveal";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden py-28 sm:py-36">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 size-[60vw] -translate-x-1/2 -translate-y-1/2 animate-[aurora-drift-1_20s_ease-in-out_infinite] rounded-full bg-brand-purple/30 blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 size-[45vw] -translate-x-1/2 -translate-y-1/2 animate-[aurora-drift-2_24s_ease-in-out_infinite] rounded-full bg-brand-blue/20 blur-[140px]" />
      </div>

      <Container className="relative flex flex-col items-center gap-8 text-center">
        <Reveal className="flex flex-col items-center gap-6">
          <h2 className="max-w-2xl font-heading text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
            Tu presencia digital
            <br />
            <span className="text-gradient-aura">empieza aquí.</span>
          </h2>
          <p className="max-w-md text-balance text-muted-foreground">
            Crea tu página en minutos. Sin tarjeta de crédito, sin
            compromisos — solo tu identidad, lista para compartir.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <Link
            href="/admin/login"
            className={buttonVariants({ size: "lg", className: "glow-purple px-8 text-base" })}
          >
            Crear mi página
            <ArrowRight className="size-4" />
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
