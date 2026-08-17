'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Globe2, Lock, AlertTriangle, Users, FolderKanban } from 'lucide-react'
import { updateProject, deleteProject, toggleProjectMember } from '../actions'
import { Avatar } from '@/components/ui/Avatar'
import { PROJECT_ICONS, PROJECT_COLORS, getProjectIcon, getProjectColor } from '@/lib/project-icons'

type Props = {
  project: any
  workspaceId: string
  workspaceMembers: any[]
  activeMemberIds: string[]
  canEdit: boolean           // <-- ÚJ
  canManageAccess: boolean   // <-- ÚJ
  canDelete: boolean         // <-- ÚJ
}

export function SettingsForm({ project, workspaceId, workspaceMembers, activeMemberIds, canEdit, canManageAccess, canDelete }: Props) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  // Űrlap adatok
  const [name, setName] = useState(project.name)
  const [description, setDescription] = useState(project.description || '')
  const [isPrivate, setIsPrivate] = useState(project.is_private)
  const [status, setStatus] = useState(project.status)
  const [emoji, setEmoji] = useState(project.emoji || 'folder')
  const [color, setColor] = useState(project.color || 'primary')

  // UI Állapotok
  const [showIconPicker, setShowIconPicker] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'access'>('general')

  const ActiveIcon = getProjectIcon(emoji)
  const activeColorTheme = getProjectColor(color)

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canEdit) return // Védelem kliens oldalon is!
    setIsLoading(true)
    const formData = new FormData()
    formData.append('id', project.id)
    formData.append('workspace_id', workspaceId)
    formData.append('name', name)
    formData.append('description', description)
    formData.append('is_private', String(isPrivate))
    formData.append('status', status)
    formData.append('emoji', emoji)
    formData.append('color', color)

    const result = await updateProject(formData)
    if (result.error) alert(result.error)
    else router.refresh()
    setIsLoading(false)
  }

  const handleDelete = async () => {
    if (!canDelete) return
    if (!confirm('Biztosan törlöd ezt a projektet? Ez a művelet nem vonható vissza, és a feladatok is törlődnek!')) return
    setIsLoading(true)
    const result = await deleteProject(project.id, workspaceId)
    if (result.error) alert(result.error)
    else router.push(`/${workspaceId}/projects`)
    setIsLoading(false)
  }

  const handleToggleMember = async (userId: string, isMember: boolean) => {
    if (!canManageAccess) return
    const result = await toggleProjectMember(project.id, workspaceId, userId, isMember)
    if (result.error) alert(result.error)
    else router.refresh()
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* TABOK */}
      <div className="flex items-center gap-1 bg-surface border border-border p-1 rounded-lg w-fit">
        <button onClick={() => setActiveTab('general')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${activeTab === 'general' ? 'bg-primary/10 text-primary' : 'text-sona-neutral hover:text-foreground'}`}>Általános</button>
        <button onClick={() => setActiveTab('access')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${activeTab === 'access' ? 'bg-primary/10 text-primary' : 'text-sona-neutral hover:text-foreground'}`}>Hozzáférés</button>
      </div>

      {activeTab === 'general' && (
        <form onSubmit={handleUpdate} className="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col gap-6">
          {!canEdit && (
            <div className="bg-orange-500/10 text-orange-500 text-sm p-4 rounded-lg flex items-center gap-2 font-medium">
              <Lock className="w-4 h-4 shrink-0" />
              Nincs jogosultságod a projekt alapadatait módosítani, ezért ezek a mezők csak olvashatók.
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-foreground">Projekt ikon</span>
              <div className="relative">
                <button type="button" disabled={!canEdit} onClick={() => setShowIconPicker(!showIconPicker)} className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-sm border transition-all ${!canEdit ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'} ${activeColorTheme.bg} ${activeColorTheme.text} ${activeColorTheme.border}`}>
                  <ActiveIcon className="w-8 h-8" strokeWidth={2.5} />
                </button>
                
                {showIconPicker && canEdit && (
                  <div className="absolute top-full left-0 mt-2 p-3 bg-surface border border-border rounded-xl shadow-xl z-50 w-64">
                    <div className="mb-3">
                      <span className="text-xs font-bold text-sona-neutral uppercase mb-2 block">Színek</span>
                      <div className="flex flex-wrap gap-2">
                        {PROJECT_COLORS.map(c => (
                          <button key={c.id} type="button" onClick={() => setColor(c.id)} className={`w-6 h-6 rounded-full border-2 ${c.bg} ${c.border} ${color === c.id ? 'ring-2 ring-foreground ring-offset-2 ring-offset-surface' : ''}`} />
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-sona-neutral uppercase mb-2 block">Ikonok</span>
                      <div className="grid grid-cols-5 gap-2">
                        {PROJECT_ICONS.map(i => {
                          const IconComp = i.icon
                          return (
                            <button key={i.id} type="button" onClick={() => { setEmoji(i.id); setShowIconPicker(false) }} className="w-8 h-8 flex items-center justify-center text-sona-neutral hover:bg-sona-neutral/10 hover:text-foreground rounded-md transition-colors">
                              <IconComp className="w-4 h-4" />
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-4">
              <Input label="Projekt neve" name="name" value={name} onChange={e => setName(e.target.value)} required disabled={!canEdit} />
              
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-foreground">Státusz</label>
                <select value={status} onChange={e => setStatus(e.target.value)} disabled={!canEdit} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-70 disabled:cursor-not-allowed">
                  <option value="planning">Tervezés alatt</option>
                  <option value="in_progress">Folyamatban</option>
                  <option value="on_hold">Felfüggesztve</option>
                  <option value="completed">Befejezett</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">Leírás (opcionális)</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} disabled={!canEdit} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-70 disabled:cursor-not-allowed" placeholder="Rövid leírás a projektről..." />
          </div>

          {canEdit && (
            <div className="flex justify-end pt-4 border-t border-border mt-2">
              <Button type="submit" disabled={isLoading} className="w-auto">{isLoading ? 'Mentés...' : 'Változtatások mentése'}</Button>
            </div>
          )}
        </form>
      )}

      {activeTab === 'access' && (
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col gap-6">
          {!canManageAccess && (
            <div className="bg-orange-500/10 text-orange-500 text-sm p-4 rounded-lg flex items-center gap-2 font-medium">
              <Lock className="w-4 h-4 shrink-0" />
              Nincs jogosultságod a projekt hozzáférését és tagjait kezelni.
            </div>
          )}

          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Láthatóság</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div onClick={() => canManageAccess && setIsPrivate(false)} className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-colors ${!canManageAccess ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'} ${!isPrivate ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                <Globe2 className={`w-5 h-5 shrink-0 ${!isPrivate ? 'text-primary' : 'text-sona-neutral'}`} />
                <div className="flex flex-col gap-1">
                  <span className={`text-sm font-bold ${!isPrivate ? 'text-primary' : 'text-foreground'}`}>Publikus</span>
                  <span className="text-xs text-sona-neutral">A munkaterület minden tagja látja és hozzáfér.</span>
                </div>
              </div>
              <div onClick={() => canManageAccess && setIsPrivate(true)} className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-colors ${!canManageAccess ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'} ${isPrivate ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                <Lock className={`w-5 h-5 shrink-0 ${isPrivate ? 'text-primary' : 'text-sona-neutral'}`} />
                <div className="flex flex-col gap-1">
                  <span className={`text-sm font-bold ${isPrivate ? 'text-primary' : 'text-foreground'}`}>Privát</span>
                  <span className="text-xs text-sona-neutral">Csak a meghívott tagok látják és férnek hozzá.</span>
                </div>
              </div>
            </div>
            {canManageAccess && isPrivate !== project.is_private && (
              <Button type="button" onClick={handleUpdate} disabled={isLoading} className="w-auto self-end mt-2">Láthatóság Mentése</Button>
            )}
          </div>

          <hr className="border-border" />

          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Csapat hozzáférés</h3>
            {!isPrivate ? (
              <p className="text-sm text-sona-neutral italic bg-sona-neutral/5 p-4 rounded-lg">
                Mivel a projekt publikus, a munkaterület összes tagja ({workspaceMembers.length} fő) automatikusan hozzáfér.
              </p>
            ) : (
              <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
                {workspaceMembers.map(member => {
                  const hasAccess = activeMemberIds.includes(member.user_id) || member.user_id === project.user_id
                  const isCreator = member.user_id === project.user_id
                  return (
                    <div key={member.user_id} className="flex items-center justify-between p-3 bg-background hover:bg-sona-neutral/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar name={member.name} url={member.avatar_url} className="w-8 h-8 text-xs" />
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                            {member.name} {isCreator && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase font-bold">Létrehozó</span>}
                          </span>
                          <span className="text-xs text-sona-neutral">{member.email}</span>
                        </div>
                      </div>
                      {isCreator ? (
                         <span className="text-xs font-bold text-sona-neutral uppercase px-2 py-1 bg-sona-neutral/10 rounded-md">Alapértelmezett</span>
                      ) : (
                        canManageAccess ? (
                          <button onClick={() => handleToggleMember(member.user_id, !hasAccess)} className={`text-xs font-bold px-3 py-1.5 rounded-md transition-colors ${hasAccess ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}>
                            {hasAccess ? 'Eltávolítás' : 'Hozzáadás'}
                          </button>
                        ) : (
                          <span className={`text-xs font-bold uppercase px-2 py-1 rounded-md ${hasAccess ? 'bg-green-500/10 text-green-500' : 'bg-sona-neutral/10 text-sona-neutral'}`}>
                            {hasAccess ? 'Tag' : 'Nincs Hozzáférése'}
                          </span>
                        )
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TÖRLÉS SZEKCIÓ - CSAK AKKOR LÁTSZIK, HA VAN JOGA TÖRÖLNI! */}
      {canDelete && (
        <section className="mt-8 pt-8 border-t border-red-500/20">
          <div className="border border-red-500/30 rounded-xl overflow-hidden relative bg-surface p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />
            <div className="relative z-10">
              <h3 className="text-base font-bold text-red-500 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Projekt törlése
              </h3>
              <p className="text-sm text-sona-neutral mt-1 max-w-xl">
                A projekt és az összes benne lévő feladat, dokumentum és fájl véglegesen törlődik.
              </p>
            </div>
            <div className="shrink-0 relative z-10">
             <Button type="button" onClick={handleDelete} disabled={isLoading} className="bg-red-500 hover:bg-red-600 text-white border-transparent shadow-md">{isLoading ? 'Folyamatban...' : 'Törlés véglegesen'}</Button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}