// Ráfaga de confeti: reparte `count` partículas en `waves` oleadas.
export function burstWaves(count: number, waves: number): number[] {
  const perWave = Math.floor(count / waves);
  const out: number[] = [];
  for (let i = 0; i <= waves; i++) out.push(perWave);
  return out;
}
