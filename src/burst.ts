// Ráfaga de confeti: reparte `count` partículas en `waves` oleadas.
export function burstWaves(count: number, waves: number): number[] {
  const perWave = Math.floor(count / waves);
  const remainder = count - perWave * waves;
  const out: number[] = [];
  for (let i = 0; i < waves; i++) out.push(perWave + (i < remainder ? 1 : 0));
  return out;
}
