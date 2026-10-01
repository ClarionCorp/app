import { getCharacterFromId } from '../../core/objects/characters'

export default function BansCard({ bans }: { bans?: string[] }) {
  if (!bans) return null;

  return (
    <div className="flex flex-col gap-1">
      <span className="text-white text-lg font-semibold">Banned Characters:</span>
      {bans.length === 0 ? (
        <span className="text-white/70">None.</span>
      ) : (
        <div className="flex gap-1">
          {bans.slice(0, 2).map((banId) => {
            const character = getCharacterFromId(banId)
            if (!character) return null

            return (
              <img
                key={banId}
                src={`/characters/portrait/${character.id}.webp`}
                alt={character.name}
                title={character.name}
                width={48}
                height={48}
                className="rounded-md w-16 aspect-square object-cover"
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
