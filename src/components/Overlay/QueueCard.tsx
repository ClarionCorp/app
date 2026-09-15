// Separate from the one in dRPC to keep overlay server separate
const PARTY_SIZE_LABELS: Record<number, string> = {
  1: 'Solo',
  2: 'Duos',
  3: 'Trios',
}

export default function QueueCard({
  queue,
  partySize,
}: {
  queue: string
  partySize: number
}) {
  const partyLabel = PARTY_SIZE_LABELS[partySize] ?? `${partySize}-Stack`

  if (!queue || queue === "Unknown") return null;

  return (
    <div className="flex flex-col">
      <span className="text-white font-bold text-2xl leading-tight">Playing {queue}</span>
      <span className="text-white/70 text-lg">Queued {partyLabel}</span>
    </div>
  )
}
