import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel,
} from "@/components/ui/accordion";
import { Container } from "./container";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";

const FAQS = [
  {
    question: "¿Qué es Aura?",
    answer:
      "Aura es tu identidad digital como plataforma: una página personal, profesional o de negocio donde centralizas enlaces, contenido, productos y contacto — con un editor visual y analítica propia.",
  },
  {
    question: "¿Necesito conocimientos técnicos?",
    answer:
      "No. Todo se configura desde un editor visual con vista previa en tiempo real — eliges colores, tema y bloques sin escribir código ni depender de un desarrollador.",
  },
  {
    question: "¿Puedo personalizar mi página?",
    answer:
      "Sí, por completo: color de marca, tipografía, estilo de botones, layout, animaciones de entrada y el orden de cada bloque son configurables desde tu panel.",
  },
  {
    question: "¿Funciona en móvil?",
    answer:
      "Tu página pública y tu panel de administración están diseñados mobile-first — se ven y funcionan igual de bien en teléfono, tablet y escritorio.",
  },
  {
    question: "¿Puedo agregar mis redes?",
    answer:
      "Sí. Instagram, WhatsApp, email, ubicación y cualquier red social se agregan como bloques independientes, con su propio ícono y estilo.",
  },
  {
    question: "¿Puedo vender productos?",
    answer:
      "Sí, con el bloque de producto puedes mostrar imagen, precio y un enlace de compra directo — ideal para catálogos pequeños o servicios puntuales.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="relative py-24 sm:py-32">
      <Container className="flex flex-col items-center gap-16">
        <SectionHeading
          kicker="Preguntas frecuentes"
          title="Todo lo que necesitas saber."
        />

        <Reveal delay={0.1} className="glass w-full max-w-2xl rounded-2xl px-6">
          <Accordion>
            {FAQS.map((faq) => (
              <AccordionItem key={faq.question} value={faq.question}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionPanel>{faq.answer}</AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </Container>
    </section>
  );
}
