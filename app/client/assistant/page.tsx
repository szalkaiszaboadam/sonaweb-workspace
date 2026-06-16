'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { PageHeader } from '@/components/portal-shell'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SonawebLogo } from '@/components/sonaweb-logo'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { client } from '@/lib/data'
import { Sparkles, ArrowUp, Loader2 } from 'lucide-react'

const suggestions = [
  'How are my TikTok numbers trending?',
  'What should I prioritize this week?',
  'Explain my advertising ROAS',
  'How can I improve my conversion rate?',
]

export default function AssistantPage() {
  const [input, setInput] = useState('')
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/assistant' }),
  })
  const scrollRef = useRef<HTMLDivElement>(null)
  const busy = status === 'streaming' || status === 'submitted'

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages])

  function submit(text: string) {
    if (!text.trim() || busy) return
    sendMessage({ text })
    setInput('')
  }

  return (
    <>
      <PageHeader
        title="AI Marketing Assistant"
        description="Ask anything about your website, ads, TikTok, content or email performance — and get clear next steps."
      />

      <Card className="flex h-[calc(100vh-13rem)] flex-col overflow-hidden p-0">
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 lg:px-8">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary glow-red">
                <Sparkles className="h-6 w-6" />
              </span>
              <h2 className="mt-4 text-lg font-semibold text-foreground">
                How can I help you grow today?
              </h2>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                I have access to your latest performance context. Try one of
                these:
              </p>
              <div className="mt-5 grid w-full max-w-lg grid-cols-1 gap-2 sm:grid-cols-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => submit(s)}
                    className="rounded-lg border border-border bg-secondary/40 px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:border-primary/50 hover:bg-secondary"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-2xl space-y-6">
              {messages.map((m) => {
                const text = m.parts
                  .filter((p) => p.type === 'text')
                  .map((p) => p.text)
                  .join('')
                const isUser = m.role === 'user'
                return (
                  <div
                    key={m.id}
                    className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback
                        className={
                          isUser
                            ? 'bg-secondary text-xs font-semibold'
                            : 'bg-primary text-xs font-semibold text-primary-foreground'
                        }
                      >
                        {isUser ? client.initials : 'AI'}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        isUser
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-foreground'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{text}</p>
                    </div>
                  </div>
                )
              })}
              {status === 'submitted' && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking...
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-border bg-card/60 p-3 lg:p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              submit(input)
            }}
            className="mx-auto flex max-w-2xl items-center gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the SONAWEB assistant..."
              className="h-11 border-border bg-background"
              disabled={busy}
            />
            <Button
              type="submit"
              size="icon"
              className="h-11 w-11 shrink-0"
              disabled={busy || !input.trim()}
              aria-label="Send"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </Button>
          </form>
          <div className="mx-auto mt-2 flex max-w-2xl items-center justify-center gap-1.5">
            <SonawebLogo showText={false} className="scale-75" />
            <p className="text-[11px] text-muted-foreground">
              Powered by SONAWEB Intelligence
            </p>
          </div>
        </div>
      </Card>
    </>
  )
}
