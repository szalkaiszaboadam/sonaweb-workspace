import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  Check,
  Star,
  TrendingUp,
  Users,
  Globe,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  marketingCategories,
  marketingServices,
  caseStudies,
  blogPosts,
} from '@/lib/marketing'
import { PublicClientMap } from '@/components/marketing/public-client-map'

const stats = [
  { label: 'Brands served', value: '120+', icon: Users },
  { label: 'Avg. conversion lift', value: '+38%', icon: TrendingUp },
  { label: 'Countries', value: '16', icon: Globe },
  { label: 'Client rating', value: '4.9/5', icon: Star },
]

export default function HomePage() {
  const featuredServices = marketingServices.slice(0, 6)
  const featuredCases = caseStudies.slice(0, 3)
  const featuredPosts = blogPosts.slice(0, 3)

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/marketing/hero.png"
            alt=""
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/85 to-background" />
        </div>

        <div className="mx-auto w-full max-w-7xl px-4 py-20 lg:px-8 lg:py-32">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Full-service digital marketing agency
            </span>
            <h1 className="mt-5 text-balance text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Marketing that turns ambitious brands into category leaders.
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
              Websites, content, video, advertising, and email — designed,
              built, and managed by one team obsessed with your growth.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" render={<Link href="/services" />} className="gap-1.5">
                Explore services
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                render={<Link href="/book" />}
              >
                Book a free consultation
              </Button>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Everything you need to grow
            </h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Six core disciplines, one accountable team. Buy a service instantly
              or book a consultation first.
            </p>
          </div>
          <Button variant="ghost" render={<Link href="/services" />} className="gap-1.5">
            All services
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredServices.map((service) => {
            const Icon = service.icon
            const from = Math.min(...service.packages.map((p) => p.price))
            return (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {service.name}
                </h3>
                <p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {service.tagline}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {`From $${from.toLocaleString()}`}
                  </span>
                  <ArrowRight className="h-4 w-4 text-primary -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                </div>
              </Link>
            )
          })}
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {marketingCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/services?category=${cat.id}`}
              className="rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Case studies */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Results we are proud of
              </h2>
              <p className="mt-2 max-w-xl text-muted-foreground">
                Real work for real brands across every discipline.
              </p>
            </div>
            <Button
              variant="ghost"
              render={<Link href="/references/website" />}
              className="gap-1.5"
            >
              View references
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {featuredCases.map((cs) => (
              <Link
                key={cs.slug}
                href={`/references/${cs.category}/${cs.slug}`}
                className="group overflow-hidden rounded-2xl border border-border bg-background"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={cs.image || '/placeholder.svg'}
                    alt={`${cs.client} — ${cs.serviceType}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-primary">
                    {cs.industry}
                  </p>
                  <h3 className="mt-1 font-semibold text-foreground">
                    {cs.client}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {cs.resultSummary}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Public client map */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Trusted by brands across the map
          </h2>
          <p className="mt-2 text-muted-foreground">
            From London to Dubai, we partner with growing businesses worldwide.
            Explore where our clients are building.
          </p>
        </div>
        <div className="mt-10">
          <PublicClientMap />
        </div>
      </section>

      {/* Blog preview */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Insights from the team
              </h2>
              <p className="mt-2 max-w-xl text-muted-foreground">
                Practical playbooks on growth, content, and conversion.
              </p>
            </div>
            <Button variant="ghost" render={<Link href="/blog" />} className="gap-1.5">
              Read the blog
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {featuredPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group overflow-hidden rounded-2xl border border-border bg-background"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={post.cover || '/placeholder.svg'}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-primary">
                    {post.category}
                  </p>
                  <h3 className="mt-1 font-semibold leading-snug text-foreground">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {post.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
        <div className="overflow-hidden rounded-3xl border border-border bg-primary px-6 py-14 text-center lg:px-16">
          <h2 className="mx-auto max-w-2xl text-balance text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
            Ready to grow your brand with SONAWEB?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-pretty text-primary-foreground/80">
            Book a free consultation and we will map out the highest-impact next
            steps for your business — no obligation.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              variant="secondary"
              render={<Link href="/book" />}
              className="gap-1.5"
            >
              Book a free consultation
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              render={<Link href="/services" />}
              className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              Browse services
            </Button>
          </div>

          <ul className="mx-auto mt-8 flex max-w-md flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {['No obligation', 'Senior strategist', 'Tailored plan'].map((item) => (
              <li
                key={item}
                className="flex items-center gap-1.5 text-sm text-primary-foreground/80"
              >
                <Check className="h-4 w-4" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
