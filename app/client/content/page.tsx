'use client'

import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/portal-shell'
import { StatCard } from '@/components/stat-card'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { PlatformIcon, statusStyles } from '@/components/platform-badge'
import { usePortal, type ContentItem } from '@/lib/portal-store'
import { Check, RotateCcw, MessageSquare, Calendar, Clock } from 'lucide-react'

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function ContentReview({ item }: { item: ContentItem }) {
  const { setContentStatus, addComment } = usePortal()
  const [feedback, setFeedback] = useState('')
  const [open, setOpen] = useState(false)

  const pending = item.status === 'Waiting For Approval'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="w-full text-left">
        <ContentCard item={item} />
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <PlatformIcon platform={item.platform} />
            {item.title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex aspect-video items-center justify-center rounded-lg border border-border bg-gradient-to-br from-card to-background">
          <PlatformIcon platform={item.platform} className="h-14 w-14" />
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" /> {formatDate(item.date)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {item.time}
          </span>
          <span
            className={`ml-auto rounded-md px-2 py-0.5 text-[10px] font-medium ${statusStyles[item.status]}`}
          >
            {item.status}
          </span>
        </div>

        <div>
          <p className="text-sm text-foreground">{item.caption}</p>
          <p className="mt-1 text-xs text-primary">{item.hashtags}</p>
        </div>

        {item.comments.length > 0 && (
          <div className="space-y-2 rounded-lg bg-secondary/40 p-3">
            <p className="text-xs font-semibold text-foreground">Feedback</p>
            {item.comments.map((c) => (
              <div key={c.id} className="text-xs">
                <span className="font-medium text-foreground">{c.author}</span>
                <span className="text-muted-foreground"> · {c.time}</span>
                <p className="text-muted-foreground">{c.text}</p>
              </div>
            ))}
          </div>
        )}

        {pending ? (
          <div className="space-y-3">
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Add a comment or request changes…"
              className="min-h-20 resize-none"
            />
            <div className="flex gap-2">
              <Button
                className="flex-1 gap-1.5"
                onClick={() => {
                  if (feedback.trim()) addComment(item.id, feedback.trim())
                  setContentStatus(item.id, 'Approved')
                  setOpen(false)
                }}
              >
                <Check className="h-4 w-4" /> Approve
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-1.5"
                disabled={!feedback.trim()}
                onClick={() => {
                  addComment(item.id, feedback.trim())
                  setContentStatus(item.id, 'Rejected')
                  setOpen(false)
                }}
              >
                <RotateCcw className="h-4 w-4" /> Request changes
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-center text-xs text-muted-foreground">
            This item is {item.status.toLowerCase()} and no longer needs review.
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}

function ContentCard({ item }: { item: ContentItem }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-secondary/40 transition-colors hover:border-primary/40">
      <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-card to-background">
        <PlatformIcon platform={item.platform} className="h-10 w-10" />
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {item.platform} · {formatDate(item.date)}
          </span>
          <span
            className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${statusStyles[item.status]}`}
          >
            {item.status}
          </span>
        </div>
        <p className="mt-1.5 truncate text-sm font-medium text-foreground">
          {item.title}
        </p>
        <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" /> {item.comments.length}
          </span>
          {item.status === 'Waiting For Approval' && (
            <span className="ml-auto font-medium text-chart-3">
              Tap to review
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ContentPage() {
  const { content } = usePortal()
  const [tab, setTab] = useState('pending')

  const counts = useMemo(
    () => ({
      pending: content.filter((c) => c.status === 'Waiting For Approval').length,
      approved: content.filter(
        (c) => c.status === 'Approved' || c.status === 'Scheduled',
      ).length,
      published: content.filter((c) => c.status === 'Published').length,
    }),
    [content],
  )

  const filtered = useMemo(() => {
    if (tab === 'pending')
      return content.filter((c) => c.status === 'Waiting For Approval')
    if (tab === 'approved')
      return content.filter(
        (c) => c.status === 'Approved' || c.status === 'Scheduled',
      )
    if (tab === 'published')
      return content.filter((c) => c.status === 'Published')
    return content
  }, [content, tab])

  return (
    <>
      <PageHeader
        title="Content Approval"
        description="Review, approve and request changes on your Facebook, Instagram & TikTok creative."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Awaiting Approval" value={String(counts.pending)} sub="needs your review" />
        <StatCard label="Approved" value={String(counts.approved)} sub="ready to publish" />
        <StatCard label="Published" value="22" delta={9} sub="last 30 days" />
        <StatCard label="Reach" value="186K" delta={14.2} sub="combined" />
      </div>

      <Card className="mt-4 p-5">
        <Tabs value={tab} onValueChange={setTab}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Approval Center
              </h3>
              <p className="text-xs text-muted-foreground">
                Tap any item to preview, comment and approve
              </p>
            </div>
            <TabsList>
              <TabsTrigger value="pending">
                Pending {counts.pending > 0 && `(${counts.pending})`}
              </TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={tab} className="mt-4">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
                <Check className="h-8 w-8 text-chart-2" />
                <p className="mt-2 text-sm font-medium text-foreground">
                  All caught up
                </p>
                <p className="text-xs text-muted-foreground">
                  Nothing in this view right now.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((item) => (
                  <ContentReview key={item.id} item={item} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </>
  )
}
