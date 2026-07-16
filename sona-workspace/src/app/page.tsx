"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { Fraunces, Inter } from "next/font/google";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  FileText,
  FolderOpen,
  CalendarDays,
  Clock,
  Users,
  Layers,
  Zap,
  Eye,
  FileStack,
  Timer,
  Sparkles,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  ArrowRight,
  Play,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Fonts                                                                      */
/* -------------------------------------------------------------------------- */

const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

/* -------------------------------------------------------------------------- */
/*  Theme                                                                      */
/* -------------------------------------------------------------------------- */

type Theme = "light" | "dark";
const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "light",
  toggle: () => {},
});
const useTheme = () => useContext(ThemeContext);

const tokens = {
  light: {
    bg: "#F4F2F0",
    bgAlt: "#EDEAE7",
    surface: "#FFFFFF",
    text: "#141414",
    textSoft: "#6B6664",
    border: "rgba(20,20,20,0.09)",
    primary: "#BF2234",
    primarySoft: "rgba(191,34,52,0.08)",
  },
  dark: {
    bg: "#0A0A0A",
    bgAlt: "#141414",
    surface: "#1A1A1A",
    text: "#F4F2F0",
    textSoft: "#9E9A98",
    border: "rgba(244,242,240,0.09)",
    primary: "#D9424F",
    primarySoft: "rgba(217,66,79,0.12)",
  },
};

/* -------------------------------------------------------------------------- */
/*  Shared motion presets                                                      */
/* -------------------------------------------------------------------------- */

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const Reveal = ({
  children,
  className,
  variants = fadeUp,
}: {
  children: React.ReactNode;
  className?: string;
  variants?: any;
}) => (
  <motion.div
    className={className}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, margin: "-80px" }}
    variants={variants}
  >
    {children}
  </motion.div>
);

/* -------------------------------------------------------------------------- */
/*  Logo mark                                                                  */
/* -------------------------------------------------------------------------- */

const Logo = ({ className = "" }: { className?: string }) => {
  const { theme } = useTheme();
  const t = tokens[theme];
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <rect width="26" height="26" rx="7" fill={t.primary} />
        <path
          d="M8 17.5C8 15 10 14 13 13C16 12 18 11 18 8.5"
          stroke={t.bg}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <circle cx="8" cy="17.5" r="1.4" fill={t.bg} />
        <circle cx="18" cy="8.5" r="1.4" fill={t.bg} />
      </svg>
      <span
        className="text-[1.05rem] font-semibold tracking-tight"
        style={{ color: t.text, fontFamily: "var(--font-body)" }}
      >
        SONA
      </span>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Navbar                                                                     */
/* -------------------------------------------------------------------------- */

const NAV_LINKS = [
  { label: "Funkciók", href: "#funkciok" },
  { label: "Árazás", href: "#arazas" },
  { label: "GYIK", href: "#gyik" },
];

const Navbar = () => {
  const { theme, toggle } = useTheme();
  const t = tokens[theme];
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 transition-colors duration-300"
      style={{
        backdropFilter: scrolled ? "blur(14px)" : "none",
        backgroundColor: scrolled ? `${t.bg}CC` : "transparent",
        borderBottom: `1px solid ${scrolled ? t.border : "transparent"}`,
      }}
    >
      <nav className="mx-auto max-w-7xl px-6 lg:px-10 h-16 flex items-center justify-between">
        <a href="#top" aria-label="SONA főoldal">
          <Logo />
        </a>

        <div className="hidden md:flex items-center gap-9">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[0.92rem] font-medium transition-opacity hover:opacity-70"
              style={{ color: t.text, fontFamily: "var(--font-body)" }}
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggle}
            aria-label="Téma váltása"
            className="w-9 h-9 grid place-items-center rounded-full transition-colors"
            style={{ color: t.textSoft, border: `1px solid ${t.border}` }}
          >
            {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
          </button>
          <a
            href="#bejelentkezes"
            className="text-[0.92rem] font-medium px-3 py-2 transition-opacity hover:opacity-70"
            style={{ color: t.text, fontFamily: "var(--font-body)" }}
          >
            Bejelentkezés
          </a>
          <a
            href="#regisztracio"
            className="text-[0.92rem] font-semibold px-4 py-2.5 rounded-full transition-transform hover:scale-[1.03] active:scale-[0.98]"
            style={{ backgroundColor: t.primary, color: "#F4F2F0", fontFamily: "var(--font-body)" }}
          >
            Regisztráció
          </a>
        </div>

        <button
          className="md:hidden w-9 h-9 grid place-items-center"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menü"
          style={{ color: t.text }}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="md:hidden overflow-hidden"
            style={{ backgroundColor: t.bg, borderTop: `1px solid ${t.border}` }}
          >
            <div className="px-6 py-6 flex flex-col gap-5">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-[0.98rem] font-medium"
                  style={{ color: t.text, fontFamily: "var(--font-body)" }}
                >
                  {l.label}
                </a>
              ))}
              <div className="h-px w-full" style={{ backgroundColor: t.border }} />
              <a href="#bejelentkezes" className="text-[0.98rem] font-medium" style={{ color: t.text }}>
                Bejelentkezés
              </a>
              <a
                href="#regisztracio"
                className="text-center text-[0.95rem] font-semibold px-4 py-3 rounded-full"
                style={{ backgroundColor: t.primary, color: "#F4F2F0" }}
              >
                Regisztráció
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

/* -------------------------------------------------------------------------- */
/*  Dashboard mockup (signature visual)                                        */
/* -------------------------------------------------------------------------- */

const DashboardMockup = () => {
  const { theme } = useTheme();
  const t = tokens[theme];

  const rows = [
    { w: "78%", tone: t.primary },
    { w: "52%", tone: t.textSoft },
    { w: "64%", tone: t.textSoft },
  ];

  return (
    <div className="relative">
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="rounded-2xl overflow-hidden shadow-2xl"
        style={{
          border: `1px solid ${t.border}`,
          backgroundColor: t.surface,
          boxShadow:
            theme === "light"
              ? "0 40px 80px -30px rgba(20,20,20,0.25)"
              : "0 40px 80px -30px rgba(0,0,0,0.6)",
        }}
      >
        {/* window bar */}
        <div
          className="flex items-center gap-1.5 px-4 py-3"
          style={{ borderBottom: `1px solid ${t.border}` }}
        >
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.primary }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.textSoft, opacity: 0.5 }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.textSoft, opacity: 0.3 }} />
        </div>

        <div className="flex">
          {/* sidebar */}
          <div
            className="hidden sm:flex w-[110px] shrink-0 flex-col gap-3 p-4"
            style={{ borderRight: `1px solid ${t.border}` }}
          >
            {[LayoutDashboard, CheckSquare, FolderKanban, FileText, Clock].map((Icon, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5"
                style={{ backgroundColor: i === 0 ? t.primarySoft : "transparent" }}
              >
                <Icon size={13} color={i === 0 ? t.primary : t.textSoft} />
                <span
                  className="h-1.5 rounded-full flex-1"
                  style={{ backgroundColor: t.textSoft, opacity: i === 0 ? 0.35 : 0.2 }}
                />
              </div>
            ))}
          </div>

          {/* main */}
          <div className="flex-1 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-3 w-28 rounded-full" style={{ backgroundColor: t.textSoft, opacity: 0.3 }} />
              <div className="h-6 w-16 rounded-full" style={{ backgroundColor: t.primary }} />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-xl p-3 space-y-2"
                  style={{ backgroundColor: t.bgAlt, border: `1px solid ${t.border}` }}
                >
                  <div className="h-2 w-10 rounded-full" style={{ backgroundColor: t.textSoft, opacity: 0.3 }} />
                  <div className="h-4 w-14 rounded-md" style={{ backgroundColor: i === 1 ? t.primary : t.textSoft, opacity: i === 1 ? 1 : 0.25 }} />
                </div>
              ))}
            </div>

            <div
              className="rounded-xl p-4 space-y-3"
              style={{ backgroundColor: t.bgAlt, border: `1px solid ${t.border}` }}
            >
              {rows.map((r, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="h-2 rounded-full" style={{ width: r.w, backgroundColor: r.tone, opacity: r.tone === t.textSoft ? 0.25 : 1 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* floating chip */}
      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        className="hidden sm:flex absolute -left-8 bottom-10 items-center gap-2 rounded-xl px-3.5 py-2.5 shadow-xl"
        style={{ backgroundColor: t.surface, border: `1px solid ${t.border}` }}
      >
        <Timer size={14} color={t.primary} />
        <span className="text-xs font-medium" style={{ color: t.text, fontFamily: "var(--font-body)" }}>
          3ó 42p ma
        </span>
      </motion.div>

      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        className="hidden sm:flex absolute -right-6 -top-6 items-center gap-2 rounded-xl px-3.5 py-2.5 shadow-xl"
        style={{ backgroundColor: t.surface, border: `1px solid ${t.border}` }}
      >
        <CheckSquare size={14} color={t.primary} />
        <span className="text-xs font-medium" style={{ color: t.text, fontFamily: "var(--font-body)" }}>
          Feladat kész
        </span>
      </motion.div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Hero                                                                       */
/* -------------------------------------------------------------------------- */

const Hero = () => {
  const { theme } = useTheme();
  const t = tokens[theme];

  return (
    <section id="top" className="relative pt-36 pb-24 lg:pt-44 lg:pb-32 overflow-hidden">
      {/* signature red thread */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-full w-px opacity-[0.15]"
        style={{ backgroundColor: t.primary }}
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-10 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <Reveal>
            <span
              className="inline-flex items-center gap-2 text-xs font-medium tracking-wide uppercase px-3 py-1.5 rounded-full"
              style={{ color: t.primary, backgroundColor: t.primarySoft, fontFamily: "var(--font-body)" }}
            >
              <Sparkles size={12} /> Új generációs workspace
            </span>
          </Reveal>

          <Reveal className="mt-6">
            <h1
              className="text-[2.6rem] sm:text-[3.4rem] lg:text-[3.9rem] leading-[1.05] tracking-tight"
              style={{ color: t.text, fontFamily: "var(--font-display)", fontWeight: 500 }}
            >
              Egy helyen minden,
              <br />
              ami a csapatodat{" "}
              <span style={{ color: t.primary, fontStyle: "italic" }}>előre viszi.</span>
            </h1>
          </Reveal>

          <Reveal className="mt-6">
            <p
              className="text-[1.05rem] leading-relaxed max-w-md"
              style={{ color: t.textSoft, fontFamily: "var(--font-body)" }}
            >
              A SONA Workspace összeköti a feladatokat, projekteket, dokumentumokat
              és az időkövetést egyetlen letisztult felületen — váltogatás nélkül.
            </p>
          </Reveal>

          <Reveal className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#regisztracio"
              className="group inline-flex items-center gap-2 text-[0.95rem] font-semibold px-6 py-3.5 rounded-full transition-transform hover:scale-[1.03] active:scale-[0.98]"
              style={{ backgroundColor: t.primary, color: "#F4F2F0", fontFamily: "var(--font-body)" }}
            >
              Ingyenes kipróbálás
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#bemutato"
              className="inline-flex items-center gap-2 text-[0.95rem] font-semibold px-6 py-3.5 rounded-full transition-colors"
              style={{ color: t.text, border: `1px solid ${t.border}` }}
            >
              <Play size={14} /> Demo megtekintése
            </a>
          </Reveal>

          <Reveal className="mt-10 flex items-center gap-3">
            <span className="text-xs" style={{ color: t.textSoft, fontFamily: "var(--font-body)" }}>
              Bankkártya nélkül · 14 napos ingyenes próba
            </span>
          </Reveal>
        </div>

        <Reveal variants={{ hidden: { opacity: 0, x: 40 }, show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } } }}>
          <DashboardMockup />
        </Reveal>
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/*  Trusted by                                                                 */
/* -------------------------------------------------------------------------- */

const LOGOS = ["NORDLINE", "VERAGROUP", "ATLASWORKS", "KAIRO STUDIO", "HELIX & CO", "MERIDIAN"];

const TrustedBy = () => {
  const { theme } = useTheme();
  const t = tokens[theme];
  return (
    <section className="py-14" style={{ borderTop: `1px solid ${t.border}`, borderBottom: `1px solid ${t.border}` }}>
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <p className="text-center text-xs tracking-wide uppercase mb-9" style={{ color: t.textSoft, fontFamily: "var(--font-body)" }}>
            Csapatok, akik már SONA-val dolgoznak
          </p>
        </Reveal>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={stagger}
          className="flex flex-wrap justify-center gap-x-12 gap-y-6"
        >
          {LOGOS.map((l) => (
            <motion.span
              key={l}
              variants={fadeUp}
              className="text-[1.05rem] font-semibold tracking-wide opacity-40"
              style={{ color: t.text, fontFamily: "var(--font-display)" }}
            >
              {l}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/*  Features                                                                   */
/* -------------------------------------------------------------------------- */

const FEATURES = [
  { icon: LayoutDashboard, title: "Áttekintés", desc: "Lásd át egy pillantás alatt, hol tart a csapatod." },
  { icon: CheckSquare, title: "Feladatok", desc: "Rendszerezd a teendőket listákban, táblákon vagy naptárban." },
  { icon: FolderKanban, title: "Projektek", desc: "Kövesd a projektek állapotát a tervezéstől a lezárásig." },
  { icon: FileText, title: "Dokumentumok", desc: "Írj, szerkessz és oszd meg a tudásbázisod egy helyen." },
  { icon: FolderOpen, title: "Fájlok", desc: "Tárold és rendszerezd a csapat összes fájlját biztonságosan." },
  { icon: CalendarDays, title: "Naptár", desc: "Ütemezd az eseményeket és a határidőket vizuálisan." },
  { icon: Clock, title: "Időkövetés", desc: "Mérd a ráfordított időt projektenként és feladatonként." },
  { icon: Users, title: "Csapat", desc: "Kezeld a szerepköröket és a csapat együttműködését." },
];

const Features = () => {
  const { theme } = useTheme();
  const t = tokens[theme];
  return (
    <section id="funkciok" className="py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal className="max-w-xl mb-16">
          <span className="text-xs font-medium tracking-wide uppercase" style={{ color: t.primary, fontFamily: "var(--font-body)" }}>
            Funkciók
          </span>
          <h2 className="mt-4 text-[2rem] lg:text-[2.6rem] leading-[1.1] tracking-tight" style={{ color: t.text, fontFamily: "var(--font-display)", fontWeight: 500 }}>
            Minden modul, amire egy modern csapatnak szüksége van.
          </h2>
        </Reveal>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl overflow-hidden"
          style={{ backgroundColor: t.border }}
        >
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              whileHover={{ y: -3 }}
              className="p-7 transition-colors"
              style={{ backgroundColor: t.bg }}
            >
              <div
                className="w-10 h-10 rounded-xl grid place-items-center mb-5"
                style={{ backgroundColor: t.primarySoft }}
              >
                <Icon size={18} color={t.primary} />
              </div>
              <h3 className="text-[1.02rem] font-semibold mb-1.5" style={{ color: t.text, fontFamily: "var(--font-body)" }}>
                {title}
              </h3>
              <p className="text-[0.87rem] leading-relaxed" style={{ color: t.textSoft, fontFamily: "var(--font-body)" }}>
                {desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/*  Product showcase                                                          */
/* -------------------------------------------------------------------------- */

const Showcase = () => {
  const { theme } = useTheme();
  const t = tokens[theme];
  const points = [
    "Táblák és listák a feladatokhoz",
    "Strukturált dokumentációs tér a tudásnak",
    "Beépített időmérés minden feladathoz",
  ];

  return (
    <section id="bemutato" className="py-28 lg:py-36" style={{ backgroundColor: t.bgAlt }}>
      <div className="mx-auto max-w-7xl px-6 lg:px-10 grid lg:grid-cols-2 gap-16 items-center">
        <Reveal>
          <span className="text-xs font-medium tracking-wide uppercase" style={{ color: t.primary, fontFamily: "var(--font-body)" }}>
            Egy rendszer
          </span>
          <h2 className="mt-4 text-[2rem] lg:text-[2.6rem] leading-[1.1] tracking-tight" style={{ color: t.text, fontFamily: "var(--font-display)", fontWeight: 500 }}>
            Egy rendszer, minden munkafolyamathoz.
          </h2>
          <p className="mt-5 text-[1rem] leading-relaxed max-w-md" style={{ color: t.textSoft, fontFamily: "var(--font-body)" }}>
            A SONA egyetlen felületen egyesíti a projektmenedzsmentet, a jegyzetelést
            és az időkövetést — nincs több váltogatás alkalmazások között, nincs
            elveszett kontextus.
          </p>
          <ul className="mt-8 space-y-4">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: t.primary }} />
                <span className="text-[0.95rem]" style={{ color: t.text, fontFamily: "var(--font-body)" }}>
                  {p}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal variants={{ hidden: { opacity: 0, x: 40 }, show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } }}>
          <div
            className="rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] p-6 flex flex-col gap-4"
            style={{ backgroundColor: t.surface, border: `1px solid ${t.border}` }}
          >
            <div className="flex gap-3">
              {["Terv", "Folyamatban", "Kész"].map((col, ci) => (
                <div key={col} className="flex-1 rounded-xl p-3 space-y-2.5" style={{ backgroundColor: t.bgAlt }}>
                  <span className="text-[0.7rem] font-medium" style={{ color: t.textSoft, fontFamily: "var(--font-body)" }}>
                    {col}
                  </span>
                  {[...Array(ci === 1 ? 3 : 2)].map((_, i) => (
                    <div
                      key={i}
                      className="rounded-lg p-2.5 space-y-1.5"
                      style={{ backgroundColor: t.surface, border: `1px solid ${t.border}` }}
                    >
                      <div className="h-1.5 w-3/4 rounded-full" style={{ backgroundColor: t.textSoft, opacity: 0.25 }} />
                      <div className="h-1.5 w-1/2 rounded-full" style={{ backgroundColor: ci === 1 && i === 0 ? t.primary : t.textSoft, opacity: ci === 1 && i === 0 ? 1 : 0.25 }} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="flex-1 rounded-xl p-4 space-y-2" style={{ backgroundColor: t.bgAlt }}>
              <div className="h-2 w-1/3 rounded-full" style={{ backgroundColor: t.textSoft, opacity: 0.3 }} />
              <div className="h-2 w-full rounded-full" style={{ backgroundColor: t.textSoft, opacity: 0.15 }} />
              <div className="h-2 w-5/6 rounded-full" style={{ backgroundColor: t.textSoft, opacity: 0.15 }} />
              <div className="h-2 w-2/3 rounded-full" style={{ backgroundColor: t.textSoft, opacity: 0.15 }} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/*  Why SONA                                                                   */
/* -------------------------------------------------------------------------- */

const WHY = [
  { icon: Layers, title: "Minden egy helyen", desc: "Nincs több szétszórt eszköz, nincs elveszett információ." },
  { icon: Zap, title: "Gyorsabb együttműködés", desc: "A csapat egyszerre lát, egyszerre dolgozik, egyszerre halad." },
  { icon: Eye, title: "Átlátható projektek", desc: "Minden státusz és határidő valós időben látható." },
  { icon: FileStack, title: "Dokumentáció és feladatkezelés együtt", desc: "A tudás és a teendők ugyanabban a térben élnek." },
  { icon: Timer, title: "Beépített időkövetés", desc: "Pontos ráfordítási adatok külön eszköz nélkül." },
  { icon: Sparkles, title: "Modern Workspace élmény", desc: "Gyors, letisztult felület, amit valóban élvezetes használni." },
];

const WhySona = () => {
  const { theme } = useTheme();
  const t = tokens[theme];
  return (
    <section className="py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal className="max-w-xl mb-16">
          <span className="text-xs font-medium tracking-wide uppercase" style={{ color: t.primary, fontFamily: "var(--font-body)" }}>
            Miért a SONA?
          </span>
          <h2 className="mt-4 text-[2rem] lg:text-[2.6rem] leading-[1.1] tracking-tight" style={{ color: t.text, fontFamily: "var(--font-display)", fontWeight: 500 }}>
            Épp annyi eszköz, amennyi tényleg kell.
          </h2>
        </Reveal>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {WHY.map(({ icon: Icon, title, desc }) => (
            <motion.div key={title} variants={fadeUp}>
              <Icon size={20} color={t.primary} />
              <h3 className="mt-4 text-[1.02rem] font-semibold" style={{ color: t.text, fontFamily: "var(--font-body)" }}>
                {title}
              </h3>
              <p className="mt-1.5 text-[0.87rem] leading-relaxed" style={{ color: t.textSoft, fontFamily: "var(--font-body)" }}>
                {desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/*  CTA banner                                                                 */
/* -------------------------------------------------------------------------- */

const CTABanner = () => {
  const { theme } = useTheme();
  const t = tokens[theme];
  return (
    <section className="py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <div
            className="relative overflow-hidden rounded-3xl px-8 py-16 lg:py-20 text-center"
            style={{ backgroundColor: t.primary }}
          >
            <div
              className="pointer-events-none absolute -left-20 -top-20 w-72 h-72 rounded-full opacity-20"
              style={{ backgroundColor: t.bg }}
            />
            <div
              className="pointer-events-none absolute -right-16 -bottom-24 w-80 h-80 rounded-full opacity-10"
              style={{ backgroundColor: t.bg }}
            />
            <h2
              className="relative text-[2rem] lg:text-[2.8rem] leading-[1.1] tracking-tight"
              style={{ color: "#F4F2F0", fontFamily: "var(--font-display)", fontWeight: 500 }}
            >
              Készen állsz a váltásra?
            </h2>
            <p className="relative mt-4 text-[1rem]" style={{ color: "#F4F2F0", opacity: 0.85, fontFamily: "var(--font-body)" }}>
              Próbáld ki ingyen — nincs szükség bankkártyára.
            </p>
            <a
              href="#regisztracio"
              className="relative inline-flex mt-9 items-center gap-2 text-[0.95rem] font-semibold px-7 py-3.5 rounded-full transition-transform hover:scale-[1.03] active:scale-[0.98]"
              style={{ backgroundColor: "#F4F2F0", color: t.primary, fontFamily: "var(--font-body)" }}
            >
              Ingyenes fiók létrehozása <ArrowRight size={16} />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/*  FAQ                                                                        */
/* -------------------------------------------------------------------------- */

const FAQS = [
  { q: "Kell-e bankkártya az ingyenes próbához?", a: "Nem, 14 napig teljesen ingyen kipróbálhatod a SONA-t, bankkártya megadása nélkül." },
  { q: "Migrálhatom az adataimat más eszközökből?", a: "Igen, importálhatod a meglévő projektjeidet és dokumentumaidat CSV fájlból vagy natív integrációk segítségével." },
  { q: "Mekkora csapatokhoz ajánlott a SONA?", a: "A SONA két fős csapatoktól akár több száz fős szervezetekig gond nélkül skálázódik." },
  { q: "Van mobilalkalmazás?", a: "Igen, iOS-en és Androidon is elérhető az alkalmazásunk, a webes felület minden funkciójával." },
  { q: "Hogyan kezelitek az adatvédelmet?", a: "Az adataidat titkosítva, európai szervereken tároljuk, teljes mértékben GDPR-kompatibilis módon." },
];

const FAQItem = ({ q, a, open, onClick }: { q: string; a: string; open: boolean; onClick: () => void }) => {
  const { theme } = useTheme();
  const t = tokens[theme];
  return (
    <div style={{ borderBottom: `1px solid ${t.border}` }}>
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between gap-6 py-6 text-left"
      >
        <span className="text-[1rem] font-medium" style={{ color: t.text, fontFamily: "var(--font-body)" }}>
          {q}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }} style={{ color: t.primary }}>
          <ChevronDown size={18} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-[0.92rem] leading-relaxed max-w-2xl" style={{ color: t.textSoft, fontFamily: "var(--font-body)" }}>
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQ = () => {
  const { theme } = useTheme();
  const t = tokens[theme];
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="gyik" className="py-28 lg:py-36">
      <div className="mx-auto max-w-4xl px-6 lg:px-10">
        <Reveal className="mb-14 text-center">
          <span className="text-xs font-medium tracking-wide uppercase" style={{ color: t.primary, fontFamily: "var(--font-body)" }}>
            GYIK
          </span>
          <h2 className="mt-4 text-[2rem] lg:text-[2.6rem] leading-[1.1] tracking-tight" style={{ color: t.text, fontFamily: "var(--font-display)", fontWeight: 500 }}>
            Gyakori kérdések.
          </h2>
        </Reveal>

        <Reveal>
          <div>
            {FAQS.map((f, i) => (
              <FAQItem
                key={f.q}
                q={f.q}
                a={f.a}
                open={openIndex === i}
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/*  Footer                                                                     */
/* -------------------------------------------------------------------------- */

const Footer = () => {
  const { theme } = useTheme();
  const t = tokens[theme];
  const cols = [
    { title: "Termék", links: ["Funkciók", "Árazás", "GYIK"] },
    { title: "Jogi", links: ["Adatvédelem", "ÁSZF"] },
    { title: "Kapcsolat", links: ["hello@sona.app", "Közösségi média"] },
  ];

  return (
    <footer style={{ backgroundColor: t.bgAlt, borderTop: `1px solid ${t.border}` }}>
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16 grid sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] gap-12">
        <div>
          <Logo />
          <p className="mt-4 text-[0.87rem] leading-relaxed max-w-xs" style={{ color: t.textSoft, fontFamily: "var(--font-body)" }}>
            A SONA Workspace egy helyen tartja a csapatod feladatait, projektjeit és tudását.
          </p>
        </div>

        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: t.text, fontFamily: "var(--font-body)" }}>
              {c.title}
            </h4>
            <ul className="space-y-3">
              {c.links.map((l) => (
                <li key={l}>
                  <a href="#" className="text-[0.87rem] transition-opacity hover:opacity-70" style={{ color: t.textSoft, fontFamily: "var(--font-body)" }}>
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div style={{ borderTop: `1px solid ${t.border}` }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs" style={{ color: t.textSoft, fontFamily: "var(--font-body)" }}>
            © {new Date().getFullYear()} SONA Workspace. Minden jog fenntartva.
          </span>
        </div>
      </div>
    </footer>
  );
};

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function Page() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = window.localStorage.getItem("sona-theme") as Theme | null;
    if (stored) {
      setTheme(stored);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
  }, []);

  const toggle = () => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      window.localStorage.setItem("sona-theme", next);
      return next;
    });
  };

  const t = tokens[theme];

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      <div
        className={`${fraunces.variable} ${inter.variable} min-h-screen transition-colors duration-300`}
        style={{
          backgroundColor: t.bg,
          color: t.text,
          fontFamily: "var(--font-body)",
          scrollBehavior: "smooth",
        }}
      >
        <Navbar />
        <main>
          <Hero />
          <TrustedBy />
          <Features />
          <Showcase />
          <WhySona />
          <CTABanner />
          <FAQ />
        </main>
        <Footer />
      </div>
    </ThemeContext.Provider>
  );
}