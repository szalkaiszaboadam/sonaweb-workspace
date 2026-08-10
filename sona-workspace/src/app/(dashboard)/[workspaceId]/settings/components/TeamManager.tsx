'use client'

import { useState } from 'react'
import { User as UserIcon, Shield, Trash2, ShieldAlert, X, AlertTriangle, ChevronDown } from 'lucide-react'
import { updateMemberRole, removeMember } from '../../team/actions'
import { SelectDropdown } from '@/components/ui/SelectDropdown'
import { Button } from '@/components/ui/Button'
// 1. MEGOLDÁS: Importáljuk be az új Avatar komponenst!
import { Avatar } from '@/components/ui/Avatar'

// 2. MEGOLDÁS: Bővítsük ki a típust az avatar_url-el!
type Member = {
    id: string
    email: string
    name: string
    role: 'owner' | 'member'
    avatar_url?: string // <-- Ez hiányzott a TypeScriptnek!
}

type Props = {
    workspaceId: string
    members: Member[]
    currentUserId: string
    currentUserRole: 'owner' | 'member'
}

export function TeamManager({ workspaceId, members, currentUserId, currentUserRole }: Props) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Megerősítő ablak állapota
    const [confirmModal, setConfirmModal] = useState<{
        type: 'demote' | 'kick'
        userId: string
        userName: string
    } | null>(null)

    // ==========================================
    // AKCIÓK (A Modalból hívjuk őket)
    // ==========================================
    const executeDemotion = async () => {
        if (!confirmModal) return
        setIsLoading(true)
        setError(null)
        const result = await updateMemberRole(workspaceId, confirmModal.userId, 'member')
        if (result.error) setError(result.error)
        setIsLoading(false)
        setConfirmModal(null)
    }

    const executeKick = async () => {
        if (!confirmModal) return
        setIsLoading(true)
        setError(null)
        const result = await removeMember(workspaceId, confirmModal.userId)
        if (result.error) setError(result.error)
        setIsLoading(false)
        setConfirmModal(null)
    }

    // ==========================================
    // KEZELŐK (Ezek nyitják meg a Modalt, vagy futtatnak egyből)
    // ==========================================
    const handleRoleChange = async (userId: string, userName: string, newRole: string) => {
        if (newRole === 'member') {
            // Ha Tulajdonost akarunk Tag-gá tenni, rákérdezünk!
            setConfirmModal({ type: 'demote', userId, userName })
        } else {
            // Tagból Tulajdonos azonnal mehet
            setIsLoading(true)
            const result = await updateMemberRole(workspaceId, userId, 'owner')
            if (result.error) setError(result.error)
            setIsLoading(false)
        }
    }

    const handleKickClick = (userId: string, userName: string) => {
        setConfirmModal({ type: 'kick', userId, userName })
    }

    return (
        <div className="flex flex-col gap-6">

            {/* HIBAÜZENET */}
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}

            {/* LISTA */}
{/* LISTA */}
      <div className="bg-surface border border-border rounded-xl shadow-sm">

{/* PRÉMIUM LISTA DIZÁJN */}
            <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="divide-y divide-border">
                    {members.map(member => (
                        <div key={member.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-sona-neutral/5 transition-colors">
                            
                            <div className="flex items-center gap-4">
                               <Avatar 
  name={member.name} 
  url={member.avatar_url} 
  className="w-10 h-10 text-sm" 
  fallbackClass={member.role === 'owner' ? 'bg-foreground text-background' : 'bg-sona-neutral/10 text-foreground'} 
/>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-foreground text-sm">{member.name}</span>
                                        {member.id === currentUserId && (
                                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border border-border bg-background text-sona-neutral shadow-sm">
                                                Te
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs text-sona-neutral">{member.email}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {currentUserRole === 'owner' ? (
                                    <div className="w-[130px]">
                                        <SelectDropdown
                                            value={member.role}
                                            onChange={(val) => { if (val) handleRoleChange(member.id, member.name, val) }}
                                            placeholder="Szerepkör"
                                            options={[
                                                { id: 'owner', label: 'Tulajdonos' },
                                                { id: 'member', label: 'Tag' }
                                            ]}
                                        />
                                    </div>
                                ) : (
                                    <div className="px-3 py-1.5 rounded-lg border border-border bg-surface flex items-center gap-1.5 shadow-sm">
                                        {member.role === 'owner' ? <Shield className="w-3.5 h-3.5 text-foreground" /> : <UserIcon className="w-3.5 h-3.5 text-sona-neutral" />}
                                        <span className="text-xs font-semibold">{member.role === 'owner' ? 'Tulajdonos' : 'Tag'}</span>
                                    </div>
                                )}
                                
                                {currentUserRole === 'owner' && (
                                    <button
                                        onClick={() => handleKickClick(member.id, member.name)}
                                        className="p-2 text-sona-neutral hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                                        title="Eltávolítás"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>


            </div>

            {/* ========================================================= */}
            {/* MEGERŐSÍTŐ MODAL (Felugró ablak) */}
            {/* ========================================================= */}
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
                                    : 'A felhasználó azonnal elveszíti a hozzáférését az összes projekthez és feladathoz ezen a munkaterületen belül.'}
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