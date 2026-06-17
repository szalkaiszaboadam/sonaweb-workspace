'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/portal-shell'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { messages } from '@/lib/data'
import { ArrowUp } from 'lucide-react'

const thread = [
  { from: 'team', name: 'SONAWEB Team', text: 'Hi Aurelia! The August TikTok batch is ready for your review in the Content tab.', time: '9:14 AM' },
  { from: 'me', name: 'You', text: 'Amazing, taking a look now. The first cut looked great.', time: '9:22 AM' },
  { from: 'team', name: 'SONAWEB Team', text: 'Perfect. Once approved we will schedule them across the month. Also, the website dev phase is at 64%.', time: '9:25 AM' },
]

export default function MessagesPage() {
  const [active, setActive] = useState(0)
  const [draft, setDraft] = useState('')

  return (
    <>
      <PageHeader
        title="Messages"
        description="Talk directly with your SONAWEB project team."
      />

      <Card className="grid h-[calc(100vh-13rem)] grid-cols-1 overflow-hidden p-0 md:grid-cols-[300px_1fr]">
        {/* Conversation list */}
        <div className="border-b border-border md:border-b-0 md:border-r">
          <div className="border-b border-border p-4">
            <h3 className="text-sm font-semibold text-foreground">Inbox</h3>
          </div>
          <ul>
            {messages.map((m, i) => (
              <li key={m.id}>
                <button
                  onClick={() => setActive(i)}
                  className={`flex w-full gap-3 border-b border-border/50 p-4 text-left transition-colors ${
                    active === i ? 'bg-sidebar-accent' : 'hover:bg-secondary/40'
                  }`}
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                      {m.from.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        {m.from}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {m.time}
                      </span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {m.preview}
                    </p>
                  </div>
                  {m.unread && (
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Thread */}
        <div className="flex flex-col">
          <div className="flex items-center gap-3 border-b border-border p-4">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                {messages[active].from.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-foreground">
                {messages[active].from}
              </p>
              <Badge variant="secondary" className="mt-0.5 gap-1 text-[10px]">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Online
              </Badge>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {thread.map((t, i) => {
              const isMe = t.from === 'me'
              return (
                <div
                  key={i}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      isMe
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-foreground'
                    }`}
                  >
                    <p>{t.text}</p>
                    <p
                      className={`mt-1 text-[10px] ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}
                    >
                      {t.time}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              setDraft('')
            }}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type a message..."
              className="border-border bg-background"
            />
            <Button
              type="submit"
              size="icon"
              className="shrink-0"
              aria-label="Send"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </>
  )
}
