const CHARACTER_NAMES: Record<string, string> = {
  'CD_AngelicSupport': 'Atlas',
  'CD_ChaoticRocketeer': 'Luna',
  'CD_CleverSummoner': 'Juno',
  'CD_DrumOni': 'Mako',
  'CD_EDMOni': 'Octavia',
  'CD_EmpoweringEnchanter': 'Era',
  'CD_FlashySwordsman': 'Zentaro',
  'CD_FlexibleBrawler': 'Juliette',
  'CD_GravityMage': 'Finii',
  'CD_Healer': 'Nao',
  'CD_HulkingBeast': 'X',
  'CD_MagicalPlaymaker': 'Ai.Mi',
  'CD_ManipulatingMastermind': 'Rune',
  'CD_NimbleBlaster': "Drek'ar",
  'CD_RockOni': 'Vyce',
  'CD_ShieldUser': 'Asher',
  'CD_SpeedySkirmisher': 'Kai',
  'CD_StalwartProtector': 'Dubu',
  'CD_TempoSniper': 'Estelle',
  'CD_UmbrellaUser': 'Kazan',
  'CD_WhipFighter': 'Rasmus',
}

export function getCharName(character: string): string {
  return CHARACTER_NAMES[character];
}

export const removeDevCharPrefix = (str: string) => str.replace(/^CD_/, '');

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