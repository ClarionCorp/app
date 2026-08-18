import { getTrainingInfo } from "../../core/objects/trainings";
import clsx from "clsx";
import { getCharName } from "../../core/objects/ody";
import { ShieldIcon, SwordIcon } from "@phosphor-icons/react";
import { MatchPlayer } from "../../types/ue4ss";
import { openUrl } from "@tauri-apps/plugin-opener";
import { getRankFromLP } from "../../core/objects/ranks";
import BasicPopover from "../UI/BasicPopover";

export function TeamListing({ players, myUsername }: { players: MatchPlayer[]; myUsername: string }) {
  return (
    <>
      {players.map((p) => (
        <div
          key={p.name}
          className={clsx(
            'flex items-center gap-2 p-2 rounded min-w-0',
            p.name === myUsername && 'bg-white/5'
          )}
        >
          {/* Character + Username */}
          <div className="flex items-center gap-2 w-full max-w-1/5 shrink-0">
            <img
              src={`/characters/portrait/${p.characterId}.webp`}
              alt={getCharName(p.characterId) ?? p.characterId}
              className="w-8 h-8 rounded object-cover"
            />
            <BasicPopover displayText={`${getRankFromLP(p.rating).name}`}>
              <img
                src={`${getRankFromLP(p.rating).image}`}
                alt={'rank icon'}
                className="w-6 h-6 object-cover"
              />
            </BasicPopover>
            <button
              onClick={() => openUrl(`https://clarioncorp.net/pilot/${p.name}`)}
              className="text-sm font-medium w-full truncate text-left cursor-pointer hover:underline text-char" title={p.name}
            >
              {p.name}
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center lg:gap-3 mx-auto min-w-0 flex-wrap">
            <BasicPopover displayText={p.role}>
              <div className="flex items-center justify-center min-w-8">
                {p.role === 'Forward' ? (
                  <SwordIcon size={16} weight="regular" className="text-char-subtle" />
                ) : (
                  <ShieldIcon size={16} weight="regular" className="text-char-subtle" />
                )}
              </div>
            </BasicPopover>
            <div className="flex flex-col items-center min-w-10">
              <span className="text-char-subtle text-[10px] leading-tight">Level</span>
              <span className="text-xs lg:text-sm font-semibold leading-tight text-char">{p.level}</span>
            </div>
            <div className={clsx('flex flex-col items-center min-w-10', p.role === 'Forward' ? 'opacity-100' : 'opacity-50')}>
              <span className="text-char-subtle text-[10px] leading-tight">Goals</span>
              <span className="text-xs lg:text-sm font-semibold leading-tight text-char">{p.goals}</span>
            </div>
            <div className={clsx('flex flex-col items-center min-w-10', p.role === 'Forward' ? 'opacity-100' : 'opacity-50')}>
              <span className="text-char-subtle text-[10px] leading-tight">Assists</span>
              <span className="text-xs lg:text-sm font-semibold leading-tight text-char">{p.assists}</span>
            </div>
            <div className={clsx('flex flex-col items-center min-w-10', p.role === 'Goalie' ? 'opacity-100' : 'opacity-50')}>
              <span className="text-char-subtle text-[10px] leading-tight">Saves</span>
              <span className="text-xs lg:text-sm font-semibold leading-tight text-char">{p.saves}</span>
            </div>
            <div className={clsx('flex flex-col items-center min-w-10', p.role === 'Forward' ? 'opacity-100' : 'opacity-50')}>
              <span className="text-char-subtle text-[10px] leading-tight">KOs</span>
              <span className="text-xs lg:text-sm font-semibold leading-tight text-char">{p.kos}</span>
            </div>
            <div className={clsx('flex flex-col items-center min-w-10', p.role === 'Forward' ? 'opacity-100' : 'opacity-50')}>
              <span className="text-char-subtle text-[10px] leading-tight">Damage</span>
              <span className="text-xs lg:text-sm font-semibold leading-tight text-char">{p.damage}</span>
            </div>
            <div className={clsx('flex flex-col items-center min-w-10', p.role === 'Forward' ? 'opacity-100' : 'opacity-50')}>
              <span className="text-char-subtle text-[10px] leading-tight">Shots</span>
              <span className="text-xs lg:text-sm font-semibold leading-tight text-char">{p.shots}</span>
            </div>
            <div className={clsx('flex flex-col items-center min-w-10', p.role === 'Goalie' ? 'opacity-100' : 'opacity-50')}>
              <span className="text-char-subtle text-[10px] leading-tight">Redirects</span>
              <span className="text-xs lg:text-sm font-semibold leading-tight text-char">{p.redirects}</span>
            </div>
            <div className={clsx('flex flex-col items-center min-w-10', p.role === 'Goalie' ? 'opacity-100' : 'opacity-50')}>
              <span className="text-char-subtle text-[10px] leading-tight">Orbs</span>
              <span className="text-xs lg:text-sm font-semibold leading-tight text-char">{p.orbs}</span>
            </div>
          </div>

          {/* Trainings */}
          <div className="flex items-start gap-3 ml-auto shrink-0">
            {p.trainings.some(id => getTrainingInfo(id)?.gear) && (
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-char-subtle whitespace-nowrap">Gear</span>
                <div className="flex gap-0.5">
                  {p.trainings.map((id, idx) => {
                    const info = getTrainingInfo(id)
                    if (!info?.gear) return null
                    return (
                      <BasicPopover key={idx} displayText={info.name}>
                        <img src={info.image} alt={info.name} className="w-5 h-5 rounded" />
                      </BasicPopover>
                    )
                  })}
                </div>
              </div>
            )}
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-char-subtle whitespace-nowrap">Awakenings</span>
              <div className="flex flex-wrap gap-0.5" style={{ maxWidth: '108px' }}>
                {p.trainings.map((id, idx) => {
                  const info = getTrainingInfo(id)
                  if (!info || info.gear) return null
                  return (
                    <BasicPopover key={idx} displayText={info.name}>
                      <img src={info.image} alt={info.name} className="w-5 h-5 rounded" />
                    </BasicPopover>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}


