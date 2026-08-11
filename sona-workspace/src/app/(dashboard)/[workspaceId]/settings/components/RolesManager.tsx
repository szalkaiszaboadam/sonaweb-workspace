'use client'

import { useState } from 'react'
import { Plus, Shield, Settings2, Trash2, CheckSquare } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PERMISSION_DEFINITIONS } from '@/lib/permissions.constants'
import { saveRole, deleteRole } from '../roleActions'

export type CustomRole = {
  id: string
  name: string
  permissions: string[]
}

export function RolesManager({ workspaceId, roles, canManage }: { workspaceId: string, roles: CustomRole[], canManage: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<CustomRole | null>(null)
  
  const [roleName, setRoleName] = useState('')
  const [selectedPerms, setSelectedPerms] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const openModal = (role?: CustomRole) => {
    setEditingRole(role || null)
    setRoleName(role?.name || '')
    setSelectedPerms(role?.permissions || [])
    setIsOpen(true)
  }

  const togglePerm = (perm: string) => {
    setSelectedPerms(prev => prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const res = await saveRole(workspaceId, editingRole?.id || null, roleName, selectedPerms)
    if (!res.error) setIsOpen(false)
    setIsLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Biztosan törlöd ezt a szerepkört? A tagok elveszítik a hozzá tartozó jogokat!')) return
    await deleteRole(workspaceId, id)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Egyedi Szerepkörök</h2>
        {canManage && (
          <Button onClick={() => openModal()} className="text-sm px-4 py-1.5 h-auto w-auto gap-2">
            <Plus className="w-4 h-4" /> Új Szerepkör
          </Button>
        )}
      </div>

      {roles.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center bg-surface/30">
          <Shield className="w-8 h-8 text-sona-neutral/50 mb-3" />
          <p className="text-sm font-medium text-foreground">Még nincsenek egyedi szerepkörök</p>
          <p className="text-xs text-sona-neutral mt-1">Hozzon létre profilokat a hozzáférések egyszerű kezeléséhez.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map(role => (
            <div key={role.id} className="bg-surface border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all group relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground truncate flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" /> {role.name}
                </h3>
                {canManage && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openModal(role)} className="p-1.5 text-sona-neutral hover:text-foreground hover:bg-sona-neutral/10 rounded-md transition-colors"><Settings2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(role.id)} className="p-1.5 text-sona-neutral hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {role.permissions.slice(0, 3).map(p => (
                  <span key={p} className="text-[10px] font-bold bg-sona-neutral/10 text-sona-neutral px-2 py-0.5 rounded-md border border-border uppercase tracking-wider">{PERMISSION_DEFINITIONS.find(def => def.id === p)?.label || p}</span>
                ))}
                {role.permissions.length > 3 && (
                  <span className="text-[10px] font-bold bg-sona-neutral/10 text-sona-neutral px-2 py-0.5 rounded-md border border-border uppercase tracking-wider">+{role.permissions.length - 3} további</span>
                )}
                {role.permissions.length === 0 && <span className="text-xs text-sona-neutral italic">Nincs kiosztott jog</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LÉTREHOZÁS / SZERKESZTÉS MODAL */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editingRole ? 'Szerepkör szerkesztése' : 'Új szerepkör létrehozása'} className="max-w-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <Input label="Szerepkör megnevezése" value={roleName} onChange={e => setRoleName(e.target.value)} placeholder="pl. Projekt Menedzser" required autoFocus />
          
          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-foreground">Jogosultságok</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto pr-2 pb-2">
              {PERMISSION_DEFINITIONS.map(def => {
                const isChecked = selectedPerms.includes(def.id)
                return (
                  <div key={def.id} onClick={() => togglePerm(def.id)} className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${isChecked ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-primary/50'}`}>
                    <div className={`mt-0.5 w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 transition-colors ${isChecked ? 'bg-primary border-primary' : 'border-sona-neutral/50'}`}>
                      {isChecked && <CheckSquare className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-sm font-semibold ${isChecked ? 'text-primary' : 'text-foreground'}`}>{def.label}</span>
                      <span className="text-[10px] text-sona-neutral leading-tight mt-0.5">{def.desc}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-2 border-t border-border pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>Mégse</Button>
            <Button type="submit" disabled={isLoading} className="w-auto">{isLoading ? 'Mentés...' : 'Szerepkör mentése'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}