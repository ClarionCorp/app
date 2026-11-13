import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { Section } from './Cards'

const CHIP_WIDTH = 20 // w-5
const CHIP_GAP = 4 // gap-1

export default function RecentOutcomesSection({ results }: { results: boolean[] }) {
  const stripRef = useRef<HTMLDivElement>(null)
  const [fitCount, setFitCount] = useState(0)

  useEffect(() => {
    const el = stripRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      setFitCount(Math.max(0, Math.floor((entry.contentRect.width + CHIP_GAP) / (CHIP_WIDTH + CHIP_GAP)) - 1))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <Section>
      <div className="flex items-center gap-2 min-w-0">
        {/* Chips are absolutely positioned so they never contribute to layout width */}
        <div ref={stripRef} className="relative flex-1 min-w-0 h-6">
          <div className="absolute inset-0 flex justify-center gap-1">
            {results.slice(0, fitCount).map((won, i) => (
              <div
                key={i}
                title={won ? 'Win' : 'Loss'}
                className={clsx(
                  'w-5 h-6 shrink-0 rounded flex items-center justify-center text-[10px] font-bold',
                  won ? 'bg-match-win/20 text-match-win' : 'bg-match-loss/20 text-match-loss'
                )}
              >
                {won ? 'W' : 'L'}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}
