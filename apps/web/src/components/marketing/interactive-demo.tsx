"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Plus, Image as ImageIcon, Video, ShoppingBag } from "lucide-react";
import { Container } from "./container";
import { PhoneMockup } from "./phone-mockup";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import { cn } from "@/lib/utils";

const COLORS = [
  { name: "Aura", value: "#7c3aed" },
  { name: "Océano", value: "#0ea5e9" },
  { name: "Menta", value: "#10b981" },
  { name: "Atardecer", value: "#f97316" },
  { name: "Rosa", value: "#ec4899" },
];

const THEMES = [
  { id: "glow", name: "Aura Glow", bg: "radial-gradient(circle at 50% 0%, var(--accent-color)44, transparent 60%), #0b0c14" },
  { id: "mono", name: "Minimal", bg: "#111214" },
  { id: "sunset", name: "Bold", bg: "linear-gradient(160deg, var(--accent-color)33, #0b0c14 65%)" },
] as const;

type BlockKind = "link" | "gallery" | "video" | "product";

interface DemoBlock {
  id: string;
  kind: BlockKind;
  label: string;
}

const INITIAL_BLOCKS: DemoBlock[] = [
  { id: "b1", kind: "link", label: "Mi último proyecto" },
  { id: "b2", kind: "link", label: "Reservar consultoría" },
];

const ADDABLE: Array<{ kind: BlockKind; label: string; icon: React.ReactNode }> = [
  { kind: "gallery", label: "Galería", icon: <ImageIcon className="size-3.5" /> },
  { kind: "video", label: "Video", icon: <Video className="size-3.5" /> },
  { kind: "product", label: "Producto", icon: <ShoppingBag className="size-3.5" /> },
];

export function InteractiveDemo() {
  const [color, setColor] = useState(COLORS[0]);
  const [theme, setTheme] = useState<(typeof THEMES)[number]>(THEMES[0]);
  const [blocks, setBlocks] = useState<DemoBlock[]>(INITIAL_BLOCKS);

  function addBlock(item: (typeof ADDABLE)[number]) {
    setBlocks((prev) => [
      ...prev,
      { id: `${item.kind}-${prev.length}-${Date.now()}`, kind: item.kind, label: item.label },
    ]);
  }

  return (
    <section id="demo" className="relative py-24 sm:py-32">
      <Container className="flex flex-col items-center gap-16">
        <SectionHeading
          kicker="Pruébalo aquí mismo"
          title="Un editor visual, en tiempo real."
          description="Cambia colores, temas y agrega bloques — mira cómo se refleja al instante en la vista previa, igual que en el producto real."
        />

        <div className="grid w-full items-center gap-12 lg:grid-cols-[1fr_auto] lg:gap-20">
          <Reveal delay={0.1} className="flex flex-col gap-8">
            <div className="glass flex flex-col gap-4 rounded-2xl p-6">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Color de marca
              </p>
              <div className="flex flex-wrap gap-3">
                {COLORS.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setColor(c)}
                    aria-label={c.name}
                    aria-pressed={color.name === c.name}
                    className="relative flex size-10 items-center justify-center rounded-full outline-none transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring/40"
                    style={{ backgroundColor: c.value }}
                  >
                    {color.name === c.name && <Check className="size-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass flex flex-col gap-4 rounded-2xl p-6">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Tema de la página
              </p>
              <div className="flex flex-wrap gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t)}
                    aria-pressed={theme.id === t.id}
                    className={cn(
                      "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                      theme.id === t.id
                        ? "bg-gradient-aura text-white"
                        : "bg-surface-2 text-muted-foreground hover:bg-surface-5 hover:text-foreground",
                    )}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass flex flex-col gap-4 rounded-2xl p-6">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Agregar bloque
              </p>
              <div className="flex flex-wrap gap-2">
                {ADDABLE.map((item) => (
                  <button
                    key={item.kind}
                    onClick={() => addBlock(item)}
                    className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3.5 py-2 text-sm font-medium transition-colors hover:border-border-hover hover:bg-surface-6"
                  >
                    <Plus className="size-3.5 text-brand-purple-light" />
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.2} className="mx-auto">
            <PhoneMockup>
              <div
                className="flex min-h-full flex-col items-center gap-4 px-5 pt-14 pb-8 text-center transition-[background] duration-500"
                style={
                  {
                    background: theme.bg.replaceAll("var(--accent-color)", color.value),
                    "--accent-color": color.value,
                  } as React.CSSProperties
                }
              >
                <motion.div
                  animate={{ borderColor: color.value, boxShadow: `0 0 24px ${color.value}66` }}
                  transition={{ duration: 0.4 }}
                  className="size-16 shrink-0 overflow-hidden rounded-full border-2 bg-gradient-aura"
                />
                <div>
                  <p className="font-heading text-sm font-semibold text-white">Mica Duarte</p>
                  <p className="mt-1 text-[11px] text-white/60">Diseño experiencias con alma ✨</p>
                </div>

                <div className="mt-1 flex w-full flex-col gap-2.5">
                  <AnimatePresence initial={false}>
                    {blocks.map((block) => (
                      <motion.div
                        key={block.id}
                        layout
                        initial={{ opacity: 0, y: 12, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="flex items-center justify-center gap-2 rounded-xl border py-2.5 text-[11px] font-medium text-white backdrop-blur-md"
                        style={{
                          borderColor: `${color.value}55`,
                          backgroundColor: `${color.value}22`,
                        }}
                      >
                        {block.kind === "gallery" && <ImageIcon className="size-3.5" />}
                        {block.kind === "video" && <Video className="size-3.5" />}
                        {block.kind === "product" && <ShoppingBag className="size-3.5" />}
                        {block.label}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </PhoneMockup>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
