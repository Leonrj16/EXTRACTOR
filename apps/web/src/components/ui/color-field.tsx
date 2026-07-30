import { Label } from "@/components/ui/label";

export function ColorField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative flex h-10 items-center gap-2 rounded-xl border border-border bg-surface-2 px-2">
        <div
          className="size-6 shrink-0 rounded-lg border border-border-hover"
          style={{ backgroundColor: value }}
        />
        <span className="text-sm text-muted-foreground uppercase">{value}</span>
        <input
          id={id}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>
    </div>
  );
}
