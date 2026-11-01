// Componente de React: lanza confeti cada vez que cambia `fire` (un número que sube en cada
// celebración; 0 o false = nada). Al desmontarse quita lo que siga en pantalla.
import { useEffect, useRef } from "react";
import { confetti, type ConfettiHandle, type ConfettiOptions } from "./index";

export type ConfettiProps = ConfettiOptions & {
  /** Cambia este valor para lanzar otra tanda. */
  fire: number | boolean;
};

export function Confetti({ fire, ...options }: ConfettiProps) {
  const handles = useRef(new Set<ConfettiHandle>());
  // Las opciones se leen al disparar; no relanzan por sí solas.
  const opts = useRef(options);
  opts.current = options;

  useEffect(() => {
    if (!fire) return;
    const h = confetti(opts.current);
    handles.current.add(h);
    h.done.then(() => handles.current.delete(h));
    // En `loop` cada disparo reemplaza la lluvia anterior.
    if (opts.current.loop) return () => h.stop();
  }, [fire]);

  useEffect(() => {
    const set = handles.current;
    return () => set.forEach((h) => h.stop());
  }, []);

  return null;
}

export default Confetti;
