'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { PlatformIcon } from '@/components/platform-badge'
import { usePortal, type Platform, type ContentStatus } from '@/lib/portal-store'
import { cn } from '@/lib/utils'
import { UploadCloud, Calendar } from 'lucide-react'

const platforms: Platform[] = ['TikTok', 'Instagram', 'Facebook']

const typeByPlatform: Record<Platform, string[]> = {
  TikTok: ['TikTok Video'],
  Instagram: ['Instagram Post', 'Instagram Reel'],
  Facebook: ['Facebook Post'],
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function ContentComposer({
  open,
  onOpenChange,
  defaultDate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultDate?: string
}) {
  const { addContent } = usePortal()
  const [platform, setPlatform] = useState<Platform>('TikTok')
  const [type, setType] = useState('TikTok Video')
  const [title, setTitle] = useState('')
  const [caption, setCaption] = useState('')
  const [hashtags, setHashtags] = useState('')
  const [date, setDate] = useState(defaultDate ?? todayIso())
  const [time, setTime] = useState('09:00')
  const [fileName, setFileName] = useState('')

  function reset() {
    setPlatform('TikTok')
    setType('TikTok Video')
    setTitle('')
    setCaption('')
    setHashtags('')
    setDate(defaultDate ?? todayIso())
    setTime('09:00')
    setFileName('')
  }

  function submit(status: ContentStatus) {
    if (!title.trim()) return
    addContent({ title, platform, type, caption, hashtags, status, date, time })
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule content</DialogTitle>
          <DialogDescription>
            Create a post, add details, and send it for approval or schedule it.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
          {/* Platform */}
          <div className="space-y-2">
            <Label>Platform</Label>
            <div className="grid grid-cols-3 gap-2">
              {platforms.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setPlatform(p)
                    setType(typeByPlatform[p][0])
                  }}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
                    platform === p
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border text-muted-foreground hover:border-primary/40',
                  )}
                >
                  <PlatformIcon platform={p} className="h-6 w-6" />
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label>Content type</Label>
            <div className="flex flex-wrap gap-2">
              {typeByPlatform[platform].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs transition-colors',
                    type === t
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border text-muted-foreground hover:border-primary/40',
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Behind the scenes — v1"
            />
          </div>

          {/* Upload */}
          <div className="space-y-2">
            <Label>Media</Label>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-secondary/30 px-4 py-6 text-center transition-colors hover:border-primary/50">
              <UploadCloud className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm text-foreground">
                {fileName || 'Upload image or video'}
              </span>
              <span className="text-xs text-muted-foreground">
                MP4, MOV, JPG or PNG up to 200MB
              </span>
              <input
                type="file"
                className="hidden"
                accept="video/*,image/*"
                onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')}
              />
            </label>
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <Label htmlFor="caption">Caption</Label>
            <Textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
              rows={3}
            />
          </div>

          {/* Hashtags */}
          <div className="space-y-2">
            <Label htmlFor="hashtags">Hashtags</Label>
            <Input
              id="hashtags"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="#brand #launch #fyp"
            />
          </div>

          {/* Date & time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="date">Publish date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={() => submit('Draft')}
            disabled={!title.trim()}
          >
            Save draft
          </Button>
          <Button
            onClick={() => submit('Waiting For Approval')}
            disabled={!title.trim()}
            className="gap-2"
          >
            <Calendar className="h-4 w-4" />
            Send for approval
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
