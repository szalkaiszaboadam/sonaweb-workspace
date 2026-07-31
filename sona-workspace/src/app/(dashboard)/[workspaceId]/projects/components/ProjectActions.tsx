'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreVertical, Edit2, Trash2, AlertTriangle } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { updateProject, deleteProject } from '../actions'

type Project = {
  id: string
  workspace_id: string
  name: string
  description: string | null
  client_name: string | null
  is_private?: boolean // ÚJ
}

// ÚJ PROP: isManager
export function ProjectActions({ project, isManager }: { project: Project, isManager: boolean }) {
  const router = useRouter()
  
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // HA NEM MANAGER, AKKOR ELREJTJÜK A GOMBOT!
  if (!isManager) return <div className="w-8 h-8" /> 

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    // Ne felejtsük el átadni a rejtett is_private értéket, hogy ne írja felül!
    formData.append('is_private', project.is_private ? 'true' : 'false') 
    const result = await updateProject(formData)
    if (result?.error) { setError(result.error); setIsLoading(false) } 
    else { setIsEditModalOpen(false); setIsLoading(false); router.refresh() }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    const result = await deleteProject(project.id, project.workspace_id)
    if (result?.error) { setError(result.error); setIsLoading(false) } 
    else { setIsDeleteModalOpen(false); setIsLoading(false); router.refresh() }
  }

  return (
    // ... INNEN TELJESEN UGYANAZ, MINT A KORÁBBI KÓDOD!
    // A gomb (MoreVertical), a Modalok, minden változatlan maradhat.
    // Csak ne felejts el egy <input type="hidden" name="workspace_id" value={project.workspace_id} /> beletenni az Edit Formba!
    <div className="relative">
      <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-1.5 text-sona-neutral hover:text-foreground hover:bg-sona-neutral/10 rounded-md transition-colors">
        <MoreVertical className="w-5 h-5" />
      </button>

      {isMenuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
          <div className="absolute top-full right-0 mt-1 w-40 bg-surface border border-border shadow-lg rounded-md z-50 py-1 overflow-hidden">
            <button onClick={() => { setIsMenuOpen(false); setIsEditModalOpen(true) }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-sona-neutral/10 transition-colors text-foreground">
              <Edit2 className="w-4 h-4" /> Szerkesztés
            </button>
            <button onClick={() => { setIsMenuOpen(false); setIsDeleteModalOpen(true) }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-red-500/10 hover:text-red-500 transition-colors text-red-500/90">
              <Trash2 className="w-4 h-4" /> Törlés
            </button>
          </div>
        </>
      )}

      {/* SZERKESZTŐ MODÁL */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Projekt szerkesztése">
        <form onSubmit={handleEdit} className="flex flex-col gap-4">
          <input type="hidden" name="id" value={project.id} />
          <input type="hidden" name="workspace_id" value={project.workspace_id} />
          <Input label="Projekt neve" id="edit-name" name="name" defaultValue={project.name} required />
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-medium text-foreground">Leírás (opcionális)</label>
            <textarea name="description" rows={3} defaultValue={project.description || ''} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground resize-none" />
          </div>
          {error && <p className="text-sm text-red-500 bg-red-500/10 p-2 rounded">{error}</p>}
          <div className="flex justify-end gap-3 mt-4">
            <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>Mégse</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Mentés...' : 'Mentés'}</Button>
          </div>
        </form>
      </Modal>

      {/* TÖRLÉS MEGERŐSÍTŐ MODÁL */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Projekt törlése">
        <div className="flex flex-col items-center text-center gap-4 py-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Biztosan törlöd?</h3>
          <p className="text-sm text-sona-neutral">
            A(z) <span className="font-semibold text-foreground">{project.name}</span> projekt és minden adat véglegesen törlődik.
          </p>
          {error && <p className="text-sm text-red-500 bg-red-500/10 p-2 rounded w-full">{error}</p>}
          <div className="flex justify-center gap-3 w-full mt-4">
            <Button type="button" variant="secondary" onClick={() => setIsDeleteModalOpen(false)} className="flex-1">Mégse</Button>
            <Button type="button" onClick={handleDelete} disabled={isLoading} className="flex-1 bg-red-500 hover:bg-red-600 text-white border-transparent">
              {isLoading ? 'Törlés...' : 'Igen, törlöm'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}