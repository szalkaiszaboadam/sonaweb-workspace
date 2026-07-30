'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { updateProject, updateProjectStatus, deleteProject } from '../actions'
import { Save, Trash2, AlertTriangle, Building2, AlignLeft, Target } from 'lucide-react'

type Project = {
  id: string
  name: string
  description: string | null
  client_name: string | null
  status: string
}

export function SettingsForm({ project, workspaceId }: { project: Project, workspaceId: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // 1. Alapadatok mentése
  const handleUpdateDetails = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData(e.currentTarget)
    const result = await updateProject(formData)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess('A projekt adatai sikeresen frissítve!')
      router.refresh() // Frissítjük az oldalt, hogy a bal oldali menüben is átíródjon a név
    }
    setIsLoading(false)
  }

  // 2. Státusz azonnali módosítása
  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusLoading(true)
    setError(null)
    setSuccess(null)

    const newStatus = e.target.value
    const result = await updateProjectStatus(project.id, newStatus)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess('A projekt státusza frissült!')
      router.refresh()
    }
    setStatusLoading(false)
  }

  // 3. Projekt törlése
  const handleDelete = async () => {
    if (!confirm('VIGYÁZAT! Biztosan törlöd a projektet? Ezzel elveszik minden feladat, dokumentum és komment! Ez a művelet visszavonhatatlan!')) {
      return
    }

    setIsLoading(true)
    const result = await deleteProject(project.id)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
    } else {
      // Siker esetén visszadobjuk a felhasználót a munkatér főoldalára
      router.push(`/${workspaceId}/projects`)
    }
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      
      {/* Visszajelzések (Siker / Hiba) */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl text-sm font-medium">
          {success}
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. SZEKCIÓ: ALAPADATOK */}
      {/* ========================================================= */}
      <section className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-border bg-sona-neutral/5">
          <h2 className="text-lg font-semibold text-foreground">Általános adatok</h2>
          <p className="text-sm text-sona-neutral">A projekt alapvető információinak módosítása.</p>
        </div>
        
        <form onSubmit={handleUpdateDetails} className="p-5 flex flex-col gap-5">
          <input type="hidden" name="id" value={project.id} />

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-foreground">Projekt neve <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              name="name" 
              defaultValue={project.name} 
              required
              className="w-full bg-background border border-border px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow text-sm font-medium"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4 text-sona-neutral" /> Ügyfél neve (Opcionális)
            </label>
            <input 
              type="text" 
              name="client_name" 
              defaultValue={project.client_name || ''} 
              className="w-full bg-background border border-border px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow text-sm"
              placeholder="pl. Apple Inc."
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <AlignLeft className="w-4 h-4 text-sona-neutral" /> Leírás (Opcionális)
            </label>
            <textarea 
              name="description" 
              defaultValue={project.description || ''} 
              rows={4}
              className="w-full bg-background border border-border px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow text-sm resize-y"
              placeholder="Rövid összefoglaló a projektről..."
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" disabled={isLoading} className="gap-2 px-6">
              <Save className="w-4 h-4" />
              {isLoading ? 'Mentés...' : 'Változtatások mentése'}
            </Button>
          </div>
        </form>
      </section>

      {/* ========================================================= */}
      {/* 2. SZEKCIÓ: STÁTUSZ (Azonnali mentéssel) */}
      {/* ========================================================= */}
      <section className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Target className="w-5 h-5 text-sona-neutral" /> Projekt állapota
            </h2>
            <p className="text-sm text-sona-neutral mt-1">Hol tart most a projekt? (Azonnal frissül)</p>
          </div>
          
          <div className="relative">
            <select
              defaultValue={project.status}
              onChange={handleStatusChange}
              disabled={statusLoading}
              className={`bg-background border border-border px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow text-sm font-bold cursor-pointer min-w-[200px] ${statusLoading ? 'opacity-50' : ''}`}
            >
              <option value="active">Folyamatban</option>
              <option value="completed">Befejezett</option>
              <option value="on_hold">Felfüggesztve</option>
              <option value="archived">Archivált</option>
            </select>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. SZEKCIÓ: VESZÉLYZÓNA */}
      {/* ========================================================= */}
      <section className="border border-red-500/30 rounded-2xl overflow-hidden shadow-sm relative">
        {/* Diszkrét vörös háttér a veszélyzónának */}
        <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />
        
        <div className="p-5 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-lg font-semibold text-red-500 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Veszélyzóna
            </h2>
            <p className="text-sm text-sona-neutral mt-1">
              A projekt törlésével minden adat, feladat és dokumentum véglegesen elveszik. Ezt nem lehet visszavonni!
            </p>
          </div>
          
          <button 
            type="button" 
            onClick={handleDelete}
            disabled={isLoading}
            className="shrink-0 flex items-center justify-center gap-2 px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Projekt törlése
          </button>
        </div>
      </section>

    </div>
  )
}