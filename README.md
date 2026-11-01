# @easybits.cloud/confetti

![Papelitos morados y amarillos con contorno cayendo sobre una tarjeta de «¡Listo!»](https://raw.githubusercontent.com/blissito/confetti/main/docs/confetti.gif)

El confeti de EasyBits y Ghosty: papelitos sesgados con contorno que bailan de lado, giran en X
y caen dando vueltas. Es una sola función, no tiene dependencias, usa la Web Animations API y
**se limpia solo** cuando el último papelito toca el piso.

- Cero dependencias, ~3 KB minificado (~1.5 KB con gzip).
- Capa `position: fixed` encima de todo y que deja pasar los clics.
- CSS inyectado una sola vez, con clases propias (`.ebc-*`) para no chocar con tu página.
- Respeta `prefers-reduced-motion`.
- Modo `loop` para una lluvia que no para hasta que tú digas.
- Componente de React opcional.

## Instalación

```bash
npm install @easybits.cloud/confetti
```

## Uso sin framework

```js
import { confetti } from "@easybits.cloud/confetti";

// Una sola caída; se quita sola.
confetti();

// Espera a que termine.
await confetti({ count: 120 }).done;

// Lluvia infinita (pantalla de pago exitoso, por ejemplo) y cortarla después.
const rain = confetti({ loop: true });
setTimeout(() => rain.stop(), 10_000);
```

`confetti()` regresa `{ done, stop }`: `done` es una promesa que se resuelve cuando la capa ya
no está en la página y `stop()` la quita con un desvanecido corto. En el servidor (SSR) no hace
nada, así que puedes llamarla sin miedo.

## Uso con React

```tsx
import { Confetti } from "@easybits.cloud/confetti/react";

function Checkout() {
  const [fire, setFire] = useState(0);
  return (
    <>
      <button onClick={() => setFire((n) => n + 1)}>Pagar</button>
      <Confetti fire={fire} />
    </>
  );
}
```

Cada vez que `fire` cambia sale otra tanda; con `0` o `false` no sale nada. Para la lluvia
infinita: `<Confetti fire loop />`, y se detiene sola cuando el componente se desmonta.

## Opciones

| Opción | Tipo | Default | Qué hace |
|---|---|---|---|
| `count` | `number` | `80` | Cuántos papelitos. |
| `colors` | `string[]` | `#f0d36b`, `#c4b0f5`, `#9870ed` | Colores de relleno. Repite uno para darle más peso. |
| `outline` | `string` | `#111` | Color del contorno. |
| `duration` | `[min, max]` | `[3500, 6000]` | Cuánto tarda cada papelito en caer, en ms. |
| `delay` | `[min, max]` | `[0, 1800]` (`[0, 5000]` en `loop`) | Retraso de salida de cada papelito, en ms. |
| `loop` | `boolean` | `false` | Lluvia infinita hasta llamar `stop()`. |
| `zIndex` | `number` | `60` | z-index de la capa. |
| `respectReducedMotion` | `boolean` | `true` | Si el sistema pide menos movimiento, no sale nada. |

## La historia del bug de la esquina

La primera versión vivía en EasyBits como componente de React y tenía un detalle que nunca se
dejó arreglar a mano: cada papelito empezaba en `top: -2rem; left: -2rem` y esperaba hasta 5
segundos su turno. Como la animación no tenía `fill: "backwards"`, durante esa espera el
papelito se quedaba en su lugar del CSS, y los 80 se amontonaban en la esquina superior
izquierda antes de salir volando. Aquí la caída usa `fill: "both"`: mientras espera, el
papelito ya está en su primer cuadro, arriba y fuera de la vista. De paso, la capa es fija (ya
no se va con el scroll), una sola caída termina y se quita, y el helper de números al azar ya
no se pisa el mínimo.

## Licencia y autor

MIT © bliss ([@blissito](https://github.com/blissito)).

Basado en un confeti que bliss adaptó y modificó a mano.
