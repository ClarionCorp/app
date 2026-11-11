import { useRef, useState } from "react";
import { CaretDownIcon } from "@phosphor-icons/react";
import { Dropdown } from "../UI/Dropdown";

interface SettingSelectProps<T extends string> {
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
  capitalize?: boolean;
}

export function SettingSelect<T extends string>({ value, options, onChange, capitalize }: SettingSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-surface-border text-sm text-char hover:bg-surface-raised transition-colors duration-100 cursor-pointer ${capitalize ? 'capitalize' : ''}`}
      >
        {value}
        <CaretDownIcon size={12} className="opacity-60" />
      </button>
      <Dropdown
        triggerRef={triggerRef}
        open={open}
        onClose={() => setOpen(false)}
        items={options.map(v => ({ label: v, onClick: () => onChange(v) }))}
      />
    </div>
  );
}
