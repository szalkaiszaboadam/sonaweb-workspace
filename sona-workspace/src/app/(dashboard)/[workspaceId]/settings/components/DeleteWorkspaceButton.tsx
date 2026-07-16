'use client'

import { useState } from 'react'
import { deleteWorkspace } from '../actions'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AlertTriangle } from 'lucide-react'

export function DeleteWorkspaceButton({ 
  workspaceId, 
  workspaceName 
}: { 
  workspaceId: string
  workspaceName: string 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault()
    // Dupla ellenőrzés: csak akkor fut le, ha a beírt szöveg pontosan egyezik
    if (confirmText !== workspaceName) return
    
    setIsLoading(true)
    const result = await deleteWorkspace(workspaceId)
    
    if (result?.error) {
      alert(result.error)
      setIsLoading(false)
    }
  }

  // Ha bezárjuk a modalt, alaphelyzetbe állítjuk az inputot
  const handleClose = () => {
    setIsOpen(false)
    setConfirmText('')
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm font-medium rounded-md border border-red-500/20 transition-colors whitespace-nowrap"
      >
        Munkaterület törlése
      </button>

      <Modal isOpen={isOpen} onClose={handleClose} title="Munkaterület törlése">
        <form onSubmit={handleDelete} className="flex flex-col gap-4">
          
          {/* Figyelmeztető doboz */}
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg flex items-start gap-3 text-red-500 mb-2">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold mb-1">Ez a művelet NEM vonható vissza!</p>
              <p>A(z) <strong>{workspaceName}</strong> munkaterület és a benne lévő összes adat (projektek, feladatok, tagok) véglegesen törlődik a rendszerből.</p>
            </div>
          </div>

          {/* Megerősítő input */}
          <div className="text-sm text-foreground mt-2">
            Kérlek, gépeld be a munkaterület nevét a megerősítéshez:<br/>
            <span className="font-mono font-bold bg-sona-neutral/10 px-1 py-0.5 rounded select-all mt-1 inline-block">
              {workspaceName}
            </span>
          </div>

         <Input 
            label="Munkaterület neve" 
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={workspaceName}
            autoFocus
          />
          
          {/* Gombok */}
          <div className="flex justify-end gap-3 mt-4">
            <Button type="button" variant="secondary" onClick={handleClose}>
              Mégse
            </Button>
            <button 
              type="submit" 
              disabled={isLoading || confirmText !== workspaceName}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white text-sm font-medium rounded-md transition-colors disabled:cursor-not-allowed"
            >
              {isLoading ? 'Törlés folyamatban...' : 'Végleges törlés'}
            </button>
          </div>

        </form>
      </Modal>
    </>
  )
}