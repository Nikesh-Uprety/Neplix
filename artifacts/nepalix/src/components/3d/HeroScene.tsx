import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Image, ScrollControls, useScroll, Float, Text, ContactShadows, Environment, MeshReflectorMaterial, Preload } from "@react-three/drei";
import * as THREE from "three";

import img1 from "@assets/image_1776100495005.png";
import img2 from "@assets/image_1776100524442.png";
import img3 from "@assets/image_1776100541356.png";
import img4 from "@assets/image_1776100572045.png";
import img5 from "@assets/image_1776100592841.png";
import img6 from "@assets/image_1776100621061.png";
import img7 from "@assets/image_1776100642684.png";
import img8 from "@assets/image_1776100665095.png";
import img9 from "@assets/image_1776100687942.png";
import img10 from "@assets/image_1776100728550.png";

// Mouse-tracking camera
function CameraController() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    document.addEventListener("mousemove", handler);
    return () => document.removeEventListener("mousemove", handler);
  }, []);

  useFrame((state) => {
    camera.position.x += (mouse.current.x * 1.5 - camera.position.x) * 0.05;
    camera.position.y += (-mouse.current.y * 1.0 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

const screenshots = [
  { url: img1, position: [-2.5, 1.2, -1], rotation: [0, 0.2, 0], scale: 1.5 },
  { url: img2, position: [2.8, -0.5, 0.5], rotation: [0, -0.3, 0], scale: 1.8 },
  { url: img3, position: [-3.2, -1.0, 1], rotation: [0, 0.4, 0], scale: 1.4 },
  { url: img4, position: [3.5, 1.5, -2], rotation: [0, -0.2, 0], scale: 1.6 },
  { url: img5, position: [-1.0, -2.5, -1.5], rotation: [0.1, 0.1, 0], scale: 1.3 },
  { url: img6, position: [1.2, 2.8, 0], rotation: [-0.1, -0.1, 0], scale: 1.7 },
  { url: img7, position: [-4.0, 0.5, -2.5], rotation: [0, 0.3, 0], scale: 1.5 },
  { url: img8, position: [4.2, -1.5, -1], rotation: [0, -0.4, 0], scale: 1.4 },
  { url: img9, position: [0, -0.5, -3], rotation: [0, 0, 0], scale: 2.0 },
  { url: img10, position: [0.5, 1.0, -4], rotation: [0, 0, 0], scale: 1.5 }
];

function FloatingGallery() {
  return (
    <group>
      {screenshots.map((s, i) => (
        <Float key={i} floatIntensity={2} rotationIntensity={0.2} speed={1.5 + Math.random()}>
          <Image
            url={s.url}
            position={s.position as [number, number, number]}
            rotation={s.rotation as [number, number, number]}
            scale={[s.scale * 1.6, s.scale * 1.0]} // approximate aspect ratio
            transparent
            opacity={0.8}
            radius={0.05}
          />
        </Float>
      ))}
    </group>
  );
}

function Starfield() {
  const geo = useMemo(() => {
    const pos = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000 * 3; i++) pos[i] = (Math.random() - 0.5) * 80;
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);

  return (
    <points geometry={geo}>
      <pointsMaterial color={0xffffff} size={0.035} transparent opacity={0.4} />
    </points>
  );
}

function GlobeScene() {
  return (
    <>
      <ambientLight color={0x0a1628} intensity={2.5} />
      <pointLight color={0x06b6d4} intensity={5} distance={15} position={[1.5, 1.5, 2]} />
      <pointLight color={0x8b5cf6} intensity={3} distance={10} position={[-2, -1, 1]} />
      
      <Starfield />
      
      {/* Central glow */}
      <mesh position={[0, 0, -5]}>
        <sphereGeometry args={[4, 32, 32]} />
        <meshBasicMaterial color={0x001428} transparent opacity={0.3} />
      </mesh>
      
      <FloatingGallery />
      <CameraController />
    </>
  );
}

export function HeroScene({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <GlobeScene />
        <Preload all />
      </Canvas>
    </div>
  );
}
