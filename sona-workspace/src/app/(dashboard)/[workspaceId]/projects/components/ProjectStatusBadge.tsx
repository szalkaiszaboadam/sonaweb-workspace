'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateProjectStatus } from '../actions'
import { ChevronDown, Loader2 } from 'lucide-react'

// Szótár a színekhez és a magyar szövegekhez (Az adatbázisban angolul vannak: planning, in_progress, stb.)
const STATUS_CONFIG = {
  planning: { 
    label: 'Tervezés alatt', 
    colors: 'bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500/20' 
  },
  in_progress: { 
    label: 'Folyamatban', 
    colors: 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20' 
  },
  on_hold: { 
    label: 'Szüneteltetve', 
    colors: 'bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20' 
  },
  completed: { 
    label: 'Kész', 
    colors: 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20' 
  }
} as const

// Kinyerjük a megengedett státuszokat
type StatusType = keyof typeof STATUS_CONFIG

export function ProjectStatusBadge({ projectId, currentStatus }: { projectId: string, currentStatus: string }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // Biztosítjuk, hogy a státusz létezik a szótárban (ha esetleg üres lenne, legyen 'in_progress' az alap)
  const statusKey = (Object.keys(STATUS_CONFIG).includes(currentStatus) ? currentStatus : 'in_progress') as StatusType
  const config = STATUS_CONFIG[statusKey]

  const handleStatusChange = async (newStatus: StatusType) => {
    setIsOpen(false)
    if (newStatus === statusKey) return // Ha ugyanarra kattint, nem csinálunk semmit

    setIsUpdating(true)
    const result = await updateProjectStatus(projectId, newStatus)
    
    if (!result?.error) {
      router.refresh() // Újratöltjük az adatokat, hogy a felület frissüljön
    }
    setIsUpdating(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-colors ${config.colors} ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
        {config.label}
        <ChevronDown className="w-3 h-3" />
      </button>

      {/* Legördülő menü */}
      {isOpen && (
        <>
          {/* Láthatatlan háttér a bezáráshoz */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          
          <div className="absolute top-full left-0 mt-1 w-40 bg-surface border border-border shadow-lg rounded-md z-50 p-1 overflow-hidden">
            {(Object.entries(STATUS_CONFIG) as [StatusType, typeof STATUS_CONFIG[StatusType]][]).map(([key, data]) => (
              <button
                key={key}
                onClick={() => handleStatusChange(key)}
                className={`w-full text-left px-3 py-2 text-xs font-medium rounded-sm transition-colors mb-0.5 last:mb-0
                  ${key === statusKey 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-sona-neutral hover:bg-sona-neutral/10 hover:text-foreground'
                  }`}
              >
                {data.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}