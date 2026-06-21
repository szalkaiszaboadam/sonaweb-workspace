'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { client } from '@/lib/data'
import { usePortal } from '@/lib/portal-store'
import { cn } from '@/lib/utils'
import { Sparkles, ArrowUp, Loader2, X } from 'lucide-react'

const suggestions = [
  'How are my TikTok numbers trending?',
  'What should I post next week?',
  'Explain my ad ROAS',
  'How can I get more leads?',
]

export function AiAssistantWidget() {
  const { assistantOpen, setAssistantOpen } = usePortal()
  const [input, setInput] = useState('')
  const { messages, sendMessage, status, error } = useChat({
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
      {/* Floating trigger */}
      <button
        onClick={() => setAssistantOpen(!assistantOpen)}
        aria-label="Open AI assistant"
        className={cn(
          'fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:scale-105 glow-red',
          assistantOpen && 'scale-0 opacity-0',
        )}
      >
        <Sparkles className="h-6 w-6" />
      </button>

      {/* Panel */}
      <div
        className={cn(
          'fixed bottom-0 right-0 z-50 flex h-[100dvh] w-full flex-col border-l border-border bg-card transition-transform duration-300 sm:bottom-5 sm:right-5 sm:h-[600px] sm:max-h-[calc(100dvh-2.5rem)] sm:w-[400px] sm:rounded-2xl sm:border',
          assistantOpen ? 'translate-y-0' : 'translate-y-full sm:translate-y-[120%]',
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Marketing Assistant
              </p>
              <p className="text-[11px] text-muted-foreground">
                Powered by SONAWEB Intelligence
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setAssistantOpen(false)}
            aria-label="Close assistant"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary glow-red">
                <Sparkles className="h-5 w-5" />
              </span>
              <h2 className="mt-3 text-sm font-semibold text-foreground">
                How can I help you grow?
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                I have your latest performance context.
              </p>
              <div className="mt-4 grid w-full grid-cols-1 gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => submit(s)}
                    className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-left text-xs text-foreground transition-colors hover:border-primary/50 hover:bg-secondary"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m) => {
                const text = m.parts
                  .filter((p) => p.type === 'text')
                  .map((p) => p.text)
                  .join('')
                const isUser = m.role === 'user'
                return (
                  <div
                    key={m.id}
                    className={`flex gap-2 ${isUser ? 'flex-row-reverse' : ''}`}
                  >
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarFallback
                        className={
                          isUser
                            ? 'bg-secondary text-[10px] font-semibold'
                            : 'bg-primary text-[10px] font-semibold text-primary-foreground'
                        }
                      >
                        {isUser ? client.initials : 'AI'}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`max-w-[82%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
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
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Thinking...
                </div>
              )}
              {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  The assistant is temporarily unavailable. Please make sure AI
                  credits are enabled on your Vercel account, then try again.
                </div>
              )}
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            submit(input)
          }}
          className="flex items-center gap-2 border-t border-border p-3"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the assistant..."
            className="h-10 border-border bg-background text-sm"
            disabled={busy}
          />
          <Button
            type="submit"
            size="icon"
            className="h-10 w-10 shrink-0"
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
      </div>
    </>
  )
}
