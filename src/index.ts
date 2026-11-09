// Confeti de papelitos con contorno: una función que monta una capa fija, anima con la WAAPI y
// se quita sola al terminar. Hecho a mano por bliss; ver README.
import {
  DEFAULT_OUTLINE,
  PREFIX,
  buildCss,
  fallKeyframes,
  fallTiming,
  makePieces,
  type ConfettiOptions,
} from "./core";

export type { ConfettiOptions, Piece, Range } from "./core";
export { DEFAULT_COLORS, makePieces, rand } from "./core";

export type ConfettiHandle = {
  /** Se resuelve cuando la capa ya no está en la página (terminó o se detuvo). */
  done: Promise<void>;
  /** Quita el confeti con un desvanecido corto. Sirve para cortar la lluvia de `loop`. */
  stop: () => void;
};

const STYLE_ID = `${PREFIX}-confetti-style`;

/** Inyecta el CSS una sola vez por documento. */
function ensureStyle(doc: Document) {
  if (doc.getElementById(STYLE_ID)) return;
  const style = doc.createElement("style");
  style.id = STYLE_ID;
  style.textContent = buildCss();
  doc.head.appendChild(style);
}

function prefersReducedMotion(): boolean {
  return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const NOOP: ConfettiHandle = { done: Promise.resolve(), stop: () => {} };

/** Lanza confeti. Sin `loop` cae una vez y se limpia solo; con `loop` llueve hasta `stop()`. */
export function confetti(options: ConfettiOptions = {}): ConfettiHandle {
  // En el servidor (SSR) o sin WAAPI no hay nada que pintar.
  if (typeof document === "undefined" || typeof Element === "undefined" || !("animate" in Element.prototype)) return NOOP;
  if ((options.respectReducedMotion ?? true) && prefersReducedMotion()) return NOOP;

  const doc = document;
  ensureStyle(doc);
  const pieces = makePieces(options);
  const loop = !!options.loop;

  const layer = doc.createElement("div");
  layer.className = `${PREFIX}-layer`;
  layer.setAttribute("aria-hidden", "true");
  layer.style.zIndex = String(options.zIndex ?? 60);
  layer.style.setProperty(`--${PREFIX}-outline`, options.outline ?? DEFAULT_OUTLINE);

  const animations: Animation[] = [];
  for (const p of pieces) {
    const piece = doc.createElement("div");
    piece.className = `${PREFIX}-piece`;
    const rotate = doc.createElement("div");
    rotate.className = `${PREFIX}-rotate`;
    rotate.style.animationDuration = `${p.spin}s`;
    const askew = doc.createElement("div");
    askew.className = `${PREFIX}-askew`;
    askew.style.background = p.color;
    askew.style.animationDuration = `${p.drift}s`;
    askew.style.animationDelay = `${p.driftDelay}s`;
    rotate.appendChild(askew);
    piece.appendChild(rotate);
    layer.appendChild(piece);
    animations.push(piece.animate(fallKeyframes(p), fallTiming(p, loop)));
  }
  doc.body.appendChild(layer);

  let resolve!: () => void;
  const done = new Promise<void>((r) => (resolve = r));
  let removed = false;
  const remove = () => {
    if (removed) return;
    removed = true;
    for (const a of animations) a.cancel();
    layer.remove();
    resolve();
  };

  // Una sola caída: se quita cuando el último papelito llega al piso.
  if (!loop) Promise.all(animations.map((a) => a.finished)).then(remove, remove);

  const stop = () => {
    if (removed) return;
    layer.style.opacity = "0";
    setTimeout(remove, 300);
  };
  return { done, stop };
}

export default confetti;
export { confettiSequence, type SequenceOptions } from "./sequence";
