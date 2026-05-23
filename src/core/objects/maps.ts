import {
  BuildingsIcon,
  FlaskIcon,
  MoonIcon,
  EyeIcon,
  QuestionIcon,
  CopyIcon,
  HurricaneIcon,
  ArrowUUpLeftIcon,
  FrameCornersIcon,
  ArrowsClockwiseIcon,
  CircleIcon,
  SpeakerHifiIcon,
  WaveformIcon,
  OnigiriIcon,
  TrashIcon,
  type Icon,
} from '@phosphor-icons/react'

export type MapObject = {
  mapId: string
  mapName: string
  icon: Icon
  image: string | null
}

export function getMapObjectFromID(mapId: string | null | undefined): MapObject {
  let target = MAPS.find(m => m.mapId === mapId);
  if (!target) {
    target = {
      mapId: '',
      mapName: 'Unknown',
      icon: QuestionIcon,
      image: null
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
    icon: HurricaneIcon,
    image: '/maps/AtlasLab.webp'
  },
  {
    mapId: 'GMD_ClarionCorp',
    mapName: 'Clarion Test Chamber',
    icon: FlaskIcon,
    image: '/maps/ClarionCorp.webp'
  },
  {
    mapId: 'GMD_DigitalWorld',
    mapName: "Ai.Mi's App",
    icon: CircleIcon,
    image: '/maps/AiMiApp.webp'
  },
  {
    mapId: 'GMD_Drums',
    mapName: 'Taiko Temple',
    icon: SpeakerHifiIcon,
    image: '/maps/TaikoTemple.webp'
  },
  {
    mapId: 'GMD_MusicStage',
    mapName: 'Demon Dais',
    icon: WaveformIcon,
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
    icon: OnigiriIcon,
    image: '/maps/OniVillage.webp'
  },
  {
    mapId: 'GMD_SummerSplash',
    mapName: "Inky's Splash Zone",
    icon: TrashIcon,
    image: '/maps/InkysSplashZone.webp'
  },
  {
    mapId: 'TutorialMap',
    mapName: 'Neo Origins',
    icon: CopyIcon,
    image: '/maps/NeoOrigins.webp'
  },
  {
    mapId: 'GTD_BackToBackXL',
    mapName: 'Back To Back',
    icon: HurricaneIcon,
    image: '/maps/BackToBack.webp'
  },
  {
    mapId: 'GTD_AboutFaceXL',
    mapName: 'About Face',
    icon: ArrowUUpLeftIcon,
    image: '/maps/AboutFace.webp'
  },
  {
    mapId: 'GTD_CornerGoalXL',
    mapName: 'Corner Pocket',
    icon: FrameCornersIcon,
    image: '/maps/CornerPocket.webp'
  },
  {
    mapId: 'GTD_FlippedXL',
    mapName: 'Map Flipped',
    icon: ArrowsClockwiseIcon,
    image: '/maps/MapFlipped.webp'
  },
]