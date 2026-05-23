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
  WavesIcon,
  BookOpenIcon,
  type Icon,
  QuestionIcon,
} from '@phosphor-icons/react'

export type MapObject = {
  mapId: string
  mapName: string
  icon: Icon
  image: string
}

export function getMapObjectFromID(mapId: string | null | undefined): MapObject {
  let target = MAPS.find(m => m.mapId === mapId);
  if (!target) {
    target = {
      mapId: '',
      mapName: 'Unknown',
      icon: QuestionIcon,
      image: ''
    }
  }
  return target;
}

export const MAPS: MapObject[] = [
  {
    mapId: 'GMD_AhtenCity',
    mapName: 'Ahten City',
    icon: BuildingsIcon,
    image: '/maps/AhtenCity.webp'
  },
  {
    mapId: 'GMD_AtlasLab',
    mapName: 'Atlas Lab',
    icon: FlaskIcon,
    image: '/maps/AtlasLab.webp'
  },
  {
    mapId: 'GMD_ClarionCorp',
    mapName: 'Clarion Test Chamber',
    icon: CubeIcon,
    image: '/maps/ClarionCorp.webp'
  },
  {
    mapId: 'GMD_DigitalWorld',
    mapName: "Ai.Mi's App",
    icon: DeviceMobileIcon,
    image: '/maps/AiMiApp.webp'
  },
  {
    mapId: 'GMD_Drums',
    mapName: 'Taiko Temple',
    icon: MusicNoteIcon,
    image: '/maps/TaikoTemple.webp'
  },
  {
    mapId: 'GMD_MusicStage',
    mapName: 'Demon Dais',
    icon: MicrophoneIcon,
    image: '/maps/DemonDais.webp'
  },
  {
    mapId: 'GMD_NightMarket',
    mapName: 'Night Market',
    icon: MoonIcon,
    image: '/maps/NightMarket.webp'
  },
  {
    mapId: 'GMD_Obscura',
    mapName: 'Gates of Obscura',
    icon: EyeIcon,
    image: '/maps/GatesOfObscura.webp'
  },
  {
    mapId: 'GMD_OniVillage',
    mapName: 'Oni Village',
    icon: HouseIcon,
    image: '/maps/OniVillage.webp'
  },
  {
    mapId: 'GMD_Practice',
    mapName: 'Practice',
    icon: TargetIcon,
    image: '/maps/NeoOrigins.webp'
  },
  {
    mapId: 'GMD_SummerSplash',
    mapName: "Inky's Splash Zone",
    icon: WavesIcon,
    image: '/maps/InkysSplashZone.webp'
  },
  {
    mapId: 'TutorialMap',
    mapName: 'Neo Origins',
    icon: BookOpenIcon,
    image: '/maps/NeoOrigins.webp'
  },
  {
    mapId: 'GTD_BackToBackXL',
    mapName: 'Back To Back',
    icon: BookOpenIcon,
    image: '/maps/BackToBack.webp'
  },
  {
    mapId: 'GTD_AboutFaceXL',
    mapName: 'About Face',
    icon: BookOpenIcon,
    image: '/maps/AboutFace.webp'
  },
  {
    mapId: 'GTD_CornerGoalXL',
    mapName: 'Corner Pocket',
    icon: BookOpenIcon,
    image: '/maps/CornerPocket.webp'
  },
  {
    mapId: 'GTD_FlippedXL',
    mapName: 'Map Flipped',
    icon: BookOpenIcon,
    image: '/maps/MapFlipped.webp'
  },
]