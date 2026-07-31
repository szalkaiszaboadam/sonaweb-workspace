'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { updateProject, updateProjectStatus, deleteProject, toggleProjectMember, toggleProjectGroup } from '../actions'
import { Save, Trash2, AlertTriangle, Building2, AlignLeft, Target, Globe2, Lock, Users, Shield } from 'lucide-react'

type Props = {
  project: any
  workspaceId: string
  workspaceMembers: any[]
  workspaceGroups: any[]
  activeMemberIds: string[]
  activeGroupIds: string[]
}

export function SettingsForm({ project, workspaceId, workspaceMembers, workspaceGroups, activeMemberIds, activeGroupIds }: Props) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Állapot a láthatósághoz
  const [isPrivate, setIsPrivate] = useState(project.is_private || false)

  // 1. Alapadatok mentése
  const handleUpdateDetails = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true); setError(null); setSuccess(null)

    const formData = new FormData(e.currentTarget)
    formData.append('workspace_id', workspaceId)
    formData.append('is_private', isPrivate ? 'true' : 'false')

    const result = await updateProject(formData)
    if (result.error) setError(result.error)
    else { setSuccess('A projekt adatai sikeresen frissítve!'); router.refresh() }
    setIsLoading(false)
  }

  // 2. Státusz azonnali módosítása
  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusLoading(true)
    setError(null)
    setSuccess(null)

    const newStatus = e.target.value
    const result = await updateProjectStatus(project.id, workspaceId, newStatus)

    if (result?.error) {
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
    const result = await deleteProject(project.id, workspaceId)

    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    } else {
      router.push(`/${workspaceId}/projects`)
    }
  }

  // 4. Tag/Csoport hozzáadása
  const handleToggleMember = async (userId: string, isCurrentlyMember: boolean) => {
    setIsLoading(true)
    await toggleProjectMember(project.id, workspaceId, userId, !isCurrentlyMember)
    router.refresh(); setIsLoading(false)
  }

  const handleToggleGroup = async (groupId: string, isCurrentlyMember: boolean) => {
    setIsLoading(true)
    await toggleProjectGroup(project.id, workspaceId, groupId, !isCurrentlyMember)
    router.refresh(); setIsLoading(false)
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      
      {/* Visszajelzések */}
      {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-medium">{error}</div>}
      {success && <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl text-sm font-medium">{success}</div>}

      {/* ========================================================= */}
      {/* LÁTHATÓSÁG ÉS ADATVÉDELEM */}
      {/* ========================================================= */}
      <section className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-border bg-sona-neutral/5">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-sona-neutral" /> Projekt láthatósága
          </h2>
          <p className="text-sm text-sona-neutral mt-1">Döntsd el, ki láthatja ezt a projektet.</p>
        </div>
        
        <div className="p-5 flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Publikus kártya */}
            <div 
              onClick={() => setIsPrivate(false)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${!isPrivate ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-primary/50'}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Globe2 className={`w-5 h-5 ${!isPrivate ? 'text-primary' : 'text-sona-neutral'}`} />
                <h3 className={`font-semibold ${!isPrivate ? 'text-primary' : 'text-foreground'}`}>Publikus</h3>
              </div>
              <p className="text-xs text-sona-neutral">A munkaterület összes tagja automatikusan látja, és csatlakozhat a feladatokhoz.</p>
            </div>

            {/* Privát kártya */}
            <div 
              onClick={() => setIsPrivate(true)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${isPrivate ? 'border-orange-500 bg-orange-500/5' : 'border-border bg-background hover:border-orange-500/50'}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Lock className={`w-5 h-5 ${isPrivate ? 'text-orange-500' : 'text-sona-neutral'}`} />
                <h3 className={`font-semibold ${isPrivate ? 'text-orange-500' : 'text-foreground'}`}>Privát (Meghívásos)</h3>
              </div>
              <p className="text-xs text-sona-neutral">Csak Te, a Workspace tulajdonosok, és a külön meghívott tagok / csoportok láthatják.</p>
            </div>
          </div>

          {/* HA PRIVÁT, MEGJELENIK A TAGOK MEGHÍVÁSA */}
          {isPrivate && (
            <div className="mt-4 pt-5 border-t border-border animate-in fade-in duration-300">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-sona-neutral" /> Hozzáférések kezelése
              </h3>
              
              <div className="flex flex-col gap-6">
                {/* Csoportok */}
                {workspaceGroups.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-sona-neutral uppercase tracking-wider mb-2">Csoportok</h4>
                    <div className="flex flex-col gap-2">
                      {workspaceGroups.map(group => {
                        const isAdded = activeGroupIds.includes(group.id)
                        return (
                          <div key={group.id} className="flex items-center justify-between p-3 bg-background border border-border rounded-lg">
                            <span className="text-sm font-medium text-foreground">{group.name}</span>
                            <button disabled={isLoading} onClick={() => handleToggleGroup(group.id, isAdded)} className={`px-3 py-1.5 text-xs font-bold uppercase rounded-md transition-colors ${isAdded ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}>
                              {isAdded ? 'Eltávolítás' : 'Hozzáadás'}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Egyéni Tagok */}
                <div>
                  <h4 className="text-xs font-bold text-sona-neutral uppercase tracking-wider mb-2">Egyéni munkatársak</h4>
                  <div className="flex flex-col gap-2">
                    {workspaceMembers.filter(m => m.user_id !== project.user_id).map(member => {
                      const isAdded = activeMemberIds.includes(member.user_id)
                      return (
                        <div key={member.user_id} className="flex items-center justify-between p-3 bg-background border border-border rounded-lg">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">{member.name || 'Ismeretlen'}</span>
                            <span className="text-xs text-sona-neutral">{member.email}</span>
                          </div>
                          <button disabled={isLoading} onClick={() => handleToggleMember(member.user_id, isAdded)} className={`px-3 py-1.5 text-xs font-bold uppercase rounded-md transition-colors ${isAdded ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}>
                            {isAdded ? 'Eltávolítás' : 'Hozzáadás'}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* ALAPADATOK SZEKCIÓ */}
      {/* ========================================================= */}
      <section className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
         <div className="p-5 border-b border-border bg-sona-neutral/5">
            <h2 className="text-lg font-semibold text-foreground">Általános adatok</h2>
         </div>
         <form onSubmit={handleUpdateDetails} className="p-5 flex flex-col gap-5">
            <input type="hidden" name="id" value={project.id} />
            <input type="hidden" name="workspace_id" value={workspaceId} />
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-foreground">Projekt neve <span className="text-red-500">*</span></label>
              <input type="text" name="name" defaultValue={project.name} required className="w-full bg-background border border-border px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow text-sm font-medium" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <AlignLeft className="w-4 h-4 text-sona-neutral" /> Leírás (Opcionális)
              </label>
              <textarea name="description" rows={4} defaultValue={project.description || ''} className="w-full bg-background border border-border px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow text-sm resize-y" placeholder="Rövid összefoglaló a projektről..." />
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
      {/* STÁTUSZ SZEKCIÓ */}
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
              <option value="planning">Tervezés alatt</option>
              <option value="in_progress">Folyamatban</option>
              <option value="on_hold">Felfüggesztve</option>
              <option value="completed">Befejezett</option>
            </select>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* VESZÉLYZÓNA */}
      {/* ========================================================= */}
      <section className="border border-red-500/30 rounded-2xl overflow-hidden shadow-sm relative">
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