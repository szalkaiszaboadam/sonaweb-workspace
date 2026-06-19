'use client'

import { useRef, useEffect, useState, MouseEvent as ReactMouseEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useMotionValue,
  useSpring,
  useMotionTemplate,
  AnimatePresence,
} from 'motion/react'
import { ArrowRight, ArrowUpRight, Play, Compass, MonitorSmartphone, PenTool, TrendingUp, Video, Mail, Globe2 } from 'lucide-react'
import { caseStudies } from '@/lib/marketing'
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react'
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps"
import { Tooltip as ReactTooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'
import { ReactLenis } from 'lenis/react' // A smooth scroll motor

/* ─── Globális Változók & Segédek ─────────────────────────────────── */

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

const MARKERS = [
  { name: "Budapest, HU", coordinates: [19.0402, 47.4979] },
  { name: "Szeged, HU", coordinates: [20.1414, 46.2530] },
  { name: "Debrecen, HU", coordinates: [21.6273, 47.5316] },
  { name: "Győr, HU", coordinates: [17.6351, 47.6833] },
  { name: "Pécs, HU", coordinates: [18.2323, 46.0727] },
  { name: "Veszprém, HU", coordinates: [17.9115, 47.0933] },
  { name: "Kecskemét, HU", coordinates: [19.6913, 46.9062] },
  { name: "London, UK", coordinates: [-0.1278, 51.5074] },
  { name: "Berlin, DE", coordinates: [13.4050, 52.5200] },
  { name: "Dubai, UAE", coordinates: [55.2708, 25.2048] },
  { name: "New York, USA", coordinates: [-74.0060, 40.7128] },
  { name: "Los Angeles, USA", coordinates: [-118.2437, 34.0522] },
  { name: "Toronto, CAN", coordinates: [-79.3832, 43.6532] },
  { name: "Sydney, AUS", coordinates: [151.2093, -33.8688] },
  { name: "Paris, FR", coordinates: [2.3522, 48.8566] },
];

function useMousePosition() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])
  return pos
}

function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode, delay?: number, className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }} className={className}>
      {children}
    </motion.div>
  )
}

/* ÚJ: Szöveg-maszkolás animáció (Text Split Masking) */
function MaskText({ text, className = '' }: { text: string, className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div initial={{ y: '100%' }} animate={inView ? { y: 0 } : {}} transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}>
        {text}
      </motion.div>
    </div>
  )
}

function MagneticButton({ children, className = '', href, onClick }: { children: React.ReactNode, className?: string, href?: string, onClick?: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 150, damping: 15 })
  const sy = useSpring(y, { stiffness: 150, damping: 15 })

  const handle = (e: ReactMouseEvent) => {
    const rect = ref.current!.getBoundingClientRect()
    x.set((e.clientX - (rect.left + rect.width / 2)) * 0.3)
    y.set((e.clientY - (rect.top + rect.height / 2)) * 0.3)
  }
  const reset = () => { x.set(0); y.set(0) }

  const inner = (
    <motion.div ref={ref} style={{ x: sx, y: sy }} onMouseMove={handle} onMouseLeave={reset} whileTap={{ scale: 0.95 }} className={className}>
      {children}
    </motion.div>
  )
  if (href) return <Link href={href}>{inner}</Link>
  return <button onClick={onClick} className="block w-full sm:w-auto">{inner}</button>
}

/* ─── Komplex Interaktív Komponensek ─────────────────────────────── */

/* ÚJ: Brutalista Preloader */
function Preloader({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    let current = 0
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 15) + 1
      if (current >= 100) {
        current = 100
        clearInterval(interval)
        setTimeout(onComplete, 400) // Várakozás a 100% után
      }
      setCount(current)
    }, 80)
    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <motion.div 
      initial={{ y: 0 }} 
      exit={{ y: "-100%" }} 
      transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }} 
      className="fixed inset-0 z-[99999] bg-[#be2133] flex flex-col items-center justify-center text-[#f5f1ef] overflow-hidden"
    >
      <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay" style={{ backgroundImage: GRAIN_SVG }} />
      <div className="overflow-hidden">
        <motion.span 
          initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-[clamp(6rem,20vw,15rem)] font-black tracking-tighter tabular-nums leading-none"
        >
          {count}%
        </motion.span>
      </div>
    </motion.div>
  )
}

function CustomCursor() {
  const { x, y } = useMousePosition()
  const cx = useSpring(x, { stiffness: 100, damping: 20 })
  const cy = useSpring(y, { stiffness: 100, damping: 20 })

  return (
    <>
      <motion.div className="fixed top-0 left-0 w-12 h-12 rounded-full border border-[#be2133]/60 pointer-events-none z-[9999] hidden md:flex items-center justify-center backdrop-blur-[2px]" style={{ x: cx, y: cy, translateX: '-50%', translateY: '-50%' }} />
      <motion.div className="fixed top-0 left-0 w-2 h-2 bg-[#be2133] rounded-full pointer-events-none z-[9999] hidden md:block" style={{ x, y, translateX: '-50%', translateY: '-50%' }} />
    </>
  )
}

function ScrollRevealText({ text }: { text: string }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 50%'] })
  const words = text.split(' ')
  
  return (
    <p ref={ref} className="text-[clamp(1.8rem,4vw,3.5rem)] font-bold leading-[1.2] tracking-tight text-white flex flex-wrap justify-center gap-x-3 gap-y-1">
      {words.map((word, i) => {
        const start = i / words.length
        const end = start + (1 / words.length)
        const opacity = useTransform(scrollYProgress, [start, end], [0.15, 1])
        const isHighlight = word.includes('NOT') || word.includes('OUTCOMES') || word.includes('PARTNER')
        const color = isHighlight ? '#be2133' : '#ffffff'
        return <motion.span key={i} style={{ opacity, color }}>{word}</motion.span>
      })}
    </p>
  )
}

function SpotlightCard({ children }: { children: React.ReactNode }) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove({ currentTarget, clientX, clientY }: ReactMouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#050505] transition-colors hover:border-white/20 h-full" onMouseMove={handleMouseMove}>
      <motion.div className="pointer-events-none absolute -inset-px rounded-[2rem] opacity-0 transition duration-300 group-hover:opacity-100"
        style={{ background: useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(190, 33, 51, 0.15), transparent 80%)` }}
      />
      <div className="relative z-10 h-full p-8 md:p-10">{children}</div>
    </div>
  )
}

/* ÚJ: Hover Portfolio (Kurzorkövető Média Reveal) */
function HoverPortfolio() {
  const [activeProject, setActiveProject] = useState<number | null>(null);
  const mouseX = useSpring(useMotionValue(0), { stiffness: 100, damping: 20 });
  const mouseY = useSpring(useMotionValue(0), { stiffness: 100, damping: 20 });

  const handleMouseMove = (e: ReactMouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  const displayCases = caseStudies.slice(0, 4);

  return (
    <section id="work" className="py-32 px-6 bg-[#0a0a0a] relative" onMouseMove={handleMouseMove}>
      <div className="mx-auto max-w-7xl">
        <FadeUp className="mb-20 flex flex-col md:flex-row justify-between md:items-end gap-8 border-b border-white/10 pb-10">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 bg-[#be2133] rounded-full" />
              <span className="text-xs uppercase tracking-[0.3em] text-white/60 font-bold">Selected Works</span>
            </div>
            <MaskText text="Proof of Concept." className="text-4xl md:text-6xl font-black tracking-tighter" />
          </div>
          <Link href="/references" className="group flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white hover:text-[#be2133] transition-colors bg-white/5 px-6 py-3 rounded-full border border-white/10 hover:border-[#be2133]/50">
            View Archive
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </FadeUp>

        {/* Masszív tipográfiai lista */}
        <div className="relative z-20 flex flex-col w-full border-t border-white/10">
          {displayCases.map((cs, i) => (
            <Link 
              key={cs.slug} href={`/references/${cs.category}/${cs.slug}`}
              className="group flex flex-col md:flex-row md:items-center justify-between py-10 md:py-16 border-b border-white/10 relative transition-colors hover:bg-white/5 px-4 md:px-8"
              onMouseEnter={() => setActiveProject(i)}
              onMouseLeave={() => setActiveProject(null)}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-12 pointer-events-none">
                <span className="text-white/20 font-mono text-xl md:text-2xl font-bold group-hover:text-[#be2133] transition-colors">0{i+1}</span>
                <h3 className="text-4xl md:text-7xl font-black tracking-tighter text-white/60 group-hover:text-white transition-colors uppercase leading-none">
                  {cs.client}
                </h3>
              </div>
              <div className="mt-6 md:mt-0 flex items-center gap-6 pointer-events-none">
                <span className="text-sm uppercase tracking-[0.2em] font-bold text-white/40 group-hover:text-white transition-colors">{cs.industry}</span>
                <ArrowUpRight className="h-8 w-8 text-white/20 group-hover:text-[#be2133] transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Lebegő, kurzorkövető kép */}
      <AnimatePresence>
        {activeProject !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 w-[400px] h-[500px] pointer-events-none z-30 hidden md:block overflow-hidden rounded-[2rem] shadow-2xl"
            style={{ 
              x: mouseX, 
              y: mouseY, 
              translateX: '-50%', 
              translateY: '-50%' 
            }}
          >
            <div className="relative w-full h-full bg-[#050505]">
              <Image 
                src={displayCases[activeProject].image || '/placeholder.svg'} 
                alt={displayCases[activeProject].client} 
                fill 
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[#be2133]/10 mix-blend-overlay" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

function ClientMapSection() {
  const [tooltipContent, setTooltipContent] = useState("");
  const uniqueCountries = new Set(MARKERS.map(m => m.name.split(', ')[1])).size;

  return (
    <section className="py-24 px-6 bg-[#0a0a0a] border-t border-white/10 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none" style={{ backgroundImage: GRAIN_SVG }} />
      <div className="mx-auto max-w-7xl relative z-10">
        <FadeUp className="mb-16 flex flex-col md:flex-row justify-between md:items-end gap-8 border-b border-white/10 pb-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <Globe2 className="w-5 h-5 text-[#be2133]" />
              <span className="text-xs uppercase tracking-[0.3em] text-white/60 font-bold">Global Reach</span>
            </div>
            <MaskText text="Ambition has no borders." className="text-4xl md:text-6xl font-black tracking-tighter text-balance" />
          </div>
          <div className="bg-[#050505] border border-white/10 rounded-full px-8 py-5 flex items-center gap-6 shadow-2xl">
            <span className="text-6xl font-black text-[#be2133] tabular-nums">{MARKERS.length}</span>
            <p className="text-white/80 text-sm font-medium leading-tight max-w-[120px]">Sikeres projekt {uniqueCountries} országban</p>
          </div>
        </FadeUp>

        <FadeUp delay={0.2} className="relative w-full bg-[#050505] rounded-[2.5rem] border border-white/10 p-4 md:p-10 shadow-inner overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,#050505_100%)] z-10 pointer-events-none" />
          <ComposableMap projection="geoMercator" projectionConfig={{ scale: 130, center: [0, 45] }} width={800} height={400} className="w-full h-auto max-h-[60vh] outline-none">
            <Geographies geography={geoUrl}>
              {({ geographies }) => geographies.map((geo) => (
                <Geography key={geo.rsmKey} geography={geo}
                  style={{
                    default: { fill: "#1a1a1a", stroke: "#2e2e2e", strokeWidth: 0.5, outline: "none" },
                    hover: { fill: "#262626", stroke: "#404040", strokeWidth: 0.5, outline: "none" },
                    pressed: { fill: "#121212", outline: "none" },
                  }}
                />
              ))}
            </Geographies>
            {MARKERS.map(({ name, coordinates }) => (
              <Marker key={name} coordinates={coordinates as [number, number]} onMouseEnter={() => setTooltipContent(name)} onMouseLeave={() => setTooltipContent("")} className="cursor-pointer">
                <circle r={5} fill="#be2133" className="animate-ping opacity-60" />
                <circle r={2.5} fill="#ff3b4e" stroke="#050505" strokeWidth={1} />
              </Marker>
            ))}
          </ComposableMap>
          <ReactTooltip float className="!bg-black/90 !backdrop-blur-md !border !border-white/10 !rounded-full !px-4 !py-2 !text-xs !font-bold !shadow-2xl z-50">
            {tooltipContent}
          </ReactTooltip>
        </FadeUp>
      </div>
    </section>
  );
}

/* ─── Adatok ──────────────────────────────────────────────────────── */

const SERVICES = [
  { id: '01', title: 'Digital Strategy', icon: Compass, desc: 'Data-driven roadmaps that align your brand vision with measurable business growth and positioning.' },
  { id: '02', title: 'Web Development', icon: MonitorSmartphone, desc: 'High-performance, headless architectures and immersive frontend experiences built with React and Next.js.' },
  { id: '03', title: 'Creative Direction', icon: PenTool, desc: 'Uncompromising visual identities, typography, and UI/UX design that separate you from the noise.' },
  { id: '04', title: 'Performance Ads', icon: TrendingUp, desc: 'Aggressive, ROI-focused media buying. We optimize strictly for conversions, not vanity metrics.' },
  { id: '05', title: 'Content Production', icon: Video, desc: 'Premium short-form video, copywriting, and asset creation that demands attention and builds authority.' },
  { id: '06', title: 'Retention / CRM', icon: Mail, desc: 'Automated email flows and lifecycle marketing campaigns designed to maximize Customer Lifetime Value.' },
]

/* ═══════════════════════════════════════════════════════════════════ */
/* FŐOLDAL KOMPONENS (Curtain Wrapperrel)                             */
/* ═══════════════════════════════════════════════════════════════════ */

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);

  const heroRef = useRef(null)
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(heroScroll, [0, 1], ['0%', '50%'])
  const heroOpacity = useTransform(heroScroll, [0, 0.7], [1, 0])

  return (
    <ReactLenis root options={{ lerp: 0.05, smoothWheel: true }}>
      <AnimatePresence mode="wait">
        {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      <div className={`bg-[#050505] text-[#f5f1ef] selection:bg-[#be2133] selection:text-white font-sans min-h-screen relative ${isLoading ? 'h-screen overflow-hidden' : ''} md:cursor-none`}>
        <CustomCursor />

        {/* ── FŐ TARTALOM (Relatív Z-index, hogy felül lehessen a láthatatlan footer felett) ── */}
        <main className="relative z-10 bg-[#050505] mb-[100vh] shadow-[0_20px_100px_rgba(0,0,0,0.8)] rounded-b-[2rem] md:rounded-b-[4rem]">
          
          {/* 1. HERO SZEKCIÓ */}
          <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
            <div className="absolute inset-0 pointer-events-none z-0">
              <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/40 via-transparent to-[#050505] z-10" />
              <div className="absolute inset-0 opacity-70 mix-blend-screen">
                <ShaderGradientCanvas style={{ position: 'absolute', inset: 0 }} pixelDensity={1} fov={45}>
                  <ShaderGradient
                    control="props" animate="on"
                    // @ts-ignore
                    axesHelper="off" bgColor1="#000000" bgColor2="#000000" brightness={1.2}
                    cAzimuthAngle={180} cDistance={3.59} cPolarAngle={90} cameraZoom={1}
                    color1="#be2133" color2="#000000" color3="#be2133" destination="onCanvas"
                    embedMode="off" envPreset="city" format="gif" frameRate={10} gizmoHelper="hide"
                    grain="off" lightType="3d" positionX={-1.4} positionY={0} positionZ={0}
                    range="disabled" rangeEnd={40} rangeStart={0} reflection={0.1}
                    rotationX={0} rotationY={10} rotationZ={50} shader="defaults"
                    type="plane" uAmplitude={1} uDensity={1.3} uFrequency={5.5} uSpeed={0.4} uStrength={4} uTime={0} wireframe={false}
                  />
                </ShaderGradientCanvas>
              </div>
            </div>
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize: '120px 120px' }} />

            <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-20 w-full max-w-7xl px-6 text-center flex flex-col items-center">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }} className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-md px-5 py-2 mb-10 shadow-xl">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#be2133] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#be2133]"></span>
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-white font-medium">Accepting New Clients</span>
              </motion.div>

              <div className="mb-8 overflow-hidden">
                <motion.h1 initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ duration: 1, ease: [0.33, 1, 0.68, 1], delay: 0.6 }} className="text-[clamp(3rem,9vw,8.5rem)] font-black leading-[0.85] tracking-tighter uppercase text-balance drop-shadow-2xl">
                  <span className="block text-white">Engineering</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#be2133] via-[#ff3b4e] to-[#be2133]">Dominance</span>
                </motion.h1>
              </div>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1 }} className="mx-auto max-w-2xl text-lg md:text-xl text-white/70 font-medium mb-12 text-balance">
                We don't build standard websites. We architect premium digital ecosystems that turn attention into revenue and scale visionary brands.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.2 }} className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                <MagneticButton href="/book" className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-full bg-[#be2133] px-8 py-4 font-bold text-white transition-all hover:scale-105 hover:shadow-[0_0_30px_-5px_#be2133]">
                  <span className="relative z-10">Initiate Project</span>
                  <ArrowRight className="relative z-10 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </MagneticButton>
                <MagneticButton href="#work" className="group flex items-center justify-center gap-3 rounded-full border border-white/20 bg-[#050505]/50 backdrop-blur-md px-8 py-4 font-bold text-white transition-all hover:bg-white/10">
                  <Play className="h-4 w-4 text-[#be2133] group-hover:scale-110 transition-transform" />
                  View Showreel
                </MagneticButton>
              </motion.div>
            </motion.div>
          </section>

          {/* 2. DYNAMIC MARQUEE */}
          <div className="border-y border-white/10 bg-[#0a0a0a] py-8 overflow-hidden relative">
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10" />
            <motion.div className="flex whitespace-nowrap" animate={{ x: ['0%', '-50%'] }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}>
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center">
                  {['STRATEGY', 'DESIGN', 'ENGINEERING', 'GROWTH', 'CONTENT', 'CONVERSION'].map((item, j) => (
                    <div key={j} className="flex items-center gap-12 px-12">
                      <span className="text-2xl md:text-3xl font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors duration-300">{item}</span>
                      <span className="text-[#be2133]">✦</span>
                    </div>
                  ))}
                </div>
              ))}
            </motion.div>
          </div>

          {/* 3. SCROLL REVEAL STATEMENT */}
          <section className="py-32 md:py-48 px-6 text-center">
            <div className="mx-auto max-w-5xl">
              <ScrollRevealText text="WE ARE NOT JUST ANOTHER AGENCY. WE ARE YOUR STRATEGIC PARTNER, OBSESSED WITH CRAFTING DIGITAL EXPERIENCES THAT DRIVE TANGIBLE OUTCOMES AND UNFAIR ADVANTAGES." />
            </div>
          </section>

          {/* 4. ARSENAL (SPOTLIGHT CARDS) */}
          <section className="py-24 px-6 relative z-10 border-t border-white/10">
            <div className="mx-auto max-w-7xl">
              <FadeUp className="mb-20 flex flex-col md:flex-row justify-between md:items-end gap-8 border-b border-white/10 pb-10">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-2 bg-[#be2133] rounded-full" />
                    <span className="text-xs uppercase tracking-[0.3em] text-white/60 font-bold">Our Arsenal</span>
                  </div>
                  <MaskText text="Everything you need." className="text-4xl md:text-6xl font-black tracking-tighter" />
                  <MaskText text="Nothing you don't." className="text-4xl md:text-6xl font-black tracking-tighter text-white/60" />
                </div>
                <p className="text-white/60 max-w-sm text-lg md:text-right text-balance">We operate at the intersection of stunning aesthetics and ruthless performance.</p>
              </FadeUp>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {SERVICES.map((srv, i) => {
                  const Icon = srv.icon
                  return (
                    <FadeUp key={srv.id} delay={i * 0.1} className="h-full">
                      <SpotlightCard>
                        <div className="flex flex-col h-full justify-between gap-12">
                          <div className="flex items-start justify-between">
                            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#be2133]/20 group-hover:border-[#be2133]/40 transition-all duration-500">
                              <Icon className="w-6 h-6 text-white/60 group-hover:text-[#be2133] transition-colors" />
                            </div>
                            <span className="text-2xl font-mono text-white/10 group-hover:text-[#be2133]/40 transition-colors">{srv.id}</span>
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-[#be2133] transition-colors">{srv.title}</h3>
                            <p className="text-white/60 text-sm leading-relaxed">{srv.desc}</p>
                          </div>
                        </div>
                      </SpotlightCard>
                    </FadeUp>
                  )
                })}
              </div>
            </div>
          </section>

          {/* 5. HOVER PORTFOLIO */}
          <HoverPortfolio />

          {/* 6. PROCESS (INTERACTIVE TIMELINE) */}
          <section className="py-32 px-6 relative">
            <div className="mx-auto max-w-7xl flex flex-col lg:flex-row gap-16 lg:gap-32">
              <div className="lg:w-1/3 lg:sticky lg:top-40 h-fit">
                <FadeUp>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-2 bg-[#be2133] rounded-full" />
                    <span className="text-xs uppercase tracking-[0.3em] text-white/60 font-bold">Methodology</span>
                  </div>
                  <MaskText text="How we operate." className="text-4xl md:text-6xl font-black tracking-tighter mb-6" />
                  <p className="text-white/60 text-lg">A battle-tested framework designed for speed, clarity, and uncompromising quality. No guesswork.</p>
                </FadeUp>
              </div>
              <div className="lg:w-2/3 relative">
                <div className="absolute left-[11px] top-0 bottom-0 w-[2px] bg-white/10" />
                <motion.div className="absolute left-[11px] top-0 w-[2px] bg-[#be2133] origin-top" initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: false, margin: "-20%" }} transition={{ duration: 1.5, ease: "easeInOut" }} style={{ bottom: 0 }} />
                <div className="space-y-20">
                  {[
                    { title: 'Discovery & Audit', desc: 'We dissect your brand, market, and competitors. We define the exact KPIs that will define success.' },
                    { title: 'Strategy & Architecture', desc: 'Wireframing, user journey mapping, and technical planning. The blueprint is forged before a single pixel is painted.' },
                    { title: 'Design & Engineering', desc: 'Execution. Pixel-perfect UI design meets robust, scalable Next.js code. The vision becomes reality.' },
                    { title: 'Launch & Scale', desc: 'Rigorous QA, deployment, and performance monitoring. Then, we ignite the growth marketing engine.' }
                  ].map((step, i) => (
                    <FadeUp key={i} className="relative pl-12 md:pl-20">
                      <motion.div className="absolute left-0 top-2 w-6 h-6 rounded-full bg-[#050505] border-[4px] border-white/20 z-10" whileInView={{ borderColor: '#be2133', backgroundColor: '#be2133' }} viewport={{ once: false, margin: "-40%" }} transition={{ duration: 0.3 }} />
                      <h4 className="text-3xl font-bold mb-4 text-white flex flex-col md:flex-row md:items-center gap-2 md:gap-6"><span className="text-[#be2133] font-mono text-xl opacity-80">0{i+1}</span>{step.title}</h4>
                      <p className="text-white/60 leading-relaxed text-lg max-w-xl">{step.desc}</p>
                    </FadeUp>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 7. GLOBAL MAP SZEKCIÓ */}
          <ClientMapSection />

        </main>

        {/* ── 8. "FÜGGÖNY" (CURTAIN) CTA FOOTER ── */}
        {/* Ez a rész fixed, azaz mindig a háttérben vár a képernyő alján. A "mb-[100vh]" a main-en biztosítja, hogy a görgetés végén "felgördüljön" a fekete tartalom, és előbukkanjon ez a piros szekció. */}
        <footer className="fixed bottom-0 left-0 right-0 w-full h-screen z-0 bg-[#be2133] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-15 mix-blend-overlay pointer-events-none" style={{ backgroundImage: GRAIN_SVG }} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-white/10 rounded-[100%] blur-[80px] pointer-events-none" />
          
          <div className="relative z-10 mx-auto max-w-4xl text-center px-6">
            <MaskText text="Stop" className="text-[clamp(4rem,12vw,11rem)] font-black tracking-tighter text-white leading-[0.85] uppercase inline-block mr-4 md:mr-8" />
            <MaskText text="Blending In." className="text-[clamp(4rem,12vw,11rem)] font-black tracking-tighter text-white leading-[0.85] uppercase inline-block mb-10" />
            
            <FadeUp delay={0.1}>
              <p className="text-xl md:text-3xl text-white/90 font-medium mb-12 max-w-3xl mx-auto text-balance">
                It's time to build a digital presence that commands authority. Let's discuss your next move.
              </p>
            </FadeUp>
            <FadeUp delay={0.2}>
              <MagneticButton href="/book" className="inline-flex items-center justify-center gap-3 rounded-full bg-[#050505] text-white px-12 py-6 text-lg md:text-xl font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
                Book a Call <ArrowRight className="h-6 w-6" />
              </MagneticButton>
            </FadeUp>
          </div>
        </footer>

      </div>
    </ReactLenis>
  )
}