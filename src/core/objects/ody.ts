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
  'Aimi': 'MagicalPlaymaker',      // check in game
  'Rune': 'ManipulatingMastermind',
  'Drekar': 'NimbleBlaster',    // check in game
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


const MAP_DEV_NAMES: Record<string, string> = {
  'GameMapAhtenCity': 'Ahten City',
  'GameMapAtlasLab': 'Atlas Lab',
  'GameMapClarionCorp': 'Clarion Test Chamber',
  'GameMapDigitalWorld': "Ai.Mi's App",
  'GameMapDrums': 'Taiko Temple',
  'GameMapMusicStage': 'Demon Dais',
  'GameMapNightMarket': 'Night Market',
  'GameMapObscura': 'Gates of Obscura',
  'GameMapOniVillage': 'Oni Village',
  'GameMapPractice': 'Practice',
  'GameMapRGM': 'Tea Time Tussle',
  'GameMapSummerSplash': "Inky's Splash Zone",
  'TutorialMap': 'Tutorial',
}

export function getMapName(map: string): string {
  return MAP_DEV_NAMES[map] ?? map;
}

const QUEUE_DEV_NAMES: Record<string, string> = {
  '3v3': 'Normal',
  'coopvsai': 'Co-Op VS AI',
  'custom': 'Custom',
  'custom:NvM': 'Custom',
  'practice': 'Practice',
  'quickplay': 'Quick Play',
  'ranked:3v3': 'Ranked'
}

export function getQueueName(queue: string): string {
  return QUEUE_DEV_NAMES[queue] ?? queue;
}