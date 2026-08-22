'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'

// 🚀 ITT VAN A JAVÍTÁS: Hozzáadtuk a 'row' típust
type Props = {
  variant?: 'empty' | 'default' | 'row'
}

export function CreateWorkspaceModal({ variant = 'default' }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const { data, error: insertError } = await supabase.rpc('create_workspace', { ws_name: name, user_id: user.id })

    if (insertError) {
      setError(insertError.message)
      setIsLoading(false)
    } else {
      setIsOpen(false)
      router.push(`/${data}/overview`) 
    }
  }

  return (
    <>
      {/* GOMBOK STÍLUSAI */}
      {variant === 'empty' ? (
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-foreground text-background font-semibold text-[14px] rounded-xl hover:opacity-90 transition-opacity shadow-sm w-full"
        >
          <Plus className="w-4 h-4 shrink-0" />
          Munkaterület létrehozása
        </button>
      ) : variant === 'row' ? (
        /* 🚀 APPLE LISTA-SOR STÍLUS: Olyan, mint egy menüpont! */
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center gap-4 p-4 bg-transparent hover:bg-sona-neutral/5 transition-colors text-left group outline-none focus-visible:bg-sona-neutral/5"
        >
          <div className="w-11 h-11 rounded-[12px] bg-sona-neutral/10 flex items-center justify-center shrink-0 border border-sona-neutral/20 group-hover:bg-primary/10 group-hover:border-primary/20 transition-colors duration-300">
            <Plus className="w-5 h-5 text-sona-neutral group-hover:text-primary transition-colors" />
          </div>
          <span className="text-[15px] font-semibold text-sona-neutral group-hover:text-primary transition-colors">
            Új munkaterület...
          </span>
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-background border border-border/60 hover:border-border text-foreground font-medium text-[13px] rounded-xl hover:bg-sona-neutral/5 transition-all shadow-sm active:scale-[0.99]"
        >
          <Plus className="w-4 h-4 shrink-0 text-sona-neutral" />
          Új munkaterület
        </button>
      )}

      {/* A MODAL */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Új munkaterület létrehozása">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          
          <Input 
            label="Munkaterület neve" 
            name="name" 
            placeholder="pl. Marketing Csapat" 
            required 
            autoFocus 
          />
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[13px] font-medium p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2.5 mt-4 border-t border-border/40 pt-5">
            <button 
              type="button" 
              onClick={() => setIsOpen(false)} 
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium text-[13px] text-foreground hover:bg-sona-neutral/10 transition-colors"
            >
              Mégse
            </button>
            
            <button 
              type="submit" 
              disabled={isLoading} 
              className="inline-flex items-center justify-center px-5 py-2 rounded-lg font-medium text-[13px] bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isLoading ? 'Létrehozás...' : 'Létrehozás'}
            </button>
          </div>

        </form>
      </Modal>
    </>
  )
}