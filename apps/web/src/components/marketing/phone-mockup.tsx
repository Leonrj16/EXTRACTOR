import { cn } from "@/lib/utils";

/**
 * Decorative floating phone frame used across marketing sections (hero,
 * templates gallery). Purely presentational — the content is passed as
 * children, never wired to real profile data.
 */
export function PhoneMockup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative aspect-[9/19] w-[280px] overflow-hidden rounded-[2.5rem] border-4 border-white/10 bg-[#07080c] shadow-(--shadow-surface-strong)",
        className,
      )}
    >
      <div className="absolute top-2 left-1/2 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-black/60" />
      <div className="absolute inset-0 overflow-y-auto">{children}</div>
    </div>
  );
}
