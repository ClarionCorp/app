import { useMemo } from 'react';
import QueueCard from '../../components/Overlay/QueueCard';
import BansCard from '../../components/Overlay/BansCard';
import DurationCard from '../../components/Overlay/DurationCard';
import TeamRoster from '../../components/Overlay/TeamRoster';
import TimelineCard from '../../components/Overlay/TimelineCard';
import XPLeaderboardCard from '../../components/Overlay/XPLeaderboardCard';
import { useOverlayData } from '../../components/Overlay/useOverlayData';

type OverlayComponent = 'queue' | 'bans' | 'trainings' | 'ranks' | 'timeline' | 'leaderboard' | 'duration';

export function OverlayApp() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const isPreview = params.get('preview') === 'true';
  const enabledComponents = useMemo(
    () => new Set((params.get('components') ?? '').split(',').map((c) => c.trim()).filter(Boolean)),
    [params],
  );
  const isEnabled = (component: OverlayComponent) => enabledComponents.has(component);

  const data = useOverlayData(isPreview);
  if (!data || data.queueState == 'Queued' || data.queueState == 'FoundMatch' || data.queueState == 'StartingGame') return null;

  const showQueue = isEnabled('queue');
  const showBans = isEnabled('bans');
  const showTrainings = isEnabled('trainings');
  const showRanks = isEnabled('ranks');
  const showDuration = isEnabled('duration');

  // Timeline and leaderboard share the same corner slot,
  // so a stale/hand-edited URL that requests both must still only render one.
  // In this event, leaderboard takes priority.
  const showLeaderboard = isEnabled('leaderboard');
  const showTimeline = isEnabled('timeline') && !showLeaderboard;

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

      {(showTimeline || showLeaderboard) && (
        <div className="absolute top-2 right-2 w-96 shadow-xl">
          {showLeaderboard ? (
            <XPLeaderboardCard players={data.players} myTeam={data.teamNumber} />
          ) : (
            <TimelineCard timeline={data.timeline} players={data.players} myTeam={data.teamNumber} />
          )}
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
