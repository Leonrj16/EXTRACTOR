import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex size-8 items-center justify-center rounded-xl bg-gradient-aura glow-purple-sm",
        className,
      )}
    >
      <div className="size-2.5 rounded-full bg-white/90" />
    </div>
  );
}

export function Logo({ className, iconOnly }: { className?: string; iconOnly?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      {!iconOnly && (
        <span className="font-heading text-lg font-semibold tracking-tight text-gradient-aura">
          Aura
        </span>
      )}
    </div>
  );
}
