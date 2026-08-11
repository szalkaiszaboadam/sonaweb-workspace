'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'

// Prop a gomb vizuális megjelenéséhez (Üres állapot vagy Lista alatti)
type Props = {
  variant?: 'empty' | 'default'
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

    if (!user) {
      setError('Nincs bejelentkezve.')
      setIsLoading(false)
      return
    }

    const { data, error: insertError } = await supabase.rpc('create_workspace', {
      ws_name: name,
      user_id: user.id
    })

    if (insertError) {
      setError(insertError.message)
      setIsLoading(false)
    } else {
      setIsOpen(false)
      // Azonnal bedobjuk az új workspace-be
      router.push(`/${data}/overview`) 
    }
  }

  return (
    <>
      {/* DINAMIKUS GOMB MEGJELENÉS */}
      {variant === 'empty' ? (
        <Button onClick={() => setIsOpen(true)} className="gap-2 font-bold px-6">
          <Plus className="w-4 h-4" />
          Workspace létrehozása
        </Button>
      ) : (
        <Button onClick={() => setIsOpen(true)} variant="secondary" className="gap-2 w-full font-bold">
          <Plus className="w-4 h-4" />
          Új workspace
        </Button>
      )}

      {/* A MODAL */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Új workspace létrehozása">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input 
            label="Workspace neve" 
            name="name" 
            placeholder="pl. Sonaweb" 
            required 
            autoFocus 
          />
          
          {error && (
            <p className="text-sm font-medium text-red-500 bg-red-500/10 p-2 rounded-lg">
              {error}
            </p>
          )}
          
          <div className="flex justify-end gap-3 mt-2 border-t border-border pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>
              Mégse
            </Button>
            <Button type="submit" disabled={isLoading} className="w-auto">
              {isLoading ? 'Létrehozás...' : 'Létrehozás'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}