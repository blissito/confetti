import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_COLORS, buildCss, fallKeyframes, fallTiming, makePieces, rand, totalDuration } from "./core";

// Generador repetible para que las pruebas no dependan del azar.
function seeded(seed = 1) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

test("rand respeta min y max (el original pisaba min)", () => {
  const rng = seeded(7);
  for (let i = 0; i < 1000; i++) {
    const n = rand(0.6, 2.8, rng);
    assert.ok(n >= 0.6 && n < 2.8, String(n));
  }
  assert.equal(rand(3, 3), 3);
});

test("makePieces reparte a lo ancho con los defaults", () => {
  const pieces = makePieces({}, seeded(3));
  assert.equal(pieces.length, 80);
  assert.equal(pieces[0].x, 0);
  assert.ok(pieces.every((p) => (DEFAULT_COLORS as readonly string[]).includes(p.color)));
  assert.ok(pieces.every((p) => p.fall >= 3500 && p.fall < 6000 && p.delay >= 0 && p.delay < 1800));
  assert.ok(pieces.every((p) => p.turn === 2 || p.turn === -2));
});

test("makePieces acepta count, colores, duración y loop", () => {
  const pieces = makePieces({ count: 5, colors: ["red"], duration: [100, 200], loop: true }, seeded(9));
  assert.equal(pieces.length, 5);
  assert.ok(pieces.every((p) => p.color === "red" && p.fall >= 100 && p.fall < 200 && p.delay < 5000));
  assert.equal(makePieces({ count: 0 }).length, 0);
});

test("la caída sale de arriba y espera ahí (fill both), sin opacidad inútil", () => {
  const [p] = makePieces({ count: 1 }, seeded(5));
  const frames = fallKeyframes(p);
  assert.equal(frames.length, 2);
  assert.match(String(frames[0].transform), /-5vh/);
  assert.match(String(frames[1].transform), /105vh/);
  assert.ok(frames.every((f) => !("opacity" in f)));
  const once = fallTiming(p);
  assert.equal(once.fill, "both");
  assert.equal(once.iterations, 1);
  assert.equal(fallTiming(p, true).iterations, Infinity);
});

test("totalDuration es el papelito que llega al último", () => {
  const pieces = makePieces({ count: 10 }, seeded(2));
  const max = Math.max(...pieces.map((p) => p.delay + p.fall));
  assert.equal(totalDuration(pieces), max);
  assert.equal(totalDuration([]), 0);
});

test("el CSS es fijo, con prefijo propio y sin !important", () => {
  const css = buildCss();
  assert.match(css, /\.ebc-layer\{position:fixed/);
  assert.ok(!css.includes("!important"));
  assert.ok(!/(^|\})\.(confetti|rotate|askew)\b/.test(css));
});
