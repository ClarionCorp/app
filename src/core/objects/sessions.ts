export function getPartyLabel(partySize: number): string {
  const labels: Record<number, string> = {
    0: 'Solo',
    1: 'Solo',
    2: 'Duos',
    3: 'Trios',
  };
  return labels[partySize] ?? String(partySize);
}