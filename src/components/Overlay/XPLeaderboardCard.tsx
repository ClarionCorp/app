import { LiveMatchPlayer } from '../../core/overlay'

function getBarColor(player: LiveMatchPlayer, myTeam: 1 | 2) {
  if (player.isMe) return '#25cf0e';
  return player.teamNumber === myTeam ? '#3b82f6' : '#ef4444';
}

export default function XPLeaderboardCard({
  players,
  myTeam,
}: {
  players: LiveMatchPlayer[]
  myTeam: 1 | 2
}) {
  if (players.length === 0) return null;

  const sorted = [...players].sort((a, b) => b.gainedXp - a.gainedXp)
  const maxXp = Math.max(1, ...sorted.map((p) => p.gainedXp))

  return (
    <div className="rounded-3xl border bg-black/80 border-white/10 px-3 py-3 w-full flex flex-col gap-2">
      <p className="text-[11px] uppercase font-semibold tracking-widest text-white/50 text-center">
        Most XP Gained This Set
      </p>

      {sorted.map((player, index) => {
        const xp = player.gainedXp
        const pct = Math.max(4, (xp / maxXp) * 100)
        const color = getBarColor(player, myTeam)

        return (
          <div key={player.playerId} className="flex items-center gap-2">
            <span className="w-3 shrink-0 text-xs font-semibold text-white/50 text-right">
              {index + 1}
            </span>

            <div
              className="w-7 h-7 rounded-full overflow-hidden shrink-0 border-2"
              style={{ borderColor: color }}
            >
              {player.characterId ? (
                <img
                  src={`/characters/portrait/${player.characterId}.webp`}
                  alt=""
                  className="w-full h-full object-cover bg-black/40"
                />
              ) : (
                <div className="w-full h-full bg-white/10" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2 mb-1">
                <span className="text-xs font-medium text-white truncate">
                  {player.username}
                </span>
                <span className="text-xs font-semibold text-white/60 shrink-0">
                  {xp.toLocaleString()}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
