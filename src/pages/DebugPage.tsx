import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getCurrentMatch, getMatchPlayers } from '../core/database/queries';
import type { CurrentMatchTable, MatchPlayersTable } from '../types/database';
import { TRAININGS } from '../core/objects/trainings';
import { ShieldIcon, SwordIcon } from '@phosphor-icons/react';
import { getLatestRegion } from '../core/bridgeListener';

function DebugRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-background-border last:border-0">
      <span className="text-xs text-char-subtle">{label}</span>
      <span className="text-xs font-medium text-char text-right max-w-[60%] truncate">{value ?? '—'}</span>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <p className="text-sm uppercase font-semibold tracking-widest text-char-subtle mb-1 mt-5 first:mt-0 py-2">
      {title}
    </p>
  );
}

function Swatch({ label, bg, text }: { label: string; bg: string; text?: string }) {
  return (
    <div className={`rounded-lg px-3 py-2 flex items-center justify-between gap-2 ${bg}`}>
      <span className={`text-xs font-medium truncate ${text ?? 'text-char'}`}>{label}</span>
      <span className={`text-[10px] font-mono opacity-60 ${text ?? 'text-char'}`}>{label}</span>
    </div>
  );
}

function ThemeButton({ label, cls }: { label: string; cls: string }) {
  return (
    <button className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${cls}`}>{label}</button>
  );
}

const activeTrainings = Object.entries(TRAININGS).filter(([, info]) => !info.disabled);

export default function DebugPage() {
  const [match, setMatch] = useState<CurrentMatchTable | null>(null);
  const [players, setPlayers] = useState<MatchPlayersTable[]>([]);
  const [region, setRegion] = useState<string | null>();
  const polling_rate = 2000;

  useEffect(() => {
    async function poll() {
      const [m, p] = await Promise.all([getCurrentMatch(), getMatchPlayers()]);
      setMatch(m);
      setPlayers(p);
    }

    poll();
    const id = setInterval(poll, polling_rate);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    async function fetchOnce() {
      setRegion(await getLatestRegion());
    }

    fetchOnce();
  }, [])

  return (
    <div className="min-h-screen bg-background px-4 py-6 sm:px-6">
      <motion.div
        className="flex flex-col sm:flex-row sm:items-start gap-6 max-w-5xl mx-auto"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Left: UE4SS Bridge */}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-char mb-1">Debug</h1>
          <p className="text-xs text-char-subtle mb-6">Polling every {polling_rate / 1000}s</p>

          <div className="bg-surface-subtle border border-background-border rounded-xl px-4">
            <SectionHeader title="Match State" />
            <DebugRow label="Game State" value={match?.gameState} />
            <DebugRow label="Map" value={match?.map} />
            <DebugRow label="Queue" value={match?.queue} />
            <DebugRow label="My Team" value={match?.teamNum} />
            <DebugRow label="Started At" value={match?.startedAt?.toLocaleTimeString()} />
            <DebugRow label="Region" value={region} />
          </div>

          <div className="bg-surface-subtle border border-background-border rounded-xl px-4 mt-3">
            <SectionHeader title="Score" />
            <DebugRow label="Team 1 Points" value={match?.teamOnePts} />
            <DebugRow label="Team 2 Points" value={match?.teamTwoPts} />
            <DebugRow label="Team 1 Sets" value={match?.teamOneSets} />
            <DebugRow label="Team 2 Sets" value={match?.teamTwoSets} />
          </div>

          <div className="bg-surface-subtle border border-background-border rounded-xl px-4 mt-3">
            <SectionHeader title={`Players (${players.length})`} />
            {players.length === 0 ? (
              <div className="py-3">
                <span className="text-xs text-char-subtle">None yet</span>
              </div>
            ) : (
              players.map((p) => (
                <DebugRow
                  key={p.username}
                  label={`${p.username}${p.isMe ? ' (me)' : ''}`}
                  value={`T${p.teamNum} · ${p.role ?? '?'} · ${p.charName ?? '?'}`}
                />
              ))
            )}
          </div>

          <div className="bg-surface-subtle border border-background-border rounded-xl px-4 mt-3 pb-4">
            <SectionHeader title={`Trainings (${activeTrainings.length})`} />
            <div className="grid grid-cols-6 gap-3">
              {activeTrainings.map(([id, info]) => (
                <div key={id} className="flex flex-col items-center gap-1">
                  <img src={info.image} alt={info.name} className="w-10 h-10 rounded" />
                  <span className="text-[10px] text-char text-center leading-tight">{info.name || id}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Theme Previewer */}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-char mb-1">Theme</h1>
          <p className="text-xs text-char-subtle mb-6">Current color tokens</p>

          {/* Typography */}
          <div className="bg-surface-subtle border border-background-border rounded-xl px-4 pb-4">
            <SectionHeader title="Typography" />
            <p className="text-base font-bold text-char mb-1">char — Primary text</p>
            <p className="text-sm text-char-secondary mb-1">char-secondary — Supporting text</p>
            <p className="text-sm text-char-subtle mb-1">char-subtle — Muted / labels</p>
            <p className="text-sm text-char-accent mb-1">char-accent — Accent text</p>
            <p className="text-sm text-primary mb-1">primary — Main color</p>
            <p className="text-sm text-secondary mb-1">secondary — Slightly darker</p>
            <p className="text-sm text-tertiary mb-1">tertiary — Even darker</p>
            <p className="text-sm text-error mb-1">error — Destructive</p>
            <p className="text-sm text-pink">pink — It's pink.</p>
          </div>

          {/* Buttons */}
          <div className="bg-surface-subtle border border-background-border rounded-xl px-4 pb-4 mt-3">
            <SectionHeader title="Buttons" />
            <div className="flex flex-wrap gap-2">
              <ThemeButton label="Primary" cls="bg-primary text-char" />
              <ThemeButton label="Secondary" cls="bg-secondary text-char" />
              <ThemeButton label="Tertiary" cls="bg-tertiary text-char" />
              <ThemeButton label="Error" cls="bg-error text-char" />
              <ThemeButton label="Pink" cls="bg-pink text-char" />
              <ThemeButton label="Outline" cls="border border-primary text-primary" />
              <ThemeButton label="Ghost" cls="text-char-subtle hover:text-char" />
              <ThemeButton label="Surface" cls="bg-surface-raised text-char" />
              <ThemeButton label="Overlay" cls="bg-surface-overlay text-char" />
              <ThemeButton label="Active" cls="bg-surface-active text-primary" />
            </div>
          </div>

          {/* Surfaces */}
          <div className="bg-surface-subtle border border-background-border rounded-xl px-4 pb-4 mt-3">
            <SectionHeader title="Surfaces" />
            <div className="flex flex-col gap-2">
              <Swatch label="background" bg="bg-background border border-background-border" />
              <Swatch label="surface-subtle" bg="bg-surface-subtle border border-background-border" />
              <Swatch label="surface" bg="bg-surface border border-background-border" />
              <Swatch label="surface-raised" bg="bg-surface-raised border border-background-border" />
              <Swatch label="surface-overlay" bg="bg-surface-overlay border border-background-border" />
              <Swatch label="surface-active" bg="bg-surface-active border border-background-border" text="text-primary" />
              <Swatch label="slate" bg="bg-slate border border-background-border" />
            </div>
          </div>

          {/* Match colors */}
          <div className="bg-surface-subtle border border-background-border rounded-xl px-4 pb-4 mt-3">
            <SectionHeader title="Match Colors" />
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-match-ally shrink-0" />
                <span className="text-xs text-match-ally font-medium">My Team</span>
                <span className="text-xs text-char-subtle ml-auto font-mono">match-ally</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-match-enemy shrink-0" />
                <span className="text-xs text-match-enemy font-medium">Their Team</span>
                <span className="text-xs text-char-subtle ml-auto font-mono">match-enemy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-match-win shrink-0" />
                <span className="text-xs text-match-win font-medium">98% Winrate</span>
                <span className="text-xs text-char-subtle ml-auto font-mono">match-win</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-match-mid shrink-0" />
                <span className="text-xs text-match-mid font-medium">50% Winrate</span>
                <span className="text-xs text-char-subtle ml-auto font-mono">match-mid</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-match-loss shrink-0" />
                <span className="text-xs text-match-loss font-medium">24% Winrate</span>
                <span className="text-xs text-char-subtle ml-auto font-mono">match-loss</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-match-brawler shrink-0" />
                <SwordIcon size={16} weight="duotone" className="text-xs text-match-brawler font-medium" />
                <span className="text-xs text-char-subtle ml-auto font-mono">match-brawler</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-match-midfielder shrink-0" />
                <SwordIcon size={16} weight="duotone" className="text-xs text-match-midfielder font-medium" />
                <span className="text-xs text-char-subtle ml-auto font-mono">match-midfielder</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-match-hardfwd shrink-0" />
                <SwordIcon size={16} weight="duotone" className="text-xs text-match-hardfwd font-medium" />
                <span className="text-xs text-char-subtle ml-auto font-mono">match-hardfwd</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-match-offgoalie shrink-0" />
                <ShieldIcon size={16} weight="duotone" className="text-xs text-match-offgoalie font-medium" />
                <span className="text-xs text-char-subtle ml-auto font-mono">match-offgoalie</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-match-defgoalie shrink-0" />
                <ShieldIcon size={16} weight="duotone" className="text-xs text-match-defgoalie font-medium" />
                <span className="text-xs text-char-subtle ml-auto font-mono">match-defgoalie</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
