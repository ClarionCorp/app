export type AbilityTag = 'Dash' | 'Buff' | 'Melee' | 'Impact' | 'Creation' | 'Projectile';

export type Ability = {
  type: 'Strike' | 'Primary' | 'Secondary' | 'Special'
  title: string,
  icon: string,
  tags: AbilityTag[],
  cooldown: number, // seconds
  description: string,
}

type Character = {
  id: string,
  name: string,
  abilities: Ability[]
}

export const characters: Character[] = [
  {
    id: 'CD_ShieldUser',
    name: 'Asher',
    abilities: [
      {
        type: 'Strike',
        title: "Strike",
        icon: '/characters/abilities/Asher/strike.webp',
        tags: ['Melee'],
        cooldown: 0.7,
        description: "Knock the Core in a direction with a LIGHT MELEE hit."
      },
      {
        type: 'Primary',
        title: "Barrier Beam",
        icon: '/characters/abilities/Asher/primary.webp',
        tags: ['Melee', 'Impact', 'Creation'],
        cooldown: 7.7,
        description: "Create a barrier while firing a blast that knocks away enemies near its center but deals a LIGHT hit to others. The barrier deals LIGHT hits and breaks when it touches an enemy. If cast on your side of the field, the barrier is larger and unbreakable."
      },
      {
        type: 'Secondary',
        title: "Breakthrough",
        icon: '/characters/abilities/Asher/secondary.webp',
        tags: ['Dash', 'Melee', 'Buff'],
        cooldown: 11.2,
        description: "Gain a defensive buff and charge forward, stopping on the first enemy hit and knocking nearby enemies back. The buff reduces your Strike cooldown while on your side of the field and grants 25% damage reduction for 5s. This buff is lost if you are staggered."
      },
      {
        type: 'Special',
        title: "Pathsplitter",
        icon: '/characters/abilities/Asher/special.webp',
        tags: ['Projectile', 'Creation'],
        cooldown: 30.8,
        description: "Combine both shields and launch them forward. If they hit an enemy, they expand into a slow-moving, destructible barrier that can repeatedly hit enemies. Deals reduced damage after the first hit."
      }
    ]
  }
]