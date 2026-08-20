import {
  Link2,
  Video,
  Images,
  ShoppingBag,
  Wrench,
  FileText,
  Calendar,
  MapPin,
  Share2,
  Music,
  Mail,
  MessageCircle,
} from "lucide-react";
import { Container } from "./container";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";

const BLOCKS = [
  { icon: Link2, label: "Botones" },
  { icon: Video, label: "Videos" },
  { icon: Images, label: "Galería" },
  { icon: ShoppingBag, label: "Productos" },
  { icon: Wrench, label: "Servicios" },
  { icon: FileText, label: "Formulario" },
  { icon: Calendar, label: "Calendario" },
  { icon: MapPin, label: "Mapas" },
  { icon: Share2, label: "Redes sociales" },
  { icon: Music, label: "Música" },
  { icon: Mail, label: "Contacto" },
  { icon: MessageCircle, label: "WhatsApp" },
];

export function BlocksShowcase() {
  return (
    <section className="relative py-24 sm:py-32">
      <Container className="flex flex-col items-center gap-16">
        <SectionHeading
          kicker="Bloques"
          title="Construye tu página con bloques."
          description="No es una lista de enlaces — es un sistema de piezas que combinas como quieras. Cada bloque se personaliza, se reordena y se activa o desactiva de forma independiente."
        />

        <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {BLOCKS.map((block, i) => (
            <Reveal key={block.label} delay={(i % 4) * 0.05}>
              <div className="group flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-6 text-center transition-colors hover:border-solid hover:border-brand-purple/40 hover:bg-surface-1">
                <div className="flex size-12 items-center justify-center rounded-xl bg-surface-3 text-brand-purple-light transition-colors group-hover:bg-brand-purple/15">
                  <block.icon className="size-5" />
                </div>
                <span className="text-sm font-medium">{block.label}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
