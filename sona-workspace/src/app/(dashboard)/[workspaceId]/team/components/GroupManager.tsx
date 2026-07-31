'use client'

import { useState } from 'react'
import { Plus, Users, Settings2, Trash2, X, AlertTriangle } from 'lucide-react'
import { createGroup, deleteGroup, toggleGroupMember } from '../actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'

type Member = { id: string; email: string; name: string; role: string }
type Group = { id: string; name: string; memberIds: string[] }

type Props = {
  workspaceId: string
  members: Member[]
  groups: Group[]
  currentUserRole: string
}

export function GroupManager({ workspaceId, members, groups, currentUserRole }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Modálok állapotai
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)

  // -- CSOPORT LÉTREHOZÁSA --
  const handleCreateGroup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string

    const result = await createGroup(workspaceId, name)
    if (result.error) setError(result.error)
    else setIsCreateModalOpen(false)
    
    setIsLoading(false)
  }

  // -- CSOPORT TÖRLÉSE --
  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Biztosan törlöd ezt a csoportot?')) return
    setIsLoading(true)
    const result = await deleteGroup(workspaceId, groupId)
    if (result.error) setError(result.error)
    setIsLoading(false)
  }

  // -- TAG HOZZÁADÁSA / ELTÁVOLÍTÁSA --
  const handleToggleMember = async (groupId: string, userId: string, currentStatus: boolean) => {
    setIsLoading(true)
    const result = await toggleGroupMember(workspaceId, groupId, userId, !currentStatus)
    if (result.error) setError(result.error)
    setIsLoading(false)
  }

  const editingGroup = groups.find(g => g.id === editingGroupId)

  return (
    <div className="flex flex-col gap-4">
      
      {/* FEJLÉC */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Munkacsoportok</h2>
        {currentUserRole === 'owner' && (
          <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Új csoport
          </Button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg flex items-center gap-2 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* RÁCSOS LISTA (Bento stílusú kártyák) */}
      {groups.length === 0 ? (
        <div className="bg-surface border border-dashed border-border rounded-xl p-8 text-center flex flex-col items-center">
          <Users className="w-8 h-8 text-sona-neutral/50 mb-3" />
          <p className="text-sm text-sona-neutral">Nincsenek még létrehozott csoportok.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map(group => {
            const groupMembers = members.filter(m => group.memberIds.includes(m.id))
            
            return (
              <div key={group.id} className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
                
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-foreground truncate">{group.name}</h3>
                  {currentUserRole === 'owner' && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => setEditingGroupId(group.id)} className="p-1.5 text-sona-neutral hover:text-primary hover:bg-primary/10 rounded-md transition-colors">
                        <Settings2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteGroup(group.id)} className="p-1.5 text-sona-neutral hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* AVATÁROK MEGJELENÍTÉSE */}
                <div>
                  <div className="text-xs text-sona-neutral mb-2 font-medium uppercase tracking-wider">
                    {groupMembers.length} Tag
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {groupMembers.length === 0 ? (
                      <span className="text-xs text-sona-neutral/70 italic">Nincsenek tagok</span>
                    ) : (
                      groupMembers.map(member => (
                        <div key={member.id} title={member.name} className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-bold shadow-sm">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
              </div>
            )
          })}
        </div>
      )}

      {/* LÉTREHOZÁS MODAL */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Új csoport létrehozása">
        <form onSubmit={handleCreateGroup} className="flex flex-col gap-4">
          <Input label="Csoport neve" name="name" placeholder="pl. Fejlesztők, Designerek" required autoFocus />
          <div className="flex justify-end gap-3 mt-2">
            <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>Mégse</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Létrehozás...' : 'Mentés'}</Button>
          </div>
        </form>
      </Modal>

      {/* TAGOK SZERKESZTÉSE MODAL */}
      <Modal isOpen={!!editingGroupId} onClose={() => setEditingGroupId(null)} title={`${editingGroup?.name} - Tagok kezelése`}>
        <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
          {members.map(member => {
            const isMember = editingGroup?.memberIds.includes(member.id) || false
            return (
              <div key={member.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-sona-neutral/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{member.name}</span>
                    <span className="text-xs text-sona-neutral">{member.email}</span>
                  </div>
                </div>
                <button
                  disabled={isLoading}
                  onClick={() => editingGroupId && handleToggleMember(editingGroupId, member.id, isMember)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 ${
                    isMember ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-primary/10 text-primary hover:bg-primary/20'
                  }`}
                >
                  {isMember ? 'Eltávolítás' : 'Hozzáadás'}
                </button>
              </div>
            )
          })}
        </div>
      </Modal>

    </div>
  )
}