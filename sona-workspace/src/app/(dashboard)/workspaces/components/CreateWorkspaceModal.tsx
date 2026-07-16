'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation' // 1. Ezt importáljuk be!
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Plus } from 'lucide-react'
import { createWorkspace } from '../actions'

export function CreateWorkspaceModal() {
  const router = useRouter() // 2. Ezt inicializáljuk!
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const result = await createWorkspace(formData)

    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    } else {
      setIsOpen(false)
      setIsLoading(false)
      router.refresh() // 3. Ez kényszeríti ki az oldal újratöltését a háttérben!
    }
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="flex items-center gap-2">
        <Plus className="w-5 h-5" />
        Új Workspace
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Workspace létrehozása">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input 
            label="Munkaterület neve" 
            id="name" 
            name="name"      
            placeholder="Pl.: Saját Ügynökség" 
            required 
            autoFocus
          />
          
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