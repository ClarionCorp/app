import {
  BuildingsIcon,
  FlaskIcon,
  CubeIcon,
  DeviceMobileIcon,
  MusicNoteIcon,
  MicrophoneIcon,
  MoonIcon,
  EyeIcon,
  HouseIcon,
  TargetIcon,
  CoffeeIcon,
  WavesIcon,
  BookOpenIcon,
  type Icon,
} from '@phosphor-icons/react'

export type MapObject = {
  mapId: string
  mapName: string
  icon: Icon
}

export const MAPS: MapObject[] = [
  {
    mapId: 'GMD_AhtenCity',
    mapName: 'Ahten City',
    icon: BuildingsIcon,
  },
  {
    mapId: 'GMD_AtlasLab',
    mapName: 'Atlas Lab',
    icon: FlaskIcon,
  },
  {
    mapId: 'GMD_ClarionCorp',
    mapName: 'Clarion Test Chamber',
    icon: CubeIcon,
  },
  {
    mapId: 'GMD_DigitalWorld',
    mapName: "Ai.Mi's App",
    icon: DeviceMobileIcon,
  },
  {
    mapId: 'GMD_Drums',
    mapName: 'Taiko Temple',
    icon: MusicNoteIcon,
  },
  {
    mapId: 'GMD_MusicStage',
    mapName: 'Demon Dais',
    icon: MicrophoneIcon,
  },
  {
    mapId: 'GMD_NightMarket',
    mapName: 'Night Market',
    icon: MoonIcon,
  },
  {
    mapId: 'GMD_Obscura',
    mapName: 'Gates of Obscura',
    icon: EyeIcon,
  },
  {
    mapId: 'GMD_OniVillage',
    mapName: 'Oni Village',
    icon: HouseIcon,
  },
  {
    mapId: 'GMD_Practice',
    mapName: 'Practice',
    icon: TargetIcon,
  },
  {
    mapId: 'GMD_RGM',
    mapName: 'Tea Time Tussle',
    icon: CoffeeIcon,
  },
  {
    mapId: 'GMD_SummerSplash',
    mapName: "Inky's Splash Zone",
    icon: WavesIcon,
  },
  {
    mapId: 'TutorialMap',
    mapName: 'Neo Origins',
    icon: BookOpenIcon,
  },
]