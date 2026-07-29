"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, PlayCircle, Sparkles, MapPin, AtSign, MessageCircle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Container } from "./container";
import { PhoneMockup } from "./phone-mockup";

const EASE = [0.16, 1, 0.3, 1] as const;

function HeroAurora() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute top-[-25%] left-[-10%] size-[55vw] animate-[aurora-drift-1_22s_ease-in-out_infinite] rounded-full bg-brand-purple/35 blur-[120px]" />
      <div className="absolute top-[-5%] right-[-15%] size-[50vw] animate-[aurora-drift-2_26s_ease-in-out_infinite] rounded-full bg-brand-blue/25 blur-[130px]" />
      <div className="absolute bottom-[-30%] left-[20%] size-[45vw] animate-[aurora-drift-3_30s_ease-in-out_infinite] rounded-full bg-brand-cyan/15 blur-[130px]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--background)_78%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
}

function FloatingChip({
  className,
  delay,
  children,
}: {
  className: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay, ease: EASE }}
      className={`glass-strong absolute z-30 flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap ${className}`}
    >
      {children}
    </motion.div>
  );
}

function HeroDemoPhone() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: 3 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.9, ease: EASE }}
      className="relative"
    >
      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <PhoneMockup className="mx-auto">
          <div
            className="flex min-h-full flex-col items-center gap-4 px-5 pt-14 pb-8 text-center"
            style={{
              background:
                "radial-gradient(circle at 50% 0%, rgba(124,58,237,0.35), transparent 60%), #0b0c14",
            }}
          >
            <div className="glow-purple-sm size-16 shrink-0 overflow-hidden rounded-full border-2 border-white/80 bg-gradient-aura" />
            <div>
              <p className="font-heading text-sm font-semibold text-white">Mica Duarte</p>
              <p className="mt-1 text-[11px] text-white/60">Diseño experiencias con alma ✨</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-white/50">
              <MapPin className="size-3" />
              CDMX
            </div>
            <div className="mt-1 flex w-full flex-col gap-2.5">
              {[
                { icon: <AtSign className="size-3.5" />, label: "Instagram" },
                { icon: <MessageCircle className="size-3.5" />, label: "WhatsApp" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] py-2.5 text-[11px] font-medium text-white backdrop-blur-md"
                >
                  {item.icon}
                  {item.label}
                </div>
              ))}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="aspect-square rounded-xl bg-gradient-to-br from-brand-purple/50 to-brand-blue/30" />
                <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-white/15 bg-white/[0.06] p-2">
                  <span className="text-[10px] font-semibold text-white">Set de presets</span>
                  <span className="text-[9px] text-white/50">$25 USD</span>
                </div>
              </div>
            </div>
          </div>
        </PhoneMockup>
      </motion.div>

      <FloatingChip className="top-10 -left-6 sm:-left-14" delay={1.1}>
        <span className="flex size-6 items-center justify-center rounded-full bg-brand-success/20 text-brand-success">
          <Sparkles className="size-3.5" />
        </span>
        <span>
          <span className="block text-foreground">2,481 visitas</span>
          <span className="block font-normal text-muted-foreground">esta semana</span>
        </span>
      </FloatingChip>

      <FloatingChip className="right-0 bottom-24 sm:-right-10" delay={1.3}>
        <span className="flex size-6 items-center justify-center rounded-full bg-brand-purple/20 text-brand-purple-light">
          ✓
        </span>
        <span>Tema publicado</span>
      </FloatingChip>
    </motion.div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-36 pb-24 sm:pt-44">
      <HeroAurora />
      <Container className="relative grid items-center gap-16 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
        <div className="flex flex-col items-start gap-7">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-3 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-brand-purple-light uppercase"
          >
            <Sparkles className="size-3.5" />
            Presentamos Aura
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05, ease: EASE }}
            className="max-w-xl font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]"
          >
            Tu identidad digital,
            <br />
            <span className="text-gradient-aura">diseñada como un producto.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
            className="max-w-md text-balance text-lg text-muted-foreground"
          >
            Crea una página personal, profesional o de negocio con bloques,
            temas y analítica en tiempo real. Sin plantillas genéricas. Sin
            código.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
            className="flex flex-wrap items-center gap-3"
          >
            <Link href="/admin/login" className={buttonVariants({ size: "lg" })}>
              Crear gratis
              <ArrowRight className="size-4" />
            </Link>
            <Button variant="outline" size="lg" render={<a href="#demo" />}>
              <PlayCircle className="size-4" />
              Ver demo
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="text-xs text-muted-foreground"
          >
            Gratis para empezar · No necesitas tarjeta
          </motion.p>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <HeroDemoPhone />
        </div>
      </Container>
    </section>
  );
}
