import { useEffect, useRef, useState } from "react";
import { getTrainingInfo } from "../../core/objects/trainings";
import clsx from "clsx";
import { getCharName } from "../../core/objects/ody";
import { ShieldIcon, SwordIcon } from "@phosphor-icons/react";
import { MatchPlayer } from "../../types/ue4ss";

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
          <div className="flex items-center gap-2 shrink-0">
            <img
              src={`/characters/portrait/${p.characterId}.webp`}
              alt={getCharName(p.characterId) ?? p.characterId}
              className="w-8 h-8 rounded object-cover"
            />
            <span className="text-sm font-medium w-28 truncate" title={p.name}>
              {p.name}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-2 lg:gap-3 mx-auto shrink-0">
            <BasicPopover displayText={p.role}>
              <div className="flex items-center justify-center min-w-8">
                {p.role === 'Forward' ? (
                  <SwordIcon size={16} weight="regular" className="text-char-subtle" />
                ) : (
                  <ShieldIcon size={16} weight="regular" className="text-char-subtle" />
                )}
              </div>
            </BasicPopover>
            <div className="flex flex-col items-center min-w-12">
              <span className="text-char-subtle text-[10px] leading-tight">Level</span>
              <span className="text-xs lg:text-sm font-semibold leading-tight">{p.level}</span>
            </div>
            <div className={clsx('flex flex-col items-center min-w-12', p.role === 'Forward' ? 'opacity-100' : 'opacity-50')}>
              <span className="text-char-subtle text-[10px] leading-tight">Goals</span>
              <span className="text-xs lg:text-sm font-semibold leading-tight">{p.goals}</span>
            </div>
            <div className={clsx('flex flex-col items-center min-w-12', p.role === 'Goalie' ? 'opacity-100' : 'opacity-50')}>
              <span className="text-char-subtle text-[10px] leading-tight">Assists</span>
              <span className="text-xs lg:text-sm font-semibold leading-tight">{p.assists}</span>
            </div>
            <div className={clsx('flex flex-col items-center min-w-12', p.role === 'Goalie' ? 'opacity-100' : 'opacity-50')}>
              <span className="text-char-subtle text-[10px] leading-tight">Saves</span>
              <span className="text-xs lg:text-sm font-semibold leading-tight">{p.saves}</span>
            </div>
            <div className={clsx('flex flex-col items-center min-w-12', p.role === 'Forward' ? 'opacity-100' : 'opacity-50')}>
              <span className="text-char-subtle text-[10px] leading-tight">KOs</span>
              <span className="text-xs lg:text-sm font-semibold leading-tight">{p.kos}</span>
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
              <span className="text-[10px] text-char-subtle whitespace-nowrap">Trainings</span>
              <div className="flex gap-0.5">
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


function BasicPopover({ displayText, children }: { displayText: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && triggerRef.current && popoverRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect()
      const popoverRect = popoverRef.current.getBoundingClientRect()
      setPosition({
        top: triggerRect.top - popoverRect.height - 8,
        left: triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2,
      })
    }
  }, [isOpen])

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="inline-flex items-center justify-center"
      >
        {children}
      </div>
      {isOpen && (
        <div
          ref={popoverRef}
          className="fixed z-50 px-2 py-1 text-xs rounded bg-surface-overlay border border-background-border pointer-events-none whitespace-nowrap"
          style={{ top: `${position.top}px`, left: `${position.left}px` }}
        >
          {displayText}
        </div>
      )}
    </>
  )
}