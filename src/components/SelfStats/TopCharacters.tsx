import { Section, WinRateBar } from './Cards'
import { getCharacterFromId } from '../../core/objects/characters'
import { getCharName } from '../../core/objects/ody'
import { CharacterTotals, winRate } from '../../core/utilities/selfStats'

export default function TopCharactersSection({ characters, customImgs }: { characters: CharacterTotals[]; customImgs: boolean }) {
  return (
    <Section title="Top Characters">
      <div className="space-y-2">
        {characters.slice(0, 5).map(c => {
          const character = getCharacterFromId(c.characterId)
          const art = customImgs ? character?.images.custom_portrait : character?.images.portrait
          const wr = winRate(c.wins, c.games)
          return (
            <div key={c.characterId} className="flex items-center gap-3 min-w-0">
              <img src={art} alt="" className="w-9 h-9 rounded object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 text-xs mb-1">
                  <span className="font-semibold text-char truncate">{character?.name ?? getCharName(c.characterId) ?? c.characterId}</span>
                  <span className="text-char-subtle tabular-nums shrink-0">{c.games} games · {wr}%</span>
                </div>
                <WinRateBar percent={wr} />
                <p className="text-[10px] text-char-subtle mt-0.5">
                  {c.forwardGames} Forward · {c.goalieGames} Goalie
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </Section>
  )
}
