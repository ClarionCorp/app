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
import { ClarionAPI } from '../constants'

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
    image: `${ClarionAPI}/assets/maps/GTD_AhtenCity.webp`
  },
  {
    mapId: 'GMD_AtlasLab',
    mapName: 'Atlas Lab',
    icon: HurricaneIcon,
    image: `${ClarionAPI}/assets/maps/GTD_AtlasLab.webp`
  },
  {
    mapId: 'GMD_ClarionCorp',
    mapName: 'Clarion Test Chamber',
    icon: FlaskIcon,
    image: `${ClarionAPI}/assets/maps/GTD_ClarionCorp.webp`
  },
  {
    mapId: 'GMD_DigitalWorld',
    mapName: "Ai.Mi's App",
    icon: CircleIcon,
    image: `${ClarionAPI}/assets/maps/GTD_AiMiApp.webp`
  },
  {
    mapId: 'GMD_Drums',
    mapName: 'Taiko Temple',
    icon: SpeakerHifiIcon,
    image: `${ClarionAPI}/assets/maps/GTD_TaikoTemple.webp`
  },
  {
    mapId: 'GMD_MusicStage',
    mapName: 'Demon Dais',
    icon: WaveformIcon,
    image: `${ClarionAPI}/assets/maps/GTD_DemonDais.webp`
  },
  {
    mapId: 'GMD_NightMarket',
    mapName: 'Night Market',
    icon: MoonIcon,
    image: `${ClarionAPI}/assets/maps/GTD_NightMarket.webp`
  },
  {
    mapId: 'GMD_Obscura',
    mapName: 'Gates of Obscura',
    icon: EyeIcon,
    image: `${ClarionAPI}/assets/maps/GTD_GatesOfObscura.webp`
  },
  {
    mapId: 'GMD_OniVillage',
    mapName: 'Oni Village',
    icon: OnigiriIcon,
    image: `${ClarionAPI}/assets/maps/GTD_OniVillage.webp`
  },
  {
    mapId: 'GMD_SummerSplash',
    mapName: "Inky's Splash Zone",
    icon: TrashIcon,
    image: `${ClarionAPI}/assets/maps/GTD_InkysSplashZone.webp`
  },
  {
    mapId: 'TutorialMap',
    mapName: 'Neo Origins',
    icon: CopyIcon,
    image: `${ClarionAPI}/assets/maps/GTD_Tutorial.webp`
  },
  {
    mapId: 'GTD_BackToBackXL',
    mapName: 'Back To Back',
    icon: HurricaneIcon,
    image: `${ClarionAPI}/assets/maps/GTD_BackToBackXL.webp`
  },
  {
    mapId: 'GTD_AboutFaceXL',
    mapName: 'About Face',
    icon: ArrowUUpLeftIcon,
    image: `${ClarionAPI}/assets/maps/GTD_AboutFaceXL.webp`
  },
  {
    mapId: 'GTD_CornerGoalXL',
    mapName: 'Corner Pocket',
    icon: FrameCornersIcon,
    image: `${ClarionAPI}/assets/maps/GTD_CornerGoalXL.webp`
  },
  {
    mapId: 'GTD_FlippedXL',
    mapName: 'Map Flipped',
    icon: ArrowsClockwiseIcon,
    image: `${ClarionAPI}/assets/maps/GTD_FlippedXL.webp`
  },
]