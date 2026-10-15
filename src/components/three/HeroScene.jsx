import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import { TECH_GLYPHS, makeGlyphTexture } from "./techGlyphs";

/* ─── Distorted icosphere — dark chrome with iridescent reflections ─────── */
function Orb({ heroRef }) {
  const group = useRef(null);
  const mat = useRef(null);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const h = heroRef.current?.offsetHeight || 800;
    const p = Math.min(1, Math.max(0, window.scrollY / (h * 0.9)));

    // pointer parallax + slow idle spin + scroll-driven rotation/exit
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, state.pointer.x * 0.4 + t * 0.07 + p * 1.4, 2.4, delta);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -state.pointer.y * 0.24 + p * 0.4, 2.4, delta);
    const targetScale = 1 - p * 0.3;
    const s = THREE.MathUtils.damp(g.scale.x, targetScale, 2.4, delta);
    g.scale.setScalar(s);
    g.position.y = THREE.MathUtils.damp(g.position.y, p * 1.8, 2.4, delta);
    if (mat.current) mat.current.distort = 0.34 + Math.sin(t * 0.5) * 0.06;
  });

  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[1.38, 48]} />
        <MeshDistortMaterial
          ref={mat}
          color="#1b1b30"
          metalness={0.8}
          roughness={0.14}
          distort={0.35}
          speed={1.6}
          envMapIntensity={2.1}
        />
      </mesh>
      {/* faint wireframe shell — gives the blob an engineered structure */}
      <mesh scale={1.3}>
        <icosahedronGeometry args={[1.38, 1]} />
        <meshBasicMaterial wireframe color="#6366f1" transparent opacity={0.11} />
      </mesh>
    </group>
  );
}

/* ─── Orbiting tech sprites + hairline rings ────────────────────────────── */
function Orbiter({ texture, cfg }) {
  const ref = useRef(null);
  useFrame((state) => {
    const el = ref.current;
    if (!el) return;
    const t = state.clock.elapsedTime;
    const a = cfg.phase + t * cfg.speed;
    el.position.set(
      Math.cos(a) * cfg.radius,
      cfg.y + Math.sin(t * 0.8 + cfg.phase * 2.7) * 0.14,
      Math.sin(a) * cfg.radius * 0.55
    );
    // sprites crossing behind the orb fade back for depth
    const depth = (Math.sin(a) + 1) / 2; // 0 back → 1 front
    el.material.opacity = 0.28 + depth * 0.72;
  });
  return (
    <sprite ref={ref} scale={[cfg.scale, cfg.scale, 1]}>
      <spriteMaterial
        map={texture}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </sprite>
  );
}

function OrbitRing({ tilt, radius, color, opacity, speed, reverse }) {
  const ref = useRef(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += (reverse ? -1 : 1) * speed * delta;
  });
  return (
    <mesh ref={ref} rotation={[Math.PI / 2 + tilt, tilt * 0.6, 0]}>
      <torusGeometry args={[radius, 0.0045, 8, 128]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  );
}

function SceneContent({ heroRef }) {
  const sceneGroup = useRef(null);
  const textures = useMemo(() => TECH_GLYPHS.map((g) => makeGlyphTexture(g)), []);

  useFrame((state, delta) => {
    const g = sceneGroup.current;
    if (!g) return;
    // whole composition leans toward the pointer — parallax depth for sprites
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, state.pointer.x * 0.12, 2, delta);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -state.pointer.y * 0.08, 2, delta);
  });

  return (
    <group ref={sceneGroup}>
      <Orb heroRef={heroRef} />
      <OrbitRing tilt={0.32} radius={2.55} color="#818cf8" opacity={0.22} speed={0.05} reverse={false} />
      <OrbitRing tilt={-0.4} radius={2.9} color="#22d3ee" opacity={0.14} speed={0.04} reverse={true} />
      {textures.map((tex, i) => (
        <Orbiter key={TECH_GLYPHS[i].key} texture={tex} cfg={TECH_GLYPHS[i]} />
      ))}
    </group>
  );
}

/* ─── Canvas host — DPR-capped, paused offscreen ─────────────────────────── */
export default function HeroScene({ heroRef }) {
  const wrapRef = useRef(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0,
    });
    if (wrapRef.current) io.observe(wrapRef.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="hero-canvas-wrap absolute inset-0" aria-hidden="true">
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 6], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.25} />
        <directionalLight position={[4, 5, 6]} intensity={1.5} color="#a5b4fc" />
        <directionalLight position={[-5, -3, -4]} intensity={0.8} color="#22d3ee" />
        <Suspense fallback={null}>
          {/* Procedural studio — Lightformers only, no HDR download */}
          <Environment resolution={256}>
            <Lightformer intensity={8} color="#818cf8" position={[0, 4, -6]} scale={[9, 3, 1]} />
            <Lightformer intensity={5} color="#22d3ee" position={[-5, -1, 3]} rotation-y={Math.PI / 2} scale={[7, 2.5, 1]} />
            <Lightformer intensity={4} color="#e0e7ff" position={[5, 2, 3]} rotation-y={-Math.PI / 2} scale={[7, 2, 1]} />
          </Environment>
          <SceneContent heroRef={heroRef} />
        </Suspense>
      </Canvas>
    </div>
  );
}
