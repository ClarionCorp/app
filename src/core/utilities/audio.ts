import { QueuePopType } from "../../pages/Settings";
import { AiMiQueuePops, ESQueuePops } from "../objects/sounds";

/**
 * Plays an audio file at a given volume.
 * @param filePath - Path to the audio asset (e.g. /sounds/foo.mp3).
 * @param volume   - Playback volume from 0 (silent) to 100 (full). Defaults to 50.
 * @returns The HTMLAudioElement so the caller can pause/stop it later.
 */
export async function playAudio(filePath: string, volume: number = 50): Promise<HTMLAudioElement> {
  const audio = new Audio(filePath);
  audio.volume = Math.max(0, Math.min(100, volume)) / 100;
  try {
    console.log(`[Audio] Playing: ${filePath} at volume ${audio.volume}`);
    await audio.play();
  } catch (err) {
    console.error(`[Audio] Failed to play audio:`, err);
    throw err;
  }
  return audio;
}

export function stopAudio(audio: HTMLAudioElement): void {
  audio.pause();
  audio.currentTime = 0;
}


export function selectRandomQueuePop(type: QueuePopType): string {
  let array: string[] = [];
  switch (type) {
    case 'Ai.Mi':
      array = AiMiQueuePops;
      break;
    case 'Generic':
      array = ESQueuePops;
      break;
  };

  return array[Math.floor(Math.random() * array.length)];
}