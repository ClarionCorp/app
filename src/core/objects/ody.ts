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
  'GMD_AhtenCity': 'Ahten City',
  'GMD_AtlasLab': 'Atlas Lab',
  'GMD_ClarionCorp': 'Clarion Test Chamber',
  'GMD_DigitalWorld': "Ai.Mi's App",
  'GMD_Drums': 'Taiko Temple',
  'GMD_MusicStage': 'Demon Dais',
  'GMD_NightMarket': 'Night Market',
  'GMD_Obscura': 'Gates of Obscura',
  'GMD_OniVillage': 'Oni Village',
  'GMD_Practice': 'Practice',
  'GMD_RGM': 'Tea Time Tussle',
  'GMD_SummerSplash': "Inky's Splash Zone",
  'TutorialMap': 'Tutorial',
}

export function getMapName(map: string): string {
  return MAP_DEV_NAMES[map] ?? map;
}

const QUEUE_DEV_NAMES: Record<string, string> = {
  'queue:3v3': 'Normal',
  'queue:coopvsai': 'Co-Op VS AI',
  'queue:custom': 'Customs',
  'queue:custom:NvM': 'Customs',
  'queue:practice': 'Practice',
  'queue:quickplay': 'Quick Play',
  'queue:ranked:3v3': 'Ranked'
}

export function getQueueName(queue: string): string {
  return QUEUE_DEV_NAMES[queue] ?? queue;
}