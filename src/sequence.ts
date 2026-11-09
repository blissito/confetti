// Varias tandas seguidas de confeti (p. ej. un «combo» al cerrar una venta).
import { confetti, type ConfettiHandle, type ConfettiOptions } from "./index";

export type SequenceOptions = ConfettiOptions & {
  /** Cuántas tandas lanzar. */
  times: number;
  /** Duración total de la secuencia en ms. */
  totalMs: number;
};

export function confettiSequence({ times, totalMs, ...options }: SequenceOptions): ConfettiHandle {
  const handles: ConfettiHandle[] = [];
  const gap = totalMs / times;
  let fired = 0;

  const timer = setInterval(() => {
    if (fired <= times) {
      handles.push(confetti(options));
      fired++;
    }
  }, gap);

  return {
    done: Promise.all(handles.map((h) => h.done)).then(() => {}),
    stop: () => handles.forEach((h) => h.stop()),
  };
}
