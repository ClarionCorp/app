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