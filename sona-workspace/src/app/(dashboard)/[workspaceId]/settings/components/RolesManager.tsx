'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Plus, Edit3, Trash2, Check, ShieldAlert } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { saveRole, deleteRole } from '../roleActions'
import { PERMISSION_DEFINITIONS, PERMISSION_GROUPS } from '@/lib/permissions.constants'

export type CustomRole = {
  id: string
  name: string
  permissions: string[]
}


export function RolesManager({ workspaceId, roles, canManage }: { workspaceId: string, roles: CustomRole[], canManage: boolean }) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<CustomRole | null>(null)
  
  // Űrlap állapota
  const [roleName, setRoleName] = useState('')
  const [selectedPerms, setSelectedPerms] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  if (!canManage) return null

  const openNewModal = () => {
    setEditingRole(null)
    setRoleName('')
    setSelectedPerms([])
    setIsModalOpen(true)
  }

  const openEditModal = (role: CustomRole) => {
    setEditingRole(role)
    setRoleName(role.name)
    setSelectedPerms(role.permissions)
    setIsModalOpen(true)
  }

  const togglePermission = (permId: string) => {
    setSelectedPerms(prev => prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId])
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!roleName.trim()) return
    setIsLoading(true)

    const result = await saveRole(workspaceId, editingRole?.id || null, roleName, selectedPerms)
    
    if (result.error) alert(result.error)
    else {
      setIsModalOpen(false)
      router.refresh()
    }
    setIsLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Biztosan törlöd ezt a szerepkört? A tagok, akiknek ki volt osztva, elveszítik ezeket a jogokat.')) return
    setIsLoading(true)
    const result = await deleteRole(workspaceId, id)
    if (result.error) alert(result.error)
    else router.refresh()
    setIsLoading(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <p className="text-sm text-sona-neutral">
          Hozzon létre egyedi szerepköröket (pl. "Projektmenedzser"), amelyeket később a csapattagokhoz rendelhet.
        </p>
        <Button onClick={openNewModal} className="w-auto text-xs py-1.5 px-3 gap-1.5">
          <Plus className="w-4 h-4" /> Új szerepkör
        </Button>
      </div>

      {roles.length === 0 ? (
        <div className="text-center py-8 text-sona-neutral flex flex-col items-center">
          <ShieldAlert className="w-10 h-10 mb-3 opacity-20" />
          <p className="text-sm font-medium">Még nincsenek egyedi szerepkörök.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {roles.map(role => (
            <div key={role.id} className="bg-background border border-border rounded-xl p-4 flex flex-col gap-3 group hover:border-primary/50 transition-colors">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" /> {role.name}
                </h3>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditModal(role)} className="p-1.5 text-sona-neutral hover:text-primary bg-surface rounded-md shadow-sm border border-border"><Edit3 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(role.id)} className="p-1.5 text-sona-neutral hover:text-red-500 bg-surface rounded-md shadow-sm border border-border"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <p className="text-xs text-sona-neutral font-medium">
                {role.permissions.length} db jog kiosztva
              </p>
            </div>
          ))}
        </div>
      )}

      {/* SZERKESZTŐ MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingRole ? 'Szerepkör szerkesztése' : 'Új szerepkör'} className="max-w-2xl">
        <form onSubmit={handleSave} className="flex flex-col gap-6 max-h-[75vh] overflow-y-auto px-1">
          <Input label="Szerepkör neve" value={roleName} onChange={(e) => setRoleName(e.target.value)} placeholder="pl. Pénzügyes" required autoFocus />
          
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Jogosultságok</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {PERMISSION_GROUPS.map(group => (
                <div key={group.label} className="bg-sona-neutral/5 p-4 rounded-xl border border-border">
                  <h4 className="text-xs font-bold text-sona-neutral mb-3">{group.label}</h4>
                  <div className="flex flex-col gap-3">
                    {group.keys.map(key => {
                      const def = PERMISSION_DEFINITIONS.find(d => d.id === key)
                      if (!def) return null
                      const isChecked = selectedPerms.includes(key)
                      return (
                        // JAVÍTVA: <label> helyett <button>, hogy működjön a kattintás!
                        <button 
                          key={key} 
                          type="button"
                          onClick={() => togglePermission(key)}
                          className="flex items-start gap-3 cursor-pointer group/lbl text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-md"
                        >
                          <div className={`mt-0.5 flex items-center justify-center w-5 h-5 rounded border transition-colors shrink-0 ${isChecked ? 'bg-primary border-primary text-white' : 'bg-background border-border group-hover/lbl:border-primary/50'}`}>
                            {isChecked && <Check className="w-3.5 h-3.5" />}
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

          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Mégse</Button>
            <Button type="submit" disabled={isLoading} className="w-auto">{isLoading ? 'Mentés...' : 'Mentés'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}