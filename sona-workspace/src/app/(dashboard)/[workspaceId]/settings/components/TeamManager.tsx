'use client'

import { useState } from 'react'
import { Shield, Trash2, ShieldAlert, AlertTriangle, UserCog, CheckSquare } from 'lucide-react'
import { updateMemberRole, removeMember } from '../../team/actions'
import { SelectDropdown } from '@/components/ui/SelectDropdown'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { CustomRole } from './RolesManager'
import { PERMISSION_DEFINITIONS } from '@/lib/permissions.constants'
import { updateMemberCustomRoles, updateMemberOverrides } from '../roleActions'

type Member = {
  id: string // auth.users ID
  db_id: string // workspace_members ID (Ezt használjuk a custom roleshoz!)
  email: string
  name: string
  role: 'owner' | 'member'
  avatar_url?: string
  customRoleIds: string[]
  customPermissions: string[] // <--- ÚJ
}

type Props = {
  workspaceId: string
  members: Member[]
  currentUserId: string
  currentUserRole: 'owner' | 'member'
  availableRoles: CustomRole[]
}

export function TeamManager({ workspaceId, members, currentUserId, currentUserRole, availableRoles }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [confirmModal, setConfirmModal] = useState<{ type: 'demote' | 'kick', userId: string, userName: string } | null>(null)
  
  // Custom Roles Kiosztás Állapot
  const [roleModalUser, setRoleModalUser] = useState<Member | null>(null)
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [selectedOverrides, setSelectedOverrides] = useState<string[]>([])

  const executeDemotion = async () => {
    if (!confirmModal) return
    setIsLoading(true); setError(null)
    const result = await updateMemberRole(workspaceId, confirmModal.userId, 'member')
    if (result.error) setError(result.error)
    setIsLoading(false); setConfirmModal(null)
  }

  const executeKick = async () => {
    if (!confirmModal) return
    setIsLoading(true); setError(null)
    const result = await removeMember(workspaceId, confirmModal.userId)
    if (result.error) setError(result.error)
    setIsLoading(false); setConfirmModal(null)
  }

  const handleRoleChange = async (userId: string, userName: string, newRole: string) => {
    if (newRole === 'member') setConfirmModal({ type: 'demote', userId, userName })
    else {
      setIsLoading(true)
      const result = await updateMemberRole(workspaceId, userId, 'owner')
      if (result.error) setError(result.error)
      setIsLoading(false)
    }
  }


const openCustomRoleModal = (member: Member) => {
    setRoleModalUser(member)
    setSelectedRoles(member.customRoleIds)
    setSelectedOverrides(member.customPermissions) // <--- ÚJ
  }

  const handleSaveCustomRoles = async () => {
    if (!roleModalUser) return
    setIsLoading(true)
    // Megvárjuk mindkét mentést
    await Promise.all([
      updateMemberCustomRoles(workspaceId, roleModalUser.db_id, selectedRoles),
      updateMemberOverrides(workspaceId, roleModalUser.db_id, selectedOverrides)
    ])
    setRoleModalUser(null)
    setIsLoading(false)
  }



  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* LISTA */}
      {/* KIVETTÜK az overflow-hidden-t, hogy a dropdown ki tudjon nyílni! */}
      <div className="bg-surface border border-border rounded-xl shadow-sm">
        <div className="divide-y divide-border">
          {members.map(member => (
           
            <div key={member.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-sona-neutral/5 transition-colors first:rounded-t-xl last:rounded-b-xl">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <Avatar 
                  name={member.name} 
                  url={member.avatar_url} 
                  className="w-10 h-10 text-sm" 
                  fallbackClass={member.role === 'owner' ? 'bg-foreground text-background' : 'bg-sona-neutral/10 text-foreground'} 
                />
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground text-sm truncate">{member.name}</span>
                    {member.id === currentUserId && <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border border-border bg-background text-sona-neutral shadow-sm">Te</span>}
                  </div>
                  
                  {/* BADEGEK: Milyen szerepkörei vannak? */}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {member.role === 'owner' && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500/10 text-orange-500 uppercase tracking-wider border border-orange-500/20">Tulajdonos (Minden jog)</span>}
                    {member.role === 'member' && member.customRoleIds.length === 0 && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sona-neutral/10 text-sona-neutral uppercase tracking-wider border border-border">Alap Tag</span>}
                    {member.role === 'member' && member.customRoleIds.map(rid => {
                      const rName = availableRoles.find(r => r.id === rid)?.name
                      return rName ? <span key={rid} className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary uppercase tracking-wider border border-primary/20">{rName}</span> : null
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {currentUserRole === 'owner' && (
                  <>
                    {/* ÚJ: Egyedi szerepkör kiosztó gomb (Ha Member) */}
                    {member.role === 'member' && (
                      <button onClick={() => openCustomRoleModal(member)} className="p-2 text-sona-neutral hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Jogosultságok beállítása">
                        <UserCog className="w-4 h-4" />
                      </button>
                    )}
                    
                    <div className="w-[130px] ml-2">
                      <SelectDropdown value={member.role} onChange={(val) => { if (val) handleRoleChange(member.id, member.name, val) }} options={[{ id: 'owner', label: 'Tulajdonos' }, { id: 'member', label: 'Tag' }]} />
                    </div>
                    
                    <button onClick={() => setConfirmModal({ type: 'kick', userId: member.id, userName: member.name })} className="p-2 text-sona-neutral hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors shrink-0" title="Eltávolítás">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SZEREPKÖR KIOSZTÓ MODAL */}
{/* SZEREPKÖR ÉS EGYÉNI JOG KIOSZTÓ MODAL */}
      <Modal isOpen={!!roleModalUser} onClose={() => setRoleModalUser(null)} title={`${roleModalUser?.name} jogosultságai`} className="max-w-2xl">
        <div className="flex flex-col gap-6">
          
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground">Hozzárendelt Szerepkörök</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableRoles.length === 0 ? (
                <p className="text-sm text-sona-neutral italic">Még nincsenek egyedi szerepkörök.</p>
              ) : (
                availableRoles.map(role => {
                  const isChecked = selectedRoles.includes(role.id)
                  return (
                    <div key={role.id} onClick={() => setSelectedRoles(prev => isChecked ? prev.filter(r => r !== role.id) : [...prev, role.id])} className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${isChecked ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-primary/50'}`}>
                      <span className={`text-sm font-semibold ${isChecked ? 'text-primary' : 'text-foreground'}`}>{role.name}</span>
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${isChecked ? 'bg-primary border-primary' : 'border-sona-neutral/50'}`}>
                        {isChecked && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4 border-t border-border">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Egyéni Extra Jogosultságok</h3>
              <p className="text-xs text-sona-neutral mt-1">Ezeket a jogokat a szerepköreitől függetlenül, dedikáltan kapja meg.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[30vh] overflow-y-auto pr-2">
              {PERMISSION_DEFINITIONS.map(def => {
                const isChecked = selectedOverrides.includes(def.id)
                return (
                  <div key={def.id} onClick={() => setSelectedOverrides(prev => isChecked ? prev.filter(p => p !== def.id) : [...prev, def.id])} className={`flex items-start justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${isChecked ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-primary/50'}`}>
                    <div className="flex flex-col">
                      <span className={`text-sm font-semibold ${isChecked ? 'text-primary' : 'text-foreground'}`}>{def.label}</span>
                      <span className="text-[10px] text-sona-neutral mt-0.5">{def.desc}</span>
                    </div>
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${isChecked ? 'bg-primary border-primary' : 'border-sona-neutral/50'}`}>
                      {isChecked && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-2 border-t border-border pt-4">
            <Button variant="secondary" onClick={() => setRoleModalUser(null)}>Mégse</Button>
            <Button onClick={handleSaveCustomRoles} disabled={isLoading} className="w-auto">{isLoading ? 'Mentés...' : 'Jogosultságok mentése'}</Button>
          </div>
        </div>
      </Modal>

      {/* TÖRLÉS/VISSZAMINŐSÍTÉS MODAL */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface border border-border shadow-2xl rounded-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-2">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground leading-tight">
                {confirmModal.type === 'demote'
                  ? `Biztosan visszaminősíted ${confirmModal.userName}-t Tag-gá?`
                  : `Biztosan eltávolítod ${confirmModal.userName}-t?`}
              </h3>
              <p className="text-sona-neutral text-sm">
                {confirmModal.type === 'demote'
                  ? 'Ezzel elveszíti az összes tulajdonosi jogosultságát, és nem tudja többé kezelni a tagokat és a munkaterületet.'
                  : 'A felhasználó azonnal elveszíti a hozzáférést az összes projekthez és feladathoz ezen a munkaterületen belül.'}
              </p>
            </div>
            <div className="px-6 py-4 bg-background border-t border-border flex items-center justify-end gap-3">
              <button
                disabled={isLoading}
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 text-sm font-semibold text-sona-neutral hover:text-foreground transition-colors"
              >
                Mégse
              </button>
              <button
                disabled={isLoading}
                onClick={confirmModal.type === 'demote' ? executeDemotion : executeKick}
                className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/20 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Megerősítés
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}