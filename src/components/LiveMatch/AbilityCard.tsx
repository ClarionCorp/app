import { Ability } from '../../core/objects/characters';

const UNLABELED_TYPES = new Set<Ability['type']>(['Strike', 'Open Strike']);

export function AbilityCard({ ability }: { ability: Ability }) {
  const typeLabel = UNLABELED_TYPES.has(ability.type) ? null : ability.type.replace(/^(Open|Closed) /, '');

  return (
    <div className="bg-surface-subtle border border-surface-border rounded-xl px-4 py-2 flex gap-4 shadow-lg">
      <img
        src={ability.icon}
        alt={ability.title}
        className="w-14 h-14 rounded-md shrink-0 object-contain bg-surface-overlay"
      />

      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-sm font-bold text-char uppercase tracking-wide">
              {ability.title}
              {typeLabel && (
                <span className="text-char-secondary font-semibold"> [{typeLabel}]</span>
              )}
            </span>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {ability.tags.map(tag => (
                <span
                  key={tag}
                  className="text-[10px] font-bold bg-surface-raised uppercase tracking-widest text-char-subtle border border-surface-border rounded px-1.5 py-0.5"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <span className="text-sm font-semibold text-char shrink-0 tabular-nums">
            {ability.cooldown}s
          </span>
        </div>

        <p className="text-xs text-char leading-relaxed">
          {ability.description}
        </p>
      </div>
    </div>
  );
}
