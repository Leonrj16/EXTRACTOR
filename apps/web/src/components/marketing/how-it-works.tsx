import { UserCircle2, Palette, LayoutGrid, Share2 } from "lucide-react";
import { Container } from "./container";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";

const STEPS = [
  {
    number: "01",
    icon: UserCircle2,
    title: "Crea tu perfil",
    description: "Nombre, foto, bio y usuario — tu punto de partida en menos de un minuto.",
  },
  {
    number: "02",
    icon: Palette,
    title: "Personaliza tu diseño",
    description: "Elige un tema, tu color de marca, tipografía y el estilo de tus botones.",
  },
  {
    number: "03",
    icon: LayoutGrid,
    title: "Agrega contenido",
    description: "Enlaces, redes, productos, video o un formulario — arma tu página con bloques.",
  },
  {
    number: "04",
    icon: Share2,
    title: "Comparte tu página",
    description: "Un solo enlace para tu bio, tu firma de correo o tu tarjeta de presentación.",
  },
];

export function HowItWorks() {
  return (
    <section id="producto" className="relative py-24 sm:py-32">
      <Container className="flex flex-col items-center gap-16">
        <SectionHeading
          kicker="Cómo funciona"
          title="De cero a publicado, en cuatro pasos."
          description="Sin fricción, sin curva de aprendizaje — el editor te guía en cada etapa."
        />

        <div className="relative grid w-full gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          <div className="absolute top-6 left-0 hidden h-px w-full bg-gradient-to-r from-transparent via-border-strong to-transparent lg:block" />
          {STEPS.map((step, i) => (
            <Reveal key={step.number} delay={i * 0.1} className="relative flex flex-col gap-4">
              <div className="relative z-10 flex items-center gap-3">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-aura font-heading text-sm font-semibold text-white glow-purple-sm">
                  {step.number}
                </span>
                <step.icon className="size-5 text-muted-foreground" />
              </div>
              <h3 className="font-heading text-lg font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
