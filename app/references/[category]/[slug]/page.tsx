import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  getCaseStudy,
  getMarketingService,
  caseStudies,
} from '@/lib/marketing'

export function generateStaticParams() {
  return caseStudies.map((c) => ({ category: c.category, slug: c.slug }))
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>
}) {
  const { category, slug } = await params
  const cs = getCaseStudy(slug)
  if (!cs) notFound()

  const recommended = getMarketingService(cs.recommendedService)

  return (
    <div>
      <section className="border-b border-border bg-card">
        <div className="mx-auto w-full max-w-5xl px-4 py-12 lg:px-8 lg:py-16">
          <Link
            href={`/references/${category}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to references
          </Link>
          <p className="mt-5 text-xs font-medium uppercase tracking-wide text-primary">
            {`${cs.industry} · ${cs.serviceType}`}
          </p>
          <h1 className="mt-2 text-balance text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
            {cs.client}
          </h1>
          <p className="mt-3 max-w-2xl text-pretty text-lg text-muted-foreground">
            {cs.resultSummary}
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-5xl px-4 py-12 lg:px-8 lg:py-16">
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border">
          <Image
            src={cs.image || '/placeholder.svg'}
            alt={`${cs.client} project`}
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* Results */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {cs.results.map((r) => (
            <div
              key={r.label}
              className="rounded-2xl border border-border bg-card p-6 text-center"
            >
              <p className="text-3xl font-bold text-primary">{r.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{r.label}</p>
            </div>
          ))}
        </div>

        {/* Problem / Solution */}
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold text-foreground">The challenge</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              {cs.problem}
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Our approach
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              {cs.solution}
            </p>
          </div>
        </div>

        {/* Delivered */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-foreground">
            What we delivered
          </h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {cs.delivered.map((d) => (
              <li
                key={d}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {d}
              </li>
            ))}
          </ul>
        </div>

        {/* Gallery */}
        {cs.gallery.length > 0 && (
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {cs.gallery.map((g, i) => (
              <div
                key={i}
                className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border"
              >
                <Image
                  src={g || '/placeholder.svg'}
                  alt={`${cs.client} gallery ${i + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* Recommended service */}
        {recommended && (
          <div className="mt-12 overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <recommended.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-primary">
                    Want results like these?
                  </p>
                  <h3 className="mt-0.5 font-semibold text-foreground">
                    {recommended.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {recommended.tagline}
                  </p>
                </div>
              </div>
              <Button
                render={<Link href={`/services/${recommended.slug}`} />}
                className="shrink-0 gap-1.5"
              >
                Explore service
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-border bg-primary p-8 text-center">
          <h3 className="text-xl font-bold text-primary-foreground">
            Let&apos;s build your success story
          </h3>
          <p className="max-w-md text-sm text-primary-foreground/80">
            Book a free consultation and see what SONAWEB can do for your brand.
          </p>
          <Button
            variant="secondary"
            render={<Link href="/book" />}
            className="mt-2 gap-1.5"
          >
            Book a consultation
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
