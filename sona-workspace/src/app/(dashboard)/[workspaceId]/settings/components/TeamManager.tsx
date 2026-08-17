'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Trash2, Settings2, UserCog, Check, AlertTriangle } from 'lucide-react'
import { updateMemberRole, removeMember } from '../../team/actions'
import { updateMemberCustomRoles, updateMemberOverrides } from '../roleActions'
import { SelectDropdown } from '@/components/ui/SelectDropdown'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { CustomRole } from './RolesManager'
import { PERMISSION_DEFINITIONS, PERMISSION_GROUPS } from '@/lib/permissions.constants'

type Member = {
  id: string
  db_id: string
  email: string
  name: string
  role: 'owner' | 'member'
  avatar_url?: string
  customRoleIds: string[]
  customPermissions: string[]
}

type Props = {
  workspaceId: string
  members: Member[]
  currentUserId: string
  currentUserRole: 'owner' | 'member'
  availableRoles: CustomRole[]
}



export function TeamManager({ workspaceId, members, currentUserId, currentUserRole, availableRoles }: Props) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [confirmModal, setConfirmModal] = useState<{ type: 'demote' | 'kick', userId: string, userName: string } | null>(null)
  
  // Custom Roles & Jogosultságok Kiosztó állapota
  const [roleModalUser, setRoleModalUser] = useState<Member | null>(null)
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [selectedOverrides, setSelectedOverrides] = useState<string[]>([])

  const executeDemotion = async () => {
    if (!confirmModal) return
    setIsLoading(true)
    const result = await updateMemberRole(workspaceId, confirmModal.userId, 'member')
    if (result.error) alert(result.error)
    setIsLoading(false); setConfirmModal(null)
  }

  const executeKick = async () => {
    if (!confirmModal) return
    setIsLoading(true)
    const result = await removeMember(workspaceId, confirmModal.userId)
    if (result.error) alert(result.error)
    setIsLoading(false); setConfirmModal(null)
  }

  const handleRoleChange = async (userId: string, userName: string, newRole: string) => {
    if (newRole === 'member') setConfirmModal({ type: 'demote', userId, userName })
    else {
      setIsLoading(true)
      const result = await updateMemberRole(workspaceId, userId, 'owner')
      if (result.error) alert(result.error)
      setIsLoading(false)
    }
  }

  // --- EGYEDI JOGOK & SZEREPKÖRÖK MODAL LOGIKA ---
  const openCustomRoleModal = (member: Member) => {
    setRoleModalUser(member)
    setSelectedRoles(member.customRoleIds)
    setSelectedOverrides(member.customPermissions)
  }

  const toggleAssignedRole = (roleId: string) => {
    setSelectedRoles(prev => prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId])
  }

  const toggleOverridePermission = (permId: string) => {
    setSelectedOverrides(prev => prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId])
  }

  const handleSaveCustomRoles = async () => {
    if (!roleModalUser) return
    setIsLoading(true)

    // 1. Mentjük a Szerepköröket (Member_Roles)
    const roleResult = await updateMemberCustomRoles(workspaceId, roleModalUser.db_id, selectedRoles)
    if (roleResult.error) alert(roleResult.error)

    // 2. Mentjük az extra egyéni jogokat (Overrides)
    const overrideResult = await updateMemberOverrides(workspaceId, roleModalUser.db_id, selectedOverrides)
    if (overrideResult.error) alert(overrideResult.error)

    setIsLoading(false)
    setRoleModalUser(null)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-4">
      
      {/* 1. TAGOK LISTÁJA */}
      <div className="bg-surface border border-border rounded-xl shadow-sm">
        <div className="divide-y divide-border">
          {members.map(member => (
            <div key={member.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-sona-neutral/5 transition-colors first:rounded-t-xl last:rounded-b-xl">
              
              <div className="flex items-center gap-4 min-w-0">
                <Avatar name={member.name} url={member.avatar_url} className="w-10 h-10 text-sm" fallbackClass={member.role === 'owner' ? 'bg-orange-500/10 text-orange-500' : 'bg-primary/10 text-primary'} />
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground truncate">{member.name}</span>
                    {member.id === currentUserId && <span className="text-[10px] font-bold uppercase bg-sona-neutral/10 text-sona-neutral px-1.5 py-0.5 rounded">Te</span>}
                    {member.role === 'owner' && <Shield className="w-3.5 h-3.5 text-orange-500 shrink-0" />}
                  </div>
                  <span className="text-xs text-sona-neutral truncate">{member.email}</span>
                  
                  {/* Kijelezzük a felvett szerepköröket */}
                  {member.customRoleIds.length > 0 && member.role !== 'owner' && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {member.customRoleIds.map(rid => {
                        const rName = availableRoles.find(r => r.id === rid)?.name
                        if (!rName) return null
                        return <span key={rid} className="text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20">{rName}</span>
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Vezérlők (Csak ha mi tulajdonosok vagyunk, és nem saját magunkat módosítjuk) */}
              <div className="flex items-center gap-3 shrink-0">
                {currentUserRole === 'owner' && member.id !== currentUserId ? (
                  <>
                    <div className="w-36">
                      <SelectDropdown
                        value={member.role}
                        onChange={(val) => handleRoleChange(member.id, member.name, val as string)}
                        options={[
                          { id: 'member', label: 'Tag', subLabel: 'Korlátozott jogok' },
                          { id: 'owner', label: 'Tulajdonos', subLabel: 'Teljes hozzáférés' }
                        ]}
                      />
                    </div>
                    {member.role === 'member' && (
                      <button onClick={() => openCustomRoleModal(member)} className="p-2 text-sona-neutral hover:text-primary hover:bg-primary/10 rounded-md transition-colors border border-border bg-background shadow-sm" title="Részletes jogosultságok">
                        <Settings2 className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => setConfirmModal({ type: 'kick', userId: member.id, userName: member.name })} className="p-2 text-sona-neutral hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors border border-border bg-background shadow-sm" title="Tag eltávolítása">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <span className="text-xs font-bold text-sona-neutral uppercase tracking-wider px-2 py-1 bg-sona-neutral/10 rounded-md">
                    {member.role === 'owner' ? 'Tulajdonos' : 'Tag'}
                  </span>
                )}
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* 2. JOGOSULTSÁG-OSZTÓ MODAL (RBAC) */}
      <Modal isOpen={!!roleModalUser} onClose={() => setRoleModalUser(null)} title={`${roleModalUser?.name} jogosultságai`} className="max-w-2xl">
        <div className="flex flex-col gap-6 max-h-[75vh] overflow-y-auto px-1 pb-2">
          
          <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl text-orange-500 text-sm flex gap-3">
            <UserCog className="w-5 h-5 shrink-0 mt-0.5" />
            <p>Itt rendelheted hozzá az előre elkészített <strong>Szerepköröket</strong>, vagy adhatsz neki <strong>Egyedi plusz jogokat</strong>, amiket a szerepköre amúgy nem tartalmazna.</p>
          </div>

          {/* SZEREPKÖRÖK */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Kiosztott Szerepkörök</h3>
            {availableRoles.length === 0 ? (
              <p className="text-xs text-sona-neutral italic">Még nem hoztál létre egyedi szerepköröket.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableRoles.map(role => {
                  const isAssigned = selectedRoles.includes(role.id)
                  return (
                    <div key={role.id} onClick={() => toggleAssignedRole(role.id)} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${isAssigned ? 'bg-primary/5 border-primary' : 'bg-surface border-border hover:border-primary/50'}`}>
                      <div className={`flex items-center justify-center w-5 h-5 rounded border transition-colors shrink-0 ${isAssigned ? 'bg-primary border-primary text-white' : 'bg-background border-border'}`}>
                        {isAssigned && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-sm font-bold ${isAssigned ? 'text-primary' : 'text-foreground'}`}>{role.name}</span>
                        <span className="text-[10px] text-sona-neutral">{role.permissions.length} db jogcsomag</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <hr className="border-border" />

          {/* EGYEDI EXTRA JOGOK */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Egyedi extra jogok</h3>
            <p className="text-xs text-sona-neutral -mt-2 mb-2">Ezek a jogok hozzáadódnak a fenti szerepkörök által biztosított jogokhoz.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {PERMISSION_GROUPS.map(group => (
                <div key={group.label} className="bg-sona-neutral/5 p-4 rounded-xl border border-border">
                  <h4 className="text-xs font-bold text-sona-neutral mb-3">{group.label}</h4>
                  <div className="flex flex-col gap-3">
                    {group.keys.map(key => {
                      const def = PERMISSION_DEFINITIONS.find(d => d.id === key)
                      if (!def) return null
                      
                      const hasFromRole = availableRoles.some(r => selectedRoles.includes(r.id) && r.permissions.includes(key))
                      const isOverridden = selectedOverrides.includes(key)
                      
                      return (
                        // JAVÍTVA: <label> helyett <button> az egyedi jogokhoz is!
                        <button 
                          key={key} 
                          type="button"
                          onClick={() => { if (!hasFromRole) toggleOverridePermission(key) }}
                          className={`flex items-start gap-3 transition-opacity text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-md ${hasFromRole ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer group/lbl'}`}
                        >
                          <div className={`mt-0.5 flex items-center justify-center w-5 h-5 rounded border transition-colors shrink-0 ${hasFromRole ? 'bg-sona-neutral/50 border-transparent text-white' : isOverridden ? 'bg-primary border-primary text-white' : 'bg-background border-border group-hover/lbl:border-primary/50'}`}>
                            {(isOverridden || hasFromRole) && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-foreground leading-none">{def.label}</span>
                            <span className="text-[10px] text-sona-neutral mt-0.5 leading-tight">{def.desc}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-2 sticky bottom-0 bg-surface/90 backdrop-blur-sm pb-2">
            <Button type="button" variant="secondary" onClick={() => setRoleModalUser(null)}>Mégse</Button>
            <Button type="button" onClick={handleSaveCustomRoles} disabled={isLoading} className="w-auto">{isLoading ? 'Mentés...' : 'Jogok mentése'}</Button>
          </div>
        </div>
      </Modal>

      {/* 3. TÖRLÉS/VISSZAMINŐSÍTÉS MEGERŐSÍTŐ MODAL */}
     {/* 3. TÖRLÉS/VISSZAMINŐSÍTÉS MEGERŐSÍTŐ MODAL */}
      <Modal isOpen={!!confirmModal} onClose={() => setConfirmModal(null)} title={confirmModal?.type === 'demote' ? 'Visszaminősítés megerősítése' : 'Tag eltávolítása'}>
        {/* A JAVÍTÁS: Ebbe a feltételbe csomagoltuk a tartalmat, így a TS tudja, hogy itt a confirmModal már biztosan nem null! */}
        {confirmModal && (
          <div className="flex flex-col items-center text-center gap-4 py-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Biztosan folytatod?</h3>
            <p className="text-sm text-sona-neutral">
              {confirmModal.type === 'demote' 
                ? `Visszaminősíted a(z) ${confirmModal.userName} felhasználót "Tag" státuszba. Elveszíti a Tulajdonosi jogait!`
                : `Véglegesen eltávolítod a(z) ${confirmModal.userName} felhasználót a munkaterületről.`}
            </p>
            <div className="flex justify-center gap-3 w-full mt-4">
              <Button type="button" variant="secondary" onClick={() => setConfirmModal(null)} className="flex-1">Mégse</Button>
              <Button type="button" onClick={confirmModal.type === 'demote' ? executeDemotion : executeKick} disabled={isLoading} className="flex-1 bg-red-500 hover:bg-red-600 text-white border-transparent">
                {isLoading ? 'Folyamatban...' : 'Igen, végrehajtás'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  )
}