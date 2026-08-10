'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Send, Trash2 } from 'lucide-react'
import { getComments, addComment, deleteComment } from '../actions'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'

type Comment = {
  id: string
  content: string
  created_at: string
  user: { email: string, name?: string, avatar_url?: string }
}

export function CommentSection({ targetType, targetId }: { targetType: 'task' | 'document', targetId: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function loadComments() {
      const { comments: data } = await getComments(targetType, targetId)
      if (data) setComments(data)
    }
    loadComments()
  }, [targetType, targetId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setIsLoading(true)
    const { comment } = await addComment(targetType, targetId, newComment)
    if (comment) {
      setComments([...comments, comment])
      setNewComment('')
    }
    setIsLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Törlöd a kommentet?')) return
    await deleteComment(id)
    setComments(comments.filter(c => c.id !== id))
  }

  return (
    <div className="flex flex-col gap-4 mt-6">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-sona-neutral" /> Hozzászólások
      </h3>
      
      <div className="flex flex-col gap-3">
        {comments.length === 0 ? (
          <p className="text-xs text-sona-neutral italic">Még nincs hozzászólás.</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="bg-sona-neutral/5 p-3 rounded-lg group relative flex gap-3">
              <Avatar name={c.user?.name || c.user?.email} url={c.user?.avatar_url} className="w-8 h-8 text-xs shrink-0" />
              <div className="flex flex-col w-full min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-foreground truncate mr-2">{c.user?.name || c.user?.email || 'Ismeretlen'}</span>
                    <span className="text-[10px] text-sona-neutral shrink-0">
                      {new Date(c.created_at).toLocaleString('hu-HU', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{c.content}</p>
              </div>
              <button onClick={() => handleDelete(c.id)} className="absolute top-2 right-2 p-1.5 bg-background rounded-md text-sona-neutral hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all shadow-sm border border-border">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* <form> HELYETT <div>-ET HASZNÁLUNK */}
      <div className="flex flex-col gap-2 relative mt-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Írj egy hozzászólást..."
          className="w-full text-sm bg-background border border-border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px] resize-y"
        />
        <div className="flex justify-end">
          {/* A gomb type="button" lett, és megkapta az onClick={handleSubmit} eseményt */}
          <Button 
            type="button" 
            onClick={handleSubmit} 
            disabled={isLoading || !newComment.trim()} 
            className="py-1.5 px-4 text-sm gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            {isLoading ? 'Küldés...' : 'Küldés'}
          </Button>
        </div>
      </div>
    </div>
  )
}