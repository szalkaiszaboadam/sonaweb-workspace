'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Plus } from 'lucide-react'
// Behúzzuk az egy mappával feljebb lévő actiont
import { createProject } from '../actions' 

export function CreateProjectModal({ workspaceId }: { workspaceId: string }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const result = await createProject(formData)

    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    } else {
      setIsOpen(false)
      setIsLoading(false)
      router.refresh() // Frissítjük a szerveroldali komponenst
    }
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="flex items-center gap-2">
        <Plus className="w-4 h-4" />
        Új Projekt
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Új projekt létrehozása">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          <input type="hidden" name="workspace_id" value={workspaceId} />

          <Input 
            label="Projekt neve" 
            id="name" 
            name="name" 
            placeholder="Pl.: Sonaweb Redesign" 
            required 
            autoFocus
          />
          
          <Input 
            label="Ügyfél neve (opcionális)" 
            id="client_name" 
            name="client_name" 
            placeholder="Pl.: Kovács Kft." 
          />

          <div className="flex flex-col gap-1.5 w-full">
            <label htmlFor="description" className="text-sm font-medium text-foreground">Leírás (opcionális)</label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground resize-none"
              placeholder="Rövid leírás a projektről..."
            />
          </div>
          
          {error && <p className="text-sm text-red-500 bg-red-500/10 p-2 rounded">{error}</p>}
          
          <div className="flex justify-end gap-3 mt-4">
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