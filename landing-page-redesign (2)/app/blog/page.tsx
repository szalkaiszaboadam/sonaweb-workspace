'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { blogPosts, blogCategories, type BlogCategory } from '@/lib/marketing'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function BlogPage() {
  const [filter, setFilter] = useState<BlogCategory | 'All'>('All')

  const posts =
    filter === 'All'
      ? blogPosts
      : blogPosts.filter((p) => p.category === filter)

  const [featured, ...rest] = posts

  return (
    <div>
      <section className="border-b border-border bg-card">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
            The SONAWEB Blog
          </h1>
          <p className="mt-3 max-w-xl text-pretty text-lg text-muted-foreground">
            Playbooks, strategies, and lessons from building brands online.
          </p>
        </div>
      </section>

      {/* Filters */}
      <div className="sticky top-16 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl gap-2 overflow-x-auto px-4 py-3 lg:px-8">
          <Chip label="All" active={filter === 'All'} onClick={() => setFilter('All')} />
          {blogCategories.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              active={filter === cat}
              onClick={() => setFilter(cat)}
            />
          ))}
        </div>
      </div>

      <section className="mx-auto w-full max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
        {/* Featured */}
        {featured && (
          <Link
            href={`/blog/${featured.slug}`}
            className="group grid gap-6 overflow-hidden rounded-3xl border border-border bg-card lg:grid-cols-2"
          >
            <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto">
              <Image
                src={featured.cover || '/placeholder.svg'}
                alt={featured.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col justify-center p-6 lg:p-10">
              <p className="text-xs font-medium uppercase tracking-wide text-primary">
                {featured.category}
              </p>
              <h2 className="mt-2 text-balance text-2xl font-bold leading-snug text-foreground lg:text-3xl">
                {featured.title}
              </h2>
              <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
                {featured.excerpt}
              </p>
              <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
                <span>{formatDate(featured.date)}</span>
                <span aria-hidden>·</span>
                <span>{featured.readingTime}</span>
              </div>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                Read article
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        )}

        {/* Rest */}
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={post.cover || '/placeholder.svg'}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-primary">
                  {post.category}
                </p>
                <h3 className="mt-1 font-semibold leading-snug text-foreground">
                  {post.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {post.excerpt}
                </p>
                <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{formatDate(post.date)}</span>
                  <span aria-hidden>·</span>
                  <span>{post.readingTime}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'border border-border text-muted-foreground hover:text-foreground',
      )}
    >
      {label}
    </button>
  )
}
