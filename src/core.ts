// Núcleo puro del confeti: números, papelitos y CSS. Sin DOM, para poder probarlo en Node.

/** Par [mínimo, máximo]. */
export type Range = readonly [number, number];

export type ConfettiOptions = {
  /** Cuántos papelitos (default 80). */
  count?: number;
  /** Colores de relleno; se repiten para darles peso (default morado, amarillo y lila). */
  colors?: readonly string[];
  /** Color del contorno (default #111). */
  outline?: string;
  /** Cuánto tarda cada papelito en caer, en ms (default [3500, 6000]). */
  duration?: Range;
  /** Retraso de salida de cada papelito, en ms (default [0, 1800]; en `loop`, [0, 5000]). */
  delay?: Range;
  /** Lluvia infinita hasta llamar `stop()` (default false: una sola caída). */
  loop?: boolean;
  /** z-index de la capa (default 60). */
  zIndex?: number;
  /** Si es true (default), no hace nada cuando el sistema pide menos movimiento. */
  respectReducedMotion?: boolean;
};

export type Piece = {
  /** Columna de salida en vw. */
  x: number;
  color: string;
  scale: number;
  /** Duración del giro en X, en s. */
  spin: number;
  /** Duración del vaivén, en s. */
  drift: number;
  driftDelay: number;
  /** Duración de la caída, en ms. */
  fall: number;
  /** Retraso de la caída, en ms. */
  delay: number;
  /** Vueltas al caer: 2 o -2. */
  turn: number;
};

export const DEFAULT_COLORS = ["#f0d36b", "#c4b0f5", "#9870ed", "#9870ed", "#f0d36b", "#9870ed"] as const;
export const DEFAULT_OUTLINE = "#111";
export const DEFAULT_COUNT = 80;
export const DEFAULT_DURATION: Range = [3500, 6000];
export const DEFAULT_DELAY: Range = [0, 1800];
export const DEFAULT_LOOP_DELAY: Range = [0, 5000];

/** Prefijo de las clases, para no chocar con el CSS de la página. */
export const PREFIX = "ebc";

export type Rng = () => number;

/** Número al azar en [min, max). El original pisaba `min` con su default; aquí no. */
export function rand(min: number, max: number, rng: Rng = Math.random): number {
  return rng() * (max - min) + min;
}

/** Elemento al azar de una lista. */
export function pick<T>(list: readonly T[], rng: Rng = Math.random): T {
  return list[Math.floor(rng() * list.length) % list.length];
}

/** Arma los papelitos: repartidos a lo ancho, cada uno con su color, tamaño y ritmo. */
export function makePieces(options: ConfettiOptions = {}, rng: Rng = Math.random): Piece[] {
  const count = Math.max(0, Math.floor(options.count ?? DEFAULT_COUNT));
  const colors = options.colors?.length ? options.colors : DEFAULT_COLORS;
  const [fallMin, fallMax] = options.duration ?? DEFAULT_DURATION;
  const [delayMin, delayMax] = options.delay ?? (options.loop ? DEFAULT_LOOP_DELAY : DEFAULT_DELAY);
  return Array.from({ length: count }, (_, i) => ({
    x: (i / Math.max(1, count)) * 100,
    color: pick(colors, rng),
    scale: rand(0.5, 1.1, rng),
    spin: rand(0.6, 2.8, rng),
    drift: rand(1, 2, rng),
    driftDelay: rand(0, 1.5, rng),
    fall: rand(fallMin, fallMax, rng),
    delay: rand(delayMin, delayMax, rng),
    turn: rng() > 0.5 ? 2 : -2,
  }));
}

/** Cuadros de la caída: de arriba (3rem por encima del borde, para que no asome) hasta abajo, con dos vueltas. */
export function fallKeyframes(p: Piece): Keyframe[] {
  return [
    { transform: `translate3d(${p.x}vw,calc(-5vh - 3rem),0) scale(${p.scale}) rotate(0turn)` },
    { transform: `translate3d(${p.x + 10}vw,105vh,0) scale(${p.scale}) rotate(${p.turn}turn)` },
  ];
}

/**
 * Opciones de la caída. `fill: "both"` es EL arreglo: durante su retraso el papelito ya está en
 * su primer cuadro (arriba, fuera de la vista) y no amontonado en la esquina.
 */
export function fallTiming(p: Piece, loop = false): KeyframeAnimationOptions {
  return {
    duration: p.fall,
    delay: p.delay,
    iterations: loop ? Infinity : 1,
    fill: "both",
    easing: "cubic-bezier(.3,.1,.5,1)",
  };
}

/** Cuánto dura la caída completa (el último papelito en tocar el piso), en ms. */
export function totalDuration(pieces: readonly Piece[]): number {
  return pieces.reduce((max, p) => Math.max(max, p.delay + p.fall), 0);
}

/** El CSS de la capa y de los papelitos (giro en X y vaivén sesgado). */
export function buildCss(prefix = PREFIX): string {
  const c = `.${prefix}`;
  return [
    `${c}-layer{position:fixed;inset:0;overflow:hidden;pointer-events:none;transition:opacity .3s ease}`,
    // Arriba a la izquierda y fuera de la vista: la WAAPI lo coloca desde el primer cuadro.
    `${c}-piece{position:absolute;top:0;left:0;width:1rem;height:1rem;transform:translate3d(0,-10vh,0);transform-style:preserve-3d;will-change:transform}`,
    `${c}-rotate{animation:${prefix}-rotate 1s infinite both ease-in-out}`,
    `${c}-askew{width:1rem;height:2rem;box-sizing:border-box;border:2px solid var(--${prefix}-outline,#111);transform:skewY(10deg);animation:${prefix}-drift 1s infinite alternate both ease-in-out}`,
    `@keyframes ${prefix}-drift{0%{transform:skewY(10deg) translate3d(-250%,0,0)}100%{transform:skewY(-12deg) translate3d(250%,0,0)}}`,
    `@keyframes ${prefix}-rotate{0%{transform:rotateX(0)}100%{transform:rotateX(359deg)}}`,
  ].join("\n");
}
