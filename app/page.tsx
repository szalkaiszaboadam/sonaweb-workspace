import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  Check,
  Star,
  TrendingUp,
  Users,
  Globe,
  Play,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  marketingCategories,
  marketingServices,
  caseStudies,
  blogPosts,
} from '@/lib/marketing'
import { PublicClientMap } from '@/components/marketing/public-client-map'
import { cn } from '@/lib/utils'

const stats = [
  { label: 'Kiszolgált márkák', value: '120+', icon: Users },
  { label: 'Átl. konverzió növekedés', value: '+38%', icon: TrendingUp },
  { label: 'Országok', value: '16', icon: Globe },
  { label: 'Ügyfél értékelés', value: '4.9/5', icon: Star },
]

export default function HomePage() {
  const featuredServices = marketingServices.slice(0, 6)
  const featuredCases = caseStudies.slice(0, 5) // Több elem a masonry elrendezéshez
  const featuredPosts = blogPosts.slice(0, 3)

  return (
    <div className="flex flex-col gap-24 pb-24">
      {/* Hero Section - ToDesktop & Sigmize stílus (Középre zárt, drámai) */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden pt-20">
        {/* Háttér ragyogás */}
        <div className="absolute top-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />

        <div className="mx-auto w-full max-w-5xl px-4 text-center">
          <div className="inline-flex animate-in fade-in slide-in-from-bottom-4 duration-700 items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
            </span>
            Új generációs digitális ügynökség
          </div>
          
          <h1 className="mt-8 text-balance text-5xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Marketing, ami a márkáját <br className="hidden md:block" />
            <span className="text-gradient-red">piacvezetővé</span> teszi.
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Weboldalak, tartalom, videó, hirdetések és e-mail — mindezt egyetlen,
            a növekedés iránt elkötelezett csapat tervezi, építi és kezeli.
          </p>
          
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" render={<Link href="/services" />} className="h-12 gap-2 rounded-full px-8 text-base shadow-[0_0_40px_-10px_rgba(255,0,0,0.5)] transition-all hover:shadow-[0_0_60px_-15px_rgba(255,0,0,0.6)]">
              Szolgáltatások felfedezése
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              render={<Link href="/book" />}
              className="h-12 rounded-full px-8 text-base backdrop-blur-sm"
            >
              Ingyenes konzultáció
            </Button>
          </div>

          {/* 21st.dev stílusú Video Thumbnail Gomb */}
          <div className="mx-auto mt-20 max-w-4xl">
            <div className="group relative aspect-video cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-card/50 p-2 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:border-primary/50 hover:glow-red">
              <div className="relative h-full w-full overflow-hidden rounded-2xl bg-muted">
                <Image
                  src="/marketing/hero.png"
                  alt="Showreel Thumbnail"
                  fill
                  priority
                  className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
                />
                <div className="absolute inset-0 bg-background/20 transition-colors group-hover:bg-background/10" />
                
                {/* Lebegő lejátszás gomb */}
                <div className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur-md transition-transform duration-500 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Play className="h-8 w-8 ml-1" fill="currentColor" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Stats - Glassmorphism stílus */}
      <section className="mx-auto w-full max-w-7xl px-4">
        <div className="grid grid-cols-2 gap-4 rounded-3xl border border-white/5 bg-white/[0.02] p-8 backdrop-blur-lg sm:grid-cols-4 lg:gap-8">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center text-center">
              <div className="mb-3 rounded-full bg-primary/10 p-3 text-primary">
                <s.icon className="h-6 w-6" />
              </div>
              <p className="text-3xl font-bold tracking-tight text-foreground">{s.value}</p>
              <p className="mt-1 text-sm font-medium text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services - Bento Grid (Latitude.sh / SurferSEO stílus) */}
      <section className="mx-auto w-full max-w-7xl px-4 pt-10">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Minden, amire a <span className="text-gradient-red">növekedéshez</span> szüksége van
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Hat alapvető szakterület, egyetlen elszámoltatható csapat. Vásároljon szolgáltatást azonnal, vagy foglaljon időpontot először.
            </p>
          </div>
          <Button variant="ghost" render={<Link href="/services" />} className="gap-1.5 rounded-full">
            Összes szolgáltatás
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-12 grid auto-rows-[280px] grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {featuredServices.map((service, i) => {
            const Icon = service.icon
            const from = Math.min(...service.packages.map((p) => p.price))
            
            // Dinamikus bento box méretezés
            const isLarge = i === 0 || i === 3;
            
            return (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className={cn(
                  "group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-card p-8 transition-all hover:-translate-y-1 hover:border-primary/50 hover:glow-red",
                  isLarge ? "md:col-span-2 lg:col-span-2" : "md:col-span-1 lg:col-span-1"
                )}
              >
                {/* Díszítő háttér gradient */}
                <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl transition-all group-hover:bg-primary/20" />
                
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold text-foreground">
                    {service.name}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                    {service.tagline}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-sm font-medium text-foreground">
                    {`$${from.toLocaleString()}-tól`}
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 transition-colors group-hover:bg-primary">
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary-foreground" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Case studies - Masonry Layout (21st.dev Testimonials stílus) */}
      <section className="relative mt-10 border-y border-border bg-black/20 py-24">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay" />
        <div className="mx-auto w-full max-w-7xl px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Eredmények, melyekre büszkék vagyunk
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Valós munkák, valós márkák számára minden iparágban.
            </p>
          </div>

          {/* CSS Columns a Masonry hatásért */}
          <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 space-y-6">
            {featuredCases.map((cs) => (
              <Link
                key={cs.slug}
                href={`/references/${cs.category}/${cs.slug}`}
                className="group block break-inside-avoid overflow-hidden rounded-3xl border border-white/10 bg-card/80 p-2 backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-card"
              >
                <div className="relative overflow-hidden rounded-2xl">
                  {/* Dinamikus képarány a falazat (masonry) hatáshoz */}
                  <div className={cn("relative w-full", Math.random() > 0.5 ? "aspect-[4/5]" : "aspect-video")}>
                    <Image
                      src={cs.image || '/placeholder.svg'}
                      alt={`${cs.client} — ${cs.serviceType}`}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute right-3 top-3 rounded-full bg-background/80 px-3 py-1 text-xs font-medium uppercase tracking-wide text-primary backdrop-blur-md">
                    {cs.industry}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold text-foreground">
                    {cs.client}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {cs.resultSummary}
                  </p>
                  <div className="mt-4 flex items-center font-medium text-primary text-sm">
                    Esettanulmány megtekintése
                    <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="mt-12 flex justify-center">
            <Button variant="outline" render={<Link href="/references/website" />} className="rounded-full px-8">
              Összes referencia megtekintése
            </Button>
          </div>
        </div>
      </section>

      {/* Public client map */}
      <section className="mx-auto w-full max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Márkák által megbízva a térképen
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Londontól Dubajig növekvő vállalkozásokkal dolgozunk együtt.
            Nézze meg, hol építkeznek ügyfeleink.
          </p>
        </div>
        <div className="mt-12 rounded-3xl border border-white/10 bg-card/30 p-4 backdrop-blur-sm">
          <PublicClientMap />
        </div>
      </section>

      {/* Blog preview */}
      <section className="mx-auto w-full max-w-7xl px-4">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Tudásbázis a csapattól
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Gyakorlati útmutatók a növekedésről, tartalomgyártásról és konverzióról.
            </p>
          </div>
          <Button variant="ghost" render={<Link href="/blog" />} className="gap-1.5 rounded-full">
            Tovább a blogra
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-card/30 transition-all hover:bg-card"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={post.cover || '/placeholder.svg'}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-6 lg:p-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {post.category}
                </p>
                <h3 className="mt-3 text-xl font-bold leading-tight text-foreground group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {post.excerpt}
                </p>
                <div className="mt-auto pt-6 flex items-center text-sm font-medium text-foreground">
                  Cikk olvasása
                  <ArrowRight className="ml-1.5 h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Final CTA - Elegáns, ragyogó kártya */}
      <section className="mx-auto w-full max-w-5xl px-4">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-primary/20 bg-card px-6 py-20 text-center shadow-2xl lg:px-20">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
          <div className="relative z-10">
            <h2 className="mx-auto max-w-2xl text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Készen áll a növekedésre a <span className="text-gradient-red">SONAWEB</span>-bel?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-muted-foreground">
              Foglaljon le egy ingyenes konzultációt, és megtervezzük a legnagyobb hatású
              következő lépéseket a vállalkozása számára — minden kötelezettség nélkül.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                render={<Link href="/book" />}
                className="h-14 gap-2 rounded-full px-8 text-base shadow-[0_0_30px_-5px_rgba(255,0,0,0.4)]"
              >
                Konzultáció foglalása
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>

            <ul className="mx-auto mt-10 flex max-w-md flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {['Kötelezettségmentes', 'Szenior stratéga', 'Személyre szabott terv'].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground"
                >
                  <div className="rounded-full bg-primary/20 p-1">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}