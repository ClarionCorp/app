export type AbilityTag = 'Dash' | 'Buff' | 'Melee' | 'Impact' | 'Creation' | 'Projectile' | 'Blink' | 'Haste' | 'Debuff';

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
    id: 'CD_MagicalPlaymaker',
    name: 'Ai.Mi',
    abilities: [
      {
        type: 'Strike',
        title: "Strike",
        icon: '/characters/abilities/AiMi/strike.webp',
        tags: ['Melee'],
        cooldown: 0.9,
        description: "Knock the Core in a direction with a LIGHT MELEE hit."
      },
      {
        type: 'Primary',
        title: "Glitch Pop",
        icon: '/characters/abilities/AiMi/primary.webp',
        tags: ['Impact', 'Projectile'],
        cooldown: 9,
        description: "Launch a glitch orb that grows as it travels. The orb bursts on recast or max range, hitting enemies away from its center point."
      },
      {
        type: 'Secondary',
        title: "Cyber Swipe",
        icon: '/characters/abilities/AiMi/secondary.webp',
        tags: ['Blink', 'Melee', 'Impact'],
        cooldown: 17,
        description: "BLINK to a location. On arrival, swipe enemies in an arc with your tail."
      },
      {
        type: 'Special',
        title: "Firewall Sentry",
        icon: '/characters/abilities/AiMi/special.webp',
        tags: ['Projectile', 'Creation'],
        cooldown: 35,
        description: "Summon a turret that launches a firewall of technostatic in a fixed direction. Each bolt hits the first enemy struck."
      }
    ]
  },
  {
    id: 'CD_ShieldUser',
    name: 'Asher',
    abilities: [
      {
        type: 'Strike',
        title: "Strike",
        icon: '/characters/abilities/Asher/strike.webp',
        tags: ['Melee'],
        cooldown: 0.9,
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
  },
  {
    id: 'CD_AngelicSupport',
    name: 'Atlas',
    abilities: [
      {
        type: 'Strike',
        title: "Strike",
        icon: '/characters/abilities/Atlas/strike.webp',
        tags: ['Melee'],
        cooldown: 0.9,
        description: "Knock the Core in a direction with a LIGHT MELEE hit."
      },
      {
        type: 'Primary',
        title: "Astral Projection",
        icon: '/characters/abilities/Atlas/primary.webp',
        tags: ['Projectile'],
        cooldown: 10,
        description: "Launch a decelerating arc barrier that deals a single hit to each enemy it collides with."
      },
      {
        type: 'Secondary',
        title: "Cosmic Expanse",
        icon: '/characters/abilities/Atlas/secondary.webp',
        tags: ['Creation'],
        cooldown: 20,
        description: "Construct an expanding ring of light that quickly vanishes. The ring will persist and begin to shrink if it hits any enemies, dealing subsequent hits to enemies who collide with it."
      },
      {
        type: 'Special',
        title: "Celestial Intervention",
        icon: '/characters/abilities/Atlas/special.webp',
        tags: ['Creation'],
        cooldown: 35,
        description: "Summon a celestial guardian that continuously heals nearby allies. The guardian rescues any ally that would be K.O.'d, transporting them to its location and restoring 60% of their Stagger bar."
      }
    ]
  },
  {
    id: 'CD_NimbleBlaster',
    name: "Drek'ar",
    abilities: [
      {
        type: 'Strike',
        title: "Strike",
        icon: '/characters/abilities/Drekar/strike.webp',
        tags: ['Melee'],
        cooldown: 0.9,
        description: "Knock the Core in a direction with a LIGHT MELEE hit."
      },
      {
        type: 'Primary',
        title: "Lock and Load",
        icon: '/characters/abilities/Drekar/primary.webp',
        tags: ['Melee', 'Impact', 'Projectile'],
        cooldown: 11,
        description: "Blast nearby enemies with a powerful cone of energy that extends into LIGHT hit bullets. 2 charges."
      },
      {
        type: 'Secondary',
        title: "Xeno Cloak",
        icon: '/characters/abilities/Drekar/secondary.webp',
        tags: ['Buff', 'Haste'],
        cooldown: 12,
        description: "Become invisible and gain 47.5% Speed for 1.5s. Using an ability during this invisibility will reveal you and make that ability hit 15% harder (15% to Core)."
      },
      {
        type: 'Special',
        title: "Molten Bolt",
        icon: '/characters/abilities/Drekar/special.webp',
        tags: ['Projectile', 'Debuff'],
        cooldown: 27,
        description: "Launch a sticky bomb that hits and burns the first enemy struck for 2s, slowing and damaging them over time. The effect can spread to nearby enemies."
      }
    ]
  },
  {
    id: 'CD_StalwartProtector',
    name: 'Dubu',
    abilities: [
      {
        type: 'Strike',
        title: "Strike",
        icon: '/characters/abilities/Dubu/strike.webp',
        tags: ['Melee'],
        cooldown: 0.9,
        description: "Knock the Core in a direction with a LIGHT MELEE hit."
      },
      {
        type: 'Primary',
        title: "Rollout",
        icon: '/characters/abilities/Dubu/primary.webp',
        tags: ['Projectile', 'Creation'],
        cooldown: 10,
        description: "Wind up and roll a decelerating bamboo log that hits and breaks on the first enemy hit."
      },
      {
        type: 'Secondary',
        title: "Somerassault",
        icon: '/characters/abilities/Dubu/secondary.webp',
        tags: ['Dash', 'Melee', 'Impact', 'Debuff'],
        cooldown: 18,
        description: "Roll in a direction. At max range or on impact with an enemy, smash nearby enemies, stunning them."
      },
      {
        type: 'Special',
        title: "Tofu Fortress",
        icon: '/characters/abilities/Dubu/special.webp',
        tags: ['Projectile', 'Creation'],
        cooldown: 40,
        description: "Serve up an arc of tofu plates that hit enemies and leave impassable terrain where they end."
      }
    ]
  },
  {
    id: 'CD_EmpoweringEnchanter',
    name: 'Era',
    abilities: [
      {
        type: 'Strike',
        title: "Strike",
        icon: '/characters/abilities/Era/strike.webp',
        tags: ['Melee'],
        cooldown: 0.9,
        description: "Knock the Core in a direction with a LIGHT MELEE hit."
      },
      {
        type: 'Primary',
        title: "Bewitching Beam",
        icon: '/characters/abilities/Era/primary.webp',
        tags: ['Impact', 'Buff', 'Debuff'],
        cooldown: 9,
        description: "Bewitch allies and enemies in a line. Enemies are reduced in Size, Speed, and Power. Allies gain Size and Power."
      },
      {
        type: 'Secondary',
        title: "Flutter Fly",
        icon: '/characters/abilities/Era/secondary.webp',
        tags: ['Haste', 'Buff'],
        cooldown: 18,
        description: "Empower nearby allies with 40% Speed that decays over 2s."
      },
      {
        type: 'Special',
        title: "Magic Maelstrom",
        icon: '/characters/abilities/Era/special.webp',
        tags: ['Projectile', 'Creation'],
        cooldown: 20,
        description: "Conjure a growing maelstrom. On recast or after a few seconds, launch the maelstrom, hitting all enemies in its path. If released before full size, it has reduced range and deals LIGHT hits."
      }
    ]
  },
  {
    id: 'CD_TempoSniper',
    name: 'Estelle',
    abilities: [
      {
        type: 'Strike',
        title: "Strike",
        icon: '/characters/abilities/Estelle/strike.webp',
        tags: ['Melee'],
        cooldown: 0.9,
        description: "Knock the Core in a direction with a LIGHT MELEE hit."
      },
      {
        type: 'Primary',
        title: "Piercing Shot",
        icon: '/characters/abilities/Estelle/primary.webp',
        tags: ['Impact'],
        cooldown: 10,
        description: "Take aim and unleash crystalline energy at all enemies in a long line."
      },
      {
        type: 'Secondary',
        title: "Rose Warp",
        icon: '/characters/abilities/Estelle/secondary.webp',
        tags: ['Blink', 'Projectile'],
        cooldown: 16,
        description: "BLINK to a nearby location, then fire a crystal thorn at the nearest target."
      },
      {
        type: 'Special',
        title: "Crystal Thorns",
        icon: '/characters/abilities/Estelle/special.webp',
        tags: ['Projectile'],
        cooldown: 23,
        description: "Fire a volley of LIGHT crystal thorns in an arc."
      }
    ]
  },
  {
    id: 'CD_GravityMage',
    name: 'Finii',
    abilities: [
      {
        type: 'Strike',
        title: "Strike",
        icon: '/characters/abilities/Finii/strike.webp',
        tags: ['Melee'],
        cooldown: 0.9,
        description: "Knock the Core in a direction with a LIGHT MELEE hit."
      },
      {
        type: 'Primary',
        title: "Misdirection",
        icon: '/characters/abilities/Finii/primary.webp',
        tags: ['Projectile'],
        cooldown: 8,
        description: "Launch a decelerating projectile that hits the first enemy struck. After reaching its apex, it rapidly reverses course and hits harder."
      },
      {
        type: 'Secondary',
        title: "Triple Take",
        icon: '/characters/abilities/Finii/secondary.webp',
        tags: ['Impact', 'Debuff'],
        cooldown: 12,
        description: "Deploy a poof of smoke at a target location that pulses 3 LIGHT hits over a short duration. Hitting an enemy player applies a DEBUFF that causes them to take 20% more damage from all sources for 3.5s."
      },
      {
        type: 'Special',
        title: "Big Finish",
        icon: '/characters/abilities/Finii/special.webp',
        tags: ['Impact', 'Creation'],
        cooldown: 30,
        description: "Conjure a gravity well at a target location, slowing and pulling enemies towards its center point. After 2.5s or upon recast, the well explodes, hitting enemies away."
      }
    ]
  },
  {
    id: 'CD_FlexibleBrawler',
    name: 'Juliette',
    abilities: [
      {
        type: 'Strike',
        title: "Strike",
        icon: '/characters/abilities/Juliette/strike.webp',
        tags: ['Melee'],
        cooldown: 0.9,
        description: "Knock the Core in a direction with a LIGHT MELEE hit."
      },
      {
        type: 'Primary',
        title: "Fiery Fist",
        icon: '/characters/abilities/Juliette/primary.webp',
        tags: ['Melee', 'Impact'],
        cooldown: 8.5,
        description: "Punch all enemies in a line."
      },
      {
        type: 'Secondary',
        title: "Flying Phoenix",
        icon: '/characters/abilities/Juliette/secondary.webp',
        tags: ['Dash', 'Melee'],
        cooldown: 17,
        description: "Dash in a direction, hitting all enemies in your path. Other abilities can be cast while dashing."
      },
      {
        type: 'Special',
        title: "Flame Flurry",
        icon: '/characters/abilities/Juliette/special.webp',
        tags: ['Melee', 'Impact'],
        cooldown: 35,
        description: "Deal a flurry of light jabs in an arc, culminating in a devastating roundhouse kick."
      }
    ]
  },
  // {
  //   id: 'CD_',
  //   name: '',
  //   abilities: [
  //     {
  //       type: 'Strike',
  //       title: "Strike",
  //       icon: '/characters/abilities/xxxxxxx/strike.webp',
  //       tags: ['Melee'],
  //       cooldown: 0.9,
  //       description: "Knock the Core in a direction with a LIGHT MELEE hit."
  //     },
  //     {
  //       type: 'Primary',
  //       title: "",
  //       icon: '/characters/abilities/xxxxxxx/primary.webp',
  //       tags: [],
  //       cooldown: ,
  //       description: ""
  //     },
  //     {
  //       type: 'Secondary',
  //       title: "",
  //       icon: '/characters/abilities/xxxxxxx/secondary.webp',
  //       tags: [],
  //       cooldown: ,
  //       description: ""
  //     },
  //     {
  //       type: 'Special',
  //       title: "",
  //       icon: '/characters/abilities/xxxxxxx/special.webp',
  //       tags: [],
  //       cooldown: ,
  //       description: ""
  //     }
  //   ]
  // },
]