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
import { ReactNode } from 'react'

export type MapObject = {
  mapId: string
  ccId: string
  mapName: string
  icon: Icon
  image: string | null
  description: ReactNode
}

export function getMapObjectFromID(mapId: string | null | undefined): MapObject {
  let target = MAPS.find(m => m.mapId === mapId);
  if (!target) {
    target = {
      mapId: '',
      ccId: '',
      mapName: 'Unknown',
      icon: QuestionIcon,
      image: null,
      description: ''
    }
  }
  return target;
}

// ClarionCorp's map rotation tools API uses its own catalog ids (unrelated to the in-game mapId).
export function getMapObjectFromCCID(ccId: string | null | undefined): MapObject {
  let target = MAPS.find(m => m.ccId === ccId);
  if (!target) {
    target = {
      mapId: '',
      ccId: '',
      mapName: 'Unknown',
      icon: QuestionIcon,
      image: null,
      description: ''
    }
  }
  return target;
}

export const MAPS: MapObject[] = [
  {
    mapId: 'GMD_AhtenCity',
    ccId: 'GTD_AhtenCity',
    mapName: 'Ahten City',
    icon: BuildingsIcon,
    image: `${ClarionAPI}/assets/maps/GTD_AhtenCity.webp`,
    description: ''
  },
  {
    mapId: 'GMD_AtlasLab',
    ccId: 'GTD_Lab',
    mapName: 'Atlas Lab',
    icon: HurricaneIcon,
    image: `${ClarionAPI}/assets/maps/GTD_Lab.webp`,
    description: <>
      <b className='text-match-mid'>Locks:</b> Two circular barriers to the sides of the goalbox. <br />
      <br />
      <b className='text-match-ally'>Map Gimmicks:</b><br />
      - The black hole in the center.<br />
      - If a <a className='text-match-mid'>player</a> or the <a className='text-match-mid'>core</a> reaches its center, it will explode, pushing everything outwards.<br />
      - This can easily <a className='text-match-loss'>KO</a> multiple players.<br />
      <br />
      <b className='text-match-enemy'>Common Bans:</b><br />
      - <a className='text-match-enemy'>Vyce</a> and <a className='text-match-enemy'>Luna</a>'s <a className='bg-match-mid/50 px-1 rounded-sm'>SPECIAL</a> can be dangerous due to the limited space while the black hole is active<br />
    </>
  },
  {
    mapId: 'GMD_ClarionCorp',
    ccId: 'GTD_ClarionCorpDefault',
    mapName: 'Clarion Test Chamber',
    icon: FlaskIcon,
    image: `${ClarionAPI}/assets/maps/GTD_ClarionCorpDefault.webp`,
    description: ''
  },
  {
    mapId: 'GMD_DigitalWorld',
    ccId: 'GTD_DigitalWorld',
    mapName: "Ai.Mi's App",
    icon: CircleIcon,
    image: `${ClarionAPI}/assets/maps/GTD_DigitalWorld.webp`,
    description: ''
  },
  {
    mapId: 'GMD_Drums',
    ccId: 'GTD_Drums',
    mapName: 'Taiko Temple',
    icon: SpeakerHifiIcon,
    image: `${ClarionAPI}/assets/maps/GTD_Drums.webp`,
    description: ''
  },
  {
    mapId: 'GMD_MusicStage',
    ccId: 'GTD_MusicStage',
    mapName: 'Demon Dais',
    icon: WaveformIcon,
    image: `${ClarionAPI}/assets/maps/GTD_MusicStage.webp`,
    description: ''
  },
  {
    mapId: 'GMD_NightMarket',
    ccId: 'GTD_NightMarket',
    mapName: 'Night Market',
    icon: MoonIcon,
    image: `${ClarionAPI}/assets/maps/GTD_NightMarket.webp`,
    description: ''
  },
  {
    mapId: 'GMD_Obscura',
    ccId: 'GTD_Obscura',
    mapName: 'Gates of Obscura',
    icon: EyeIcon,
    image: `${ClarionAPI}/assets/maps/GTD_Obscura.webp`,
    description: ''
  },
  {
    mapId: 'GMD_OniVillage',
    ccId: 'GTD_OniVillage',
    mapName: 'Oni Village',
    icon: OnigiriIcon,
    image: `${ClarionAPI}/assets/maps/GTD_OniVillage.webp`,
    description: ''
  },
  {
    mapId: 'GMD_SummerSplash',
    ccId: 'GTD_SummerSplash',
    mapName: "Inky's Splash Zone",
    icon: TrashIcon,
    image: `${ClarionAPI}/assets/maps/GTD_SummerSplash.webp`,
    description: ''
  },
  {
    mapId: 'TutorialMap',
    ccId: 'GTD_Tutorial',
    mapName: 'Neo Origins',
    icon: CopyIcon,
    image: `${ClarionAPI}/assets/maps/GTD_Tutorial.webp`,
    description: ''
  },
  {
    mapId: 'GTD_BackToBackXL',
    ccId: 'GTD_BackToBackXL',
    mapName: 'Back To Back',
    icon: HurricaneIcon,
    image: `${ClarionAPI}/assets/maps/GTD_BackToBackXL.webp`,
    description: ''
  },
  {
    mapId: 'GTD_AboutFaceXL',
    ccId: 'GTD_AboutFaceXL',
    mapName: 'About Face',
    icon: ArrowUUpLeftIcon,
    image: `${ClarionAPI}/assets/maps/GTD_AboutFaceXL.webp`,
    description: ''
  },
  {
    mapId: 'GTD_CornerGoalXL',
    ccId: 'GTD_CornerGoalXL',
    mapName: 'Corner Pocket',
    icon: FrameCornersIcon,
    image: `${ClarionAPI}/assets/maps/GTD_CornerGoalXL.webp`,
    description: ''
  },
  {
    mapId: 'GTD_FlippedXL',
    ccId: 'GTD_FlippedXL',
    mapName: 'Map Flipped',
    icon: ArrowsClockwiseIcon,
    image: `${ClarionAPI}/assets/maps/GTD_FlippedXL.webp`,
    description: ''
  },
]