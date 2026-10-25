import {
  UsersThreeIcon,
  RobotIcon,
  SlidersHorizontalIcon,
  TargetIcon,
  LightningIcon,
  TrophyIcon,
  QuestionIcon,
  type Icon,
} from '@phosphor-icons/react'

export type QueueObject = {
  queueId: string
  queueName: string
  icon: Icon
  class: 'Ranked' | 'Normal' // basically what stats to use
}

// Use the one in ody.ts for now
// export function getQueueName(queueId: string): string {
//   return QUEUES.find(q => q.queueId === queueId)?.queueName ?? queueId
// }

export const QUEUES: QueueObject[] = [
  {
    queueId: 'queue:quickplay',
    queueName: 'Quick Play',
    icon: LightningIcon,
    class: 'Normal',
  },
  {
    queueId: 'queue:ranked:3v3',
    queueName: 'Ranked',
    icon: TrophyIcon,
    class: 'Ranked',
  },
  {
    queueId: 'queue:3v3',
    queueName: 'Normal',
    icon: UsersThreeIcon,
    class: 'Normal',
  },
  {
    queueId: 'queue:coopvsai',
    queueName: 'Co-op vs AI',
    icon: RobotIcon,
    class: 'Normal',
  },
  {
    queueId: 'queue:custom:NvM',
    queueName: 'Customs',
    icon: SlidersHorizontalIcon,
    class: 'Ranked',
  },
  {
    queueId: 'queue:practice',
    queueName: 'Practice',
    icon: TargetIcon,
    class: 'Normal',
  },
  {
    queueId: 'queue:none',
    queueName: 'Unknown',
    icon: QuestionIcon,
    class: 'Ranked',
  },
]

export function getQueueObjectFromID(queueId: string | null | undefined): QueueObject {
  if (!queueId) { return QUEUES.find(q => q.queueId === 'queue:none')! };
  return QUEUES.find(q => q.queueId === queueId) ?? QUEUES.find(q => q.queueId === 'queue:none')!;
}

export function getQueueObjectFromName(queueName: string | null | undefined): QueueObject {
  if (!queueName) { return QUEUES.find(q => q.queueName === 'Unknown')! };
  return QUEUES.find(q => q.queueName === queueName) ?? QUEUES.find(q => q.queueName === 'Unknown')!;
}