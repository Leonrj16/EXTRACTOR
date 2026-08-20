import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

export function SectionHeading({
  kicker,
  title,
  description,
  align = "center",
  className,
}: {
  kicker: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border-subtle bg-surface-3 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-brand-purple-light uppercase">
        {kicker}
      </span>
      <h2 className="max-w-2xl font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="max-w-xl text-balance text-muted-foreground">{description}</p>
      )}
    </Reveal>
  );
}
