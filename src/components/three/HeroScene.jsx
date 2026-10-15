import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import { TECH_GLYPHS, makeGlyphTexture } from "./techGlyphs";

/* ─── Theme-aware color targets (lerped every frame for a smooth toggle) ── */
const PALETTES = {
  dark: {
    orb: "#222240", metalness: 0.75, roughness: 0.16, envIntensity: 2.3,
    wire: "#6366f1", wireOpacity: 0.12,
    ringA: "#818cf8", ringAOpacity: 0.24,
    ringB: "#22d3ee", ringBOpacity: 0.16,
    star: "#818cf8", starAccent: "#22d3ee", starOpacity: 0.75,
    sat: "#818cf8", satOpacity: 0.22,
    ambient: 0.3, keyLight: 1.6, rimLight: 0.9,
    spriteOpacityFront: 1, spriteOpacityBack: 0.3,
  },
  light: {
    orb: "#e6e9f8", metalness: 0.35, roughness: 0.26, envIntensity: 1.05,
    wire: "#4f46e5", wireOpacity: 0.2,
    ringA: "#4f46e5", ringAOpacity: 0.34,
    ringB: "#0891b2", ringBOpacity: 0.26,
    star: "#6366f1", starAccent: "#0891b2", starOpacity: 0.5,
    sat: "#4f46e5", satOpacity: 0.3,
    ambient: 0.75, keyLight: 0.9, rimLight: 0.55,
    spriteOpacityFront: 0.98, spriteOpacityBack: 0.5,
  },
};

function damp(current, target, k, dt) {
  return THREE.MathUtils.damp(current, target, k, dt);
}
function dampColor(color, targetHex, k, dt) {
  _tmp.set(targetHex);
  color.lerp(_tmp, 1 - Math.exp(-k * dt));
}
const _tmp = new THREE.Color();

/* ─── Pointer tracking at window level (canvas sits behind the content) ── */
function useWindowPointer() {
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  return pointer;
}

/* ─── Distorted chrome orb — repositioned right (desktop) / below (mobile) */
function Orb({ heroRef, themeRef, pointer }) {
  const group = useRef(null);
  const meshMat = useRef(null);
  const wireMat = useRef(null);
  const portrait = useRef(false);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const pal = PALETTES[themeRef.current] || PALETTES.dark;
    const w = window.innerWidth;
    const isPortrait = w < 1024;
    if (isPortrait !== portrait.current) {
      portrait.current = isPortrait;
      g.position.set(isPortrait ? 0 : 1.75, isPortrait ? -2.0 : 0.05, isPortrait ? -0.6 : 0);
    }
    const h = heroRef.current?.offsetHeight || 800;
    const p = Math.min(1, Math.max(0, window.scrollY / (h * 0.9)));

    g.rotation.y = damp(g.rotation.y, pointer.current.x * 0.38 + t * 0.07 + p * 1.4, 2.4, delta);
    g.rotation.x = damp(g.rotation.x, -pointer.current.y * 0.22 + p * 0.4, 2.4, delta);
    const s = damp(g.scale.x, (isPortrait ? 0.72 : 1) * (1 - p * 0.3), 2.4, delta);
    g.scale.setScalar(s);
    g.position.y = damp(
      g.position.y,
      (isPortrait ? -2.0 : 0.05) + p * 1.8 + Math.sin(t * 0.45) * 0.06,
      2.4,
      delta
    );
    if (meshMat.current) {
      meshMat.current.distort = 0.34 + Math.sin(t * 0.5) * 0.06;
      dampColor(meshMat.current.color, pal.orb, 3, delta);
      meshMat.current.metalness = damp(meshMat.current.metalness, pal.metalness, 3, delta);
      meshMat.current.roughness = damp(meshMat.current.roughness, pal.roughness, 3, delta);
      meshMat.current.envMapIntensity = damp(meshMat.current.envMapIntensity, pal.envIntensity, 3, delta);
    }
    if (wireMat.current) {
      dampColor(wireMat.current.color, pal.wire, 3, delta);
      wireMat.current.opacity = damp(wireMat.current.opacity, pal.wireOpacity, 3, delta);
    }
  });

  return (
    <group ref={group} position={[1.75, 0.05, 0]}>
      <mesh>
        <icosahedronGeometry args={[1.38, 48]} />
        <MeshDistortMaterial ref={meshMat} color="#222240" metalness={0.75} roughness={0.16} distort={0.35} speed={1.6} envMapIntensity={2.3} />
      </mesh>
      {/* engineered wireframe shell */}
      <mesh scale={1.3}>
        <icosahedronGeometry args={[1.38, 1]} />
        <meshBasicMaterial ref={wireMat} wireframe color="#6366f1" transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

/* ─── Orbiting tech icons — bigger, pulsing, glowing, theme-aware ──────── */
function Orbiter({ textureDark, textureLight, glyph, centerRef, themeRef }) {
  const ref = useRef(null);
  const mat = useRef(null);
  const applied = useRef(null);

  useFrame((state, delta) => {
    const el = ref.current;
    if (!el || !mat.current) return;
    const center = centerRef.current;
    const t = state.clock.elapsedTime;
    const a = glyph.phase + t * glyph.speed;
    const k = center?.scaleFactor || 1;
    const xk = center?.xFactor || 1; // elliptical orbit — icons never swing into the copy
    el.position.set(
      (center?.x || 0) + Math.cos(a) * glyph.radius * k * xk,
      (center?.y || 0) + glyph.y * k + Math.sin(t * 0.8 + glyph.phase * 2.7) * 0.16,
      Math.sin(a) * glyph.radius * 0.55
    );
    const depth = (Math.sin(a) + 1) / 2; // 0 behind orb → 1 in front
    const pal = PALETTES[themeRef.current] || PALETTES.dark;
    const target = pal.spriteOpacityBack + depth * (pal.spriteOpacityFront - pal.spriteOpacityBack);
    mat.current.opacity = THREE.MathUtils.damp(mat.current.opacity, target, 3, delta);
    // gentle pulse — the "alive" motion the icons were missing
    const pulse = 1 + Math.sin(t * 1.3 + glyph.phase * 1.9) * 0.055;
    el.scale.set(glyph.scale * pulse, glyph.scale * pulse, 1);
    el.material.rotation = Math.sin(t * 0.35 + glyph.phase) * 0.09;

    // swap texture set + blending when the theme flips
    const theme = themeRef.current;
    if (applied.current !== theme) {
      applied.current = theme;
      mat.current.map = theme === "light" ? textureLight : textureDark;
      mat.current.blending = theme === "light" ? THREE.NormalBlending : THREE.AdditiveBlending;
      mat.current.needsUpdate = true;
    }
  });

  return (
    <sprite ref={ref} scale={[glyph.scale, glyph.scale, 1]}>
      <spriteMaterial
        ref={mat}
        map={textureDark}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </sprite>
  );
}

/* ─── Hairline orbit rings ─────────────────────────────────────────────── */
function OrbitRing({ tilt, radius, colorKey, speed, reverse, centerRef, themeRef }) {
  const ref = useRef(null);
  const mat = useRef(null);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += (reverse ? -1 : 1) * speed * delta;
    const m = mat.current;
    if (!m) return;
    const center = centerRef.current;
    const pal = PALETTES[themeRef.current] || PALETTES.dark;
    dampColor(m.color, pal[colorKey], 3, delta);
    m.opacity = THREE.MathUtils.damp(m.opacity, pal[colorKey + "Opacity"], 3, delta);
    if (center) ref.current.position.set(center.x, center.y, 0);
  });

  return (
    <mesh ref={ref} rotation={[Math.PI / 2 + tilt, tilt * 0.6, 0]}>
      <torusGeometry args={[radius, 0.0045, 8, 128]} />
      <meshBasicMaterial ref={mat} color="#818cf8" transparent opacity={0.22} />
    </mesh>
  );
}

/* Deterministic PRNG — keeps the starfield pure & stable across re-renders */
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ─── 3D starfield — replaces the 2D constellation when 3D is active ───── */
function Starfield({ themeRef, pointer }) {
  const group = useRef(null);
  const matMain = useRef(null);
  const matAccent = useRef(null);

  const [geoMain, geoAccent] = useMemo(() => {
    const build = (count, spread, seed) => {
      const rand = mulberry32(seed);
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        pos[i * 3] = (rand() - 0.5) * spread[0];
        pos[i * 3 + 1] = (rand() - 0.5) * spread[1];
        pos[i * 3 + 2] = -1.5 + rand() * 5.5;
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      return g;
    };
    const mobile = window.innerWidth < 820;
    const n = mobile ? 150 : 340;
    return [build(n, [19, 10], 1988), build(Math.floor(n * 0.3), [17, 9], 4099)];
  }, []);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    g.rotation.z = t * 0.008;
    g.position.x = damp(g.position.x, pointer.current.x * -0.35, 1.6, delta);
    g.position.y = damp(g.position.y, pointer.current.y * 0.25, 1.6, delta);
    const pal = PALETTES[themeRef.current] || PALETTES.dark;
    if (matMain.current) {
      dampColor(matMain.current.color, pal.star, 3, delta);
      matMain.current.opacity = THREE.MathUtils.damp(matMain.current.opacity, pal.starOpacity * 0.7, 3, delta);
    }
    if (matAccent.current) {
      dampColor(matAccent.current.color, pal.starAccent, 3, delta);
      matAccent.current.opacity = THREE.MathUtils.damp(matAccent.current.opacity, pal.starOpacity, 3, delta);
    }
  });

  return (
    <group ref={group}>
      <points geometry={geoMain}>
        <pointsMaterial ref={matMain} size={0.028} color="#818cf8" transparent opacity={0.5} depthWrite={false} sizeAttenuation />
      </points>
      <points geometry={geoAccent}>
        <pointsMaterial ref={matAccent} size={0.05} color="#22d3ee" transparent opacity={0.6} depthWrite={false} sizeAttenuation />
      </points>
    </group>
  );
}

/* ─── Floating wireframe satellites for edge depth ─────────────────────── */
function Satellite({ shape, pos, size, speed, themeRef }) {
  const ref = useRef(null);
  const mat = useRef(null);

  useFrame((state, delta) => {
    const el = ref.current;
    if (!el) return;
    const t = state.clock.elapsedTime;
    el.rotation.x = t * speed;
    el.rotation.y = t * speed * 0.7;
    el.position.y = pos[1] + Math.sin(t * 0.6 + pos[0]) * 0.18;
    const pal = PALETTES[themeRef.current] || PALETTES.dark;
    if (mat.current) {
      dampColor(mat.current.color, pal.sat, 3, delta);
      mat.current.opacity = THREE.MathUtils.damp(mat.current.opacity, pal.satOpacity, 3, delta);
    }
  });

  return (
    <mesh ref={ref} position={pos} scale={size}>
      {shape === "ico" ? (
        <icosahedronGeometry args={[1, 0]} />
      ) : shape === "oct" ? (
        <octahedronGeometry args={[1, 0]} />
      ) : (
        <torusGeometry args={[1, 0.32, 8, 40]} />
      )}
      <meshBasicMaterial ref={mat} wireframe color="#818cf8" transparent opacity={0.22} />
    </mesh>
  );
}

/* ─── Scene composition ────────────────────────────────────────────────── */
function SceneContent({ heroRef, themeRef }) {
  const sceneGroup = useRef(null);
  const orbGroup = useRef(null);
  const centerRef = useRef({ x: 1.75, y: 0.05, scaleFactor: 1, xFactor: 0.52 });
  const portrait = useRef(false);
  const pointer = useWindowPointer();

  const textures = useMemo(() => {
    const mobile = window.innerWidth < 820;
    const size = mobile ? 192 : 256;
    return {
      dark: TECH_GLYPHS.map((g) => makeGlyphTexture(g, "dark", size)),
      light: TECH_GLYPHS.map((g) => makeGlyphTexture(g, "light", size)),
    };
  }, []);

  useFrame((state, delta) => {
    const g = sceneGroup.current;
    if (!g) return;
    const w = window.innerWidth;
    const isPortrait = w < 1024;
    if (isPortrait !== portrait.current) {
      portrait.current = isPortrait;
      centerRef.current = isPortrait
        ? { x: 0, y: -2.0, scaleFactor: 0.74, xFactor: 0.5 }
        : { x: 1.75, y: 0.05, scaleFactor: 1, xFactor: 0.62 };
    }
    const h = heroRef.current?.offsetHeight || 800;
    const p = Math.min(1, Math.max(0, window.scrollY / (h * 0.9)));

    // whole-composition pointer lean + scroll exit
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, pointer.current.x * 0.1, 2, delta);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -pointer.current.y * 0.07 + p * 0.28, 2, delta);
    g.position.y = THREE.MathUtils.damp(g.position.y, p * 1.15, 2.4, delta);
    const s = THREE.MathUtils.damp(g.scale.x, 1 - p * 0.12, 2.4, delta);
    g.scale.setScalar(s);
  });

  return (
    <group ref={sceneGroup}>
      <Starfield themeRef={themeRef} pointer={pointer} />
      <group ref={orbGroup}>
        <Orb heroRef={heroRef} themeRef={themeRef} pointer={pointer} />
        <OrbitRing tilt={0.32} radius={2.55} colorKey="ringA" speed={0.05} reverse={false} centerRef={centerRef} themeRef={themeRef} />
        <OrbitRing tilt={-0.4} radius={2.9} colorKey="ringB" speed={0.04} reverse={true} centerRef={centerRef} themeRef={themeRef} />
        {textures.dark.map((tex, i) => (
          <Orbiter
            key={TECH_GLYPHS[i].key}
            glyph={TECH_GLYPHS[i]}
            textureDark={tex}
            textureLight={textures.light[i]}
            themeRef={themeRef}
            centerRef={centerRef}
          />
        ))}
      </group>
      <Satellite shape="ico" pos={[-3.4, 1.5, -1.2]} size={0.24} speed={0.25} themeRef={themeRef} />
      <Satellite shape="torus" pos={[-3.8, -1.7, -1.6]} size={0.3} speed={0.18} themeRef={themeRef} />
      <Satellite shape="oct" pos={[3.9, -1.9, -1.4]} size={0.22} speed={0.3} themeRef={themeRef} />
    </group>
  );
}

/* ─── Theme subscription (html[data-theme] via MutationObserver) ───────── */
function useThemeSync() {
  const themeRef = useRef(
    typeof document !== "undefined" && document.documentElement.dataset.theme === "light" ? "light" : "dark"
  );
  const [, force] = useState(0);
  useEffect(() => {
    const root = document.documentElement;
    const obs = new MutationObserver(() => {
      themeRef.current = root.dataset.theme === "light" ? "light" : "dark";
      force((n) => n + 1);
    });
    obs.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);
  return themeRef;
}

/* ─── Canvas host — full-bleed hero background, DPR-capped, IO-paused ──── */
export default function HeroScene({ heroRef, onSceneReady }) {
  const wrapRef = useRef(null);
  const [visible, setVisible] = useState(true);
  const themeRef = useThemeSync();

  useEffect(() => {
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0 });
    if (wrapRef.current) io.observe(wrapRef.current);
    return () => io.disconnect();
  }, []);

  // signal the hero that WebGL content is live (2D particles can unmount)
  useEffect(() => {
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => onSceneReady?.()));
    return () => cancelAnimationFrame(raf);
  }, [onSceneReady]);

  return (
    <div ref={wrapRef} className="hero-canvas-wrap absolute inset-0 z-[1]" aria-hidden="true">
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 6], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent", pointerEvents: "none" }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[4, 5, 6]} intensity={1.6} color="#a5b4fc" />
        <directionalLight position={[-5, -3, -4]} intensity={0.9} color="#22d3ee" />
        <Suspense fallback={null}>
          {/* Procedural studio — Lightformers only, no HDR download */}
          <Environment resolution={256}>
            <Lightformer intensity={8} color="#818cf8" position={[0, 4, -6]} scale={[9, 3, 1]} />
            <Lightformer intensity={5} color="#22d3ee" position={[-5, -1, 3]} rotation-y={Math.PI / 2} scale={[7, 2.5, 1]} />
            <Lightformer intensity={4} color="#e0e7ff" position={[5, 2, 3]} rotation-y={-Math.PI / 2} scale={[7, 2, 1]} />
          </Environment>
          <SceneContent heroRef={heroRef} themeRef={themeRef} />
        </Suspense>
      </Canvas>
    </div>
  );
}
