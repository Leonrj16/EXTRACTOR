import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Container } from "./container";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";

const TESTIMONIALS = [
  {
    name: "Renata Solís",
    role: "Diseñadora independiente",
    quote:
      "Reemplacé cuatro herramientas distintas con una sola página. Mis clientes ahora ven todo mi trabajo en un solo lugar, con mi propio estilo.",
    gradient: "from-brand-purple to-brand-blue",
  },
  {
    name: "Diego Marín",
    role: "Creador de contenido",
    quote:
      "El editor se siente como usar una app de verdad, no un formulario. Cambié mi tema completo en cinco minutos sin ayuda de nadie.",
    gradient: "from-brand-blue to-brand-cyan",
  },
  {
    name: "Valeria Ponce",
    role: "Fundadora, estudio de bienestar",
    quote:
      "La analítica me mostró qué enlaces realmente generan citas. Ahora tomo decisiones con datos, no con intuición.",
    gradient: "from-brand-cyan to-brand-success",
  },
];

export function Testimonials() {
  return (
    <section className="relative py-24 sm:py-32">
      <Container className="flex flex-col items-center gap-16">
        <SectionHeading
          kicker="Primeros en probarlo"
          title="Gente construyendo su identidad con Aura."
          description="Ejemplos de cómo distintas personas están usando la plataforma en su día a día."
        />

        <div className="grid w-full gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.1}>
              <Card className="h-full gap-5">
                <div className="flex flex-col gap-5 px-(--card-spacing)">
                  <div className="flex gap-1 text-brand-warning">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className="size-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/90">“{t.quote}”</p>
                  <div className="flex items-center gap-3 border-t border-border-subtle pt-4">
                    <div
                      className={`flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-semibold text-white ${t.gradient}`}
                    >
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
