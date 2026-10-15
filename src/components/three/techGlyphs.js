import * as THREE from "three";

/**
 * Line-art tech glyphs rasterized to CanvasTextures for the 3D orbit sprites.
 * Zero image downloads — every icon is drawn with canvas primitives at
 * runtime, which keeps the lazy 3D chunk small and crisp at any DPR.
 */

function prep(ctx, s, color) {
  ctx.clearRect(0, 0, s, s);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = s * 0.042;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowColor = color;
  ctx.shadowBlur = s * 0.1;
}

function drawReact(ctx, s) {
  const c = s / 2;
  const r = s * 0.3;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(c, c, r, r * 0.4, (Math.PI / 3) * i, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(c, c, s * 0.048, 0, Math.PI * 2);
  ctx.fill();
}

function drawNode(ctx, s) {
  const c = s / 2;
  const r = s * 0.28;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    const px = c + Math.cos(a) * r;
    const py = c + Math.sin(a) * r;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(c, c, s * 0.05, 0, Math.PI * 2);
  ctx.fill();
}

function drawJava(ctx, s) {
  // coffee cup body
  ctx.beginPath();
  ctx.moveTo(s * 0.3, s * 0.44);
  ctx.lineTo(s * 0.3, s * 0.66);
  ctx.quadraticCurveTo(s * 0.3, s * 0.74, s * 0.38, s * 0.74);
  ctx.lineTo(s * 0.6, s * 0.74);
  ctx.quadraticCurveTo(s * 0.68, s * 0.74, s * 0.68, s * 0.66);
  ctx.lineTo(s * 0.68, s * 0.44);
  ctx.closePath();
  ctx.stroke();
  // handle
  ctx.beginPath();
  ctx.arc(s * 0.68, s * 0.54, s * 0.1, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  // steam
  ctx.beginPath();
  ctx.moveTo(s * 0.42, s * 0.36);
  ctx.quadraticCurveTo(s * 0.38, s * 0.28, s * 0.42, s * 0.2);
  ctx.moveTo(s * 0.56, s * 0.36);
  ctx.quadraticCurveTo(s * 0.52, s * 0.28, s * 0.56, s * 0.2);
  ctx.stroke();
  // saucer
  ctx.beginPath();
  ctx.moveTo(s * 0.26, s * 0.82);
  ctx.lineTo(s * 0.72, s * 0.82);
  ctx.stroke();
}

function drawFlutter(ctx, s) {
  // double chevron, the Flutter "F" silhouette
  ctx.beginPath();
  ctx.moveTo(s * 0.62, s * 0.16);
  ctx.lineTo(s * 0.3, s * 0.48);
  ctx.lineTo(s * 0.44, s * 0.62);
  ctx.lineTo(s * 0.76, s * 0.3);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(s * 0.76, s * 0.52);
  ctx.lineTo(s * 0.52, s * 0.76);
  ctx.lineTo(s * 0.62, s * 0.86);
  ctx.lineTo(s * 0.86, s * 0.62);
  ctx.closePath();
  ctx.stroke();
}

function drawFirebase(ctx, s) {
  ctx.beginPath();
  ctx.moveTo(s * 0.28, s * 0.64);
  ctx.quadraticCurveTo(s * 0.34, s * 0.5, s * 0.47, s * 0.18);
  ctx.quadraticCurveTo(s * 0.52, s * 0.4, s * 0.62, s * 0.34);
  ctx.quadraticCurveTo(s * 0.74, s * 0.52, s * 0.72, s * 0.64);
  ctx.quadraticCurveTo(s * 0.68, s * 0.8, s * 0.5, s * 0.82);
  ctx.quadraticCurveTo(s * 0.34, s * 0.8, s * 0.28, s * 0.64);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(s * 0.42, s * 0.6);
  ctx.lineTo(s * 0.5, s * 0.7);
  ctx.lineTo(s * 0.58, s * 0.6);
  ctx.stroke();
}

function drawSql(ctx, s) {
  const cx = s / 2;
  const rx = s * 0.22;
  const ry = s * 0.075;
  const top = s * 0.3;
  const bottom = s * 0.7;
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
  { key: "react", color: "#8fb8f8", draw: drawReact, radius: 2.55, speed: 0.14, phase: 0.0, y: 0.55, scale: 0.52 },
  { key: "node", color: "#7fd69b", draw: drawNode, radius: 2.85, speed: 0.11, phase: 1.1, y: -0.35, scale: 0.48 },
  { key: "java", color: "#f0b26b", draw: drawJava, radius: 2.45, speed: 0.16, phase: 2.2, y: 0.9, scale: 0.5 },
  { key: "flutter", color: "#6fd4f2", draw: drawFlutter, radius: 2.95, speed: 0.12, phase: 3.3, y: 0.15, scale: 0.46 },
  { key: "firebase", color: "#f2c76b", draw: drawFirebase, radius: 2.6, speed: 0.15, phase: 4.3, y: -0.75, scale: 0.5 },
  { key: "sql", color: "#9aa7f5", draw: drawSql, radius: 2.75, speed: 0.13, phase: 5.3, y: -0.1, scale: 0.48 },
];

/** Rasterize a glyph draw function into a THREE.CanvasTexture. */
export function makeGlyphTexture(glyph, size = 176) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  prep(ctx, size, glyph.color);
  glyph.draw(ctx, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}
