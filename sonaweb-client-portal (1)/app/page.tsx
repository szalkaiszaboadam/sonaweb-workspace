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
  AnimatePresence,
} from 'motion/react'
import { ArrowRight, ArrowUpRight, Play, Plus, Minus, Quote } from 'lucide-react'
import { caseStudies, blogPosts } from '@/lib/marketing'
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react'
import { ReactLenis } from 'lenis/react'

/* ─── Globális Változók & Segédek ─────────────────────────────────── */

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`

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

/* ─── Szolgáltatások (Nagy tipográfia, mint a képen) ─────────────── */
const SERVICES_LIST = [
  { id: '01', title: 'Branding', href: '/services/branding' },
  { id: '02', title: 'UI/UX Design', href: '/services/design' },
  { id: '03', title: 'Strategy', href: '/services/strategy' },
  { id: '04', title: 'Web Development', href: '/services/development' },
  { id: '05', title: 'Performance Ads', href: '/services/ads' },
]

/* ─── FAQ Komponens ──────────────────────────────────────────────── */
const FAQS = [
  { q: "Mennyi idő alatt készül el egy projekt?", a: "A komplexitástól függően átlagosan 4-8 hét alatt szállítunk prémium minőséget. Az első egyeztetés során pontos ütemtervet adunk." },
  { q: "Milyen technológiákat használtok?", a: "Főként Next.js, React, Tailwind CSS és Framer Motion alkotja a frontend gerincét, így garantálva a villámgyors és biztonságos weboldalakat. Különös figyelmet fordítunk például az Agentic Commerce kompatibilitásra." },
  { q: "Vállaltok hosszútávú karbantartást is?", a: "Igen, hosszú távú partnerekben gondolkodunk. Dedikált karbantartási, optimalizálási és SEO csomagokat is kínálunk az átadás után." },
  { q: "Mitől prémium a szolgáltatásotok?", a: "Nem sablonokból dolgozunk. Minden pixel, minden animáció és minden sor kód egyedi, a maximális konverzióra és az exkluzív márkaélményre optimalizálva." },
]

function FAQItem({ item, isOpen, onClick }: { item: any, isOpen: boolean, onClick: () => void }) {
  return (
    <div className="border-b border-white/10">
      <button onClick={onClick} className="w-full py-8 flex items-center justify-between text-left group">
        <span className="text-2xl md:text-4xl font-bold tracking-tight text-white/80 group-hover:text-white transition-colors pr-8">
          {item.q}
        </span>
        <span className="text-[#be2133] shrink-0">
          {isOpen ? <Minus className="w-8 h-8" strokeWidth={1.5} /> : <Plus className="w-8 h-8" strokeWidth={1.5} />}
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }} 
            className="overflow-hidden"
          >
            <p className="pb-8 text-white/50 text-lg max-w-3xl leading-relaxed">
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Vélemények (Testimonials) ──────────────────────────────────── */
const TESTIMONIALS = [
  { name: "Kovács Péter", role: "CEO, TechNova", text: "A SONAWEB teljesen újraírta a digitális jelenlétünket. A konverziónk 140%-kal nőtt az új oldal indulása óta. Profi csapat, kompromisszummentes minőség." },
  { name: "Nagy Anna", role: "Marketing Igazgató", text: "Elképesztő figyelem a részletekre. Nemcsak lenyűgöző dizájnt kaptunk, hanem egy teljes, átgondolt üzleti stratégiát is. Minden várakozásunkat felülmúlták." },
  { name: "Szabó Dávid", role: "Alapító, E-com Plus", text: "A legjobb ügynökség, akivel valaha dolgoztunk. Gyorsak, precízek és pontosan értik, mi kell a mai prémium piacon a figyelem megragadásához." }
]

/* ─── Vízszintes görgetésű Portfólió ─────────────────────────────── */
function HorizontalScrollPortfolio() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: targetRef });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-70%"]); 
  const displayCases = caseStudies.slice(0, 4);

  return (
    <section ref={targetRef} className="relative h-[400vh] bg-[#0a0a0a] border-t border-white/10">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.div style={{ x }} className="flex gap-10 px-6 md:px-20 w-max">
          
          <div className="w-[85vw] md:w-[40vw] h-[60vh] md:h-[70vh] flex flex-col justify-center shrink-0 pr-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 bg-[#be2133] rounded-full" />
              <span className="text-xs uppercase tracking-[0.3em] text-white/60 font-bold">Selected Works</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-8">
              Proof of <br /> Concept.
            </h2>
            <p className="text-white/60 text-lg mb-10 max-w-sm">
              Swipe through our latest engineering and design feats. We don&apos;t just build, we dominate.
            </p>
            <Link href="/references" className="group flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white hover:text-[#be2133] transition-colors w-fit bg-white/5 px-6 py-4 rounded-full border border-white/10 hover:border-[#be2133]/50">
              View Archive
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {displayCases.map((cs) => (
            <Link key={cs.slug} href={`/references/${cs.category}/${cs.slug}`} className="group relative w-[85vw] md:w-[60vw] h-[60vh] md:h-[70vh] rounded-[2.5rem] overflow-hidden shrink-0 border border-white/10 block">
              <Image src={cs.image || '/placeholder.svg'} alt={cs.client} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent opacity-80" />
              <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10 md:right-10">
                <div className="bg-[#050505]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500 hover:bg-[#050505]/80">
                  <div>
                    <div className="flex gap-2 mb-3">
                      <span className="px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-bold bg-white text-black rounded-full">{cs.industry}</span>
                    </div>
                    <h3 className="text-2xl md:text-4xl font-bold tracking-tight text-white mb-2">{cs.client}</h3>
                    <p className="text-white/60 text-sm hidden md:block">{cs.resultSummary}</p>
                  </div>
                  <div className="w-14 h-14 shrink-0 rounded-full bg-[#be2133] flex items-center justify-center transform rotate-0 group-hover:rotate-45 transition-transform duration-500 shadow-lg">
                    <ArrowUpRight className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
          <div className="w-[10vw] shrink-0" />
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* FŐOLDAL KOMPONENS                                                  */
/* ═══════════════════════════════════════════════════════════════════ */

export default function HomePage() {
  const heroRef = useRef(null)
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(heroScroll, [0, 1], ['0%', '50%'])
  const heroOpacity = useTransform(heroScroll, [0, 0.7], [1, 0])

  const [openFaq, setOpenFaq] = useState<number | null>(0); // Az első nyitva van alapból

  const featuredPosts = blogPosts.slice(0, 3);

  return (
    <ReactLenis root options={{ lerp: 0.05, smoothWheel: true }}>
      <div className="bg-[#050505] text-[#f5f1ef] selection:bg-[#be2133] selection:text-white font-sans min-h-screen relative md:cursor-none">
        <CustomCursor />

        <main className="relative z-10 bg-[#050505] mb-[100vh] shadow-[0_20px_100px_rgba(0,0,0,0.8)] rounded-b-[2rem] md:rounded-b-[4rem]">
          
          {/* 1. HERO SZEKCIÓ (Fentebb tolva) */}
          <section ref={heroRef} className="relative min-h-[90vh] flex flex-col items-center justify-start pt-[25vh] overflow-hidden">
            <div className="absolute inset-0 pointer-events-none z-0">
              <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/40 via-transparent to-[#050505] z-10" />
              <div className="absolute inset-0 opacity-70 mix-blend-screen">
                <ShaderGradientCanvas style={{ position: 'absolute', inset: 0 }} pixelDensity={1} fov={45}>
                  <ShaderGradient
                    control="props" animate="on"
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

            <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-20 w-full max-w-7xl px-6 text-center flex flex-col items-center">
              <div className="mb-8 overflow-hidden">
                <motion.h1 initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ duration: 1, ease: [0.33, 1, 0.68, 1], delay: 0.1 }} className="text-[clamp(3.5rem,10vw,9.5rem)] font-black leading-[0.85] tracking-tighter uppercase text-balance drop-shadow-2xl">
                  <span className="block text-white">Engineering</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#be2133] via-[#ff3b4e] to-[#be2133]">Dominance</span>
                </motion.h1>
              </div>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5 }} className="mx-auto max-w-2xl text-lg md:text-xl text-white/70 font-medium mb-12 text-balance">
                We don&apos;t build standard websites. We architect premium digital ecosystems that turn attention into revenue and scale visionary brands.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.7 }} className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
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

          {/* 2. SCROLL REVEAL STATEMENT */}
          <section className="py-24 md:py-32 px-6 text-center">
            <div className="mx-auto max-w-5xl">
              <ScrollRevealText text="WE ARE NOT JUST ANOTHER AGENCY. WE ARE YOUR STRATEGIC PARTNER, OBSESSED WITH CRAFTING DIGITAL EXPERIENCES THAT DRIVE TANGIBLE OUTCOMES AND UNFAIR ADVANTAGES." />
            </div>
          </section>

          {/* 3. SERVICES (Nagy, minimalista lista a kép alapján) */}
          <section className="py-32 px-6 bg-[#050505] relative z-10">
            <div className="mx-auto max-w-7xl">
              <div className="flex flex-col border-t border-white/10">
                {SERVICES_LIST.map((srv, i) => (
                  <Link 
                    key={srv.id} 
                    href={srv.href} 
                    className="group flex items-center justify-between py-10 md:py-16 border-b border-white/10 hover:bg-white/5 transition-colors px-4 md:px-8"
                  >
                    <div className="flex items-center gap-10 md:gap-32">
                      <span className="text-sm md:text-base font-mono font-bold text-white/30 group-hover:text-[#be2133] transition-colors">
                        {srv.id}
                      </span>
                      <h3 className="text-[clamp(2.5rem,6vw,6rem)] font-bold tracking-tighter text-white/80 group-hover:text-white transition-colors leading-none">
                        {srv.title}
                      </h3>
                    </div>
                    <ArrowRight 
                      className="w-10 h-10 md:w-16 md:h-16 text-white/20 group-hover:text-white transition-all duration-300" 
                      strokeWidth={1} 
                    />
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* 4. VÍZSZINTES GÖRGETÉSŰ PORTFÓLIÓ */}
          <HorizontalScrollPortfolio />

          {/* 5. VÉLEMÉNYEK (Testimonials) */}
          <section className="py-32 px-6 bg-[#0a0a0a] border-t border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none" style={{ backgroundImage: GRAIN_SVG }} />
            <div className="mx-auto max-w-7xl relative z-10">
              <FadeUp className="mb-20 text-center">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="w-2 h-2 bg-[#be2133] rounded-full" />
                  <span className="text-xs uppercase tracking-[0.3em] text-white/60 font-bold">Client Impact</span>
                  <div className="w-2 h-2 bg-[#be2133] rounded-full" />
                </div>
                <MaskText text="What they say." className="text-4xl md:text-6xl font-black tracking-tighter" />
              </FadeUp>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {TESTIMONIALS.map((testimonial, i) => (
                  <FadeUp key={i} delay={i * 0.1}>
                    <div className="h-full flex flex-col justify-between rounded-[2rem] border border-white/10 bg-[#050505] p-10 hover:border-[#be2133]/30 transition-colors">
                      <Quote className="w-10 h-10 text-[#be2133]/20 mb-8" />
                      <p className="text-white/80 text-lg leading-relaxed mb-10 font-medium">"{testimonial.text}"</p>
                      <div className="border-t border-white/10 pt-6">
                        <p className="text-white font-bold">{testimonial.name}</p>
                        <p className="text-white/40 text-sm">{testimonial.role}</p>
                      </div>
                    </div>
                  </FadeUp>
                ))}
              </div>
            </div>
          </section>

          {/* 6. GYAKORI KÉRDÉSEK (FAQ) */}
          <section className="py-32 px-6 relative bg-[#050505] border-t border-white/10">
            <div className="mx-auto max-w-4xl">
              <FadeUp className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-2 bg-[#be2133] rounded-full" />
                  <span className="text-xs uppercase tracking-[0.3em] text-white/60 font-bold">FAQ</span>
                </div>
                <MaskText text="Answers you need." className="text-4xl md:text-6xl font-black tracking-tighter mb-6" />
              </FadeUp>

              <div className="border-t border-white/10">
                {FAQS.map((faq, i) => (
                  <FadeUp key={i} delay={i * 0.1}>
                    <FAQItem 
                      item={faq} 
                      isOpen={openFaq === i} 
                      onClick={() => setOpenFaq(openFaq === i ? null : i)} 
                    />
                  </FadeUp>
                ))}
              </div>
            </div>
          </section>

          {/* 7. BLOG / CIKKEK */}
          <section className="py-32 px-6 bg-[#0a0a0a] border-t border-white/10">
            <div className="mx-auto max-w-7xl">
              <FadeUp className="mb-16 flex flex-col md:flex-row justify-between md:items-end gap-8 border-b border-white/10 pb-10">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-2 bg-[#be2133] rounded-full" />
                    <span className="text-xs uppercase tracking-[0.3em] text-white/60 font-bold">Insights</span>
                  </div>
                  <MaskText text="Our Thinking." className="text-4xl md:text-6xl font-black tracking-tighter" />
                </div>
                <Link href="/blog" className="group flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white hover:text-[#be2133] transition-colors bg-white/5 px-6 py-3 rounded-full border border-white/10 hover:border-[#be2133]/50">
                  Read all articles
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </FadeUp>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredPosts.map((post, i) => (
                  <FadeUp key={post.slug} delay={i * 0.1}>
                    <Link href={`/blog/${post.slug}`} className="group block h-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#050505] hover:border-[#be2133]/30 transition-colors">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <Image src={post.cover || '/placeholder.svg'} alt={post.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100" />
                      </div>
                      <div className="p-8">
                        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#be2133] mb-4">{post.category}</p>
                        <h3 className="text-2xl font-bold tracking-tight text-white mb-4 group-hover:text-[#be2133] transition-colors">{post.title}</h3>
                        <p className="text-white/50 text-sm leading-relaxed line-clamp-2">{post.excerpt}</p>
                      </div>
                    </Link>
                  </FadeUp>
                ))}
              </div>
            </div>
          </section>

        </main>

        <div className="h-screen bg-transparent pointer-events-none" />

        {/* 8. CURTAIN CTA FOOTER */}
        <footer className="fixed bottom-0 left-0 right-0 w-full h-screen z-0 bg-[#be2133] flex flex-col justify-between overflow-hidden pt-32 pb-12 px-6 md:px-12">
          <div className="absolute inset-0 opacity-15 mix-blend-overlay pointer-events-none" style={{ backgroundImage: GRAIN_SVG }} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-white/10 rounded-[100%] blur-[80px] pointer-events-none" />
          
          <div className="relative z-10 mx-auto max-w-4xl text-center mt-auto">
            <div className="flex justify-center gap-x-4 gap-y-2 flex-wrap mb-6">
              <MaskText text="Stop" className="text-[clamp(3.5rem,10vw,8.5rem)] font-black tracking-tighter text-white uppercase leading-none" />
              <MaskText text="Blending In." className="text-[clamp(3.5rem,10vw,8.5rem)] font-black tracking-tighter text-white leading-none uppercase" />
            </div>
            
            <FadeUp delay={0.1}>
              <p className="text-lg md:text-2xl text-white/95 font-medium mb-12 max-w-2xl mx-auto text-balance">
                It&apos;s time to build a digital presence that commands authority. Let&apos;s discuss your next move.
              </p>
            </FadeUp>
            
            <FadeUp delay={0.2}>
              <MagneticButton href="/book" className="inline-flex items-center justify-center gap-3 rounded-full bg-[#050505] text-white px-10 py-5 text-base font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                Book a Call <ArrowRight className="h-5 w-5" />
              </MagneticButton>
            </FadeUp>
          </div>

          <div className="relative z-10 w-full max-w-7xl mx-auto mt-auto pt-12 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-bold tracking-wider uppercase text-white/90">
              <Link href="/services" className="hover:text-black transition-colors">Services</Link>
              <Link href="/references" className="hover:text-black transition-colors">Work</Link>
              <Link href="/about" className="hover:text-black transition-colors">Agency</Link>
              <Link href="/blog" className="hover:text-black transition-colors">Thinking</Link>
            </div>

            <div className="text-[clamp(2.5rem,6vw,5.5rem)] font-black tracking-tighter text-white/15 select-none uppercase leading-none md:absolute md:left-1/2 md:-translate-x-1/2 pointer-events-none">
              SONAWEB
            </div>

            <div className="text-xs font-medium tracking-wide text-white/70 font-mono">
              © {new Date().getFullYear()} SONAWEB. ALL RIGHTS RESERVED.
            </div>
          </div>
        </footer>

      </div>
    </ReactLenis>
  )
}