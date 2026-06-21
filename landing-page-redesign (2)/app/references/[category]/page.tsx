import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import {
  getReferenceCategory,
  getCaseStudiesByCategory,
  referenceCategories,
} from '@/lib/marketing'

export function generateStaticParams() {
  return referenceCategories.map((c) => ({ category: c.slug }))
}

export default async function ReferenceCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params
  const cat = getReferenceCategory(category)
  if (!cat) notFound()

  const studies = getCaseStudiesByCategory(category)

  return (
    <div>
      <section className="border-b border-border bg-card">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
          <Link
            href="/references/website"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            References
          </Link>
          <h1 className="mt-5 text-balance text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
            {cat.label}
          </h1>
          <p className="mt-3 max-w-2xl text-pretty text-lg text-muted-foreground">
            {cat.description}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {referenceCategories.map((c) => (
              <Link
                key={c.slug}
                href={`/references/${c.slug}`}
                className={
                  c.slug === category
                    ? 'rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground'
                    : 'rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground'
                }
              >
                {c.label.replace(' References', '')}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
        {studies.length === 0 ? (
          <p className="text-muted-foreground">
            New case studies for this category are coming soon.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {studies.map((cs) => (
              <Link
                key={cs.slug}
                href={`/references/${cs.category}/${cs.slug}`}
                className="group overflow-hidden rounded-2xl border border-border bg-card"
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
                  <h3 className="mt-1 text-lg font-semibold text-foreground">
                    {cs.client}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {cs.resultSummary}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                    View case study
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
