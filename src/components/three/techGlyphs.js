import * as THREE from "three";

/**
 * Brand-colored tech glyphs rasterized to CanvasTextures for the 3D orbit
 * sprites. Every icon is drawn with canvas primitives at runtime (zero image
 * downloads) — filled shapes + a baked radial glow halo so they pop on both
 * dark and light canvases. Each glyph carries a `color` (dark theme) and a
 * `lightColor` (light theme) so the scene can swap texture sets on toggle.
 */

function glowBase(ctx, s, color, haloAlpha) {
  ctx.clearRect(0, 0, s, s);
  // baked glow halo — the disc that makes the icon readable over the orb
  const g = ctx.createRadialGradient(s / 2, s / 2, s * 0.08, s / 2, s / 2, s * 0.5);
  g.addColorStop(0, hexA(color, haloAlpha));
  g.addColorStop(0.55, hexA(color, haloAlpha * 0.35));
  g.addColorStop(1, hexA(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
}

function stroke(ctx, s, color) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = s * 0.055;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowColor = color;
  ctx.shadowBlur = s * 0.06;
}

function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

/* ── React — the atom ─────────────────────────────────────────────────── */
function drawReact(ctx, s, c) {
  const r = s * 0.3;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(c, c, r, r * 0.42, (Math.PI / 3) * i, 0, Math.PI * 2);
    ctx.stroke();
  }
  const grad = ctx.createRadialGradient(c, c, 0, c, c, s * 0.09);
  grad.addColorStop(0, "#ffffff");
  grad.addColorStop(1, ctx.strokeStyle);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(c, c, s * 0.075, 0, Math.PI * 2);
  ctx.fill();
}

/* ── Node.js — hexagon + JS tick ──────────────────────────────────────── */
function drawNode(ctx, s, c) {
  const r = s * 0.3;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    const px = c + Math.cos(a) * r;
    const py = c + Math.sin(a) * r;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.font = `700 ${s * 0.2}px "JetBrains Mono", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("JS", c, c + s * 0.01);
}

/* ── Java — coffee cup, filled ────────────────────────────────────────── */
function drawJava(ctx, s) {
  ctx.lineWidth = s * 0.05;
  // cup body (filled)
  ctx.beginPath();
  ctx.moveTo(s * 0.3, s * 0.44);
  ctx.lineTo(s * 0.3, s * 0.66);
  ctx.quadraticCurveTo(s * 0.3, s * 0.74, s * 0.38, s * 0.74);
  ctx.lineTo(s * 0.6, s * 0.74);
  ctx.quadraticCurveTo(s * 0.68, s * 0.74, s * 0.68, s * 0.66);
  ctx.lineTo(s * 0.68, s * 0.44);
  ctx.closePath();
  ctx.fill();
  // handle
  ctx.beginPath();
  ctx.arc(s * 0.68, s * 0.54, s * 0.1, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  // steam
  ctx.beginPath();
  ctx.moveTo(s * 0.42, s * 0.36);
  ctx.quadraticCurveTo(s * 0.37, s * 0.28, s * 0.42, s * 0.19);
  ctx.moveTo(s * 0.56, s * 0.36);
  ctx.quadraticCurveTo(s * 0.51, s * 0.28, s * 0.56, s * 0.19);
  ctx.stroke();
  // saucer
  ctx.beginPath();
  ctx.moveTo(s * 0.25, s * 0.82);
  ctx.lineTo(s * 0.73, s * 0.82);
  ctx.stroke();
}

/* ── Flutter — the double chevron F ───────────────────────────────────── */
function drawFlutter(ctx, s) {
  ctx.fillStyle = ctx.strokeStyle;
  ctx.beginPath();
  ctx.moveTo(s * 0.62, s * 0.16);
  ctx.lineTo(s * 0.3, s * 0.48);
  ctx.lineTo(s * 0.44, s * 0.62);
  ctx.lineTo(s * 0.76, s * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(s * 0.76, s * 0.52);
  ctx.lineTo(s * 0.52, s * 0.76);
  ctx.lineTo(s * 0.62, s * 0.86);
  ctx.lineTo(s * 0.86, s * 0.62);
  ctx.closePath();
  ctx.fill();
  // top wing highlight
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.beginPath();
  ctx.moveTo(s * 0.62, s * 0.16);
  ctx.lineTo(s * 0.76, s * 0.3);
  ctx.lineTo(s * 0.62, s * 0.44);
  ctx.lineTo(s * 0.48, s * 0.3);
  ctx.closePath();
  ctx.fill();
}

/* ── Firebase — flame, filled ─────────────────────────────────────────── */
function drawFirebase(ctx, s) {
  ctx.fillStyle = ctx.strokeStyle;
  ctx.beginPath();
  ctx.moveTo(s * 0.28, s * 0.64);
  ctx.quadraticCurveTo(s * 0.34, s * 0.5, s * 0.47, s * 0.18);
  ctx.quadraticCurveTo(s * 0.52, s * 0.4, s * 0.62, s * 0.34);
  ctx.quadraticCurveTo(s * 0.74, s * 0.52, s * 0.72, s * 0.64);
  ctx.quadraticCurveTo(s * 0.68, s * 0.8, s * 0.5, s * 0.82);
  ctx.quadraticCurveTo(s * 0.34, s * 0.8, s * 0.28, s * 0.64);
  ctx.closePath();
  ctx.fill();
  // inner cut (white core keeps the flame reading at small sizes)
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.beginPath();
  ctx.moveTo(s * 0.42, s * 0.62);
  ctx.quadraticCurveTo(s * 0.5, s * 0.52, s * 0.58, s * 0.62);
  ctx.quadraticCurveTo(s * 0.55, s * 0.74, s * 0.5, s * 0.74);
  ctx.quadraticCurveTo(s * 0.45, s * 0.74, s * 0.42, s * 0.62);
  ctx.closePath();
  ctx.fill();
}

/* ── SQL — database cylinder ──────────────────────────────────────────── */
function drawSql(ctx, s, c) {
  const cx = c;
  const rx = s * 0.24;
  const ry = s * 0.085;
  const top = s * 0.32;
  const bottom = s * 0.7;
  // body fill
  ctx.fillStyle = hexA(ctx.strokeStyle, 0.22);
  ctx.beginPath();
  ctx.moveTo(cx - rx, top);
  ctx.lineTo(cx - rx, bottom);
  ctx.ellipse(cx, bottom, rx, ry, 0, Math.PI, 0, true);
  ctx.lineTo(cx + rx, top);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx, top, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - rx, top);
  ctx.lineTo(cx - rx, bottom);
  ctx.moveTo(cx + rx, top);
  ctx.lineTo(cx + rx, bottom);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx, bottom, rx, ry, 0, 0, Math.PI);
  ctx.stroke();
}

export const TECH_GLYPHS = [
  { key: "react", color: "#67e0ff", lightColor: "#0891b2", radius: 2.62, speed: 0.15, phase: 0.0, y: 0.62, scale: 0.8 },
  { key: "node", color: "#7fe39a", lightColor: "#15803d", radius: 2.92, speed: 0.115, phase: 1.1, y: -0.42, scale: 0.72 },
  { key: "java", color: "#ffc07a", lightColor: "#c2410c", radius: 2.5, speed: 0.17, phase: 2.2, y: 1.0, scale: 0.76 },
  { key: "flutter", color: "#7cd3ff", lightColor: "#0284c7", radius: 3.02, speed: 0.125, phase: 3.3, y: 0.2, scale: 0.72 },
  { key: "firebase", color: "#ffd479", lightColor: "#b45309", radius: 2.68, speed: 0.16, phase: 4.3, y: -0.85, scale: 0.76 },
  { key: "sql", color: "#a5b0ff", lightColor: "#4f46e5", radius: 2.82, speed: 0.135, phase: 5.3, y: -0.05, scale: 0.74 },
];

/**
 * Rasterize a glyph into a THREE.CanvasTexture.
 * theme "dark" → bright glyph + strong halo (additive blending in scene)
 * theme "light" → saturated darker glyph + soft halo (normal blending)
 */
export function makeGlyphTexture(glyph, theme = "dark", size = 256) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const light = theme === "light";
  const color = light ? glyph.lightColor : glyph.color;

  glowBase(ctx, size, color, light ? 0.24 : 0.5);
  stroke(ctx, size, color);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  const drawers = { react: drawReact, node: drawNode, java: drawJava, flutter: drawFlutter, firebase: drawFirebase, sql: drawSql };
  drawers[glyph.key](ctx, size, size / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}
