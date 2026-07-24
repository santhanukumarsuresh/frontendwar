import { Suspense, useRef } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, OrbitControls } from '@react-three/drei'
import type { Mesh } from 'three'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/showcase')({
  head: () => ({
    meta: [
      { title: '3D Showcase — Frontend Wars 2026' },
      {
        name: 'description',
        content: 'Procedural 3D rendered in-browser with Three.js and React Three Fiber.',
      },
    ],
  }),
  component: ShowcasePage,
})

function SpinningKnot() {
  const ref = useRef<Mesh>(null)
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * 0.25
      ref.current.rotation.y += delta * 0.4
    }
  })
  return (
    <Float speed={1.5} rotationIntensity={0.6} floatIntensity={1.2}>
      <mesh ref={ref} castShadow>
        <torusKnotGeometry args={[1, 0.32, 200, 32]} />
        <meshStandardMaterial color="#7c3aed" metalness={0.6} roughness={0.2} />
      </mesh>
    </Float>
  )
}

function ShowcasePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">3D Showcase</h1>
        <p className="text-muted-foreground">
          Three.js via React Three Fiber + drei — rendered entirely in the browser. Drag to orbit.
        </p>
      </div>

      <Card className="overflow-hidden p-0">
        <CardContent className="h-[28rem] p-0">
          <Canvas shadows camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]}>
            <color attach="background" args={['#0b0b12']} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1.4} castShadow />
            <pointLight position={[-5, -3, -4]} intensity={0.6} color="#38bdf8" />
            <Suspense fallback={null}>
              <SpinningKnot />
            </Suspense>
            <OrbitControls enablePan={false} minDistance={3} maxDistance={8} />
          </Canvas>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How this stays compliant</CardTitle>
          <CardDescription>
            All 3D assets are generated procedurally in-browser. No server, no external asset CDN
            required at runtime — meeting the &ldquo;100% client-side&rdquo; rule.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
