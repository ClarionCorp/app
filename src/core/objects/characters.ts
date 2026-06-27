export type AbilityTag = 'Dash' | 'Buff' | 'Melee' | 'Impact' | 'Creation' | 'Projectile' | 'Blink' | 'Haste' | 'Debuff';

export type Ability = {
  type: 
    'Strike' |
    'Open Strike' |
    'Closed Strike' |
    'Primary' |
    'Open Primary' |
    'Closed Primary' |
    'Secondary' |
    'Open Secondary' |
    'Closed Secondary' |
    'Special' |
    'Open Special' |
    'Closed Special'
  ,
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
  {
    id: 'CD_CleverSummoner',
    name: 'Juno',
    abilities: [
      {
        type: 'Strike',
        title: "Strike",
        icon: '/characters/abilities/Juno/strike.webp',
        tags: ['Melee'],
        cooldown: 0.9,
        description: "Knock the Core in a direction with a LIGHT MELEE hit."
      },
      {
        type: 'Primary',
        title: "Friend Fling",
        icon: '/characters/abilities/Juno/primary.webp',
        tags: ['Projectile', 'Creation'],
        cooldown: 8,
        description: "Launch a blob that hits the first enemy struck and spawns a blob on impact or max range."
      },
      {
        type: 'Secondary',
        title: "Blob Bounce",
        icon: '/characters/abilities/Juno/secondary.webp',
        tags: ['Creation'],
        cooldown: 12,
        description: "Spawn a blob at your feet and hop to a location, becoming Elusive while airborne. Elusive targets are invulnerable and untargetable."
      },
      {
        type: 'Special',
        title: "Make It Rain",
        icon: '/characters/abilities/Juno/special.webp',
        tags: ['Creation'],
        cooldown: 25,
        description: "Target an area and launch a massive blob cluster into the sky. After a delay the cluster splits, raining down blobs for each enemy in the target area, plus one at the center."
      }
    ]
  },
  {
    id: 'CD_SpeedySkirmisher',
    name: 'Kai',
    abilities: [
      {
        type: 'Strike',
        title: "Strike",
        icon: '/characters/abilities/Kai/strike.webp',
        tags: ['Melee'],
        cooldown: 0.9,
        description: "Knock the Core in a direction with a LIGHT MELEE hit."
      },
      {
        type: 'Primary',
        title: "Barrage",
        icon: '/characters/abilities/Kai/primary.webp',
        tags: ['Projectile'],
        cooldown: 12,
        description: "Launch a barrage of LIGHT fireballs in a direction."
      },
      {
        type: 'Secondary',
        title: "Blazing Pace",
        icon: '/characters/abilities/Kai/secondary.webp',
        tags: ['Haste', 'Buff'],
        cooldown: 18,
        description: "Gain +30% Speed for 5s."
      },
      {
        type: 'Special',
        title: "Giga Blast",
        icon: '/characters/abilities/Kai/special.webp',
        tags: ['Impact', 'Projectile'],
        cooldown: 24,
        description: "Launch a blazing fireball that detonates on impact with an enemy or wall, hitting enemies away from the blast's center point."
      }
    ]
  },
  {
    id: 'CD_UmbrellaUser',
    name: 'Kazan',
    abilities: [
      {
        type: 'Closed Strike',
        title: "Press the Point",
        icon: '/characters/abilities/Kazan/closed_strike.webp',
        tags: ['Melee'],
        cooldown: 0.9,
        description: "Knock the Core with a LIGHT hit that has greater force generated by the point of the umbrella."
      },
      {
        type: 'Open Strike',
        title: "Strike",
        icon: '/characters/abilities/Kazan/open_strike.webp',
        tags: ['Melee'],
        cooldown: 0.9,
        description: "Knock the Core in a direction with a LIGHT MELEE hit."
      },
      {
        type: 'Closed Primary',
        title: "Crooked Leverage",
        icon: '/characters/abilities/Kazan/closed_primary.webp',
        tags: ['Melee', 'Impact'],
        cooldown: 10.5,
        description: "Hook all targets in a line towards you."
      },
      {
        type: 'Open Primary',
        title: "Top Spin",
        icon: '/characters/abilities/Kazan/open_primary.webp',
        tags: ['Melee', 'Impact'],
        cooldown: 14,
        description: "LIGHTLY hit all enemies in a line, pushing them towards the top of the umbrella. The umbrella will then spin rapidly, dealing multiple LIGHT hits leading up to a final, more powerful flourish."
      },
      {
        type: 'Closed Secondary',
        title: "The Slip",
        icon: '/characters/abilities/Kazan/closed_secondary.webp',
        tags: ['Dash'],
        cooldown: 12,
        description: "Dash a short distance, passing by all targets."
      },
      {
        type: 'Open Secondary',
        title: "Carried Away",
        icon: '/characters/abilities/Kazan/open_secondary.webp',
        tags: ['Dash'],
        cooldown: 16,
        description: "Float up in the air, becoming Elusive. Elusive targets are invulnerable and untargetable."
      },
      {
        type: 'Special',
        title: "Pop / Retract",
        icon: '/characters/abilities/Kazan/closed_special.webp',
        tags: [],
        cooldown: 1,
        description: "Pop open or Retract the Umbrella, unlocking a different set of abilities per form."
      },
      {
        type: 'Closed Special',
        title: "Pop-Up",
        icon: '/characters/abilities/Kazan/open_special.webp',
        tags: ['Melee', 'Impact'],
        cooldown: 1,
        description: "During The Slip, popping the Umbrella will hit all nearby enemies and stop the dash."
      },
      {
        type: 'Open Special',
        title: "Maddening Descent",
        icon: '/characters/abilities/Kazan/open_dive.webp',
        tags: ['Dash', 'Melee', 'Impact'],
        cooldown: 1,
        description: "Leap higher and then dive down, slamming all enemies when landing."
      }
    ]
  },
  {
    id: 'CD_ChaoticRocketeer',
    name: 'Luna',
    abilities: [
      {
        type: 'Strike',
        title: "Strike",
        icon: '/characters/abilities/Luna/strike.webp',
        tags: ['Melee'],
        cooldown: 0.9,
        description: "Knock the Core in a direction with a LIGHT MELEE hit."
      },
      {
        type: 'Primary',
        title: "W.H.A.M.M.Y.",
        icon: '/characters/abilities/Luna/primary.webp',
        tags: ['Projectile'],
        cooldown: 7.5,
        description: "Fire a rocket that deals a LIGHT hit on early impact. After a brief delay, it accelerates and hits much harder."
      },
      {
        type: 'Secondary',
        title: "B.O.O.S.T.",
        icon: '/characters/abilities/Luna/secondary.webp',
        tags: ['Dash', 'Melee'],
        cooldown: 18,
        description: "Launch in a direction with limited ability to steer, only stopping upon collision with an enemy or terrain."
      },
      {
        type: 'Special',
        title: "C.R.A.T.E.R.",
        icon: '/characters/abilities/Luna/special.webp',
        tags: ['Impact', 'Projectile'],
        cooldown: 40,
        description: "Drop a bomb at a location, hitting surrounding enemies. Enemies at the center are hit much harder."
      }
    ]
  },
  {
    id: 'CD_DrumOni',
    name: 'Mako',
    abilities: [
      {
        type: 'Strike',
        title: "Rhythm Strike",
        icon: '/characters/abilities/Mako/strike.webp',
        tags: ['Melee'],
        cooldown: 0.9,
        description: "Knock the Core in a direction with a LIGHT hit. Every hit, gain a Beat. At 8 Beats, this Strike will be empowered with a larger size, more Core knockback, and it can hit enemy Strikers."
      },
      {
        type: 'Primary',
        title: "Perfect Pitch",
        icon: '/characters/abilities/Mako/primary.webp',
        tags: ['Melee', 'Impact', 'Projectile'],
        cooldown: 8.5,
        description: "Push-and-hold to wind up a huge swing. On release, swing the bat for a LIGHT hit. After 0.1s the swing will also connect with a drum, launching it forward as a PROJECTILE. Charge up to 1.25s for a stronger swing."
      },
      {
        type: 'Secondary',
        title: "Drum and Base",
        icon: '/characters/abilities/Mako/secondary.webp',
        tags: ['Haste', 'Impact', 'Buff'],
        cooldown: 21,
        description: "Push-and-hold this ability for up to 3.5s to push away enemies and BUFF all allies, granting 28% HASTE and 21% Size while drumming and for 1s after. Upon releasing the ability, emit a LIGHT shockwave that blasts enemies away from you. Gain a Beat upon using this ability and another every 1s it's held."
      },
      {
        type: 'Special',
        title: "Ensnare Drums",
        icon: '/characters/abilities/Mako/special.webp',
        tags: ['Projectile', 'Creation'],
        cooldown: 36,
        description: "Launch your drums towards enemies as a PROJECTILE. On hitting an enemy CREATE a trap that will let targets enter but will knock them back when they attempt to escape."
      }
    ]
  },
  {
    id: 'CD_Healer',
    name: 'Nao',
    abilities: [
      {
        type: 'Strike',
        title: "Strike",
        icon: '/characters/abilities/Nao/strike.webp',
        tags: ['Melee'],
        cooldown: 0.9,
        description: "Knock the Core in a direction with a LIGHT MELEE hit."
      },
      {
        type: 'Primary',
        title: "Sentry Drone",
        icon: '/characters/abilities/Nao/primary.webp',
        tags: ['Projectile', 'Creation'],
        cooldown: 7,
        description: "Launch a drone that hits the first enemy struck. At max range or upon recast, it halts and creates unstable energy that increases in power and size over time, hitting the first enemy struck in the direction cast."
      },
      {
        type: 'Secondary',
        title: "Proximity Drone",
        icon: '/characters/abilities/Nao/secondary.webp',
        tags: ['Haste', 'Impact', 'Creation', 'Buff'],
        cooldown: 10.5,
        description: "Deploy a drone at a target location that lasts up to 15s and detonates on contact with a friendly player, hitting enemies away. Nearby allies restore 20% max stagger and gain a 40% Haste BUFF for 1.5s. Enemies can disarm the drone by briefly standing on it."
      },
      {
        type: 'Special',
        title: "Lifeline",
        icon: '/characters/abilities/Nao/special.webp',
        tags: ['Blink'],
        cooldown: 45,
        description: "Become ELUSIVE and BLINK to a target location near yourself or an ally, restoring 40% of nearby allies' missing stagger on arrival. Within the next 3.25s, recast to BLINK back to your starting position."
      }
    ]
  },
  {
    id: 'CD_EDMOni',
    name: 'Octavia',
    abilities: [
      {
        type: 'Strike',
        title: "Strike",
        icon: '/characters/abilities/Octavia/strike.webp',
        tags: ['Melee'],
        cooldown: 0.9,
        description: "Knock the Core in a direction with a LIGHT MELEE hit."
      },
      {
        type: 'Primary',
        title: "Sonic Boom",
        icon: '/characters/abilities/Octavia/primary.webp',
        tags: ['Projectile', 'Debuff'],
        cooldown: 9,
        description: "Launch a sonic wave that hits all enemies it passes through and slows them for 1s. Deals LIGHT hits to subsequent enemies."
      },
      {
        type: 'Secondary',
        title: "Flow State",
        icon: '/characters/abilities/Octavia/secondary.webp',
        tags: ['Haste', 'Buff'],
        cooldown: 17,
        description: "Gain +33% Speed for 2.5s. Hitting anything refreshes the duration."
      },
      {
        type: 'Special',
        title: "Bass Drop",
        icon: '/characters/abilities/Octavia/special.webp',
        tags: ['Melee', 'Impact'],
        cooldown: 35,
        description: "After a delay, emit 5 sound pulses at surrounding enemies over 2.5s."
      }
    ]
  },
  {
    id: 'CD_WhipFighter',
    name: 'Rasmus',
    abilities: [
      {
        type: 'Strike',
        title: "Strike",
        icon: '/characters/abilities/Rasmus/strike.webp',
        tags: ['Melee'],
        cooldown: 0.9,
        description: "Knock the Core in a direction with a LIGHT MELEE hit."
      },
      {
        type: 'Primary',
        title: "Pendulum Swing",
        icon: '/characters/abilities/Rasmus/primary.webp',
        tags: ['Melee', 'Impact'],
        cooldown: 9,
        description: "Slam your chain sickle from overhead, in a direction. Enemies hit near max range are hit much harder."
      },
      {
        type: 'Secondary',
        title: "Whiplash",
        icon: '/characters/abilities/Rasmus/secondary.webp',
        tags: ['Buff', 'Haste', 'Melee', 'Impact'],
        cooldown: 15,
        description: "Gain +35% Speed for 2.25s. Within the next 2.28s, recast to deal a LIGHT hit to surrounding enemies."
      },
      {
        type: 'Special',
        title: "Death's Touch",
        icon: '/characters/abilities/Rasmus/special.webp',
        tags: ['Projectile', 'Creation'],
        cooldown: 25,
        description: "Launch your chain's anchor, pulling the first enemy hit toward you. After an initial travel time the weapon expands and slows down dramatically, becoming much stronger."
      }
    ]
  },
  {
    id: 'CD_ManipulatingMastermind',
    name: 'Rune',
    abilities: [
      {
        type: 'Strike',
        title: "Strike",
        icon: '/characters/abilities/Rune/strike.webp',
        tags: ['Melee'],
        cooldown: 0.9,
        description: "Knock the Core in a direction with a LIGHT MELEE hit."
      },
      {
        type: 'Primary',
        title: "Unstable Anomaly",
        icon: '/characters/abilities/Rune/primary.webp',
        tags: ['Impact', 'Creation'],
        cooldown: 8,
        description: "Conjure a quickly expanding anomaly. If it reaches maximum size, it solidifies and continually hits enemies away from it. Otherwise, it dissipates on hitting a target."
      },
      {
        type: 'Secondary',
        title: "Shadow Swap",
        icon: '/characters/abilities/Rune/secondary.webp',
        tags: ['Dash', 'Impact', 'Creation'],
        cooldown: 11,
        description: "On round start, place your shadow at your location. On cast, become Elusive and quickly travel to your shadow's location, swapping places with it and leaving an Unstable Anomaly from where you departed."
      },
      {
        type: 'Special',
        title: "Banish",
        icon: '/characters/abilities/Rune/special.webp',
        tags: ['Projectile', 'Debuff'],
        cooldown: 40,
        description: "Launch a shadow wave that banishes, slows, and damages enemies for 1.75s. Banished enemies cannot be targeted or interacted with."
      }
    ]
  },
  {
    id: 'CD_RockOni',
    name: 'Vyce',
    abilities: [
      {
        type: 'Strike',
        title: "Strike",
        icon: '/characters/abilities/Vyce/strike.webp',
        tags: ['Melee'],
        cooldown: 0.9,
        description: "Knock the Core in a direction with a LIGHT MELEE hit."
      },
      {
        type: 'Primary',
        title: "Power Chord",
        icon: '/characters/abilities/Vyce/primary.webp',
        tags: ['Impact', 'Projectile', 'Debuff'],
        cooldown: 9.5,
        description: "Launch a lightning riff, hitting and slowing the first enemy struck before chaining LIGHT hits to nearby enemies."
      },
      {
        type: 'Secondary',
        title: "Thunderstruck",
        icon: '/characters/abilities/Vyce/secondary.webp',
        tags: ['Blink', 'Impact', 'Debuff'],
        cooldown: 14,
        description: "Summon a thunderbolt from the sky to a target location, hitting and stunning enemies for 0.7s. For the next 3.3s, recast to assume a form of pure energy and BLINK to the cast location."
      },
      {
        type: 'Special',
        title: "Super Nova",
        icon: '/characters/abilities/Vyce/special.webp',
        tags: ['Impact'],
        cooldown: 40,
        description: "Push-and-hold this ability to start rocking out, gaining 100% knockback resistance. Upon releasing the ability or after 2s, emit a shockwave that blasts enemies away from you. The wave increases in size and power for the first 1.25s it's charged."
      }
    ]
  },
  {
    id: 'CD_HulkingBeast',
    name: 'X',
    abilities: [
      {
        type: 'Strike',
        title: "Strike",
        icon: '/characters/abilities/X/strike.webp',
        tags: ['Melee'],
        cooldown: 0.9,
        description: "Knock the Core in a direction with a LIGHT MELEE hit."
      },
      {
        type: 'Primary',
        title: "Bell Ringer",
        icon: '/characters/abilities/X/primary.webp',
        tags: ['Melee', 'Impact'],
        cooldown: 11,
        description: "Swing your arms wildly, knocking away enemies near max range but dealing a LIGHT hit to those closer to the center."
      },
      {
        type: 'Secondary',
        title: "Bull Rush",
        icon: '/characters/abilities/X/secondary.webp',
        tags: ['Dash', 'Melee'],
        cooldown: 14,
        description: "Wind up and rush in a direction, hitting enemies in your path."
      },
      {
        type: 'Special',
        title: "X Maximus!",
        icon: '/characters/abilities/X/special.webp',
        tags: ['Melee', 'Buff'],
        cooldown: 45,
        description: "Hulk out for 3.5s, increasing your Size and upgrading your Strikes to hit harder and work against players."
      }
    ]
  },
  {
    id: 'CD_FlashySwordsman',
    name: 'Zentaro',
    abilities: [
      {
        type: 'Strike',
        title: "Slashing Strike",
        icon: '/characters/abilities/Zentaro/strike.webp',
        tags: ['Melee'],
        cooldown: 0.9,
        description: "Knock the Core in a direction with a LIGHT MELEE hit. Passive: Charge up by hitting enemies. At 16 charges, Slashing Strike will dash you forward and fire a piercing projectile that hits the first enemy struck."
      },
      {
        type: 'Primary',
        title: "Slice and Dice",
        icon: '/characters/abilities/Zentaro/primary.webp',
        tags: ['Melee', 'Impact'],
        cooldown: 8,
        description: "Deal a LIGHT hit in a small arc, followed by a larger slash that hits enemies in the center."
      },
      {
        type: 'Secondary',
        title: "Iai Rush",
        icon: '/characters/abilities/Zentaro/secondary.webp',
        tags: ['Blink', 'Melee', 'Impact'],
        cooldown: 16,
        description: "Blink in a line after a delay, hitting all enemies along your travel path."
      },
      {
        type: 'Special',
        title: "Oni's Blade",
        icon: '/characters/abilities/Zentaro/special.webp',
        tags: ['Blink', 'Melee', 'Impact'],
        cooldown: 36, // zentaro lore
        description: "Blink to a nearby location and become Elusive, repeatedly dealing LIGHT hits to enemies caught in the area. Afterwards, hit all nearby enemies away."
      }
    ]
  }
]