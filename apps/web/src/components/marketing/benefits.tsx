import {
  LayoutGrid,
  Wand2,
  Palette,
  Share2,
  BarChart3,
  Rocket,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Container } from "./container";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";

const BENEFITS = [
  {
    icon: LayoutGrid,
    title: "Todo en un solo lugar",
    description:
      "Enlaces, productos, video, formularios y redes — una sola página que reemplaza diez herramientas distintas.",
    accent: "purple" as const,
  },
  {
    icon: Wand2,
    title: "Diseña sin código",
    description:
      "Un editor visual con vista previa en vivo. Arrastra, personaliza y publica sin tocar una línea de CSS.",
    accent: "blue" as const,
  },
  {
    icon: Palette,
    title: "Tu marca, tu estilo",
    description:
      "Colores, tipografías, animaciones y layout — cada detalle se adapta a tu identidad, no al revés.",
    accent: "cyan" as const,
  },
  {
    icon: Share2,
    title: "Conecta con tu audiencia",
    description:
      "Un enlace que centraliza tus redes, tu contacto y tu contenido — listo para compartir en cualquier bio.",
    accent: "purple" as const,
  },
  {
    icon: BarChart3,
    title: "Analiza resultados",
    description:
      "Visitas, clics y rendimiento por bloque, en tiempo real. Sabes exactamente qué está funcionando.",
    accent: "blue" as const,
  },
  {
    icon: Rocket,
    title: "Crece sin límites",
    description:
      "De un perfil personal a una marca completa — la misma plataforma te acompaña en cada etapa.",
    accent: "cyan" as const,
  },
];

const ACCENTS = {
  purple: "bg-brand-purple/15 text-brand-purple-light group-hover:bg-brand-purple/25",
  blue: "bg-brand-blue/15 text-brand-blue-light group-hover:bg-brand-blue/25",
  cyan: "bg-brand-cyan/15 text-brand-cyan group-hover:bg-brand-cyan/25",
};

const GLOWS = {
  purple: "group-hover:shadow-[0_0_40px_rgba(124,58,237,0.25)]",
  blue: "group-hover:shadow-[0_0_40px_rgba(59,130,246,0.25)]",
  cyan: "group-hover:shadow-[0_0_40px_rgba(34,211,238,0.2)]",
};

export function Benefits() {
  return (
    <section id="caracteristicas" className="relative py-24 sm:py-32">
      <Container className="flex flex-col items-center gap-16">
        <SectionHeading
          kicker="Por qué Aura"
          title="No es un link en tu bio. Es tu plataforma."
          description="Cada bloque, tema y métrica está pensado para que tu página se sienta como un producto propio — no como una plantilla más."
        />

        <div className="grid w-full gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((benefit, i) => (
            <Reveal key={benefit.title} delay={(i % 3) * 0.08}>
              <Card
                className={`group h-full gap-4 transition-transform duration-300 hover:-translate-y-1 hover:ring-border-strong ${GLOWS[benefit.accent]}`}
              >
                <div className="flex flex-col gap-4 px-(--card-spacing)">
                  <div
                    className={`flex size-11 items-center justify-center rounded-xl transition-colors duration-300 ${ACCENTS[benefit.accent]}`}
                  >
                    <benefit.icon className="size-5" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
