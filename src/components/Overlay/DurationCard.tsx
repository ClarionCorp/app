import { useEffect, useState } from 'react'
import { TimelineEntry } from '../../types/ue4ss'
import { formatDuration } from '../../core/utilities/system'

export default function DurationCard({
  startedAt,
  timeline,
}: {
  startedAt?: string | Date
  timeline?: TimelineEntry[] | null
}) {
  const [now, setNow] = useState(() => Date.now())
  const wonGame = timeline?.find((entry) => entry.event === 'WON_GAME')

  useEffect(() => {
    setNow(Date.now())

    if (wonGame) return
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [wonGame, startedAt])

  if (!startedAt) return null;

  const endTime = wonGame ? new Date(wonGame.when).getTime() : now
  const elapsedMs = endTime - new Date(startedAt).getTime()

  return (
    <div className="flex flex-col">
      <span className="text-white text-xl font-semibold">Match Duration:</span>
      <span className="text-white/70 text-lg">{formatDuration(elapsedMs)} (approx.)</span>
    </div>
  )
}
