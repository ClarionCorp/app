import { MatchPlayersTable } from '../../types/database';

// Groups players by mutual/inferred queueMates (party) membership,
// preserving the original relative order and keeping each group's members adjacent.
export function groupQueuedPlayers(players: MatchPlayersTable[]): MatchPlayersTable[][] {
  const indexOf = new Map(players.map((p, i) => [p.username, i]));
  const parent = players.map((_, i) => i);

  function find(i: number): number {
    while (parent[i] !== i) {
      parent[i] = parent[parent[i]];
      i = parent[i];
    }
    return i;
  }
  function union(a: number, b: number) {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[ra] = rb;
  }

  players.forEach((p, i) => {
    for (const mate of p.queueMates) {
      const j = indexOf.get(mate);
      if (j !== undefined) union(i, j);
    }
  });

  const groups = new Map<number, MatchPlayersTable[]>();
  players.forEach((p, i) => {
    const root = find(i);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root)!.push(p);
  });

  const seen = new Set<number>();
  const ordered: MatchPlayersTable[][] = [];
  players.forEach((_, i) => {
    const root = find(i);
    if (!seen.has(root)) {
      seen.add(root);
      ordered.push(groups.get(root)!);
    }
  });
  return ordered;
}

// Returns the party this player is queued with (including themself), or null if solo.
export function getQueueGroup(player: MatchPlayersTable, teammates: MatchPlayersTable[]): MatchPlayersTable[] | null {
  const group = groupQueuedPlayers(teammates).find(g => g.some(p => p.username === player.username));
  return group && group.length > 1 ? group : null;
}
