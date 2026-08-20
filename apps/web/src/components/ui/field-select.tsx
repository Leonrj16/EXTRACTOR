import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";

export function FieldSelect({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <NativeSelect id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#12131c]">
            {option.label}
          </option>
        ))}
      </NativeSelect>
    </div>
  );
}
