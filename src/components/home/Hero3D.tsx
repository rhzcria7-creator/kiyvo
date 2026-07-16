'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

/* ── Floating gem that represents the Playdex "dex/index" concept ── */
function PlayGem() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.3
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
  })

  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={1.2}>
      <mesh ref={meshRef} scale={1.8}>
        <icosahedronGeometry args={[1, 1]} />
        <MeshDistortMaterial
          color="#2563EB"
          roughness={0.15}
          metalness={0.8}
          distort={0.25}
          speed={3}
          envMapIntensity={1}
        />
      </mesh>
    </Float>
  )
}

/* ── Orbiting rings ── */
function OrbitRing({ radius, speed, color, thickness }: { radius: number; speed: number; color: string; thickness: number }) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.z = state.clock.elapsedTime * speed
  })

  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, thickness, 16, 100]} />
      <meshStandardMaterial
        color={color}
        roughness={0.3}
        metalness={0.7}
        transparent
        opacity={0.5}
      />
    </mesh>
  )
}

/* ── Small floating particles ── */
function Particles() {
  const count = 40
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4
    }
    return pos
  }, [])

  const ref = useRef<THREE.Points>(null)

  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = state.clock.elapsedTime * 0.02
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#60A5FA" sizeAttenuation transparent opacity={0.6} />
    </points>
  )
}

/* ── Main scene wrapper ── */
export function Hero3D() {
  return (
    <div className="absolute inset-0 -z-10 opacity-80">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} color="#ffffff" />
        <directionalLight position={[-3, -3, 2]} intensity={0.4} color="#93C5FD" />
        <pointLight position={[0, 2, 3]} intensity={0.8} color="#2563EB" distance={10} />

        <PlayGem />
        <OrbitRing radius={2.2} speed={0.4} color="#3B82F6" thickness={0.02} />
        <OrbitRing radius={2.8} speed={-0.25} color="#60A5FA" thickness={0.015} />
        <Particles />
      </Canvas>
    </div>
  )
}
