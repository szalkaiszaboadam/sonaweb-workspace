'use client'

import { useState, useEffect } from 'react' // <- useEffect importálva
import { useRouter, usePathname } from 'next/navigation' // <- usePathname importálva
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Plus, Globe2, Lock, Users } from 'lucide-react'
import { createProject } from '../actions' 
import { PROJECT_ICONS, PROJECT_COLORS } from '@/lib/project-icons'

type Props = {
  workspaceId: string
  workspaceMembers: any[]
  currentUserId: string
  autoOpen?: boolean 
  canCreate?: boolean
}

export function CreateProjectModal({ workspaceId, workspaceMembers, currentUserId, autoOpen = false, canCreate = false }: Props) {
  const router = useRouter()
  const pathname = usePathname() // Lekérjük az aktuális tiszta útvonalat
  
  // Ha az autoOpen true, azonnal nyitva indul
  const [isOpen, setIsOpen] = useState(autoOpen)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [isPrivate, setIsPrivate] = useState(false)
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [selectedEmoji, setSelectedEmoji] = useState('folder')
  const [selectedColor, setSelectedColor] = useState('primary')

  // FIGYELJÜK AZ AUTO-OPEN VÁLTOZÁST
  useEffect(() => {
    if (autoOpen) {
      setIsOpen(true)
      // Eltávolítjuk a ?newProject=true paramétert az URL-ből, 
      // így egy F5 frissítés esetén nem nyílik meg újra a felugró ablak!
      router.replace(pathname, { scroll: false })
    }
  }, [autoOpen, pathname, router])

  const toggleMember = (id: string) => setSelectedMembers(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // ... Innen a kód többi része változatlan! ...
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    formData.append('is_private', isPrivate ? 'true' : 'false')
    formData.append('member_ids', JSON.stringify(selectedMembers))
    formData.append('emoji', selectedEmoji)
    formData.append('color', selectedColor)
    
    const result = await createProject(formData)

    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    } else {
      setIsOpen(false); setIsLoading(false)
      setIsPrivate(false); setSelectedMembers([]); setSelectedGroups([])
      setSelectedEmoji('📁'); setSelectedColor('primary')
    }
  }

// 🚀 VIZUÁLIS VÉDELEM MEGJELENÍTÉSE
  if (!canCreate) {
    return (
      <Button type="button" disabled variant="secondary" className="flex items-center gap-2 opacity-50 cursor-not-allowed" title="Nincs jogosultságod">
        <Lock className="w-4 h-4 text-sona-neutral" />
        <span className="text-sona-neutral">Új Projekt</span>
      </Button>
    )
  }

  // Ha van joga, megjelenítjük a normál, kattintható gombot:
  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="flex items-center gap-2">
        <Plus className="w-4 h-4" /> Új Projekt
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Új projekt létrehozása">
        <div className="max-h-[75vh] overflow-y-auto px-1 pb-1">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-2">
            <input type="hidden" name="workspace_id" value={workspaceId} />

            {/* IKON ÉS SZÍN VÁLASZTÓ */}
<div className="flex flex-col gap-3">
  <label className="text-sm font-medium text-foreground">Projekt ikon és szín</label>
  
  <div className="flex flex-wrap gap-2">
    {PROJECT_ICONS.map(item => {
      const Icon = item.icon
      return (
        <button 
          type="button" 
          key={item.id} 
          onClick={() => setSelectedEmoji(item.id)} 
          className={`w-10 h-10 flex items-center justify-center rounded-lg border-2 transition-all ${selectedEmoji === item.id ? 'border-primary bg-primary/10 text-primary' : 'border-transparent bg-sona-neutral/10 text-sona-neutral hover:bg-sona-neutral/20'}`}
        >
          <Icon className="w-5 h-5" />
        </button>
      )
    })}
  </div>

  <div className="flex flex-wrap gap-2 mt-2">
    {PROJECT_COLORS.map(c => (
      <button 
        type="button" 
        key={c.id} 
        onClick={() => setSelectedColor(c.id)} 
        className={`w-8 h-8 rounded-full border-2 transition-all ${c.bg} ${selectedColor === c.id ? c.border : 'border-transparent'}`} 
      />
    ))}
  </div>
</div>

            <div className="flex flex-col gap-4 border-t border-border pt-4">
              <Input label="Projekt neve *" id="name" name="name" placeholder="Pl.: Sonaweb Redesign" required autoFocus />
              <div className="flex flex-col gap-1.5 w-full">
                <label htmlFor="description" className="text-sm font-medium text-foreground">Leírás (opcionális)</label>
                <textarea id="description" name="description" rows={3} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground resize-none" placeholder="Rövid leírás a projektről..." />
              </div>
            </div>

            {/* LÁTHATÓSÁGI KAPCSOLÓK */}
            <div className="flex flex-col gap-2 pt-4 border-t border-border">
              <label className="text-sm font-medium text-foreground">Projekt láthatósága</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div onClick={() => setIsPrivate(false)} className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${!isPrivate ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-primary/50'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Globe2 className={`w-4 h-4 ${!isPrivate ? 'text-primary' : 'text-sona-neutral'}`} />
                    <h3 className={`font-semibold text-sm ${!isPrivate ? 'text-primary' : 'text-foreground'}`}>Publikus</h3>
                  </div>
                  <p className="text-[11px] text-sona-neutral leading-tight">Mindenki látja a munkatérben.</p>
                </div>
                <div onClick={() => setIsPrivate(true)} className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${isPrivate ? 'border-orange-500 bg-orange-500/5' : 'border-border bg-background hover:border-orange-500/50'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Lock className={`w-4 h-4 ${isPrivate ? 'text-orange-500' : 'text-sona-neutral'}`} />
                    <h3 className={`font-semibold text-sm ${isPrivate ? 'text-orange-500' : 'text-foreground'}`}>Privát</h3>
                  </div>
                  <p className="text-[11px] text-sona-neutral leading-tight">Csak a meghívottak láthatják.</p>
                </div>
              </div>
            </div>

            {/* MEGHÍVÓ MENÜ */}
            {isPrivate && (
              <div className="flex flex-col gap-4 pt-4 border-t border-border animate-in fade-in duration-300">
                <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-sona-neutral" /> Kiket hívsz meg?
                </h3>
                <div className="flex flex-col gap-4">

                  <div className="flex flex-col gap-2">
                    <h4 className="text-[10px] font-bold text-sona-neutral uppercase tracking-wider">Munkatársak</h4>
                    {workspaceMembers.filter(m => m.user_id !== currentUserId).map(member => {
                      const isAdded = selectedMembers.includes(member.user_id)
                      return (
                        <div key={member.user_id} className="flex items-center justify-between p-2.5 bg-sona-neutral/5 border border-border rounded-lg">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">{member.name || 'Ismeretlen'}</span>
                            <span className="text-[11px] text-sona-neutral">{member.email}</span>
                          </div>
                          <button type="button" onClick={() => toggleMember(member.user_id)} className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md transition-colors ${isAdded ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>{isAdded ? 'Eltávolítás' : 'Hozzáadás'}</button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {error && <p className="text-sm text-red-500 bg-red-500/10 p-2 rounded shrink-0">{error}</p>}
            
            <div className="flex justify-end gap-3 mt-2 shrink-0 border-t border-border pt-4">
              <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>Mégse</Button>
              <Button type="submit" disabled={isLoading} className="w-auto">{isLoading ? 'Létrehozás...' : 'Létrehozás'}</Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  )
}