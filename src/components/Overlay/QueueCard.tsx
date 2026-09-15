import { getQueueObjectFromID } from "../../core/objects/queues";
import { getPartyLabel } from "../../core/objects/sessions";

export default function QueueCard({
  queue,
  partySize,
}: {
  queue: string
  partySize: number
}) {
  const partyLabel = getPartyLabel(partySize);
  const queueName = getQueueObjectFromID(queue).queueName;

  if (!queue || queue === "Unknown") return null;

  return (
    <div className="flex flex-col">
      <span className="text-white font-bold text-2xl leading-tight">Playing {queueName}</span>
      <span className="text-white/70 text-lg">Queued {partyLabel}</span>
    </div>
  )
}
