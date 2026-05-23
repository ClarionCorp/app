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
  },
  {
    queueId: 'queue:ranked:3v3',
    queueName: 'Ranked',
    icon: TrophyIcon,
  },
  {
    queueId: 'queue:3v3',
    queueName: 'Normal',
    icon: UsersThreeIcon,
  },
  {
    queueId: 'queue:coopvsai',
    queueName: 'Co-op vs AI',
    icon: RobotIcon,
  },
  {
    queueId: 'queue:custom:NvM',
    queueName: 'Customs',
    icon: SlidersHorizontalIcon,
  },
  {
    queueId: 'queue:practice',
    queueName: 'Practice',
    icon: TargetIcon,
  },
  {
    queueId: 'queue:none',
    queueName: 'Unknown',
    icon: QuestionIcon,
  },
]