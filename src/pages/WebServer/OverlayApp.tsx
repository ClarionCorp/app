import { useMemo } from 'react';
import QueueCard from '../../components/Overlay/QueueCard';
import BansCard from '../../components/Overlay/BansCard';
import DurationCard from '../../components/Overlay/DurationCard';
import TeamRoster from '../../components/Overlay/TeamRoster';
import TimelineCard from '../../components/Overlay/TimelineCard';
import { useOverlayData } from '../../components/Overlay/useOverlayData';

type OverlayComponent = 'queue' | 'bans' | 'trainings' | 'ranks' | 'timeline' | 'duration';

export function OverlayApp() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const isPreview = params.get('preview') === 'true';
  const enabledComponents = useMemo(
    () => new Set((params.get('components') ?? '').split(',').map((c) => c.trim()).filter(Boolean)),
    [params],
  );
  const isEnabled = (component: OverlayComponent) => enabledComponents.has(component);

  const data = useOverlayData(isPreview);
  if (!data) return null;

  const showQueue = isEnabled('queue');
  const showBans = isEnabled('bans');
  const showTrainings = isEnabled('trainings');
  const showRanks = isEnabled('ranks');
  const showTimeline = isEnabled('timeline');
  const showDuration = isEnabled('duration');

  const myTeam = data.players.filter((p) => p.teamNumber === data.teamNumber);
  const enemyTeam = data.players.filter((p) => p.teamNumber !== data.teamNumber);

  return (
    <main className="relative w-full min-h-screen">
      {(showQueue || showDuration || showBans) && (
        <div className="absolute top-2 left-2 flex flex-col gap-3 rounded-xl border bg-black/80 border-white/10 px-4 py-2 w-fit shadow-xl">
          {showQueue && <QueueCard queue={data.queue} partySize={data.partySize} />}
          {showDuration && <DurationCard startedAt={data.startedAt} timeline={data.timeline} />}
          {showBans && <BansCard bans={data.bans} />}
        </div>
      )}

      {showTimeline && (
        <div className="absolute top-2 right-2 w-96 shadow-xl">
          <TimelineCard timeline={data.timeline} players={data.players} myTeam={data.teamNumber} />
        </div>
      )}

      {(showRanks || showTrainings) && (
        <>
          <div className="absolute bottom-30 left-1 shadow-xl">
            <TeamRoster players={myTeam} showRanks={showRanks} showTrainings={showTrainings} />
          </div>
          {enemyTeam.length > 0 && (
            <div className="absolute bottom-30 right-1 shadow-xl">
              <TeamRoster
                players={enemyTeam}
                showRanks={showRanks}
                showTrainings={showTrainings}
                reverse
              />
            </div>
          )}
        </>
      )}
    </main>
  );
}
