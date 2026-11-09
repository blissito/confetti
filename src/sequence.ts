// Varias tandas seguidas de confeti (p. ej. un «combo» al cerrar una venta).
import { confetti, type ConfettiHandle, type ConfettiOptions } from "./index";

export type SequenceOptions = ConfettiOptions & {
  /** Cuántas tandas lanzar. */
  times: number;
  /** Duración total de la secuencia en ms. */
  totalMs: number;
};
