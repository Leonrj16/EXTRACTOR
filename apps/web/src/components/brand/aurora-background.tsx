export function AuroraBackground({ variant = "default" }: { variant?: "default" | "subtle" }) {
  const opacity = variant === "subtle" ? "opacity-40" : "opacity-70";

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      <div
        className={`absolute left-[-10%] top-[-15%] size-[50vw] rounded-full bg-brand-purple/40 blur-[120px] ${opacity} animate-[aurora-drift-1_22s_ease-in-out_infinite]`}
      />
      <div
        className={`absolute right-[-15%] top-[10%] size-[45vw] rounded-full bg-brand-blue/30 blur-[130px] ${opacity} animate-[aurora-drift-2_26s_ease-in-out_infinite]`}
      />
      <div
        className={`absolute bottom-[-20%] left-[15%] size-[40vw] rounded-full bg-brand-cyan/20 blur-[130px] ${opacity} animate-[aurora-drift-3_30s_ease-in-out_infinite]`}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--background)_75%)]" />
    </div>
  );
}
