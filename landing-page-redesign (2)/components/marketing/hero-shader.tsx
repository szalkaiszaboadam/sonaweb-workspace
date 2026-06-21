'use client'

import { useEffect, useState } from 'react'
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react'

/**
 * Animated red/black ShaderGradient backdrop for the hero.
 *
 * Mounts on the client only (after first paint) so the heavy WebGL canvas
 * never blocks initial render or hydration. Falls back to a static gradient
 * before mount and on devices that prefer reduced motion.
 */
export function HeroShader() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }
    // Defer mounting one frame past hydration for smoother startup.
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      {/* Static fallback / base color (always present, sits behind canvas) */}
      <div className="absolute inset-0 bg-[#070707]" />

      {mounted && (
        <ShaderGradientCanvas
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          pixelDensity={1}
          fov={45}
        >
          <ShaderGradient
            animate="on"
            axesHelper="off"
            brightness={0.7}
            cAzimuthAngle={180}
            cDistance={3.6}
            cPolarAngle={90}
            cameraZoom={1}
            color1="#BE2132"
            color2="#020202"
            color3="#BE2132"
            destination="onCanvas"
            embedMode="off"
            envPreset="city"
            format="gif"
            fov={45}
            frameRate={10}
            gizmoHelper="hide"
            grain="off"
            lightType="3d"
            pixelDensity={1}
            positionX={-1.4}
            positionY={0}
            positionZ={0}
            range="disabled"
            rangeEnd={40}
            rangeStart={0}
            reflection={0.1}
            rotationX={0}
            rotationY={10}
            rotationZ={50}
            shader="defaults"
            type="plane"
            uAmplitude={1}
            uDensity={1.3}
            uFrequency={5.5}
            uSpeed={0.2}
            uStrength={4}
            uTime={0}
            wireframe={false}
          />
        </ShaderGradientCanvas>
      )}

      {/* Dark overlays for text legibility + smooth blend into the page */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#070707]/70 via-[#070707]/30 to-[#070707]/80" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#070707] to-transparent" />
    </div>
  )
}
