import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  getBlogPost,
  getRelatedPosts,
  getMarketingService,
  blogPosts,
} from '@/lib/marketing'

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }))
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) notFound()

  const related = getRelatedPosts(post)
  const recommended = post.recommendedServices
    .map((s) => getMarketingService(s))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))

  return (
    <div>
      <article className="mx-auto w-full max-w-3xl px-4 py-12 lg:py-16">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          All articles
        </Link>

        <p className="mt-6 text-xs font-medium uppercase tracking-wide text-primary">
          {post.category}
        </p>
        <h1 className="mt-2 text-balance text-3xl font-bold leading-tight tracking-tight text-foreground lg:text-4xl">
          {post.title}
        </h1>
        <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
          <span>{post.author}</span>
          <span aria-hidden>·</span>
          <span>{formatDate(post.date)}</span>
          <span aria-hidden>·</span>
          <span>{post.readingTime}</span>
        </div>

        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl border border-border">
          <Image
            src={post.cover || '/placeholder.svg'}
            alt={post.title}
            fill
            priority
            className="object-cover"
          />
        </div>

        <div className="mt-8 space-y-5">
          {post.content.map((para, i) => (
            <p
              key={i}
              className="text-lg leading-relaxed text-muted-foreground"
            >
              {para}
            </p>
          ))}
        </div>

        {/* Recommended services */}
        {recommended.length > 0 && (
          <div className="mt-12 rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">
              Services mentioned in this article
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {recommended.map((service) => (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="group flex items-start gap-3 rounded-xl border border-border p-4 transition-colors hover:border-primary/40"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <service.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{service.name}</p>
                    <p className="mt-0.5 text-sm leading-snug text-muted-foreground">
                      {service.tagline}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-border bg-primary p-8 text-center">
          <h3 className="text-xl font-bold text-primary-foreground">
            Put these ideas to work
          </h3>
          <p className="max-w-md text-sm text-primary-foreground/80">
            Book a free consultation and we&apos;ll tailor a plan to your brand.
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
      </article>

      {/* Related */}
      {related.length > 0 && (
        <section className="border-t border-border bg-card">
          <div className="mx-auto w-full max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Keep reading
            </h2>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {related.map((rp) => (
                <Link
                  key={rp.slug}
                  href={`/blog/${rp.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-background"
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                      src={rp.cover || '/placeholder.svg'}
                      alt={rp.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-medium uppercase tracking-wide text-primary">
                      {rp.category}
                    </p>
                    <h3 className="mt-1 font-semibold leading-snug text-foreground">
                      {rp.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
