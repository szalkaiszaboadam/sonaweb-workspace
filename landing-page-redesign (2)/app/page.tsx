'use client'

import {
  useRef,
  useEffect,
  useState,
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


const CONTAINER = 'mx-auto w-full max-w-[1340px] px-6 sm:px-10 lg:px-20'

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
  strength = 0.35,
}: {
  children: ReactNode
  className?: string
  href?: string
  onClick?: () => void
  ariaLabel?: string
  strength?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 200, damping: 16 })
  const sy = useSpring(y, { stiffness: 200, damping: 16 })

  const handle = (e: ReactMouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength)
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength)
  }
  const reset = () => {
    x.set(0)
    y.set(0)
  }

  const inner = (
    <motion.span
      ref={ref}
      style={{ x: sx, y: sy }}
      onMouseMove={handle}
      onMouseLeave={reset}
      whileTap={{ scale: 0.96 }}
      className={className}
    >
      {children}
    </motion.span>
  )

  if (href) {
    return (
      <Link href={href} aria-label={ariaLabel} className="inline-flex">
        {inner}
      </Link>
    )
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="inline-flex"
    >
      {inner}
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
    title: 'Website Development',
    slug: 'website-development',
    icon: Globe,
    desc: 'Conversion-first, high-performance sites engineered in Next.js.',
    span: 'lg:col-span-7',
  },
  {
    id: '02',
    title: 'Short-Form Video',
    slug: 'short-form-video',
    icon: Video,
    desc: 'Scroll-stopping TikTok & Reels — concepted, shot and edited.',
    span: 'lg:col-span-5',
  },
  {
    id: '03',
    title: 'Paid Advertising',
    slug: 'facebook-ads',
    icon: Megaphone,
    desc: 'Profit-obsessed media buying across Meta, TikTok and beyond.',
    span: 'lg:col-span-5',
  },
  {
    id: '04',
    title: 'Content & Graphics',
    slug: 'social-content-graphics',
    icon: LayoutGrid,
    desc: 'On-brand social content that builds a feed worth following.',
    span: 'lg:col-span-7',
  },
  {
    id: '05',
    title: 'Email Marketing',
    slug: 'email-marketing',
    icon: Mail,
    desc: 'Lifecycle flows that turn lists into predictable revenue.',
    span: 'lg:col-span-6',
  },
  {
    id: '06',
    title: 'Photography',
    slug: 'photography',
    icon: Camera,
    desc: 'Premium brand and product visuals that elevate everything.',
    span: 'lg:col-span-6',
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
  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: EASE }}
      // Az absolute pozíció biztosítja, hogy a navbar a helyén maradjon görgetéskor
      className="absolute inset-x-0 top-0 z-50 bg-transparent"
    >
      <div className={`${CONTAINER} flex items-center justify-between py-6 md:py-8`}>
        
        {/* Bal oldal: Logó */}
        <Link href="/" aria-label="SONAWEB home" className="flex items-center shrink-0">
          <img
            src="/sonaweb-logo-white.png"
            alt="SONAWEB"
            className="h-4 w-auto object-contain md:h-5"
          />
        </Link>

        {/* Közép: Fő navigációs linkek (Asztali nézetben) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide">
          <Link href="/references" className="relative text-white/70 transition-colors hover:text-white group py-2">
            Work
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#be2133] transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link href="/services" className="relative text-white/70 transition-colors hover:text-white group py-2">
            Services
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#be2133] transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link href="/blog" className="relative text-white/70 transition-colors hover:text-white group py-2">
            Journal
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#be2133] transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link href="/about" className="relative text-white/70 transition-colors hover:text-white group py-2">
            About Us
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#be2133] transition-all duration-300 group-hover:w-full" />
          </Link>
        </nav>

        {/* Jobb oldal: Felhasználói zóna és elsődleges CTA */}
        <div className="flex items-center gap-6">
          <Link 
            href="/client" 
            className="hidden sm:inline-flex text-sm font-medium text-white/60 transition-colors hover:text-white py-2"
          >
            Client Portal
          </Link>

          <MagneticButton
            href="/book"
            ariaLabel="Book a call"
            className="flex items-center justify-center rounded-lg bg-white/[0.06] border border-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/15"
          >
            Book a Call
          </MagneticButton>
        </div>

      </div>
    </motion.header>
  )
}

/* ──────────────────────────────────────────────────────────────────────
   Footer (minimal, borderless)
   ────────────────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="border-t border-white/[0.05] bg-[#070707] pt-20 md:pt-32">
      <Reveal y={20} delay={0.1}>
        <div className={`${CONTAINER} pb-12`}>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-5 lg:gap-8">

            {/* Brand & Mission */}
            <div className="flex flex-col gap-6 lg:col-span-2 lg:pr-12">
              <Link href="/" aria-label="SONAWEB home">
                <img
                  src="/sonaweb-logo-white.png"
                  alt="SONAWEB"
                  className="h-6 w-auto object-contain"
                />
              </Link>
              <p className="max-w-sm text-pretty text-sm leading-relaxed text-white/55">
                We are a strategic partner obsessed with crafting digital experiences that drive tangible outcomes and turn ambition into an unfair advantage.
              </p>
              {/* Social Icons */}
              <div className="mt-2 flex items-center gap-5">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/40 transition-colors hover:text-[#be2133]"
                  aria-label="Instagram"
                >
                  <InstagramIcon className="h-5 w-5" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/40 transition-colors hover:text-[#be2133]"
                  aria-label="LinkedIn"
                >
                  <LinkedinIcon className="h-5 w-5" />
                </a>
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/40 transition-colors hover:text-[#be2133]"
                  aria-label="X (Twitter)"
                >
                  <XIcon className="h-4 w-4" /> {/* Kicsit kisebbre véve, mert az X logó aránya más */}
                </a>
              </div>
            </div>

            {/* Navigation - Company */}
            <div className="flex flex-col gap-5">
              <h4 className="text-sm font-semibold tracking-wider text-white">Company</h4>
              <nav className="flex flex-col gap-3 text-sm text-white/55">
                <Link href="/references" className="transition-colors hover:text-white">Work</Link>
                <Link href="/services" className="transition-colors hover:text-white">Services</Link>
                <Link href="/blog" className="transition-colors hover:text-white">Journal</Link>
                <Link href="/about" className="transition-colors hover:text-white">About Us</Link>
              </nav>
            </div>

            {/* Navigation - Connect */}
            <div className="flex flex-col gap-5">
              <h4 className="text-sm font-semibold tracking-wider text-white">Connect</h4>
              <nav className="flex flex-col gap-3 text-sm text-white/55">
                <a href="mailto:hello@sonaweb.com" className="transition-colors hover:text-white">hello@sonaweb.com</a>
                <Link href="/book" className="transition-colors hover:text-white">Book a Call</Link>
                <Link href="/client" className="transition-colors hover:text-white">Client Portal</Link>
              </nav>
            </div>

            {/* Navigation - Legal */}
            <div className="flex flex-col gap-5">
              <h4 className="text-sm font-semibold tracking-wider text-white">Legal</h4>
              <nav className="flex flex-col gap-3 text-sm text-white/55">
                <Link href="/privacy" className="transition-colors hover:text-white">Privacy Policy</Link>
                <Link href="/terms" className="transition-colors hover:text-white">Terms of Service</Link>
              </nav>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-20 flex flex-col items-center justify-between border-t border-white/[0.05] pt-8 text-xs text-white/35 sm:flex-row">
            <p>{`© ${new Date().getFullYear()} SONAWEB. All rights reserved.`}</p>
            <div className="mt-3 flex items-center gap-4 sm:mt-0">
              <p>Crafted for ambitious brands.</p>
            </div>
          </div>
      
    </div>
    </Reveal>
    </footer >
  )
}
/* ──────────────────────────────────────────────────────────────────────
   Services — premium bento capability showcase
   ────────────────────────────────────────────────────────────────────── */

function ServiceCard({
  srv,
  index,
}: {
  srv: (typeof SERVICES)[number]
  index: number
}) {
  const Icon = srv.icon
  return (
    <Reveal delay={index * 0.06} className={srv.span}>
      <Link
        href={`/services/${srv.slug}`}
        className="group relative flex h-full min-h-[16rem] flex-col justify-between overflow-hidden rounded-2xl bg-[#0f0f0f] p-8 transition-colors duration-500 hover:bg-[#141414] md:min-h-[19rem] md:p-10"
      >
        {/* hover gradient wash */}
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#be2133]/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        {/* oversized watermark numeral */}
        <span className="pointer-events-none absolute -right-4 -top-10 select-none font-black leading-none tracking-tighter text-white/[0.04] transition-all duration-700 group-hover:text-white/[0.07] text-[10rem] md:text-[13rem]">
          {srv.id}
        </span>

        <div className="relative z-10 flex items-start justify-between">
          <span className="grid h-14 w-14 place-items-center rounded-xl bg-white/[0.05] transition-all duration-500 group-hover:scale-110 group-hover:bg-[#be2133]">
            <Icon className="h-6 w-6 text-white/70 transition-colors duration-500 group-hover:text-white" />
          </span>
          <ArrowUpRight className="h-6 w-6 text-white/25 transition-all duration-500 group-hover:rotate-45 group-hover:text-[#be2133]" />
        </div>

        <div className="relative z-10 mt-10">
          <h3 className="text-balance text-3xl font-bold tracking-tight text-white md:text-4xl">
            {srv.title}
          </h3>
          <p className="mt-3 max-w-md text-pretty text-white/55">{srv.desc}</p>
        </div>
      </Link>
    </Reveal>
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
  const ref = useRef<HTMLDivElement>(null)
  
  // A görgetés alapú kicsinyítési (scale) effektus teljes mértékben eltávolítva

  const [isHovered, setIsHovered] = useState(false)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  const smoothX = useSpring(mouseX, { damping: 20, stiffness: 300, mass: 0.5 })
  const smoothY = useSpring(mouseY, { damping: 20, stiffness: 300, mass: 0.5 })

  const handleMouseMove = (e: ReactMouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left)
    mouseY.set(e.clientY - rect.top)
  }

  return (
    <div
      ref={ref}
      className="sticky top-28 mb-24 flex h-[75vh] w-full flex-col items-center justify-center pt-8 last:mb-0"
      style={{ perspective: '1200px' }}
    >
      <motion.div
        // A kártya megtartja fix méretét, nem megy végbe méretcsökkenés görgetéskor
        initial={{ opacity: 0, rotateX: 15, y: 80 }}
        whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="relative h-full w-full overflow-hidden rounded-[2rem] bg-[#0c0c0c] shadow-2xl"
      >
        <Link 
          href={`/references/${cs.category}/${cs.slug}`}
          className="group absolute inset-0 z-20"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onMouseMove={handleMouseMove}
        >
          <motion.div
            className="pointer-events-none absolute left-0 top-0 flex h-28 w-28 items-center justify-center rounded-full bg-[#be2133] text-center text-sm font-bold uppercase leading-tight tracking-wider text-white shadow-[0_0_30px_rgba(190,33,51,0.4)] z-50"
            style={{
              x: smoothX,
              y: smoothY,
              translateX: '-50%',
              translateY: '-50%',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: isHovered ? 1 : 0, opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            View<br />Project
          </motion.div>
        </Link>

        <div className="pointer-events-none relative z-10 h-full w-full">
          <Image
            src={cs.image || '/placeholder.svg'}
            alt={cs.client}
            fill
            priority={index === 0}
            className="object-cover opacity-60 transition-transform duration-[1.5s] ease-out group-hover:scale-105 group-hover:opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-[#070707]/40 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-6 p-8 md:flex-row md:items-end md:justify-between md:p-12">
            <div className="max-w-2xl">
              <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium uppercase tracking-[0.16em] text-white/55">
                <span>{cs.industry}</span>
                <span className="h-1 w-1 rounded-full bg-white/30" />
                <span>{cs.serviceType || 'Web Development'}</span>
              </div>
              <h3 className="text-balance text-4xl font-black tracking-tight text-white md:text-6xl">
                {cs.client}
              </h3>
              <p className="mt-4 max-w-xl text-pretty text-lg text-white/80">
                {cs.resultSummary || 'Részletes esettanulmány a projekt kihívásairól és eredményeiről.'}
              </p>
            </div>

            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/10 backdrop-blur-md transition-all duration-500 group-hover:-translate-y-2 group-hover:bg-[#be2133] group-hover:rotate-45">
              <ArrowUpRight className="h-7 w-7 text-white" />
            </span>
          </div>
        </div>
      </motion.div>
    </div>
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
        className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-8 pl-6 sm:pl-10 lg:pl-[calc(max(0px,(100%-1340px)/2)+5rem)] scroll-pl-6 sm:scroll-pl-10 lg:scroll-pl-[calc(max(0px,(100%-1340px)/2)+5rem)]"
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

  const heroRef = useRef(null)
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroY = useTransform(heroScroll, [0, 1], ['0%', '24%'])
  const heroOpacity = useTransform(heroScroll, [0, 0.8], [1, 0])

  return (
    <div className="min-h-screen bg-[#070707] font-sans text-[#f5f1ef] selection:bg-[#be2133] selection:text-white">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden pb-28 pt-32"
      >
        {/* animated red/black shader backdrop */}
        <HeroShader />

        <Navbar />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className={`${CONTAINER} relative z-10 flex flex-col items-center text-center`}
        >
          <h1 className="text-balance text-[clamp(2.8rem,9.5vw,8.5rem)] font-black uppercase leading-[0.86] tracking-tight">
            {['Engineering', 'digital'].map((word, i) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, y: '60%' }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.1 + i * 0.08, ease: EASE }}
                className="block"
              >
                {word}
              </motion.span>
            ))}
            <motion.span
              initial={{ opacity: 0, y: '60%' }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.26, ease: EASE }}
              className="block bg-gradient-to-r from-[#be2133] via-[#ff3b4e] to-[#be2133] bg-clip-text text-transparent"
            >
              dominance
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: EASE }}
            className="mx-auto mt-8 max-w-xl text-pretty text-lg text-white/65 md:text-xl"
          >
            We don&apos;t build standard websites. We architect premium digital
            ecosystems that turn attention into revenue.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
            className="mt-11 flex flex-col items-center gap-3 sm:flex-row"
          >
            <MagneticButton
              href="/book"
              className="group flex items-center gap-2.5 rounded-lg bg-[#be2133] px-7 py-3.5 text-base font-semibold text-white transition-shadow hover:shadow-[0_0_34px_-6px_#be2133]"
            >
              Initiate project
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </MagneticButton>
            <MagneticButton
              href="/references"
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

      {/* ── Services ─────────────────────────────────────────── */}
      <section className="pb-32">
        <div className={CONTAINER}>
          <Reveal className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <h2 className="text-balance text-4xl font-bold tracking-tight md:text-6xl">
              Everything you need.
              <br className="hidden md:block" /> Nothing you don&apos;t.
            </h2>
            <p className="max-w-sm text-pretty text-white/55 md:text-right">
              We operate at the intersection of stunning aesthetics and ruthless
              performance.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-12">
            {SERVICES.map((srv, i) => (
              <ServiceCard key={srv.id} srv={srv} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Work (Stacked Effect) ────────────────────────────── */}
      <section className="bg-[#0a0a0a] pt-32 pb-24 relative">
        <div className={CONTAINER}>
          <Reveal className="mb-20">
            <h2 className="text-balance text-4xl font-bold tracking-tight md:text-6xl">
              Proof, not promises.
            </h2>
          </Reveal>

          {/* Egymásra csúszó kártyák konténere */}
          <div className="flex flex-col relative w-full">
            {caseStudies.map((cs, i) => (
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

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#be2133] py-36">
        {/* lighting + depth */}
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

        <div className={`${CONTAINER} relative z-10 text-center`}>
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
              strength={0.5}
              className="group mt-12 inline-flex items-center gap-3 rounded-lg bg-white px-10 py-5 text-base font-bold uppercase tracking-[0.1em] text-[#be2133] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] transition-transform hover:scale-[1.03]"
            >
              Book a call
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </MagneticButton>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  )
}
