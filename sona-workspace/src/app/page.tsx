"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { Bricolage_Grotesque, IBM_Plex_Mono, Manrope } from "next/font/google";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  Circle,
  Clock,
  Code2,
  FileText,
  FolderKanban,
  LayoutGrid,
  Link2,
  ListChecks,
  Menu,
  MessageSquare,
  MoreHorizontal,
  Palette,
  Paperclip,
  Play,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Fonts                                                              */
/* ------------------------------------------------------------------ */
const display = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
});

const body = Manrope({
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

/* ------------------------------------------------------------------ */
/*  Theme tokens (Strictly Light for Marketing)                        */
/* ------------------------------------------------------------------ */
const LIGHT_THEME = {
  bg: "#F4F2F0",
  bgAlt: "#EAE6E1",
  surface: "#FFFFFF",
  surface2: "#FBFAF9",
  fg: "#141414",
  fgMuted: "#85817E",
  border: "rgba(20,20,20,0.09)",
  borderStrong: "rgba(20,20,20,0.16)",
  accent: "#BF2234",
  accentSoft: "rgba(191,34,52,0.08)",
  onAccent: "#F4F2F0",
  shadow: "0 30px 80px -25px rgba(20,20,20,0.22)",
};

function themeVars(t: typeof LIGHT_THEME): CSSProperties {
  return {
    ["--bg" as string]: t.bg,
    ["--bg-alt" as string]: t.bgAlt,
    ["--surface" as string]: t.surface,
    ["--surface-2" as string]: t.surface2,
    ["--fg" as string]: t.fg,
    ["--fg-muted" as string]: t.fgMuted,
    ["--border" as string]: t.border,
    ["--border-strong" as string]: t.borderStrong,
    ["--accent" as string]: t.accent,
    ["--accent-soft" as string]: t.accentSoft,
    ["--on-accent" as string]: t.onAccent,
    ["--shadow" as string]: t.shadow,
  };
}

/* ------------------------------------------------------------------ */
/*  Shared bits                                                        */
/* ------------------------------------------------------------------ */
const EASE = [0.16, 1, 0.3, 1] as const;

function Reveal({ children, delay = 0, className = "", y = 22 }: { children: ReactNode; delay?: number; className?: string; y?: number; }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? undefined : { opacity: 0, y }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]"
      style={{ borderColor: "var(--border-strong)", color: "var(--fg-muted)", fontFamily: "var(--font-mono)" }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--accent)" }} />
      {children}
    </span>
  );
}

function PrimaryButton({ children, href = "#", icon: Icon = ArrowRight, className = "" }: { children: ReactNode; href?: string; icon?: LucideIcon; className?: string; }) {
  return (
    <a
      href={href}
      className={"group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-semibold transition-transform duration-300 will-change-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 " + className}
      style={{ backgroundColor: "var(--accent)", color: "var(--on-accent)", outlineColor: "var(--accent)" }}
    >
      {children}
      <Icon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
    </a>
  );
}

function GhostButton({ children, href = "#", icon: Icon = Play }: { children: ReactNode; href?: string; icon?: LucideIcon; }) {
  return (
    <a
      href={href}
      className="group inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3.5 text-[15px] font-semibold transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{ borderColor: "var(--border-strong)", color: "var(--fg)", outlineColor: "var(--accent)" }}
    >
      <Icon className="h-4 w-4" style={{ color: "var(--accent)" }} />
      {children}
    </a>
  );
}

function Avatar({ label, tone = 0 }: { label: string; tone?: number }) {
  const tones = [
    { bg: "var(--accent-soft)", fg: "var(--accent)" },
    { bg: "var(--surface-2)", fg: "var(--fg-muted)" },
  ];
  const c = tones[tone % tones.length];
  return (
    <span
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ring-2"
      style={{ backgroundColor: c.bg, color: c.fg, ["--tw-ring-color" as string]: "var(--surface)" }}
    >
      {label}
    </span>
  );
}

function Tag({ children }: { children: ReactNode }) {
  return (
    <span
      className="rounded-md px-2 py-0.5 text-[11px] font-semibold"
      style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent)", fontFamily: "var(--font-mono)" }}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Nav                                                                 */
/* ------------------------------------------------------------------ */
function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <a href="#top" className="inline-flex items-center gap-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4" style={{ outlineColor: "var(--accent)" }}>
      <span
        className="flex h-7 w-7 items-center justify-center rounded-[8px] text-[13px] font-extrabold"
        style={{ backgroundColor: "var(--fg)", color: "var(--surface)", fontFamily: "var(--font-display)" }}
      >
        S
      </span>
      {!compact && (
        <span className="text-[17px] font-bold tracking-tight" style={{ fontFamily: "var(--font-display)", color: "var(--fg)" }}>
          SONA
        </span>
      )}
    </a>
  );
}

const NAV_LINKS = [
  { href: "#product", label: "Termék" },
  { href: "#features", label: "Funkciók" },
  { href: "#connected", label: "Így kapcsolódik" },
  { href: "#audience", label: "Csapatoknak" },
];

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300"
      style={{
        backgroundColor: scrolled ? "color-mix(in srgb, var(--bg) 82%, transparent)" : "transparent",
        borderBottom: `1px solid ${scrolled ? "var(--border)" : "transparent"}`,
        backdropFilter: scrolled ? "blur(14px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(14px)" : "none",
      }}
    >
      <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-5 sm:px-8">
        <Logo />
        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[14px] font-medium transition-colors hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
              style={{ color: "var(--fg-muted)", outlineColor: "var(--accent)" }}
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-6 lg:flex">
          <a
            href="/login"
            className="text-[14px] font-semibold transition-colors hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
            style={{ color: "var(--fg)", outlineColor: "var(--accent)" }}
          >
            Bejelentkezés
          </a>
          <a
            href="/register"
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[14px] font-semibold transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ backgroundColor: "var(--accent)", color: "var(--on-accent)", outlineColor: "var(--accent)" }}
          >
            Ingyenes kezdés
          </a>
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menü"
            className="flex h-9 w-9 items-center justify-center rounded-full border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ borderColor: "var(--border-strong)", outlineColor: "var(--accent)" }}
          >
            {open ? <X className="h-4 w-4" style={{ color: "var(--fg)" }} /> : <Menu className="h-4 w-4" style={{ color: "var(--fg)" }} />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="overflow-hidden border-t lg:hidden"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-[15px] font-medium"
                  style={{ color: "var(--fg)" }}
                >
                  {l.label}
                </a>
              ))}
              <div className="mt-2 flex items-center gap-3 px-3">
                <a href="/login" className="text-[14px] font-semibold" style={{ color: "var(--fg)" }}>
                  Bejelentkezés
                </a>
                <a
                  href="/register"
                  className="ml-auto inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[14px] font-semibold"
                  style={{ backgroundColor: "var(--accent)", color: "var(--on-accent)" }}
                >
                  Ingyenes kezdés
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero mock   a fake, live-feeling SONA app window                   */
/* ------------------------------------------------------------------ */
const SIDEBAR_ICONS = [
  { icon: LayoutGrid, label: "Áttekintés" },
  { icon: ListChecks, label: "Feladatok", active: true },
  { icon: FolderKanban, label: "Projektek" },
  { icon: FileText, label: "Dokumentumok" },
  { icon: CalendarDays, label: "Naptár" },
  { icon: Clock, label: "Időmérés" },
  { icon: Users, label: "Csapat" },
];

const BOARD: { title: string; cards: { name: string; tag: string; who: string; done?: boolean }[] }[] = [
  {
    title: "Hátralévő",
    cards: [
      { name: "Onboarding flow & wireframe", tag: "Design", who: "AK" },
      { name: "API kulcs rotáció ütemezése", tag: "Backend", who: "PL" },
    ],
  },
  {
    title: "Folyamatban",
    cards: [
      { name: "Landing oldal - hero szekció", tag: "Marketing", who: "RM" },
      { name: "Time tracker mobil nézet", tag: "Mobil", who: "SV" },
      { name: "Q3 workspace audit", tag: "Ops", who: "AK" },
    ],
  },
  {
    title: "Kész",
    cards: [{ name: "Ügyfél workshop - jegyzetek", tag: "Docs", who: "PL", done: true }],
  },
];

function HeroMock() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 160, damping: 22, mass: 0.4 });
  const sry = useSpring(ry, { stiffness: 160, damping: 22, mass: 0.4 });

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    ry.set(px * 5);
    rx.set(py * -5);
  }

  function handleLeave() {
    rx.set(0);
    ry.set(0);
  }

  return (
    <div ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave} style={{ perspective: 1800 }} className="relative">
      <motion.div
        style={{
          rotateX: srx,
          rotateY: sry,
          transformStyle: "preserve-3d",
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
          boxShadow: "var(--shadow)",
        }}
        className="relative overflow-hidden rounded-2xl border"
      >
        <div className="flex items-center gap-4 border-b px-4 py-3 sm:px-5" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "var(--border-strong)" }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "var(--border-strong)" }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "var(--border-strong)" }} />
          </div>
          <div className="hidden items-center gap-1 rounded-lg p-1 sm:flex" style={{ backgroundColor: "var(--bg-alt)" }}>
            {["Áttekintés", "Feladatok", "Naptár"].map((t, i) => (
              <span
                key={t}
                className="rounded-md px-3 py-1.5 text-[12px] font-semibold"
                style={{
                  backgroundColor: i === 1 ? "var(--surface)" : "transparent",
                  color: i === 1 ? "var(--fg)" : "var(--fg-muted)",
                  boxShadow: i === 1 ? "var(--shadow)" : "none",
                }}
              >
                {t}
              </span>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Search className="h-4 w-4" style={{ color: "var(--fg-muted)" }} />
            <Bell className="h-4 w-4" style={{ color: "var(--fg-muted)" }} />
            <div className="flex -space-x-2">
              <Avatar label="RM" />
              <Avatar label="AK" tone={1} />
              <Avatar label="PL" />
            </div>
          </div>
        </div>
        <div className="flex">
          <div className="hidden w-14 shrink-0 flex-col items-center gap-1 border-r py-4 sm:flex" style={{ borderColor: "var(--border)" }}>
            {SIDEBAR_ICONS.map(({ icon: Icon, active, label }) => (
              <div key={label} title={label} className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: active ? "var(--accent-soft)" : "transparent" }}>
                <Icon className="h-4 w-4" style={{ color: active ? "var(--accent)" : "var(--fg-muted)" }} />
              </div>
            ))}
          </div>
          <div className="grid flex-1 grid-cols-1 gap-3 p-4 sm:grid-cols-3 sm:p-5">
            {BOARD.map((col) => (
              <div key={col.title} className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between px-0.5">
                  <span className="text-[12px] font-semibold" style={{ color: "var(--fg-muted)" }}>{col.title}</span>
                  <span className="text-[11px]" style={{ color: "var(--fg-muted)", fontFamily: "var(--font-mono)" }}>{col.cards.length}</span>
                </div>
                {col.cards.map((c) => (
                  <div key={c.name} className="rounded-xl border p-3" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-alt)" }}>
                    <div className="mb-2 flex items-center justify-between">
                      <Tag>{c.tag}</Tag>
                      {c.done ? <CheckCircle2 className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} /> : <MoreHorizontal className="h-3.5 w-3.5" style={{ color: "var(--fg-muted)" }} />}
                    </div>
                    <p className="text-[13px] font-medium leading-snug" style={{ color: "var(--fg)" }}>{c.name}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <Avatar label={c.who} />
                      <div className="flex items-center gap-1" style={{ color: "var(--fg-muted)" }}>
                        <Paperclip className="h-3 w-3" />
                        <span className="text-[10px]">2</span>
                        <MessageSquare className="ml-1.5 h-3 w-3" />
                        <span className="text-[10px]">3</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
      <motion.div
        initial={reduce ? undefined : { opacity: 0, y: 16 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
        className="absolute -bottom-6 -left-3 flex items-center gap-3 rounded-2xl border px-4 py-3 sm:-left-8"
        style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow)" }}
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ backgroundColor: "var(--accent)" }} />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "var(--accent)" }} />
        </span>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--fg-muted)" }}>Aktív idő</p>
          <p className="text-[15px] font-bold" style={{ fontFamily: "var(--font-mono)", color: "var(--fg)" }}>02:14:08</p>
        </div>
        <div className="h-8 w-px" style={{ backgroundColor: "var(--border)" }} />
        <p className="text-[12px] font-medium" style={{ color: "var(--fg-muted)" }}>Landing oldal</p>
      </motion.div>
      <motion.div
        initial={reduce ? undefined : { opacity: 0, y: -16 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.65, ease: EASE }}
        className="absolute -right-3 -top-6 hidden items-center gap-2.5 rounded-2xl border px-4 py-3 sm:-right-8 sm:flex"
        style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow)" }}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: "var(--accent-soft)" }}>
          <FileText className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
        </div>
        <div>
          <p className="text-[12px] font-semibold" style={{ color: "var(--fg)" }}>Dokumentum frissítve</p>
          <p className="text-[11px]" style={{ color: "var(--fg-muted)" }}>Ügyfél brief • 2 perce</p>
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero                                                                */
/* ------------------------------------------------------------------ */
const TRUST_LOGOS = ["NORDLY", "Fabrika Studio", "Kessler & Vine", "Loop Systems", "Hemma"];

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-36 pb-20 sm:pt-44 sm:pb-28">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-220px] h-[520px] w-[900px] -translate-x-1/2 rounded-full opacity-[0.5] blur-[110px]"
        style={{ backgroundColor: "var(--accent-soft)" }}
      />
      <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8">
        <div className="mx-auto max-w-[840px] text-center">
          <Reveal>
            <Eyebrow>SONA Workspace</Eyebrow>
          </Reveal>
          <Reveal delay={0.06}>
            <h1
              className="mt-6 text-balance text-[40px] font-bold leading-[1.05] tracking-[-0.02em] sm:text-[56px] lg:text-[68px]"
              style={{ fontFamily: "var(--font-display)", color: "var(--fg)" }}
            >
              Minden, amin a csapatod
              <br className="hidden sm:block" /> dolgozik.{" "}
              <span style={{ color: "var(--accent)" }}>Egy helyen.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mx-auto mt-6 max-w-[600px] text-balance text-[17px] leading-relaxed sm:text-[18px]" style={{ color: "var(--fg-muted)" }}>
              A SONA egyetlen összekapcsolt workspace-be gyűjti a projekteket,
              feladatokat, dokumentumokat, fájlokat, a naptárat és az
              időmérést, hogy a csapatod ne tíz eszköz között ugráljon.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <PrimaryButton href="/register">Ingyenes kezdés</PrimaryButton>
              <GhostButton href="#product">Megnézem, hogyan működik</GhostButton>
            </div>
          </Reveal>
        </div>
        <Reveal delay={0.28} y={36} className="relative mx-auto mt-20 max-w-[1080px] sm:mt-24">
          <HeroMock />
        </Reveal>
        <Reveal delay={0.4} className="mx-auto mt-24 max-w-[900px] sm:mt-28">
          <p className="text-center text-[12px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--fg-muted)" }}>
            Csapatok, amik már egy helyen dolgoznak
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {TRUST_LOGOS.map((name) => (
              <span key={name} className="text-[16px] font-bold tracking-tight opacity-50" style={{ fontFamily: "var(--font-display)", color: "var(--fg)" }}>
                {name}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Product showcase                                                   */
/* ------------------------------------------------------------------ */
type ShowcaseKey = "overview" | "tasks" | "projects" | "docs" | "time" | "calendar";

const SHOWCASE = [
  { key: "overview" as const, label: "Áttekintés", icon: LayoutGrid, title: "Lásd az egész csapatot egy pillantással", desc: "Egy irányítópult mutatja, min dolgozik a csapat.", bullets: ["Élő csapataktivitás", "Blokkolt feladatok", "Testreszabhatóság"] },
  { key: "tasks" as const, label: "Feladatok", icon: ListChecks, title: "A feladatok, ahogy tényleg dolgoztok", desc: "Tábla, lista vagy idővonal nézet.", bullets: ["Nézetválasztó", "Alfeladatok", "Egyéni státuszok"] },
  { key: "projects" as const, label: "Projektek", icon: FolderKanban, title: "Minden projekt egy láthatáron", desc: "Célok, mérföldkövek és haladás egy helyen.", bullets: ["Mérföldkövek", "Előrehaladás", "Sablonok"] },
  { key: "docs" as const, label: "Dokumentumok", icon: FileText, title: "Dokumentumok a munka mellett", desc: "Írj specifikációt közvetlenül a projekt kontextusában.", bullets: ["Valós idejű", "Fájlok és linkek", "Verziótörténet"] },
  { key: "time" as const, label: "Időmérés", icon: Clock, title: "Időmérés, ami nem plusz meló", desc: "Indíts egy időmérőt a feladatból egy kattintással.", bullets: ["Egykattintásos", "Riportok", "Számlázható"] },
  { key: "calendar" as const, label: "Naptár", icon: CalendarDays, title: "Naptár, ami tudja, mi történik", desc: "Feladat-határidők és csapat-események egy naptárban.", bullets: ["Auto-események", "Csapatnézet", "Szinkronizálás"] },
];

function ShowcaseMock({ tab }: { tab: ShowcaseKey }) {
  // Mock contents based on the selected tab (keeping it brief for the global file)
  if (tab === "tasks") {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 rounded-xl border p-3" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-alt)" }}>
          <Circle className="h-4 w-4 shrink-0" style={{ color: "var(--fg-muted)" }} />
          <p className="flex-1 truncate text-[13px] font-medium" style={{ color: "var(--fg)" }}>Design system - komponens audit</p>
          <Avatar label="AK" />
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-xl border p-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-alt)" }}>
      <p className="text-[13px] font-semibold" style={{ color: "var(--fg)" }}>Modul előnézet ({tab})</p>
    </div>
  );
}

function ProductShowcase() {
  const [active, setActive] = useState<ShowcaseKey>("overview");
  const current = SHOWCASE.find((s) => s.key === active)!;

  return (
    <section id="product" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <Reveal className="mx-auto max-w-[640px] text-center">
          <Eyebrow>Termék</Eyebrow>
          <h2 className="mt-5 text-balance text-[30px] font-bold leading-[1.15] tracking-[-0.01em] sm:text-[38px]" style={{ fontFamily: "var(--font-display)", color: "var(--fg)" }}>
            Nem egy projektmenedzsment app. A csapatod teljes munkafolyamata.
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
            Minden nézet ugyanabból az adatbázisból épül fel, hogy ne kelljen duplikálni az adatokat.
          </p>
        </Reveal>
        <Reveal delay={0.1} className="mt-14">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5">
            {SHOWCASE.map((s) => {
              const isActive = s.key === active;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setActive(s.key)}
                  className="inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-[13.5px] font-semibold transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{
                    borderColor: isActive ? "var(--accent)" : "var(--border-strong)",
                    backgroundColor: isActive ? "var(--accent-soft)" : "transparent",
                    color: isActive ? "var(--accent)" : "var(--fg-muted)",
                    outlineColor: "var(--accent)",
                  }}
                >
                  <s.icon className="h-3.5 w-3.5" />
                  {s.label}
                </button>
              );
            })}
          </div>
        </Reveal>
        <div className="mt-10 grid gap-0 overflow-hidden rounded-3xl border lg:grid-cols-[0.85fr_1.15fr]" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)", boxShadow: "var(--shadow)" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={current.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="flex flex-col justify-center p-8 sm:p-12"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: "var(--accent-soft)" }}>
                <current.icon className="h-5 w-5" style={{ color: "var(--accent)" }} />
              </div>
              <h3 className="text-[22px] font-bold leading-tight sm:text-[26px]" style={{ fontFamily: "var(--font-display)", color: "var(--fg)" }}>
                {current.title}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                {current.desc}
              </p>
              <ul className="mt-6 flex flex-col gap-2.5">
                {current.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2.5 text-[14px]" style={{ color: "var(--fg)" }}>
                    <Check className="h-4 w-4 shrink-0" style={{ color: "var(--accent)" }} />
                    {b}
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
          <div className="border-t p-6 sm:p-8 lg:border-l lg:border-t-0" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-alt)" }}>
            <AnimatePresence mode="wait">
              <motion.div key={current.key} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.4, ease: EASE }}>
                <ShowcaseMock tab={current.key} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Audience                                                            */
/* ------------------------------------------------------------------ */
const AUDIENCE = [
  { icon: Palette, title: "Kreatív ügynökségek", desc: "Ügyfélprojektek, kreatív anyagok és határidők egy helyen - a brief-től a leadásig." },
  { icon: Code2, title: "Szoftverfejlesztő csapatok", desc: "Sprintek, feladatok és dokumentáció összekötve." },
  { icon: Building2, title: "Belső vállalati csapatok", desc: "Egy közös tér, ahol minden részleg ugyanúgy dolgozik." },
  { icon: Rocket, title: "Startupok", desc: "Gyors iterációk, kevés eszköz, sok fókusz." },
];

function Audience() {
  return (
    <section id="audience" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <Reveal className="mx-auto max-w-[600px] text-center">
          <Eyebrow>Kinek szól</Eyebrow>
          <h2 className="mt-5 text-balance text-[30px] font-bold leading-[1.15] tracking-[-0.01em] sm:text-[38px]" style={{ fontFamily: "var(--font-display)", color: "var(--fg)" }}>
            Bármilyen csapatnak, aki egy helyen szeretne dolgozni
          </h2>
        </Reveal>
        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {AUDIENCE.map((a, i) => (
            <Reveal key={a.title} delay={i * 0.08}>
              <div className="h-full rounded-2xl border p-6 transition-colors duration-300 hover:border-[var(--accent)]" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: "var(--accent-soft)" }}>
                  <a.icon className="h-5 w-5" style={{ color: "var(--accent)" }} />
                </div>
                <h3 className="text-[16px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--fg)" }}>{a.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>{a.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Final CTA                                                           */
/* ------------------------------------------------------------------ */
function FinalCta() {
  return (
    <section id="cta" className="relative overflow-hidden py-24 sm:py-32">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.55] blur-[110px]" style={{ backgroundColor: "var(--accent-soft)" }} />
      <div className="relative mx-auto max-w-[720px] px-5 text-center sm:px-8">
        <Reveal>
          <h2 className="text-balance text-[32px] font-bold leading-[1.12] tracking-[-0.01em] sm:text-[46px]" style={{ fontFamily: "var(--font-display)", color: "var(--fg)" }}>
            Készen állsz, hogy egy helyen dolgozz?
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mx-auto mt-4 max-w-[420px] text-[15.5px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
            Hozd létre a workspace-edet két percen belül. Nincs szükség bankkártyára.
          </p>
        </Reveal>
        <Reveal delay={0.16}>
          <div className="mt-8 flex justify-center">
            <PrimaryButton href="/register">Ingyenes kezdés</PrimaryButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer                                                              */
/* ------------------------------------------------------------------ */
const FOOTER_COLS = [
  { title: "Termék", links: ["Áttekintés", "Feladatok", "Dokumentumok", "Naptár", "Időmérés"] },
  { title: "Cég", links: ["Rólunk", "Karrier", "Blog", "Kapcsolat"] },
  { title: "Jogi", links: ["Adatvédelem", "Általános feltételek", "Biztonság"] },
];

function Footer() {
  return (
    <footer className="border-t py-16" style={{ borderColor: "var(--border)" }}>
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Logo />
            <p className="mt-4 max-w-[220px] text-[13.5px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
              Minden, amin a csapatod dolgozik. Egy helyen.
            </p>
          </div>
          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <p className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: "var(--fg-muted)" }}>{col.title}</p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-[13.5px] font-medium transition-colors hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" style={{ color: "var(--fg)", outlineColor: "var(--accent)" }}>{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
export default function Page() {
  return (
    <div
      className={`${display.variable} ${body.variable} ${mono.variable} min-h-screen antialiased`}
      style={{
        ...themeVars(LIGHT_THEME), // 🚀 JAVÍTÁS: Szigorúan ráerőltetjük a világos témát
        backgroundColor: "var(--bg)",
        color: "var(--fg)",
        fontFamily: "var(--font-body)",
      }}
    >
      <Nav />
      <main>
        <Hero />
        <ProductShowcase />
        <Audience />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}