import { getPartyLabel } from "../../core/objects/sessions";

export default function QueueCard({
  queue,
  partySize,
}: {
  queue: string
  partySize: number
}) {
  const partyLabel = getPartyLabel(partySize);

  if (!queue || queue === "Unknown") return null;

  return (
    <div className="flex flex-col">
      <span className="text-white font-bold text-2xl leading-tight">Playing {queue}</span>
      <span className="text-white/70 text-lg">Queued {partyLabel}</span>
    </div>
  )
}
