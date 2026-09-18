import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import {
  ChartBarIcon,
  ShieldIcon,
  SmileySadIcon,
  SwordIcon,
} from '@phosphor-icons/react';
import { MatchPlayersTable } from '../../types/database';
import { SmurfConfidence } from '../../types/clarion';
import { getRankFromLP } from '../../core/objects/ranks';
import { getCharacterFromId } from '../../core/objects/characters';
import { ProminentChar } from '../../core/utilities/players';
import { getClampedPopoverPosition } from '../../core/utilities/popover';
import RankIcon from '../Rank';
import { PLAYSTYLE_CLASSES } from './PlayerCard';

const smurfLabels: Record<SmurfConfidence, string> = {
  none: 'No',
  low: 'Possibly',
  medium: 'Likely',
  high: 'Yes',
};

const smurfClasses: Record<SmurfConfidence, string> = {
  none: 'text-char-secondary',
  low: 'text-yellow-400',
  medium: 'text-orange-400',
  high: 'text-red-500',
};

// Picks the strongest entry for a queue regardless of role,
// since a player's tracked favorite/best character may sit under a different role
// than the one they're currently playing this match.
function pickChar(
  chars: ProminentChar[],
  queue: 'Normal' | 'Ranked',
  metric: 'games' | 'winrate',
): ProminentChar | undefined {
  const candidates = chars.filter(c => c.queue === queue);
  if (candidates.length === 0) return undefined;
  return candidates.reduce((best, c) => (c[metric] > best[metric] ? c : best));
}

function winrateClass(winrate: number | null | undefined) {
  if (winrate == null) return 'text-char-subtle';
  if (winrate >= 0.6) return 'text-match-win';
  if (winrate <= 0.4) return 'text-match-loss';
  return 'text-match-mid';
}

function CharacterCell({ char }: { char: ProminentChar | undefined }) {
  if (!char || char.games === 0) {
    return <span className="text-char-subtle">—</span>;
  }

  const info = getCharacterFromId(char.characterId);

  return (
    <span className="inline-flex items-center gap-1.5 min-w-0">
      <span className="w-6 h-6 rounded-sm overflow-hidden shrink-0">
        <img
          src={`/characters/portrait/${char.characterId}.webp`}
          alt=""
          className="w-full h-full object-cover"
        />
      </span>
      <span className="truncate text-char-secondary">{info?.name ?? char.characterId}</span>
    </span>
  );
}

export default function PlayerProfile({
  player,
  disabled = false,
  children,
}: {
  player: MatchPlayersTable;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && triggerRef.current && popoverRef.current) {
      setPosition(getClampedPopoverPosition(
        triggerRef.current.getBoundingClientRect(),
        popoverRef.current.getBoundingClientRect(),
        8,
        8,
        true, // preferAbove - profile popups read best floating over the card
      ));
    }
  }, [isOpen]);

  const rankInfo = getRankFromLP(player.rating);
  const roleKey = (player.role?.toLowerCase() ?? null) as 'forward' | 'goalie' | null;
  const playstyleType = roleKey ? player.playstyle?.[roleKey]?.type : undefined;
  const playstyleClass = playstyleType && playstyleType in PLAYSTYLE_CLASSES
    ? PLAYSTYLE_CLASSES[playstyleType as keyof typeof PLAYSTYLE_CLASSES]
    : null;

  const queueRows: { label: string; queue: 'Normal' | 'Ranked'; games: number | null | undefined; winrate: number | null | undefined }[] = [
    { label: 'Normal', queue: 'Normal', games: player.normGames, winrate: player.normWR },
    { label: 'Ranked', queue: 'Ranked', games: player.rankedGames, winrate: player.rankedWR },
  ];

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={() => !disabled && setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="w-full"
      >
        {children}
      </div>

      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="fixed z-60 w-96 pointer-events-none"
            style={{ top: position.top, left: position.left }}
          >
            <div className="rounded-xl border border-surface-border bg-surface shadow-2xl overflow-hidden">
              <div className="relative">
                {player.nameplate?.nameplateUrl && (
                  <>
                    <img
                      src={player.nameplate.nameplateUrl}
                      alt=""
                      aria-hidden
                      className="absolute inset-0 w-full h-full object-cover opacity-15 pointer-events-none select-none"
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0 pointer-events-none select-none"
                      style={{ background: 'linear-gradient(to bottom, transparent 30%, var(--color-surface) 100%)' }}
                    />
                  </>
                )}

              <div className="relative p-4 pb-0 space-y-3">
                {/* Header */}
                <div className="flex items-center gap-3">
                  {player.rating == null ? (
                    <div className="w-14 h-14 flex items-center justify-center shrink-0">
                      <div className="w-9 h-9 rounded-full border-2 border-surface-overlay border-t-primary animate-spin" />
                    </div>
                  ) : (
                    <RankIcon rating={player.rating} size="xm" />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base font-semibold text-char truncate">{player.username}</span>
                      {player.tags.length > 0 && (
                        <span className="flex items-center gap-1 shrink-0">
                          {player.tags.map(tag => (
                            <img
                              key={tag}
                              src={`/tags/${tag}.webp`}
                              alt={tag}
                              title={tag}
                              className="w-5 h-5"
                            />
                          ))}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-char-secondary mt-0.5 truncate">
                      {rankInfo.name}
                      {player.rating != null && (
                        <> <span className="text-char-subtle font-medium">({player.rating} Rating)</span></>
                      )}
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {player.accLevel != null && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-md border border-current/20 bg-current/5 text-char-secondary">
                      <ChartBarIcon size={12} weight="duotone" />
                      Lv. {player.accLevel}
                    </span>
                  )}

                  {playstyleType && (
                    <span className={clsx(
                      'inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-md border border-current/20 bg-current/5',
                      playstyleClass ?? 'text-char-secondary'
                    )}>
                      {player.role === 'Forward'
                        ? <SwordIcon size={12} weight="duotone" />
                        : <ShieldIcon size={12} weight="duotone" />}
                      {playstyleType.replace('Generic ', '')}
                    </span>
                  )}

                  <span className={clsx(
                    'inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-md border border-current/20 bg-current/5',
                    smurfClasses[player.smurfProbability]
                  )}>
                    <SmileySadIcon size={12} weight="duotone" />
                    Smurf: {smurfLabels[player.smurfProbability]}
                  </span>
                </div>
              </div>
              </div>

              {/* Solid gap between the banner and the stats table */}
              <div className="h-4" aria-hidden />

              {/* Queue stats */}
              <div className="px-4 pb-4">
                <table className="w-full text-xs border-t border-background-border/50 pt-2">
                  <thead>
                    <tr className="text-char-subtle uppercase tracking-wide text-[10px]">
                      <th className="text-left font-medium pb-1">Queue</th>
                      <th className="text-left font-medium pb-1">Games</th>
                      <th className="text-left font-medium pb-1">Winrate</th>
                      <th className="text-left font-medium pb-1">Main Striker</th>
                      <th className="text-left font-medium pb-1">Best Striker</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queueRows.map(row => (
                      <tr key={row.queue} className="border-t border-background-border/50">
                        <td className="py-1 pr-1 text-char-secondary font-medium">{row.label}</td>
                        <td className="py-1 pr-1 text-char-subtle">{row.games ?? '—'}</td>
                        <td className={clsx('py-1 pr-1 font-medium', winrateClass(row.winrate))}>
                          {row.winrate == null ? '—' : `${(row.winrate * 100).toFixed(0)}%`}
                        </td>
                        <td className="py-1 pr-1">
                          <CharacterCell char={pickChar(player.favChar, row.queue, 'games')} />
                        </td>
                        <td className="py-1">
                          <CharacterCell char={pickChar(player.bestChar, row.queue, 'winrate')} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
