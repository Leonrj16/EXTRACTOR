"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Container } from "./container";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";

const TEMPLATES = [
  {
    name: "Creator",
    description: "Redes, contenido y productos digitales en una sola página.",
    from: "#7c3aed",
    to: "#3b82f6",
  },
  {
    name: "Profesional",
    description: "Portafolio, servicios y contacto para consultores e independientes.",
    from: "#3b82f6",
    to: "#22d3ee",
  },
  {
    name: "Doctor",
    description: "Especialidad, horarios, ubicación y agenda de citas.",
    from: "#22d3ee",
    to: "#34d399",
  },
  {
    name: "Restaurante",
    description: "Menú, ubicación, reservas y redes en un solo enlace.",
    from: "#fb923c",
    to: "#fb3b5a",
  },
  {
    name: "Tienda",
    description: "Catálogo de productos con precios y enlace de compra directo.",
    from: "#fb3b5a",
    to: "#7c3aed",
  },
  {
    name: "Portafolio",
    description: "Proyectos, galería visual y formulario de contacto.",
    from: "#a78bfa",
    to: "#22d3ee",
  },
  {
    name: "Empresa",
    description: "Marca, equipo, ubicación y canales de contacto oficiales.",
    from: "#3b82f6",
    to: "#34d399",
  },
];

function TemplatePreview({ from, to }: { from: string; to: string }) {
  return (
    <div
      className="relative flex aspect-[4/5] w-full flex-col items-center gap-3 overflow-hidden rounded-xl p-6 pt-9"
      style={{ background: `linear-gradient(160deg, ${from}33, #0b0c14 70%)` }}
    >
      <div
        className="size-10 rounded-full border-2"
        style={{ borderColor: from, boxShadow: `0 0 20px ${from}55` }}
      />
      <div className="h-2 w-16 rounded-full bg-white/25" />
      <div className="h-1.5 w-10 rounded-full bg-white/15" />
      <div className="mt-2 flex w-full flex-col gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-6 w-full rounded-md border"
            style={{ borderColor: `${to}44`, backgroundColor: `${to}1a` }}
          />
        ))}
      </div>
    </div>
  );
}

export function Templates() {
  return (
    <section id="plantillas" className="relative py-24 sm:py-32">
      <Container className="flex flex-col items-center gap-16">
        <SectionHeading
          kicker="Plantillas"
          title="Un punto de partida para cada identidad."
          description="Elige la base más cercana a lo que quieres construir — cada plantilla es completamente personalizable después."
        />

        <div className="grid w-full gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TEMPLATES.map((template, i) => (
            <Reveal key={template.name} delay={(i % 4) * 0.07}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="group flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-3 ring-1 ring-border shadow-(--shadow-surface) backdrop-blur-xl transition-colors hover:border-border-strong hover:ring-border-strong"
              >
                <TemplatePreview from={template.from} to={template.to} />
                <div className="flex flex-1 flex-col gap-2 px-2 pb-1">
                  <h3 className="font-heading text-base font-semibold">{template.name}</h3>
                  <p className="flex-1 text-sm text-muted-foreground">{template.description}</p>
                  <Link
                    href="/admin/login"
                    className="mt-1 flex items-center gap-1.5 text-sm font-medium text-brand-purple-light transition-colors group-hover:text-brand-blue-light"
                  >
                    Usar plantilla
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
