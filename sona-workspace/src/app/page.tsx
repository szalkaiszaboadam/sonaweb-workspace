"use client";

/**
 * SONA Workspace — marketing landing page
 * ------------------------------------------------------------------
 * Single-file Next.js (App Router) client component.
 * Requires: next, react, framer-motion, lucide-react.
 *   npm install framer-motion lucide-react
 *
 * Note: this file uses "use client", so it cannot export `metadata`.
 * Add page metadata in a parent layout, or wrap this component from a
 * small server component if you need per-page <title>/<meta> tags.
 */

import {
  useEffect,
  useMemo,
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
  Moon,
  MoreHorizontal,
  Palette,
  Paperclip,
  Play,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
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
/*  Theme tokens                                                       */
/* ------------------------------------------------------------------ */

type ThemeName = "light" | "dark";

type ThemeTokens = {
  bg: string;
  bgAlt: string;
  surface: string;
  surface2: string;
  fg: string;
  fgMuted: string;
  border: string;
  borderStrong: string;
  accent: string;
  accentSoft: string;
  onAccent: string;
  shadow: string;
};

const THEME: Record<ThemeName, ThemeTokens> = {
  dark: {
    bg: "#0A0A0A",
    bgAlt: "#141414",
    surface: "#141414",
    surface2: "#1A1A1A",
    fg: "#F4F2F0",
    fgMuted: "#9E9A98",
    border: "rgba(244,242,240,0.10)",
    borderStrong: "rgba(244,242,240,0.18)",
    accent: "#BF2234",
    accentSoft: "rgba(191,34,52,0.16)",
    onAccent: "#F4F2F0",
    shadow: "0 30px 80px -20px rgba(0,0,0,0.6)",
  },
  light: {
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
  },
} as const;

function themeVars(t: ThemeTokens): CSSProperties {
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

function Reveal({
  children,
  delay = 0,
  className = "",
  y = 22,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
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
      style={{
        borderColor: "var(--border-strong)",
        color: "var(--fg-muted)",
        fontFamily: "var(--font-mono)",
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: "var(--accent)" }}
      />
      {children}
    </span>
  );
}

function PrimaryButton({
  children,
  href = "#",
  icon: Icon = ArrowRight,
  className = "",
}: {
  children: ReactNode;
  href?: string;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={
        "group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-semibold transition-transform duration-300 will-change-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 " +
        className
      }
      style={{
        backgroundColor: "var(--accent)",
        color: "var(--on-accent)",
        outlineColor: "var(--accent)",
      }}
    >
      {children}
      <Icon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
    </a>
  );
}

function GhostButton({
  children,
  href = "#",
  icon: Icon = Play,
}: {
  children: ReactNode;
  href?: string;
  icon?: LucideIcon;
}) {
  return (
    <a
      href={href}
      className="group inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3.5 text-[15px] font-semibold transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{
        borderColor: "var(--border-strong)",
        color: "var(--fg)",
        outlineColor: "var(--accent)",
      }}
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
      style={{
        backgroundColor: c.bg,
        color: c.fg,
        ["--tw-ring-color" as string]: "var(--surface)",
      }}
    >
      {label}
    </span>
  );
}

function Tag({ children }: { children: ReactNode }) {
  return (
    <span
      className="rounded-md px-2 py-0.5 text-[11px] font-semibold"
      style={{
        backgroundColor: "var(--accent-soft)",
        color: "var(--accent)",
        fontFamily: "var(--font-mono)",
      }}
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
        style={{ backgroundColor: "var(--fg)", color: "var(--bg)", fontFamily: "var(--font-display)" }}
      >
        S
      </span>
      {!compact && (
        <span
          className="text-[17px] font-bold tracking-tight"
          style={{ fontFamily: "var(--font-display)", color: "var(--fg)" }}
        >
          SONA
        </span>
      )}
    </a>
  );
}

function ThemeToggle({
  theme,
  onToggle,
}: {
  theme: ThemeName;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={theme === "dark" ? "Világos mód bekapcsolása" : "Sötét mód bekapcsolása"}
      className="relative flex h-9 w-9 items-center justify-center rounded-full border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{ borderColor: "var(--border-strong)", outlineColor: "var(--accent)" }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ opacity: 0, rotate: -60, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 60, scale: 0.6 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="flex items-center justify-center"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" style={{ color: "var(--fg)" }} />
          ) : (
            <Moon className="h-4 w-4" style={{ color: "var(--fg)" }} />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

const NAV_LINKS = [
  { href: "#product", label: "Termék" },
  { href: "#features", label: "Funkciók" },
  { href: "#connected", label: "Így kapcsolódik" },
  { href: "#audience", label: "Csapatoknak" },
];

function Nav({ theme, onToggle }: { theme: ThemeName; onToggle: () => void }) {
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

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle theme={theme} onToggle={onToggle} />
          <a
            href="/login"
            className="text-[14px] font-semibold transition-colors hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
            style={{ color: "var(--fg)", outlineColor: "var(--accent)" }}
          >
            Bejelentkezés
          </a>
          <a
            href="#cta"
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[14px] font-semibold transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ backgroundColor: "var(--accent)", color: "var(--on-accent)", outlineColor: "var(--accent)" }}
          >
            Ingyenes kezdés
          </a>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle theme={theme} onToggle={onToggle} />
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
                  href="#cta"
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
/*  Hero mock — a fake, live-feeling SONA app window                   */
/* ------------------------------------------------------------------ */

const SIDEBAR_ICONS: { icon: LucideIcon; active?: boolean; label: string }[] = [
  { icon: LayoutGrid, label: "Áttekintés" },
  { icon: ListChecks, label: "Feladatok", active: true },
  { icon: FolderKanban, label: "Projektek" },
  { icon: FileText, label: "Dokumentumok" },
  { icon: CalendarDays, label: "Naptár" },
  { icon: Clock, label: "Időkövetés" },
  { icon: Users, label: "Csapat" },
];

const BOARD: { title: string; cards: { name: string; tag: string; who: string; done?: boolean }[] }[] = [
  {
    title: "Hátralévő",
    cards: [
      { name: "Onboarding flow — v2 wireframe", tag: "Design", who: "AK" },
      { name: "API kulcs rotáció ütemezése", tag: "Backend", who: "PL" },
    ],
  },
  {
    title: "Folyamatban",
    cards: [
      { name: "Landing oldal — hero szekció", tag: "Marketing", who: "RM" },
      { name: "Time tracker mobil nézet", tag: "Mobil", who: "SV" },
      { name: "Q3 workspace audit", tag: "Ops", who: "AK" },
    ],
  },
  {
    title: "Kész",
    cards: [{ name: "Ügyfél workshop — jegyzetek", tag: "Docs", who: "PL", done: true }],
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
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ perspective: 1800 }}
      className="relative"
    >
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
        {/* window top bar */}
        <div
          className="flex items-center gap-4 border-b px-4 py-3 sm:px-5"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "var(--border-strong)" }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "var(--border-strong)" }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "var(--border-strong)" }} />
          </div>
          <div
            className="hidden items-center gap-1 rounded-lg p-1 sm:flex"
            style={{ backgroundColor: "var(--bg-alt)" }}
          >
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
          {/* sidebar */}
          <div
            className="hidden w-14 shrink-0 flex-col items-center gap-1 border-r py-4 sm:flex"
            style={{ borderColor: "var(--border)" }}
          >
            {SIDEBAR_ICONS.map(({ icon: Icon, active, label }) => (
              <div
                key={label}
                title={label}
                className="flex h-9 w-9 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: active ? "var(--accent-soft)" : "transparent",
                }}
              >
                <Icon className="h-4 w-4" style={{ color: active ? "var(--accent)" : "var(--fg-muted)" }} />
              </div>
            ))}
          </div>

          {/* board */}
          <div className="grid flex-1 grid-cols-1 gap-3 p-4 sm:grid-cols-3 sm:p-5">
            {BOARD.map((col) => (
              <div key={col.title} className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between px-0.5">
                  <span className="text-[12px] font-semibold" style={{ color: "var(--fg-muted)" }}>
                    {col.title}
                  </span>
                  <span className="text-[11px]" style={{ color: "var(--fg-muted)", fontFamily: "var(--font-mono)" }}>
                    {col.cards.length}
                  </span>
                </div>
                {col.cards.map((c) => (
                  <div
                    key={c.name}
                    className="rounded-xl border p-3"
                    style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-alt)" }}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <Tag>{c.tag}</Tag>
                      {c.done ? (
                        <CheckCircle2 className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
                      ) : (
                        <MoreHorizontal className="h-3.5 w-3.5" style={{ color: "var(--fg-muted)" }} />
                      )}
                    </div>
                    <p className="text-[13px] font-medium leading-snug" style={{ color: "var(--fg)" }}>
                      {c.name}
                    </p>
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

      {/* floating time-tracker chip */}
      <motion.div
        initial={reduce ? undefined : { opacity: 0, y: 16 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
        className="absolute -bottom-6 -left-3 flex items-center gap-3 rounded-2xl border px-4 py-3 sm:-left-8"
        style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow)" }}
      >
        <span className="relative flex h-2.5 w-2.5">
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
            style={{ backgroundColor: "var(--accent)" }}
          />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "var(--accent)" }} />
        </span>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--fg-muted)" }}>
            Aktív időzítő
          </p>
          <p className="text-[15px] font-bold" style={{ fontFamily: "var(--font-mono)", color: "var(--fg)" }}>
            02:14:08
          </p>
        </div>
        <div className="h-8 w-px" style={{ backgroundColor: "var(--border)" }} />
        <p className="text-[12px] font-medium" style={{ color: "var(--fg-muted)" }}>
          Landing oldal
        </p>
      </motion.div>

      {/* floating notification chip */}
      <motion.div
        initial={reduce ? undefined : { opacity: 0, y: -16 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.65, ease: EASE }}
        className="absolute -right-3 -top-6 hidden items-center gap-2.5 rounded-2xl border px-4 py-3 sm:-right-8 sm:flex"
        style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow)" }}
      >
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: "var(--accent-soft)" }}
        >
          <FileText className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
        </div>
        <div>
          <p className="text-[12px] font-semibold" style={{ color: "var(--fg)" }}>
            Dokumentum frissítve
          </p>
          <p className="text-[11px]" style={{ color: "var(--fg-muted)" }}>
            „Ügyfél brief — Q3” · 2 perce
          </p>
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
            <p
              className="mx-auto mt-6 max-w-[600px] text-balance text-[17px] leading-relaxed sm:text-[18px]"
              style={{ color: "var(--fg-muted)" }}
            >
              A SONA egyetlen összekapcsolt workspace-be gyűjti a projekteket,
              feladatokat, dokumentumokat, fájlokat, a naptárat és az
              időkövetést — hogy a csapatod ne tíz eszköz között ugráljon.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <PrimaryButton href="#cta">Ingyenes kezdés</PrimaryButton>
              <GhostButton href="#product">Megnézem, hogyan működik</GhostButton>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.28} y={36} className="relative mx-auto mt-20 max-w-[1080px] sm:mt-24">
          <HeroMock />
        </Reveal>

        <Reveal delay={0.4} className="mx-auto mt-24 max-w-[900px] sm:mt-28">
          <p
            className="text-center text-[12px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: "var(--fg-muted)" }}
          >
            Csapatok, amik már egy helyen dolgoznak
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {TRUST_LOGOS.map((name) => (
              <span
                key={name}
                className="text-[16px] font-bold tracking-tight opacity-50"
                style={{ fontFamily: "var(--font-display)", color: "var(--fg)" }}
              >
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
/*  Product showcase (tabs)                                            */
/* ------------------------------------------------------------------ */

type ShowcaseKey = "overview" | "tasks" | "projects" | "docs" | "time" | "calendar";

const SHOWCASE: {
  key: ShowcaseKey;
  label: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  bullets: string[];
}[] = [
  {
    key: "overview",
    label: "Áttekintés",
    icon: LayoutGrid,
    title: "Lásd az egész csapatot egy pillantásból",
    desc: "Egy irányítópult mutatja, min dolgozik a csapat, mi akadt el, és mi jön legközelebb — projektek, határidők és aktivitás egyben.",
    bullets: ["Élő csapataktivitás", "Blokkolt feladatok kiemelve", "Testreszabható widgetek"],
  },
  {
    key: "tasks",
    label: "Feladatok",
    icon: ListChecks,
    title: "A feladatok, ahogy tényleg dolgoztok",
    desc: "Tábla, lista vagy idővonal nézet — válaszd, ami a csapatodnak működik, és válts köztük egyetlen kattintással.",
    bullets: ["Tábla, lista és idővonal nézet", "Alfeladatok és függőségek", "Egyéni státuszok, címkék"],
  },
  {
    key: "projects",
    label: "Projektek",
    icon: FolderKanban,
    title: "Minden projekt egy átlátható térben",
    desc: "Célok, mérföldkövek és haladás egy helyen — mindenki tudja, hol tart a projekt, meeting nélkül is.",
    bullets: ["Mérföldkövek, célkitűzések", "Automatikus előrehaladás", "Projektsablonok"],
  },
  {
    key: "docs",
    label: "Dokumentumok",
    icon: FileText,
    title: "Dokumentumok, amik a munka mellett élnek",
    desc: "Írj specifikációt, hozz döntést, csatolj fájlt — közvetlenül a projekt kontextusában, külön eszköz nélkül.",
    bullets: ["Valós idejű közös szerkesztés", "Fájlok és linkek egy helyen", "Verziótörténet"],
  },
  {
    key: "time",
    label: "Időkövetés",
    icon: Clock,
    title: "Időkövetés, ami nem plusz meló",
    desc: "Indíts egy időzítőt a feladatból egy kattintással, és lásd azonnal, mennyi idő megy el projektenként, emberenként.",
    bullets: ["Egykattintásos időzítő", "Automatikus riportok", "Számlázható órák jelölése"],
  },
  {
    key: "calendar",
    label: "Naptár",
    icon: CalendarDays,
    title: "Naptár, ami tudja, mi történik a csapatban",
    desc: "Feladat-határidők, mérföldkövek és csapat-események egyetlen naptárban, amit bárki átlát.",
    bullets: ["Feladatok automatikusan a naptárban", "Csapat- és egyéni nézet", "Naptár-szinkronizálás"],
  },
];

function ShowcaseMock({ tab }: { tab: ShowcaseKey }) {
  if (tab === "tasks") {
    const rows = [
      { name: "Design system — komponens audit", who: "AK", status: "Folyamatban", done: false },
      { name: "Onboarding e-mail sorozat szövege", who: "RM", status: "Ellenőrzésre vár", done: false },
      { name: "Q3 időkövetés riport összeállítása", who: "PL", status: "Kész", done: true },
      { name: "Ügyfélportál — jogosultság mátrix", who: "SV", status: "Hátralévő", done: false },
    ];
    return (
      <div className="flex flex-col gap-2">
        {rows.map((r) => (
          <div
            key={r.name}
            className="flex items-center gap-3 rounded-xl border p-3"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-alt)" }}
          >
            {r.done ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: "var(--accent)" }} />
            ) : (
              <Circle className="h-4 w-4 shrink-0" style={{ color: "var(--fg-muted)" }} />
            )}
            <p
              className="flex-1 truncate text-[13px] font-medium"
              style={{ color: "var(--fg)", textDecoration: r.done ? "line-through" : "none", opacity: r.done ? 0.6 : 1 }}
            >
              {r.name}
            </p>
            <span className="hidden text-[11px] sm:inline" style={{ color: "var(--fg-muted)" }}>
              {r.status}
            </span>
            <Avatar label={r.who} />
          </div>
        ))}
      </div>
    );
  }

  if (tab === "projects") {
    const rows = [
      { name: "Ügyfélportál újratervezés", progress: 72, tag: "Design" },
      { name: "Belső API v2 migráció", progress: 41, tag: "Fejlesztés" },
      { name: "Q3 marketing kampány", progress: 90, tag: "Marketing" },
    ];
    return (
      <div className="flex flex-col gap-3">
        {rows.map((p) => (
          <div key={p.name} className="rounded-xl border p-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-alt)" }}>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold" style={{ color: "var(--fg)" }}>
                  {p.name}
                </p>
                <Tag>{p.tag}</Tag>
              </div>
              <span className="text-[13px] font-bold" style={{ fontFamily: "var(--font-mono)", color: "var(--fg)" }}>
                {p.progress}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: "var(--border)" }}>
              <div className="h-full rounded-full" style={{ width: `${p.progress}%`, backgroundColor: "var(--accent)" }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tab === "docs") {
    const docs = [
      { name: "Ügyfél brief — Q3 kampány", meta: "Szerkesztve most · RM, AK" },
      { name: "API dokumentáció v2", meta: "Frissítve 1 órája · PL" },
      { name: "Onboarding checklist", meta: "Frissítve tegnap · SV" },
    ];
    return (
      <div className="flex flex-col gap-2">
        {docs.map((d) => (
          <div
            key={d.name}
            className="flex items-center gap-3 rounded-xl border p-3"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-alt)" }}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--accent-soft)" }}>
              <FileText className="h-4 w-4" style={{ color: "var(--accent)" }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold" style={{ color: "var(--fg)" }}>
                {d.name}
              </p>
              <p className="truncate text-[11px]" style={{ color: "var(--fg-muted)" }}>
                {d.meta}
              </p>
            </div>
            <Link2 className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--fg-muted)" }} />
          </div>
        ))}
      </div>
    );
  }

  if (tab === "time") {
    const entries = [
      { name: "Landing oldal — hero szekció", project: "Marketing", time: "02:14:08", active: true },
      { name: "Sprint review előkészítés", project: "Fejlesztés", time: "00:48:32", active: false },
      { name: "Ügyfél workshop", project: "Ops", time: "01:05:00", active: false },
    ];
    return (
      <div className="flex flex-col gap-2">
        {entries.map((e) => (
          <div
            key={e.name}
            className="flex items-center gap-3 rounded-xl border p-3"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-alt)" }}
          >
            <span className="relative flex h-2 w-2 shrink-0">
              {e.active && (
                <span
                  className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                  style={{ backgroundColor: "var(--accent)" }}
                />
              )}
              <span
                className="relative inline-flex h-2 w-2 rounded-full"
                style={{ backgroundColor: e.active ? "var(--accent)" : "var(--border-strong)" }}
              />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium" style={{ color: "var(--fg)" }}>
                {e.name}
              </p>
              <p className="text-[11px]" style={{ color: "var(--fg-muted)" }}>
                {e.project}
              </p>
            </div>
            <span className="text-[13px] font-bold" style={{ fontFamily: "var(--font-mono)", color: "var(--fg)" }}>
              {e.time}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (tab === "calendar") {
    const days = ["H", "K", "Sz", "Cs", "P", "Szo", "V"];
    const marked = [3, 7, 12, 18, 21, 27];
    return (
      <div className="rounded-xl border p-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-alt)" }}>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[13px] font-semibold" style={{ color: "var(--fg)" }}>
            Augusztus
          </p>
          <CalendarDays className="h-4 w-4" style={{ color: "var(--fg-muted)" }} />
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {days.map((d) => (
            <span key={d} className="text-center text-[10px] font-semibold" style={{ color: "var(--fg-muted)" }}>
              {d}
            </span>
          ))}
          {Array.from({ length: 30 }, (_, i) => i + 1).map((n) => (
            <span
              key={n}
              className="flex aspect-square items-center justify-center rounded-md text-[11px] font-medium"
              style={{
                backgroundColor: marked.includes(n) ? "var(--accent-soft)" : "transparent",
                color: marked.includes(n) ? "var(--accent)" : "var(--fg-muted)",
              }}
            >
              {n}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // overview
  const stats = [
    { label: "Nyitott feladat", value: "24" },
    { label: "Kész ezen a héten", value: "12" },
    { label: "Aktív projekt", value: "6" },
  ];
  const activity = [
    { who: "AK", text: "lezárta: „Design system audit”" },
    { who: "RM", text: "megjegyzést fűzött a „Hero szekció” feladathoz" },
    { who: "PL", text: "új dokumentumot hozott létre: „API v2”" },
  ];
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border p-3.5" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-alt)" }}>
            <p className="text-[20px] font-bold" style={{ fontFamily: "var(--font-mono)", color: "var(--fg)" }}>
              {s.value}
            </p>
            <p className="mt-0.5 text-[11px]" style={{ color: "var(--fg-muted)" }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border p-3.5" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-alt)" }}>
        <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--fg-muted)" }}>
          Legutóbbi aktivitás
        </p>
        <div className="flex flex-col gap-2.5">
          {activity.map((a, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <Avatar label={a.who} />
              <p className="text-[12.5px]" style={{ color: "var(--fg-muted)" }}>
                <span style={{ color: "var(--fg)", fontWeight: 600 }}>{a.who}</span> {a.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductShowcase() {
  const [active, setActive] = useState<ShowcaseKey>("overview");
  const current = useMemo(() => SHOWCASE.find((s) => s.key === active)!, [active]);

  return (
    <section id="product" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <Reveal className="mx-auto max-w-[640px] text-center">
          <Eyebrow>Termék</Eyebrow>
          <h2
            className="mt-5 text-balance text-[30px] font-bold leading-[1.15] tracking-[-0.01em] sm:text-[38px]"
            style={{ fontFamily: "var(--font-display)", color: "var(--fg)" }}
          >
            Nem egy projektmenedzsment app. A csapatod teljes munkafolyamata.
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
            Minden nézet ugyanabból az adatból él — amit egy feladatnál látsz,
            az a dokumentumban, a naptárban és a riportban is ugyanaz.
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

        <div
          className="mt-10 grid gap-0 overflow-hidden rounded-3xl border lg:grid-cols-[0.85fr_1.15fr]"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)", boxShadow: "var(--shadow)" }}
        >
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
              <h3
                className="text-[22px] font-bold leading-tight sm:text-[26px]"
                style={{ fontFamily: "var(--font-display)", color: "var(--fg)" }}
              >
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
              <motion.div
                key={current.key}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
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

const AUDIENCE: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: Palette,
    title: "Kreatív ügynökségek",
    desc: "Ügyfélprojektek, kreatív anyagok és határidők egy helyen — brief-től a leadásig, ügyfelenként átlátva.",
  },
  {
    icon: Code2,
    title: "Szoftverfejlesztő cégek",
    desc: "Sprintek, feladatok és dokumentáció összekötve, hogy a fejlesztés ne szakadjon szét öt eszköz között.",
  },
  {
    icon: Building2,
    title: "Belső vállalati csapatok",
    desc: "Egy közös tér, ahol minden részleg ugyanúgy dolgozik, és ugyanott találja meg, amit keres.",
  },
  {
    icon: Rocket,
    title: "Startupok",
    desc: "Gyors iterációk, kevés eszköz, sok fókusz — minden, amire egy növekvő csapatnak szüksége van.",
  },
];

function Audience() {
  return (
    <section id="audience" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <Reveal className="mx-auto max-w-[600px] text-center">
          <Eyebrow>Kinek szól</Eyebrow>
          <h2
            className="mt-5 text-balance text-[30px] font-bold leading-[1.15] tracking-[-0.01em] sm:text-[38px]"
            style={{ fontFamily: "var(--font-display)", color: "var(--fg)" }}
          >
            Bármilyen csapatnak, aki egy helyen szeretne dolgozni
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {AUDIENCE.map((a, i) => (
            <Reveal key={a.title} delay={i * 0.08}>
              <div
                className="h-full rounded-2xl border p-6 transition-colors duration-300 hover:border-[var(--accent)]"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: "var(--accent-soft)" }}>
                  <a.icon className="h-5 w-5" style={{ color: "var(--accent)" }} />
                </div>
                <h3 className="text-[16px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--fg)" }}>
                  {a.title}
                </h3>
                <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                  {a.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Feature bento grid                                                  */
/* ------------------------------------------------------------------ */

function MiniKanban() {
  const cols = [
    ["Wireframe", "API terv"],
    ["Landing hero", "Riport", "Audit"],
    ["Onboarding"],
  ];
  return (
    <div className="grid grid-cols-3 gap-2">
      {cols.map((col, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          {col.map((c) => (
            <div
              key={c}
              className="truncate rounded-md border px-2 py-1.5 text-[10.5px] font-medium"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)", color: "var(--fg)" }}
            >
              {c}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function MiniDocs() {
  return (
    <div className="flex flex-col gap-1.5">
      {["Brief.doc", "API v2.doc", "Onboarding.doc"].map((d) => (
        <div key={d} className="flex items-center gap-2 rounded-md border px-2.5 py-1.5" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}>
          <FileText className="h-3 w-3" style={{ color: "var(--accent)" }} />
          <span className="text-[10.5px] font-medium" style={{ color: "var(--fg)" }}>{d}</span>
        </div>
      ))}
    </div>
  );
}

function MiniTimer() {
  return (
    <div className="flex items-center gap-2.5 rounded-md border px-3 py-2.5" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}>
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ backgroundColor: "var(--accent)" }} />
        <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: "var(--accent)" }} />
      </span>
      <span className="text-[13px] font-bold" style={{ fontFamily: "var(--font-mono)", color: "var(--fg)" }}>00:42:11</span>
    </div>
  );
}

function MiniCalendar() {
  const marked = [4, 9, 15, 22];
  return (
    <div className="grid grid-cols-7 gap-1">
      {Array.from({ length: 28 }, (_, i) => i + 1).map((n) => (
        <span
          key={n}
          className="flex aspect-square items-center justify-center rounded text-[9px] font-medium"
          style={{
            backgroundColor: marked.includes(n) ? "var(--accent-soft)" : "var(--surface)",
            color: marked.includes(n) ? "var(--accent)" : "var(--fg-muted)",
            border: `1px solid var(--border)`,
          }}
        >
          {n}
        </span>
      ))}
    </div>
  );
}

function MiniTeam() {
  const people = ["RM", "AK", "PL", "SV", "+4"];
  return (
    <div className="flex -space-x-2">
      {people.map((p) => (
        <span
          key={p}
          className="flex h-9 w-9 items-center justify-center rounded-full border-2 text-[11px] font-bold"
          style={{ borderColor: "var(--surface)", backgroundColor: "var(--accent-soft)", color: "var(--accent)" }}
        >
          {p}
        </span>
      ))}
    </div>
  );
}

function MiniRoles() {
  const roles = [
    { name: "Admin", n: 2 },
    { name: "Szerkesztő", n: 6 },
    { name: "Megtekintő", n: 3 },
  ];
  return (
    <div className="flex flex-col gap-1.5">
      {roles.map((r) => (
        <div key={r.name} className="flex items-center justify-between rounded-md border px-2.5 py-1.5" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}>
          <span className="text-[11px] font-semibold" style={{ color: "var(--fg)" }}>{r.name}</span>
          <span className="text-[10px]" style={{ color: "var(--fg-muted)", fontFamily: "var(--font-mono)" }}>{r.n} fő</span>
        </div>
      ))}
    </div>
  );
}

type FeatureItem = {
  icon: LucideIcon;
  title: string;
  desc: string;
  big?: boolean;
  mock: ReactNode;
};

function FeatureGrid() {
  const features: FeatureItem[] = [
    {
      icon: ListChecks,
      title: "Projektek és feladatok",
      desc: "Tervezz, ossz szét, kövess nyomon — egy struktúrában, ami követi, ahogy a csapatod gondolkodik.",
      big: true,
      mock: <MiniKanban />,
    },
    {
      icon: FileText,
      title: "Dokumentumok és fájlok",
      desc: "Írjatok és tároljatok mindent a projekt kontextusában, kereshetően.",
      mock: <MiniDocs />,
    },
    {
      icon: Clock,
      title: "Beépített időkövetés",
      desc: "Időzítő minden feladatnál, jelentés minden projekthez.",
      mock: <MiniTimer />,
    },
    {
      icon: CalendarDays,
      title: "Naptár és tervezés",
      desc: "Lásd előre, mi jön — csapatszinten és egyénileg is.",
      mock: <MiniCalendar />,
    },
    {
      icon: Users,
      title: "Csapatkezelés",
      desc: "Hívj meg embereket, szervezz csapatokat, oszd meg a terhelést.",
      mock: <MiniTeam />,
    },
    {
      icon: ShieldCheck,
      title: "Jogosultságok és szerepkörök",
      desc: "Szabályozd, ki mit lát és mit szerkeszthet, projektenként.",
      mock: <MiniRoles />,
    },
  ];

  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <Reveal className="mx-auto max-w-[600px] text-center">
          <Eyebrow>Funkciók</Eyebrow>
          <h2
            className="mt-5 text-balance text-[30px] font-bold leading-[1.15] tracking-[-0.01em] sm:text-[38px]"
            style={{ fontFamily: "var(--font-display)", color: "var(--fg)" }}
          >
            Minden eszköz, amit külön appokban kerestél
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal
              key={f.title}
              delay={(i % 3) * 0.08}
              className={f.big ? "lg:col-span-2" : ""}
            >
              <div
                className="flex h-full flex-col justify-between gap-6 rounded-2xl border p-7 transition-colors duration-300 hover:border-[var(--accent)] sm:p-8"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}
              >
                <div>
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--accent-soft)" }}>
                    <f.icon className="h-4.5 w-4.5" style={{ color: "var(--accent)" }} />
                  </div>
                  <h3 className="text-[17px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--fg)" }}>
                    {f.title}
                  </h3>
                  <p className="mt-2 max-w-[420px] text-[13.5px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                    {f.desc}
                  </p>
                </div>
                <div
                  className="rounded-xl border p-4"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-alt)" }}
                >
                  {f.mock}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Everything connected — signature diagram                            */
/* ------------------------------------------------------------------ */

type NodeDef = {
  key: string;
  label: string;
  icon: LucideIcon;
  x: number;
  y: number;
  path: string;
};

const CENTER = { x: 500, y: 300 };

const NODES: NodeDef[] = [
  { key: "tasks", label: "Feladatok", icon: ListChecks, x: 500, y: 80, path: "M500,300 C 560,225 560,150 500,80" },
  { key: "docs", label: "Dokumentumok", icon: FileText, x: 709, y: 232, path: "M500,300 C 600,288 655,258 709,232" },
  { key: "files", label: "Fájlok", icon: Paperclip, x: 629, y: 478, path: "M500,300 C 560,362 600,428 629,478" },
  { key: "time", label: "Időkövetés", icon: Clock, x: 371, y: 478, path: "M500,300 C 440,362 400,428 371,478" },
  { key: "team", label: "Csapat", icon: Users, x: 291, y: 232, path: "M500,300 C 400,288 345,258 291,232" },
];

function ConnectedDiagram() {
  const reduce = useReducedMotion();

  return (
    <div className="relative mx-auto aspect-[1000/620] w-full max-w-[900px]">
      <svg viewBox="0 0 1000 620" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        {NODES.map((n, i) => (
          <motion.path
            key={n.key}
            d={n.path}
            fill="none"
            stroke="rgba(244,242,240,0.28)"
            strokeWidth={1.5}
            initial={reduce ? undefined : { pathLength: 0, opacity: 0 }}
            whileInView={reduce ? undefined : { pathLength: 1, opacity: 1 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 1.1, delay: 0.15 + i * 0.12, ease: EASE }}
          />
        ))}
      </svg>

      {/* traveling pulses along each connector */}
      {!reduce &&
        NODES.map((n, i) => (
          <motion.span
            key={`pulse-${n.key}`}
            className="absolute h-1.5 w-1.5 rounded-full"
            style={{
              backgroundColor: "#BF2234",
              boxShadow: "0 0 10px 2px rgba(191,34,52,0.7)",
              offsetPath: `path('${n.path}')`,
              offsetRotate: "0deg",
              left: 0,
              top: 0,
              marginLeft: -3,
              marginTop: -3,
            }}
            animate={{ offsetDistance: ["0%", "100%"] }}
            transition={{ duration: 3.2 + i * 0.35, repeat: Infinity, ease: "linear", delay: 1 + i * 0.3 }}
          />
        ))}

      {/* center node */}
      <div
        className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
        style={{ left: `${(CENTER.x / 1000) * 100}%`, top: `${(CENTER.y / 620) * 100}%` }}
      >
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl sm:h-24 sm:w-24" style={{ backgroundColor: "#BF2234" }}>
          {!reduce && (
            <motion.span
              className="absolute inset-0 rounded-2xl"
              style={{ backgroundColor: "#BF2234" }}
              animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.35, 1] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
          <FolderKanban className="relative h-8 w-8 sm:h-9 sm:w-9" style={{ color: "#F4F2F0" }} />
        </div>
        <span className="mt-3 text-[13px] font-bold sm:text-[14px]" style={{ color: "#F4F2F0", fontFamily: "var(--font-display)" }}>
          Projekt
        </span>
      </div>

      {/* satellite nodes */}
      {NODES.map((n, i) => (
        <motion.div
          key={n.key}
          className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2.5"
          style={{ left: `${(n.x / 1000) * 100}%`, top: `${(n.y / 620) * 100}%` }}
          initial={reduce ? undefined : { opacity: 0, scale: 0.7 }}
          whileInView={reduce ? undefined : { opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.5, delay: 0.5 + i * 0.12, ease: EASE }}
        >
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full border sm:h-16 sm:w-16"
            style={{ backgroundColor: "#141414", borderColor: "rgba(244,242,240,0.14)" }}
          >
            <n.icon className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: "#F4F2F0" }} />
          </div>
          <span className="whitespace-nowrap text-[12px] font-semibold sm:text-[13px]" style={{ color: "rgba(244,242,240,0.75)" }}>
            {n.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function Connected() {
  return (
    <section id="connected" className="relative overflow-hidden py-24 sm:py-32" style={{ backgroundColor: "#0A0A0A" }}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage: "radial-gradient(rgba(244,242,240,0.08) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 45%, black 40%, transparent 85%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 45%, black 40%, transparent 85%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-[120px]"
        style={{ backgroundColor: "rgba(191,34,52,0.35)" }}
      />

      <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8">
        <Reveal className="mx-auto max-w-[620px] text-center">
          <span
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]"
            style={{ borderColor: "rgba(244,242,240,0.18)", color: "rgba(244,242,240,0.65)", fontFamily: "var(--font-mono)" }}
          >
            <Sparkles className="h-3 w-3" style={{ color: "#BF2234" }} />
            Így kapcsolódik
          </span>
          <h2
            className="mt-5 text-balance text-[30px] font-bold leading-[1.15] tracking-[-0.01em] sm:text-[38px]"
            style={{ fontFamily: "var(--font-display)", color: "#F4F2F0" }}
          >
            Egy projekt. Minden, ami hozzá tartozik.
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed" style={{ color: "rgba(244,242,240,0.6)" }}>
            A feladatok, dokumentumok, fájlok, az időkövetés és a csapat nem
            külön eszközökben élnek — ugyanannak a projektnek a részei.
          </p>
        </Reveal>

        <Reveal delay={0.12} className="mt-16 sm:mt-20">
          <ConnectedDiagram />
        </Reveal>
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
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.55] blur-[110px]"
        style={{ backgroundColor: "var(--accent-soft)" }}
      />
      <div className="relative mx-auto max-w-[720px] px-5 text-center sm:px-8">
        <Reveal>
          <h2
            className="text-balance text-[32px] font-bold leading-[1.12] tracking-[-0.01em] sm:text-[46px]"
            style={{ fontFamily: "var(--font-display)", color: "var(--fg)" }}
          >
            Készen állsz, hogy egy helyen dolgozz?
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mx-auto mt-4 max-w-[420px] text-[15.5px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
            Hozd létre a workspace-edet két percen belül. Nincs szükség
            bankkártyára.
          </p>
        </Reveal>
        <Reveal delay={0.16}>
          <div className="mt-8 flex justify-center">
            <PrimaryButton href="#top">Ingyenes kezdés</PrimaryButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer                                                              */
/* ------------------------------------------------------------------ */

const FOOTER_COLS: { title: string; links: string[] }[] = [
  { title: "Termék", links: ["Áttekintés", "Feladatok", "Dokumentumok", "Naptár", "Időkövetés"] },
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
              <p className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: "var(--fg-muted)" }}>
                {col.title}
              </p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-[13.5px] font-medium transition-colors hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                      style={{ color: "var(--fg)", outlineColor: "var(--accent)" }}
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="mt-14 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="text-[12.5px]" style={{ color: "var(--fg-muted)" }}>
            © {new Date().getFullYear()} SONA Workspace. Minden jog fenntartva.
          </p>
          <div className="flex items-center gap-5">
            {["X", "LinkedIn", "GitHub"].map((s) => (
              <a
                key={s}
                href="#"
                className="inline-flex items-center gap-1 text-[12.5px] font-medium transition-colors hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ color: "var(--fg-muted)", outlineColor: "var(--accent)" }}
              >
                {s}
                <ArrowUpRight className="h-3 w-3" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function Page() {
  const [theme, setTheme] = useState<ThemeName>("dark");
  const t = THEME[theme];

  return (
    <div
      className={`${display.variable} ${body.variable} ${mono.variable} min-h-screen antialiased`}
      style={{
        ...themeVars(t),
        backgroundColor: "var(--bg)",
        color: "var(--fg)",
        fontFamily: "var(--font-body)",
      }}
    >
      <Nav theme={theme} onToggle={() => setTheme((v) => (v === "dark" ? "light" : "dark"))} />
      <main>
        <Hero />
        <ProductShowcase />
        <Audience />
        <FeatureGrid />
        <Connected />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}