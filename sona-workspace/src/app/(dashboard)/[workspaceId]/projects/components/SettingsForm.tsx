'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { updateProject, deleteProject, toggleProjectMember } from '../actions'
import { Save, Trash2, AlertTriangle, Globe2, Lock, Users, Shield } from 'lucide-react'
import { PROJECT_ICONS, PROJECT_COLORS } from '@/lib/project-icons'
import { Avatar } from '@/components/ui/Avatar'

type Props = {
  project: any
  workspaceId: string
  workspaceMembers: any[]
  activeMemberIds: string[]
}

export function SettingsForm({ project, workspaceId, workspaceMembers, activeMemberIds }: Props) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [isPrivate, setIsPrivate] = useState(project.is_private || false)
  const [selectedEmoji, setSelectedEmoji] = useState(project.emoji || 'folder')
  const [selectedColor, setSelectedColor] = useState(project.color || 'primary')

  const handleUpdateDetails = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true); setError(null); setSuccess(null)

    const formData = new FormData(e.currentTarget)
    formData.append('workspace_id', workspaceId)
    formData.append('is_private', isPrivate ? 'true' : 'false')
    formData.append('emoji', selectedEmoji)
    formData.append('color', selectedColor)

    const result = await updateProject(formData)
    if (result.error) setError(result.error)
    else { setSuccess('A projekt adatai sikeresen frissítve!'); router.refresh() }
    setIsLoading(false)
  }

  const handleDelete = async () => {
    if (!confirm('VIGYÁZAT! Biztosan törlöd a projektet? Ezzel elveszik minden adat!')) return
    setIsLoading(true)
    const result = await deleteProject(project.id, workspaceId)
    if (result?.error) { setError(result.error); setIsLoading(false) } 
    else router.push(`/${workspaceId}/projects`)
  }

  const handleToggleMember = async (userId: string, isCurrentlyMember: boolean) => {
    setIsLoading(true)
    await toggleProjectMember(project.id, workspaceId, userId, !isCurrentlyMember)
    router.refresh(); setIsLoading(false)
  }


  return (
    <div className="flex flex-col gap-8 pb-12">
      
      {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-medium">{error}</div>}
      {success && <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl text-sm font-medium">{success}</div>}

      <form onSubmit={handleUpdateDetails} className="flex flex-col gap-8">
        <input type="hidden" name="id" value={project.id} />
        
        {/* 1. SZEKCIÓ: ÁLTALÁNOS BEÁLLÍTÁSOK */}
        <section className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
           <div className="p-5 border-b border-border bg-sona-neutral/5">
              <h2 className="text-lg font-semibold text-foreground">Általános adatok</h2>
           </div>
           <div className="p-5 flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-sm font-semibold text-foreground">Projekt neve</label>
                  <input type="text" name="name" defaultValue={project.name} required className="w-full bg-background border border-border px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium" />
                </div>
                
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-sm font-semibold text-foreground">Státusz</label>
                  <select name="status" defaultValue={project.status} className="w-full bg-background border border-border px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-bold cursor-pointer">
                    <option value="planning">Tervezés alatt</option>
                    <option value="in_progress">Folyamatban</option>
                    <option value="on_hold">Felfüggesztve</option>
                    <option value="completed">Befejezett</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-sm font-semibold text-foreground">Projekt ikon és szín</label>
                <div className="flex flex-wrap gap-2">
                  {PROJECT_ICONS.map(item => {
                    const Icon = item.icon
                    return (
                      <button type="button" key={item.id} onClick={() => setSelectedEmoji(item.id)} className={`w-10 h-10 flex items-center justify-center rounded-lg border-2 transition-all ${selectedEmoji === item.id ? 'border-primary bg-primary/10 text-primary' : 'border-transparent bg-sona-neutral/10 text-sona-neutral hover:bg-sona-neutral/20'}`}>
                        <Icon className="w-5 h-5" />
                      </button>
                    )
                  })}
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {PROJECT_COLORS.map(c => (
                    <button type="button" key={c.id} onClick={() => setSelectedColor(c.id)} className={`w-8 h-8 rounded-full border-2 transition-all ${c.bg} ${selectedColor === c.id ? c.border : 'border-transparent'}`} />
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-foreground">Leírás</label>
                <textarea name="description" rows={4} defaultValue={project.description || ''} className="w-full bg-background border border-border px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-y" placeholder="Rövid összefoglaló..." />
              </div>
           </div>
        </section>

        {/* 2. SZEKCIÓ: LÁTHATÓSÁG ÉS ADATVÉDELEM */}
        <section className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-border bg-sona-neutral/5">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Shield className="w-5 h-5 text-sona-neutral" /> Projekt láthatósága
            </h2>
          </div>
          
          <div className="p-5 flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div onClick={() => setIsPrivate(false)} className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${!isPrivate ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-primary/50'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <Globe2 className={`w-5 h-5 ${!isPrivate ? 'text-primary' : 'text-sona-neutral'}`} />
                  <h3 className={`font-semibold ${!isPrivate ? 'text-primary' : 'text-foreground'}`}>Publikus</h3>
                </div>
              </div>
              <div onClick={() => setIsPrivate(true)} className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${isPrivate ? 'border-orange-500 bg-orange-500/5' : 'border-border bg-background hover:border-orange-500/50'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <Lock className={`w-5 h-5 ${isPrivate ? 'text-orange-500' : 'text-sona-neutral'}`} />
                  <h3 className={`font-semibold ${isPrivate ? 'text-orange-500' : 'text-foreground'}`}>Privát (Meghívásos)</h3>
                </div>
              </div>
            </div>

            {isPrivate && (
              <div className="mt-4 pt-5 border-t border-border animate-in fade-in duration-300">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-sona-neutral" /> Hozzáférések kezelése
                </h3>
                <div className="flex flex-col gap-6">
                  
                  <div>
                    <h4 className="text-xs font-bold text-sona-neutral uppercase tracking-wider mb-2">Egyéni munkatársak</h4>
                    <div className="flex flex-col gap-2">
                      {workspaceMembers.filter(m => m.user_id !== project.user_id).map(member => {
                        const isAdded = activeMemberIds.includes(member.user_id)
                        return (
                          <div key={member.user_id} className="flex items-center justify-between p-3 bg-background border border-border rounded-lg">
                            <div className="flex items-center gap-3">
                            <Avatar name={member.name || 'Ismeretlen'} url={member.avatar_url} className="w-8 h-8 text-xs shrink-0" />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-foreground">{member.name || 'Ismeretlen'}</span>
                              <span className="text-xs text-sona-neutral">{member.email}</span>
                            </div>
                          </div>
                            <button type="button" disabled={isLoading} onClick={() => handleToggleMember(member.user_id, isAdded)} className={`px-3 py-1.5 text-xs font-bold uppercase rounded-md transition-colors ${isAdded ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}>{isAdded ? 'Eltávolítás' : 'Hozzáadás'}</button>
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

        {/* MENTÉS GOMB AZ EGÉSZ FORM ALJÁN */}
        <div className="flex justify-end sticky bottom-4 z-10">
          <Button type="submit" disabled={isLoading} className="gap-2 px-8 py-3 text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all w-full sm:w-auto">
            <Save className="w-5 h-5" /> 
            {isLoading ? 'Mentés folyamatban...' : 'Összes változtatás mentése'}
          </Button>
        </div>
      </form>

      {/* 3. SZEKCIÓ: VESZÉLYZÓNA */}
      <section className="border border-red-500/30 rounded-2xl overflow-hidden shadow-sm relative mt-4">
        <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />
        <div className="p-5 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-lg font-semibold text-red-500 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Veszélyzóna</h2>
            <p className="text-sm text-sona-neutral mt-1">A projekt törlésével minden adat véglegesen elveszik.</p>
          </div>
          <button type="button" onClick={handleDelete} disabled={isLoading} className="shrink-0 flex items-center justify-center gap-2 px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50">
            <Trash2 className="w-4 h-4" /> Projekt törlése
          </button>
        </div>
      </section>
    </div>
  )
}