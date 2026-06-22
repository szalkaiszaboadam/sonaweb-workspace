'use client'

import {
  useRef,
  useEffect,
  useState,
  useCallback,
  createContext,
  useContext,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useInView,
  useMotionValue,
  useSpring,
  type MotionValue,
} from 'motion/react'
import {
  ArrowRight,
  ArrowUpRight,
  Plus,
  Minus,
  Globe,
  Video,
  Megaphone,
  LayoutGrid,
  Mail,
  Camera,
  Star,
  LogIn,
} from 'lucide-react'
import { caseStudies, blogPosts } from '@/lib/marketing'
import { HeroShader } from '@/components/marketing/hero-shader'
import { usePathname } from 'next/navigation'

/* ──────────────────────────────────────────────────────────────────────
   Layout system — one shared content width + horizontal rhythm everywhere
   ────────────────────────────────────────────────────────────────────── */
function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
      <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
    </svg>
  )
}


// Az új, kisebb padding értékekkel (px-5, sm:px-8, lg:px-10)
const CONTAINER = 'mx-auto w-full max-w-[1340px] px-5 sm:px-8 lg:px-10'

/* ──────────────────────────────────────────────────────────────────────
   Custom cursor — piros pötty mindenhol, kibővül a munkák fölött
   ────────────────────────────────────────────────────────────────────── */

type CursorState = {
  active: boolean
  label: string
}

type CursorContextValue = {
  setCursor: (state: CursorState) => void
  clearCursor: () => void
}

const CursorContext = createContext<CursorContextValue | null>(null)

function useCustomCursor() {
  const ctx = useContext(CursorContext)
  if (!ctx) {
    // Ha nincs Provider (pl. egy másik fában), legyen no-op, hogy ne dőljön el semmi
    return { setCursor: () => {}, clearCursor: () => {} }
  }
  return ctx
}

function CustomCursorProvider({ children }: { children: ReactNode }) {
  const mouseX = useMotionValue(-100)
  const mouseY = useMotionValue(-100)
  const smoothX = useSpring(mouseX, { damping: 28, stiffness: 380, mass: 0.4 })
  const smoothY = useSpring(mouseY, { damping: 28, stiffness: 380, mass: 0.4 })

  const [active, setActive] = useState(false)
  const [label, setLabel] = useState('')
  const [visible, setVisible] = useState(false)

  const setCursor = useCallback((state: CursorState) => {
    setActive(state.active)
    setLabel(state.label)
  }, [])

  const clearCursor = useCallback(() => {
    setActive(false)
    setLabel('')
  }, [])

  useEffect(() => {
    const move = (e: globalThis.MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
      if (!visible) setVisible(true)
    }
    const hide = () => setVisible(false)

    window.addEventListener('mousemove', move)
    window.addEventListener('mouseleave', hide)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseleave', hide)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible])

  return (
    <CursorContext.Provider value={{ setCursor, clearCursor }}>
      {children}

      {/* A kis piros pötty, ami mindig a kurzort követi — az eredeti kurzor mellett, nem helyette */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[200] hidden md:block"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: active ? '-50%' : '0%',
          translateY: active ? '-50%' : '0%',
          opacity: visible ? 1 : 0,
        }}
        transition={{ opacity: { duration: 0.25 } }}
      >
        <motion.div
          className="flex items-center justify-center overflow-hidden rounded-full bg-[#be2133] text-center text-sm font-bold uppercase leading-tight tracking-wider text-white"
          animate={{
            width: active ? 132 : 8,
            height: active ? 132 : 8,
            boxShadow: active
              ? '0 0 40px rgba(190,33,51,0.55)'
              : '0 0 0px rgba(190,33,51,0)',
          }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <AnimatePresence>
            {active && (
              <motion.span
                key={label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="px-3"
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </CursorContext.Provider>
  )
}

/* ──────────────────────────────────────────────────────────────────────
   Smooth scroll — lerp-alapú, finom egész oldalas görgetés
   ────────────────────────────────────────────────────────────────────── */

function SmoothScroll({ children }: { children: ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Respektáljuk, ha a felhasználó kevesebb mozgást kér
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (prefersReducedMotion) return

    const wrapper = wrapperRef.current
    const content = contentRef.current
    if (!wrapper || !content) return

    let current = window.scrollY
    let target = window.scrollY
    let rafId = 0
    const ease = 0.085 // kisebb = "lazább"/smoothabb scroll

    const setHeight = () => {
      document.body.style.height = `${content.getBoundingClientRect().height}px`
    }

    const onScroll = () => {
      target = window.scrollY
    }

    const render = () => {
      current += (target - current) * ease
      if (Math.abs(target - current) < 0.05) current = target

      content.style.transform = `translate3d(0, ${-current}px, 0)`
      rafId = requestAnimationFrame(render)
    }

    setHeight()
    wrapper.style.position = 'fixed'
    wrapper.style.top = '0'
    wrapper.style.left = '0'
    wrapper.style.width = '100%'
    wrapper.style.willChange = 'transform'

    window.addEventListener('scroll', onScroll)
    window.addEventListener('resize', setHeight)

    const resizeObserver = new ResizeObserver(setHeight)
    resizeObserver.observe(content)

    rafId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', setHeight)
      resizeObserver.disconnect()
      document.body.style.height = ''
    }
  }, [])

  return (
    <div ref={wrapperRef}>
      <div ref={contentRef}>{children}</div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────
   Motion helpers
   ────────────────────────────────────────────────────────────────────── */

const EASE = [0.16, 1, 0.3, 1] as const

function Reveal({
  children,
  delay = 0,
  y = 32,
  className = '',
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.8, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function MagneticButton({
  children,
  className = '',
  href,
  onClick,
  ariaLabel,
}: {
  children: ReactNode
  className?: string
  href?: string
  onClick?: () => void
  ariaLabel?: string
}) {
  // A kapott osztályokat kiegészítjük a sima színátmenettel
  const combinedClassName = `transition-colors duration-300 ${className}`

  if (href) {
    return (
      <Link href={href} aria-label={ariaLabel} className={combinedClassName}>
        {children}
      </Link>
    )
  }
  
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={combinedClassName}
    >
      {children}
    </button>
  )
}
function RevealWord({
  word,
  progress,
  range,
  highlight,
}: {
  word: string
  progress: MotionValue<number>
  range: [number, number]
  highlight: boolean
}) {
  const opacity = useTransform(progress, range, [0.12, 1])
  const color = useTransform(
    progress,
    range,
    highlight ? ['#5a5a5a', '#be2133'] : ['#5a5a5a', '#f5f1ef'],
  )
  return (
    <motion.span style={{ opacity, color }} className="mr-[0.28em] inline-block">
      {word}
    </motion.span>
  )
}

function Manifesto({ text }: { text: string }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.85', 'end 0.45'],
  })
  const words = text.split(' ')
  const highlights = ['outcomes', 'partner,', 'unfair', 'advantage.']
  return (
    <p
      ref={ref}
      className="flex flex-wrap text-[clamp(2rem,5vw,4.25rem)] font-bold leading-[1.1] tracking-tight"
    >
      {words.map((word, i) => {
        const start = i / words.length
        const end = start + 1 / words.length
        return (
          <RevealWord
            key={i}
            word={word}
            progress={scrollYProgress}
            range={[start, end]}
            highlight={highlights.includes(word.toLowerCase())}
          />
        )
      })}
    </p>
  )
}

/* ──────────────────────────────────────────────────────────────────────
   Local data
   ────────────────────────────────────────────────────────────────────── */


   const SERVICES = [
  {
    id: '01',
    title: 'Develop', // Rövidítve
    slug: 'website-development',
    label: 'PERFORMANCE',
    previewUrl: '/placeholder.svg',
  },
  {
    id: '02',
    title: 'Short Video', // Rövidítve
    slug: 'short-form-video',
    label: 'CONTENT',
    previewUrl: '/placeholder.svg',
  },
  {
    id: '03',
    title: 'Adver', // Rövidítve
    slug: 'facebook-ads',
    label: 'GROWTH',
    previewUrl: '/placeholder.svg',
  },
  {
    id: '04',
    title: 'Social', // Rövidítve
    slug: 'social-content-graphics',
    label: 'BRANDING',
    previewUrl: '/placeholder.svg',
  },
  {
    id: '05',
    title: 'Marketing', // Rövidítve
    slug: 'email-marketing',
    label: 'RETENTION',
    previewUrl: '/placeholder.svg',
  },
]


const TESTIMONIALS = [
  {
    quote: 'SONAWEB rebuilt our entire digital presence in six weeks. Conversions are up, the brand finally looks the part, and the process was effortless.',
    name: 'Elena Fischer',
    role: 'Founder, Aurélie Skincare',
    avatar: '/placeholder.svg'
  },
  {
    quote: 'The only team that actually understood both the design and the numbers. Our paid campaigns are profitable for the first time in two years.',
    name: 'Marcus Vogel',
    role: 'CEO, Northpeak Outdoors',
    avatar: '/placeholder.svg'
  },
  {
    quote: 'Working with them feels like having an in-house creative department — just faster, sharper and obsessed with results.',
    name: 'Priya Anand',
    role: 'CMO, Lumen Studio',
    avatar: '/placeholder.svg'
  },
  {
    quote: 'Every deliverable came back better than we imagined. They set a new standard for what we expect from an agency.',
    name: 'Tom Becker',
    role: 'Director, Halcyon Hotels',
    avatar: '/placeholder.svg'
  },
  {
    quote: 'Sharp strategy, flawless execution, zero drama. They feel less like a vendor and more like a co-founder of our growth.',
    name: 'Sofia Romano',
    role: 'Founder, Maison Vert',
    avatar: '/placeholder.svg'
  },
]

const FAQS = [
  {
    q: 'What kind of brands do you work with?',
    a: 'We partner with ambitious founders and growing companies that take their brand seriously — from funded startups to established businesses ready to scale. If you care about quality and measurable results, we are a fit.',
  },
  {
    q: 'How long does a typical project take?',
    a: 'Most websites launch within four to six weeks. Ongoing content, advertising and growth retainers begin delivering within the first two weeks. We move fast without ever compromising the craft.',
  },
  {
    q: 'Do you offer ongoing support after launch?',
    a: 'Always. Launch is the starting line, not the finish. We offer retainers covering optimisation, content, paid media and continuous improvement so your results compound month over month.',
  },
  {
    q: 'How much does it cost to work with you?',
    a: 'Every engagement is scoped to your goals, so pricing varies. Projects typically start in the mid four figures, with growth retainers structured monthly. Book a call and we will give you a transparent estimate.',
  },
  {
    q: 'What makes SONAWEB different?',
    a: 'We sit at the intersection of design and performance. You get agency-grade creative and rigorous, data-driven execution from one tight-knit team — no hand-offs, no fluff, no compromise.',
  },
]

/* ──────────────────────────────────────────────────────────────────────
   Navbar (transparent glass, overlaid on the hero shader)
   ────────────────────────────────────────────────────────────────────── */
function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsOpen(false)
    document.body.style.overflow = ''
  }, [pathname])

  const toggleMenu = () => {
    setIsOpen(!isOpen)
    document.body.style.overflow = !isOpen ? 'hidden' : ''
  }

  const customEase = [0.76, 0, 0.24, 1] as [number, number, number, number]
  const linkEase = [0.16, 1, 0.3, 1] as [number, number, number, number]

  const menuVariants = {
    closed: {
      x: '100%',
      transition: { duration: 0.8, ease: customEase }
    },
    opened: {
      x: '0%',
      transition: { duration: 0.8, ease: customEase }
    }
  }

  const linkVariants = {
    initial: { x: 80, opacity: 0 },
    animate: (i: number) => ({
      x: 0,
      opacity: 1,
      transition: { delay: 0.4 + i * 0.1, duration: 0.8, ease: linkEase }
    })
  }

  const navLinks = [
    { title: 'Work', href: '/references' },
    { title: 'Services', href: '/services' },
    { title: 'Journal', href: '/blog' },
    { title: 'About Us', href: '/about' },
    { title: 'Client Portal', href: '/client' },
  ]

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: linkEase }}
        // ÚJ: mix-blend-difference alkalmazása, amikor a menü be van zárva
        className={`fixed top-0 inset-x-0 z-[70] w-full bg-transparent transition-colors duration-300 ${
          !isOpen ? 'mix-blend-difference' : ''
        }`}
      >
        <div className={`${CONTAINER} flex items-center justify-between py-6`}>
          <Link href="/" aria-label="SONAWEB home" className="flex items-center">
            <img
              src="/sonaweb-logo-white.png"
              alt="SONAWEB"
              className="h-5 w-auto object-contain md:h-7"
            />
          </Link>

          <button
            onClick={toggleMenu}
            className="group flex h-10 w-10 flex-col items-center justify-center gap-1.5 focus:outline-none"
            aria-label="Toggle menu"
          >
            <motion.span
              animate={isOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
              className="h-0.5 w-7 bg-white transition-colors group-hover:bg-[#be2133]"
            />
            <motion.span
              animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
              className="h-0.5 w-7 bg-white transition-colors group-hover:bg-[#be2133]"
            />
            <motion.span
              animate={isOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
              className="h-0.5 w-7 bg-white transition-colors group-hover:bg-[#be2133]"
            />
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {isOpen && (
          <motion.nav
            variants={menuVariants}
            initial="closed"
            animate="opened"
            exit="closed"
            className="fixed inset-0 z-[60] flex flex-col bg-[#070707] pt-24 sm:pt-32"
          >
            <div className="absolute right-0 top-0 h-[600px] w-[600px] rounded-full bg-[#be2133]/5 blur-[120px]" />

            <div className={`${CONTAINER} flex flex-col justify-between pb-12 h-full relative z-10`}>
              <div className="flex flex-col gap-4 mt-12">
                {navLinks.map((link, i) => (
                  <Link key={link.title} href={link.href} className="group overflow-hidden py-1">
                    <motion.span
                      custom={i}
                      variants={linkVariants}
                      initial="initial"
                      animate="animate"
                      className="block text-[clamp(3rem,8vw,7rem)] font-black uppercase leading-none tracking-tighter text-white transition-colors group-hover:text-[#be2133]"
                    >
                      {link.title}
                    </motion.span>
                  </Link>
                ))}
              </div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex flex-col md:flex-row justify-between border-t border-white/10 pt-8 gap-6"
              >
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/30">Connect</p>
                  <a href="mailto:hello@sonaweb.com" className="text-lg text-white/70 hover:text-white transition-colors">hello@sonaweb.com</a>
                </div>
                <div className="flex gap-6">
                  <a href="#" className="text-white/40 hover:text-[#be2133] transition-colors font-bold uppercase text-xs tracking-widest">Instagram</a>
                  <a href="#" className="text-white/40 hover:text-[#be2133] transition-colors font-bold uppercase text-xs tracking-widest">LinkedIn</a>
                  <a href="#" className="text-white/40 hover:text-[#be2133] transition-colors font-bold uppercase text-xs tracking-widest">Twitter / X</a>
                </div>
              </motion.div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  )
}


/* ──────────────────────────────────────────────────────────────────────
   Footer (Ultra-minimalista, elválasztó vonal nélkül)
   ────────────────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="relative z-10 w-full">
      {/* Az elválasztó vonal (border-t) eltávolítva, a tartalom teljesen letisztult */}
      <div className={`${CONTAINER} flex flex-col items-center justify-between gap-6 pb-6 pt-6 text-[11px] font-bold uppercase tracking-[0.15em] text-white/80 sm:flex-row`}>
        
        {/* Bal oldal: Copyright és a közösségi ikonok egymás mellett, ahogy a mintaképen látható */}
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-6">
          <span className="tracking-[0.12em]">
            © {new Date().getFullYear()} SONAWEB. ALL RIGHTS RESERVED.
          </span>
          
          <div className="flex items-center gap-2.5">
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex h-7 w-7 items-center justify-center rounded-md border-[1.5px] border-white/60 transition-colors hover:bg-white hover:text-[#be2133]"
              aria-label="Instagram"
            >
              <InstagramIcon className="h-3.5 w-3.5" />
            </a>
            <a 
              href="https://x.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex h-7 w-7 items-center justify-center rounded-md border-[1.5px] border-white/60 transition-colors hover:bg-white hover:text-[#be2133]"
              aria-label="X (Twitter)"
            >
              <XIcon className="h-3 w-3" />
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex h-7 w-7 items-center justify-center rounded-md border-[1.5px] border-white/60 transition-colors hover:bg-white hover:text-[#be2133]"
              aria-label="LinkedIn"
            >
              <LinkedinIcon className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Jobb oldal: Jogi linkek egy vonalban */}
        <div className="flex items-center gap-6 tracking-[0.12em]">
          <Link href="/privacy" className="transition-colors hover:text-white opacity-80 hover:opacity-100">
            Privacy Policy
          </Link>
          <Link href="/terms" className="transition-colors hover:text-white opacity-80 hover:opacity-100">
            Terms of Service
          </Link>
        </div>

      </div>
    </footer>
  )
}

/* ──────────────────────────────────────────────────────────────────────
   Interactive Service List (Awwwards stílusú tipográfia hover effekttel)
   ────────────────────────────────────────────────────────────────────── */

function InteractiveServiceList() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div className="relative flex flex-col items-center justify-center w-full py-10">
      {SERVICES.map((srv, i) => {
        const isHovered = hoveredIndex === i
        const isAnyHovered = hoveredIndex !== null

        return (
          <div
            key={srv.id}
            // Még szorosabb térköz a sorok között (py-1 md:py-2)
            className="group relative flex w-full cursor-pointer items-center justify-center py-1 md:py-2"
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Lebegő kép */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, x: -40, rotate: -4 }}
                  animate={{ opacity: 1, x: 0, rotate: 0 }}
                  exit={{ opacity: 0, x: -40, rotate: -4 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="pointer-events-none absolute left-4 lg:left-8 z-20 hidden md:block h-[220px] w-[320px] overflow-hidden rounded-xl shadow-2xl"
                >
                  <Image
                    src={srv.previewUrl}
                    alt={srv.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* A hatalmas, tömör szöveg */}
            <Link href={`/services/${srv.slug}`} className="relative z-10 w-full text-center">
              <span
                // Nagyobb méret (11rem) és szorosabb sorköz/betűköz (leading-[0.85] tracking-[-0.04em])
                className={`inline-block font-black uppercase tracking-[-0.04em] transition-all duration-500 ease-out text-[clamp(3.5rem,10vw,11rem)] leading-[0.85] ${
                  !isAnyHovered
                    ? 'text-white' 
                    : isHovered
                    ? 'text-white' 
                    : 'text-white/15' 
                }`}
              >
                {srv.title}
              </span>
            </Link>

            {/* Kiegészítő címke a jobb szélen */}
            <AnimatePresence>
              {isHovered && (
                <motion.span
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="pointer-events-none absolute right-4 lg:right-8 z-20 hidden md:block text-sm font-mono font-bold uppercase tracking-[0.2em] text-white/50"
                >
                  {srv.label}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        )
      })}

      {/* ── All Services Gomb ── */}
      <Reveal delay={0.2} className="mt-20">
        <MagneticButton
          href="/services"
          className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-8 py-4 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/20"
        >
          All services
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </MagneticButton>
      </Reveal>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────
   Portfolio — premium featured + supporting layout
   ────────────────────────────────────────────────────────────────────── */

function FeaturedWork({ cs }: { cs: (typeof caseStudies)[number] }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const imgY = useTransform(scrollYProgress, [0, 1], ['-10%', '10%'])

  return (
    <Reveal>
      <Link
        ref={ref}
        href={`/references/${cs.category}/${cs.slug}`}
        className="group relative block overflow-hidden rounded-2xl bg-[#0c0c0c]"
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden md:aspect-[21/9]">
          <motion.div style={{ y: imgY }} className="absolute inset-[-10%]">
            <Image
              src={cs.image || '/placeholder.svg'}
              alt={cs.client}
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-70 transition-all duration-[900ms] ease-out group-hover:scale-[1.05] group-hover:opacity-95"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-[#070707]/40 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-6 p-6 md:flex-row md:items-end md:justify-between md:p-10">
            <div className="max-w-2xl">
              <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium uppercase tracking-[0.16em] text-white/55">
                <span>{cs.industry}</span>
                <span className="h-1 w-1 rounded-full bg-white/30" />
                <span>{cs.serviceType}</span>
              </div>
              <h3 className="text-balance text-4xl font-black tracking-tight text-white md:text-6xl">
                {cs.client}
              </h3>
              <p className="mt-4 max-w-xl text-pretty text-lg text-white/65">
                {cs.resultSummary}
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm font-semibold text-white">
              <span className="transition-transform duration-500 group-hover:-translate-x-1">
                View case study
              </span>
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-[#be2133] transition-transform duration-500 group-hover:rotate-45">
                <ArrowUpRight className="h-6 w-6 text-white" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </Reveal>
  )
}

function StackedWorkCard({
  cs,
  index,
}: {
  cs: (typeof caseStudies)[number]
  index: number
}) {
  const { setCursor, clearCursor } = useCustomCursor()

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: (index % 2) * 0.08 }}
      className="group flex w-full flex-col gap-5"
    >
      <Link
        href={`/references/${cs.category}/${cs.slug}`}
        className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-[#0c0c0c]"
        onMouseEnter={() => setCursor({ active: true, label: 'View' })}
        onMouseLeave={clearCursor}
      >
        <Image
          src={cs.image || '/placeholder.svg'}
          alt={cs.client}
          fill
          priority={index === 0}
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </Link>

      {/* A szöveges rész letisztultan, a kép alatt */}
      <div className="flex flex-col gap-2 px-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white/50">
          <span>{cs.industry}</span>
          <span className="h-1 w-1 rounded-full bg-white/20" />
          <span>{cs.serviceType || 'Web Development'}</span>
        </div>
        <h3 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
          <Link 
            href={`/references/${cs.category}/${cs.slug}`} 
            className="transition-colors hover:text-[#be2133]"
          >
            {cs.client}
          </Link>
        </h3>
      </div>
    </motion.div>
  )
}

/* ──────────────────────────────────────────────────────────────────────
   Testimonials — horizontal overflow carousel (auto + drag)
   ────────────────────────────────────────────────────────────────────── */

function TestimonialCarousel() {
  const trackRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const [active, setActive] = useState(0)
  const count = TESTIMONIALS.length

  const scrollTo = (i: number) => {
    const card = cardRefs.current[i]
    if (!card) return
    
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
  }

  const handleScroll = () => {
    const track = trackRef.current
    if (!track) return
    
    const trackRect = track.getBoundingClientRect()
    const paddingLeft = parseInt(window.getComputedStyle(track).paddingLeft) || 0
    const targetX = trackRect.left + paddingLeft

    let nearest = 0
    let min = Infinity

    cardRefs.current.forEach((card, i) => {
      if (!card) return
      const cardRect = card.getBoundingClientRect()
      const dist = Math.abs(cardRect.left - targetX)
      
      if (dist < min) {
        min = dist
        nearest = i
      }
    })
    setActive(nearest)
  }

  // Az automatikus időzítő (setInterval) teljes mértékben eltávolításra került a kód tisztasága és a manuális vezérlés érdekében

  return (
    <div className="relative w-full">
      {/* ── Fejléc és Lapozó ── */}
      <div className={`${CONTAINER} mb-16 flex flex-col items-start justify-between gap-10 md:flex-row md:items-end`}>
        <Reveal>
          <h2 className="text-balance text-5xl font-bold leading-[1.1] tracking-tight md:text-7xl">
            What our<br />clients say
          </h2>
        </Reveal>

        <Reveal delay={0.1} className="flex flex-col items-start md:items-end text-left md:text-right">
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-bold tracking-tight text-[#be2133] md:text-6xl">4.9</span>
            <span className="text-2xl font-medium text-[#be2133]/50">/5</span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/50">
            Honest feedback from teams we've partnered with across different industries.
          </p>
          
          <div className="mt-6 flex items-center gap-2">
            {TESTIMONIALS.map((t, i) => (
              <button
                key={t.name}
                type="button"
                onClick={() => {
                  setActive(i)
                  scrollTo(i)
                }}
                aria-label={`Show testimonial ${i + 1}`}
                className="group p-1"
              >
                <span
                  className={`block h-2 rounded-full transition-all duration-500 ${
                    active === i ? 'w-6 bg-[#be2133]' : 'w-2 bg-white/20 group-hover:bg-white/40'
                  }`}
                />
              </button>
            ))}
          </div>
        </Reveal>
      </div>

      {/* ── Kártyák sávja ── */}
      <div
        ref={trackRef}
        onScroll={handleScroll}
        // A pl és scroll-pl értékeket hozzáigazítottuk a CONTAINER új belső paddingjához
        className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-8 pl-5 sm:pl-8 lg:pl-[calc(max(0px,(100%-1340px)/2)+2.5rem)] scroll-pl-5 sm:scroll-pl-8 lg:scroll-pl-[calc(max(0px,(100%-1340px)/2)+2.5rem)]"
      >
        {TESTIMONIALS.map((t, i) => (
          <div
            key={t.name}
            ref={(el) => {
              cardRefs.current[i] = el
            }}
            className="w-[85vw] shrink-0 snap-start sm:w-[420px]"
          >
            <Reveal delay={i * 0.15} y={40}>
              <figure className="relative flex h-[460px] flex-col justify-between overflow-hidden rounded-xl bg-[#141414] p-8 transition-colors duration-500 hover:bg-[#1a1a1a] md:p-10">
                
                <div className="pointer-events-none absolute left-8 top-8 text-[10rem] font-serif leading-none text-white/[0.03] select-none md:left-10 md:top-8">
                  “
                </div>

                <blockquote className="relative z-10 mt-12 flex-1 text-lg font-medium leading-relaxed text-white/90 md:mt-16">
                  {t.quote}
                </blockquote>

                <figcaption className="relative z-10 mt-8 flex items-center gap-4 border-t border-white/5 pt-6">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#1e1e1e]">
                    <Image 
                      src={t.avatar} 
                      alt={t.name} 
                      width={48} 
                      height={48} 
                      className="h-full w-full object-cover opacity-80" 
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-white">{t.name}</div>
                    <div className="text-sm text-white/50">{t.role}</div>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          </div>
        ))}

        <div className="w-[100vw] shrink-0 pointer-events-none" aria-hidden="true" />
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────
   FAQ item — borderless filled cards, spacing-based separation
   ────────────────────────────────────────────────────────────────────── */

function FaqItem({
  faq,
  isOpen,
  onToggle,
  index,
}: {
  faq: { q: string; a: string }
  isOpen: boolean
  onToggle: () => void
  index: number
}) {
  return (
    <Reveal delay={index * 0.05}>
      <div
        className={`overflow-hidden rounded-xl transition-colors duration-300 ${isOpen ? 'bg-[#141414]' : 'bg-[#0f0f0f] hover:bg-[#141414]'
          }`}
      >
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          className="group flex w-full items-center justify-between gap-6 px-6 py-6 text-left md:px-8"
        >
          <span
            className={`text-lg font-semibold tracking-tight transition-colors md:text-xl ${isOpen ? 'text-[#be2133]' : 'text-white'
              }`}
          >
            {faq.q}
          </span>
          <span
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-colors ${isOpen ? 'bg-[#be2133] text-white' : 'bg-white/[0.06] text-white/60'
              }`}
          >
            {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </span>
        </button>
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="overflow-hidden"
            >
              <p className="max-w-2xl px-6 pb-7 text-pretty leading-relaxed text-white/55 md:px-8">
                {faq.a}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Reveal>
  )
}

/* ──────────────────────────────────────────────────────────────────────
   Page
   ────────────────────────────────────────────────────────────────────── */

export default function HomePage() {
  const featuredCase = caseStudies[0]
  const supportingCases = caseStudies.slice(1, 4)
  const latestPosts = blogPosts.slice(0, 3)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  // Erre a referenciára lesz szükségünk, hogy a képeket ne lehessen kihúzni a képernyőről
  const heroRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroY = useTransform(heroScroll, [0, 1], ['0%', '24%'])
  const heroOpacity = useTransform(heroScroll, [0, 0.8], [1, 0])

  // A dobálható kártyák pozíciói és méretei
// A dobálható kártyák pozíciói és méretei (Navbar vonala alatt kezdődnek, 6 db kép)
// A dobálható kártyák pozíciói és méretei (Navbar vonala alatt, letisztultabb elrendezésben, 4 db kép)
// A dobálható kártyák pozíciói és méretei (Navbar vonala alatt, 4 db kép, 16:10 / 16:9 böngészőablak arányban)
  const draggableCards = [
    { id: 1, src: '/marketing/gaz.png', top: '24%', left: '4%', rotate: -12, w: 'w-56 md:w-80', h: 'h-36 md:h-48' },
    { id: 2, src: '/marketing/bori.png', top: '28%', right: '5%', rotate: 8, w: 'w-64 md:w-96', h: 'h-40 md:h-60' },
    { id: 3, src: caseStudies[2]?.image || '/placeholder.svg', bottom: '15%', left: '8%', rotate: -6, w: 'w-60 md:w-80', h: 'h-40 md:h-52' },
    { id: 4, src: caseStudies[3]?.image || '/placeholder.svg', bottom: '10%', right: '8%', rotate: 14, w: 'w-64 md:w-80', h: 'h-40 md:h-48' },
  ]

  return (
    <CustomCursorProvider>
      <Navbar />
      <SmoothScroll>
        <div className="min-h-screen overflow-x-hidden bg-[#070707] font-sans text-[#f5f1ef] selection:bg-[#be2133] selection:text-white">
          
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden pb-28 pt-32"
      >
        <HeroShader />

        {/* Draggable Képek Rétege */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none hidden md:block">
          {draggableCards.map((card, i) => (
            <motion.div
              key={card.id}
              drag
              dragConstraints={heroRef}
              dragElastic={0.2}
              whileDrag={{ scale: 1.05, zIndex: 50, cursor: 'grabbing' }}
              initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
              animate={{ opacity: 1, scale: 1, rotate: card.rotate }}
              transition={{ 
                duration: 0.8, 
                delay: 0.2 + i * 0.1, 
                ease: [0.16, 1, 0.3, 1] 
              }}
              className={`absolute ${card.w} ${card.h} group overflow-hidden rounded-2xl shadow-2xl cursor-grab pointer-events-auto bg-[#0c0c0c] border border-white/10`}
              style={{
                top: card.top,
                bottom: card.bottom,
                left: card.left,
                right: card.right,
              }}
            >
              {/* Alapértelmezett sötétítő réteg, ami interakcióra eltűnik */}
              <motion.div
                className="absolute inset-0 z-10 bg-black/50 transition-opacity duration-300 pointer-events-none group-hover:opacity-0 group-active:opacity-0"
              />
              <Image
                src={card.src}
                alt="Work preview"
                fill
                priority
                draggable={false} // <-- EZ TILTJA LE A BÖNGÉSZŐ ALAPÉRTELMEZETT HÚZÁSÁT
                className="object-cover pointer-events-none select-none" // <-- EZ PEDI GONDOSKODIK RÓLA, HOGY NE LEHESSEN KIJELÖLNI
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </motion.div>
          ))}
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className={`${CONTAINER} relative z-10 flex flex-col items-center text-center pointer-events-none`}
        >
          {/* Teljesen fehér, masszív tipográfia */}
          {/* Teljesen fehér, masszív tipográfia - átengedve a kattintásokat */}
          <h1 className="flex flex-col items-center justify-center text-center font-black uppercase leading-[0.82] tracking-[-0.03em] text-[clamp(4rem,13vw,12rem)] pointer-events-none select-none drop-shadow-2xl">
            <motion.span
              initial={{ opacity: 0, y: '60%' }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
              className="block text-white"
            >
              We Think
            </motion.span>
            
            <motion.span
              initial={{ opacity: 0, y: '60%' }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.18, ease: EASE }}
              className="block text-white"
            >
              Craft And
            </motion.span>
            
            <motion.span
              initial={{ opacity: 0, y: '60%' }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.26, ease: EASE }}
              className="block text-white"
            >
              Design
            </motion.span>
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
            // Megnövelt térköz fentre (mt-20)
            className="mt-20 flex flex-col items-center gap-3 sm:flex-row pointer-events-auto"
          >
            <MagneticButton
              href="/book"
              className="group flex items-center gap-2.5 rounded-lg bg-[#be2133] px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-[#a61c2c]"
            >
              Initiate project
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </MagneticButton>
            <MagneticButton
              href="/blog"
              className="flex items-center gap-2.5 rounded-lg bg-white/[0.06] px-7 py-3.5 text-base font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/15"
            >
              View our work
            </MagneticButton>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Manifesto ────────────────────────────────────────── */}
      <section className="py-32 md:py-44">
        <div className={CONTAINER}>
          <div className="mx-auto max-w-5xl">
            <Manifesto text="We are not just another agency. We are your strategic partner, obsessed with crafting digital experiences that drive tangible outcomes and turn ambition into an unfair advantage." />
          </div>
        </div>
      </section>

      {/* ── Work (2x2 Grid) ────────────────────────────── */}
      <section className="bg-[#0a0a0a] pt-32 pb-24 relative">
        <div className={CONTAINER}>
          <Reveal className="mb-20">
            <h2 className="text-balance text-4xl font-bold tracking-tight md:text-6xl">
              Proof, not promises.
            </h2>
          </Reveal>

          {/* 2x2 rács, soronként két kártya, összesen négy */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            {caseStudies.slice(0, 4).map((cs, i) => (
              <StackedWorkCard key={cs.slug} cs={cs} index={i} />
            ))}
          </div>

          {/* ÚJ: Központosított gomb az összes projekthez, közvetlenül a képek alatt */}
          <Reveal delay={0.2} className="mt-20 flex justify-center">
            <MagneticButton
              href="/references"
              className="group flex items-center gap-3 rounded-xl bg-[#be2133] px-8 py-4 text-base font-semibold text-white transition-shadow hover:shadow-[0_0_34px_-6px_#be2133]"
            >
              Összes projekt megtekintése
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </MagneticButton>
          </Reveal>
        </div>
      </section>

      {/* ── Services (Simple Grid) ─────────────────────────── */}
      {/* ── Services (Interactive Typography List) ───────────────────── */}
      <section className="py-32 bg-[#070707] overflow-hidden">
        <div className={CONTAINER}>
          <InteractiveServiceList />
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────── */}
      <section className="py-32">
        <TestimonialCarousel />
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="bg-[#0a0a0a] py-32">
        <div className={`${CONTAINER} grid gap-14 lg:grid-cols-12 lg:gap-20`}>
          <div className="lg:col-span-5">
            <Reveal className="lg:sticky lg:top-16">
              <h2 className="text-balance text-4xl font-bold tracking-tight md:text-6xl">
                Questions, answered.
              </h2>
              <p className="mt-6 max-w-sm text-pretty text-lg text-white/55">
                Everything you need to know before we start building together.
              </p>
              <MagneticButton
                href="/book"
                className="group mt-8 flex items-center gap-2 rounded-lg bg-white/[0.06] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/15"
              >
                Talk to us
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </MagneticButton>
            </Reveal>
          </div>

          <div className="flex flex-col gap-3 lg:col-span-7">
            {FAQS.map((faq, i) => (
              <FaqItem
                key={faq.q}
                faq={faq}
                index={i}
                isOpen={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Journal ──────────────────────────────────────────── */}
      <section className="py-32">
        <div className={CONTAINER}>
          <Reveal className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <h2 className="text-4xl font-bold tracking-tight md:text-6xl">
              Insights &amp; ideas.
            </h2>
            <MagneticButton
              href="/blog"
              className="group flex items-center gap-2 rounded-lg bg-white/[0.06] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/15"
            >
              All articles
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </MagneticButton>
          </Reveal>

          <div className="grid grid-cols-1 gap-x-6 gap-y-12 md:grid-cols-3">
            {latestPosts.map((post, i) => (
              <Reveal key={post.slug} delay={i * 0.08}>
                <Link href={`/blog/${post.slug}`} className="group block">
                  <div className="relative aspect-[16/11] overflow-hidden rounded-xl bg-[#0c0c0c]">
                    <Image
                      src={post.cover || '/placeholder.svg'}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-5 flex items-center gap-3 text-xs text-white/45">
                    <span className="font-semibold uppercase tracking-[0.12em] text-[#be2133]">
                      {post.category}
                    </span>
                    <span>·</span>
                    <span>{post.readingTime}</span>
                  </div>
                  <h3 className="mt-2.5 text-pretty text-xl font-bold leading-snug tracking-tight text-white transition-colors group-hover:text-[#be2133]">
                    {post.title}
                  </h3>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA & FOOTER (MERGED) ────────────────────────────── */}
      <section className="relative flex min-h-[75vh] flex-col justify-between overflow-hidden rounded-t-[2.5rem] bg-[#be2133] pt-36 md:rounded-t-[3.5rem]">
        {/* Háttér effektek és világítás */}
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute left-1/4 top-0 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-[#ff5566]/50 blur-[130px]"
          />
          <motion.div
            animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-0 right-1/4 h-[26rem] w-[26rem] translate-x-1/2 rounded-full bg-[#8a0f1d]/60 blur-[130px]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
        </div>

        {/* A CTA szöveges tartalma */}
        <div className={`${CONTAINER} relative z-10 flex flex-1 flex-col items-center justify-center text-center pb-24`}>
          <Reveal delay={0.05}>
            <h2 className="text-balance text-[clamp(3rem,10vw,9rem)] font-black uppercase leading-[0.85] tracking-tight text-white">
              Stop blending in.
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mx-auto mt-8 max-w-2xl text-pretty text-lg text-white/85 md:text-xl">
              It&apos;s time to build a digital presence that commands authority.
              Let&apos;s discuss your next move.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <MagneticButton
              href="/book"
              className="group mt-12 inline-flex items-center gap-3 rounded-lg bg-white px-10 py-5 text-base font-bold uppercase tracking-[0.1em] text-[#be2133] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] transition-transform hover:scale-[1.03]"
            >
              Book a call
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </MagneticButton>
          </Reveal>
        </div>

        {/* A megújult, egyszerűsített Footer közvetlenül a CTA hátterén belül kap helyet */}
        <Footer />
      </section>
        </div>
      </SmoothScroll>
    </CustomCursorProvider>
  )
}