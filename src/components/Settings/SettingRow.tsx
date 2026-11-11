interface SettingRowProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  vertical?: boolean;
  stretch?: boolean;
  disabled?: boolean;
}

export function SettingRow({ title, subtitle, children, vertical, stretch, disabled }: SettingRowProps) {
  return (
    <div className={`flex gap-4 py-3.5 px-1 transition-opacity duration-200 ${vertical ? 'flex-col' : 'items-center justify-between'} ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-sm font-medium text-char">{title}</span>
        <span className="text-xs text-char-subtle">{subtitle}</span>
      </div>
      <div className={vertical ? 'w-full' : stretch ? 'flex min-w-0 justify-end' : 'shrink-0'}>{children}</div>
    </div>
  );
}

export function SettingGroup({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      {label && (
        <span className="block px-1 mb-1 text-[11px] font-semibold text-char-subtle uppercase tracking-wider">
          {label}
        </span>
      )}
      <div className="flex flex-col divide-y divide-background-border">{children}</div>
    </div>
  );
}
