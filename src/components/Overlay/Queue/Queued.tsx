import { useState } from 'react';
import { formatClock } from '../../../core/utilities/system';

// Diagonal streaks for the "Queued" card's background, each independently timed so they don't all pass at once.
const SPEED_LINE_COLORS = ['#38bdf8', '#818cf8', '#f472b6'];

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function makeSpeedLines(count: number) {
  return Array.from({ length: count }, () => {
    const duration = randomBetween(1.6, 3.4);
    return {
      top: `${randomBetween(8, 90).toFixed(1)}%`,
      width: `${randomBetween(5, 12).toFixed(1)}rem`,
      duration: `${duration.toFixed(2)}s`,
      // Negative delay starts the animation already mid-flight, so lines don't all visibly launch from the same instant when the page loads.
      delay: `${(-randomBetween(0, duration)).toFixed(2)}s`,
      color: SPEED_LINE_COLORS[Math.floor(Math.random() * SPEED_LINE_COLORS.length)],
    };
  });
}

export default function Queued({ queue, seconds }: { queue: string; seconds: number }) {
  const [speedLines] = useState(() => makeSpeedLines(6));

  return (
    <div className="absolute top-2 left-2 min-w-64 w-fit overflow-hidden rounded-xl border bg-black/80 border-white/10 px-4 py-3 shadow-xl">
      <style>{`
        @keyframes queue-speedline-move {
          0%   { transform: translateX(320%) skewX(18deg); opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateX(-30%) skewX(18deg); opacity: 0; }
        }
      `}</style>
      <div className="absolute inset-0 pointer-events-none">
        {speedLines.map((line, i) => (
          <span
            key={i}
            className="absolute h-0.75 rounded-full"
            style={{
              top: line.top,
              width: line.width,
              background: `linear-gradient(90deg, transparent, ${line.color}, transparent)`,
              animation: `queue-speedline-move ${line.duration} linear infinite`,
              animationDelay: line.delay,
            }}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-xs pointer-events-none" />
      <div className="relative flex flex-col gap-0.5">
        <span className="text-white font-bold text-2xl leading-tight">{queue}</span>
        <div className="flex items-center gap-2 text-white/70 text-lg">
          <span className="text-sky-300 font-semibold">Searching</span>
          <span className="opacity-60">{formatClock(seconds)}</span>
        </div>
      </div>
    </div>
  );
}
