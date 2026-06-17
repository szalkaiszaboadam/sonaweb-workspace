'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  Sparkles,
  LayoutDashboard,
} from 'lucide-react'
import { SonawebLogo } from '@/components/sonaweb-logo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { referenceCategories, marketingCategories } from '@/lib/marketing'

const mainNav = [
  { label: 'Services', href: '/services' },
  { label: 'Blog', href: '/blog' },
  { label: 'Book a Meeting', href: '/book' },
]

export function MarketingShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [refOpen, setRefOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false)
    setRefOpen(false)
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header
        className={cn(
          'sticky top-0 z-50 w-full border-b transition-colors',
          scrolled
            ? 'border-border bg-background/90 backdrop-blur-md'
            : 'border-transparent bg-background',
        )}
      >
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 lg:px-8">
          <Link href="/" className="flex items-center" aria-label="SONAWEB home">
            <SonawebLogo />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            <div
              className="relative"
              onMouseEnter={() => setRefOpen(true)}
              onMouseLeave={() => setRefOpen(false)}
            >
              <button
                type="button"
                className={cn(
                  'flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  refOpen
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
                aria-expanded={refOpen}
              >
                References
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform',
                    refOpen && 'rotate-180',
                  )}
                />
              </button>

              {refOpen && (
                <div className="absolute left-1/2 top-full w-[640px] -translate-x-1/2 pt-2">
                  <div className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-popover p-3 shadow-xl">
                    {referenceCategories.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/references/${cat.slug}`}
                        className="group flex flex-col gap-0.5 rounded-lg p-3 transition-colors hover:bg-muted"
                      >
                        <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                          {cat.label}
                          <ArrowRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                        </span>
                        <span className="text-xs leading-relaxed text-muted-foreground">
                          {cat.description}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  pathname === item.href || pathname.startsWith(item.href + '/')
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <Button
              variant="ghost"
              size="sm"
              render={<Link href="/client" />}
              className="gap-1.5"
            >
              <LayoutDashboard className="h-4 w-4" />
              Client Login
            </Button>
            <Button size="sm" render={<Link href="/book" />} className="gap-1.5">
              Book a Meeting
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile trigger */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Mobile slide-out */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 flex h-full w-[85%] max-w-sm flex-col bg-background shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
              <SonawebLogo />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <Link
                href="/services"
                className="block rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-muted"
              >
                Services
              </Link>

              <div className="mt-2">
                <p className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  References
                </p>
                {referenceCategories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/references/${cat.slug}`}
                    className="block rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    {cat.label}
                  </Link>
                ))}
              </div>

              <Link
                href="/blog"
                className="mt-2 block rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-muted"
              >
                Blog
              </Link>
              <Link
                href="/book"
                className="block rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-muted"
              >
                Book a Meeting
              </Link>
            </div>

            <div className="border-t border-border p-4">
              <Button
                variant="outline"
                render={<Link href="/client" />}
                className="mb-2 w-full gap-1.5"
              >
                <LayoutDashboard className="h-4 w-4" />
                Client Login
              </Button>
              <Button render={<Link href="/book" />} className="w-full gap-1.5">
                Book a Meeting
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1">{children}</main>

      {/* Sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur-md lg:hidden">
        <Button render={<Link href="/book" />} className="w-full gap-1.5">
          <Sparkles className="h-4 w-4" />
          Book a Free Consultation
        </Button>
      </div>

      <MarketingFooter />
    </div>
  )
}

function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-card pb-24 lg:pb-0">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <SonawebLogo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              A full-service digital marketing agency building websites, content,
              and campaigns that grow ambitious brands.
            </p>
            <Button
              render={<Link href="/book" />}
              className="mt-6 gap-1.5"
              size="sm"
            >
              Start a project
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Services</h4>
            <ul className="mt-3 space-y-2">
              {marketingCategories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/services?category=${cat.id}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">References</h4>
            <ul className="mt-3 space-y-2">
              {referenceCategories.slice(0, 5).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/references/${cat.slug}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {cat.label.replace(' References', '')}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Company</h4>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/blog" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/book" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Book a Meeting
                </Link>
              </li>
              <li>
                <Link href="/client" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Client Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-2 border-t border-border pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">
            {`© ${new Date().getFullYear()} SONAWEB. All rights reserved.`}
          </p>
          <p className="text-xs text-muted-foreground">
            Crafted for ambitious brands across Europe and beyond.
          </p>
        </div>
      </div>
    </footer>
  )
}
