'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { UserPlus, CheckCircle2 } from 'lucide-react'
import { inviteUser } from '@/features/workspaces/actions/invitations'

export function InviteMemberModal({ workspaceId }: { workspaceId: string }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string

    // Itt hívjuk a korábban megírt logikát
    const result = await inviteUser(workspaceId, email)

    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    } else {
      setSuccess(true)
      setIsLoading(false)
      router.refresh() // Frissítjük a hátteret, hogy megjelenjen a listában
      
      // 2 másodperc múlva bezárjuk a modalt
      setTimeout(() => {
        setIsOpen(false)
        setSuccess(false)
      }, 2000)
    }
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="flex items-center gap-2">
        <UserPlus className="w-4 h-4" />
        Tag meghívása
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Új csapattag meghívása">
        {success ? (
          <div className="flex flex-col items-center justify-center py-6 text-center animate-in fade-in zoom-in">
            <CheckCircle2 className="w-12 h-12 text-green-500 mb-3" />
            <h3 className="text-lg font-medium text-foreground">Meghívó elküldve!</h3>
            <p className="text-sm text-sona-neutral mt-1">
              A meghívót sikeresen rögzítettük a rendszerben.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <p className="text-sm text-sona-neutral mb-2">
              Küldj meghívót a munkatársadnak. A meghívó 7 napig lesz érvényes.
            </p>
            
            <Input 
              label="E-mail cím" 
              name="email" 
              type="email"
              placeholder="kolléga@ugynokseg.hu" 
              required 
              autoFocus
            />
            
            {error && <p className="text-sm text-red-500 bg-red-500/10 p-2 rounded">{error}</p>}
            
            <div className="flex justify-end gap-3 mt-4">
              <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>
                Mégse
              </Button>
              <Button type="submit" disabled={isLoading} className="w-auto">
                {isLoading ? 'Küldés...' : 'Meghívó küldése'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  )
}