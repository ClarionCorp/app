export const NAV_ITEMS = [
  {
    label: "My Account",
    desc: "See stats and make advanced changes",
    slug: 'account',
    image: "/backgrounds/Strikers.webp"
  },
  {
    label: "Rank Checker",
    desc: "Auto fetch the ranks of everyone in game",
    slug: 'rankchecker',
    image: "/backgrounds/Temple.webp"
  },
  {
    label: "Custom Games Manager",
    desc: "Tweak every aspect of Custom Games",
    slug: 'cgm',
    image: "/backgrounds/MusicShow.webp"
  },
  {
    label: "Queue Manager",
    desc: "Queue into some weird game modes",
    slug: 'cqm',
    image: "/backgrounds/MusicStage.webp"
  },
  {
    label: "Mod Manager",
    desc: "Download and Install Mods",
    slug: 'mods',
    image: "/backgrounds/Campfire.jpg"
  },
  {
    label: "Settings",
    desc: "Adjust the app's settings",
    slug: 'settings',
    image: "/backgrounds/Bedroom.jpg"
  },
];


const CHARACTER_DEV_NAMES: Record<string, string> = {
  'Atlas': 'AngelicSupport',
  'Luna': 'ChaoticRocketeer',
  'Juno': 'CleverSummoner',
  'Mako': 'DrumOni',
  'Octavia': 'EDMOni',
  'Era': 'EmpoweringEnchanter',
  'Zentaro': 'FlashySwordsman',
  'Juliette': 'FlexibleBrawler',
  'Finii': 'GravityMage',
  'Nao': 'Healer',
  'X': 'HulkingBeast',
  'Ai.Mi': 'MagicalPlaymaker',      // check in game
  'Rune': 'ManipulatingMastermind',
  "Drek'ar": 'NimbleBlaster',    // check in game
  'Vyce': 'RockOni',
  'Asher': 'ShieldUser',
  'Kai': 'SpeedySkirmisher',
  'Dubu': 'StalwartProtector',
  'Estelle': 'TempoSniper',
  'Kazan': 'UmbrellaUser',
  'Rasmus': 'WhipFighter',
}

export function getCharDevName(character: string): string {
  return CHARACTER_DEV_NAMES[character];
}