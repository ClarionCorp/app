import { useEffect, useState } from 'react';
import { fetchCurrentSeason } from '../../../core/utilities/clarion';
import { CurrentSeason } from '../../../types/clarion';

type TimeLeft = {
  days: number,
  hours: number,
  minutes: number,
  seconds: number,
};

function getTimeLeft(endDate: Date): TimeLeft {
  const diff = Math.max(0, endDate.getTime() - Date.now());

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function formatTimeLeft(timeLeft: TimeLeft): string {
  const units: [number, string][] = [
    [timeLeft.days, 'd'],
    [timeLeft.hours, 'h'],
    [timeLeft.minutes, 'm'],
    [timeLeft.seconds, 's'],
  ];
  const parts = units.filter(([value, unit]) => value > 0 || unit === 's');

  return parts.map(([value, unit]) => `${value}${unit}`).join(' ');
}

export function SeasonCountdown() {
  const [seasonInfo, setSeasonInfo] = useState<CurrentSeason | null>(null);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    async function load() {
      setSeasonInfo(await fetchCurrentSeason());
    }
    load();
  }, []);

  useEffect(() => {
    if (!seasonInfo) return;

    const endDate = new Date(seasonInfo.endDate);
    setTimeLeft(getTimeLeft(endDate));
    const id = setInterval(() => setTimeLeft(getTimeLeft(endDate)), 1000);
    return () => clearInterval(id);
  }, [seasonInfo]);

  if (!seasonInfo || !timeLeft || timeLeft.days > 30) return null;
  if (new Date(seasonInfo.endDate).getTime() <= Date.now()) return null;

  return (
    <div className="flex items-center justify-between bg-surface-subtle border border-background-border rounded-xl px-4 py-2 font-mono text-sm text-char">
      <span>{`Season ${seasonInfo.season}:`}</span>
      <span className="text-char-secondary">{`ends in ${formatTimeLeft(timeLeft)}`}</span>
    </div>
  );
}
