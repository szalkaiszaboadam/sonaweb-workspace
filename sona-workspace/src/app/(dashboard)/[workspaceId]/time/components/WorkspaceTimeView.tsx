'use client'

import { useState } from 'react'
import { Calendar, Clock, FolderKanban, CheckSquare, User as UserIcon, Timer, LayoutList } from 'lucide-react'

type GlobalTimeEntry = {
  id: string
  description: string
  date: string
  duration_minutes: number
  user_id: string
  user_name: string
  user_email: string
  project_name: string
  task_title: string | null
}

type Props = {
  entries: GlobalTimeEntry[]
  currentUserId: string
}

export function WorkspaceTimeView({ entries, currentUserId }: Props) {
  const [showOnlyMine, setShowOnlyMine] = useState(false)

  // Szűrés logika
  const filteredEntries = entries.filter(entry => {
    if (showOnlyMine) return entry.user_id === currentUserId
    return true
  })

  // Statisztika számolása
  const totalMinutes = filteredEntries.reduce((sum, entry) => sum + entry.duration_minutes, 0)
  const totalHoursFormatted = Math.floor(totalMinutes / 60)
  const totalMinsFormatted = totalMinutes % 60

  return (
    <div className="flex flex-col gap-6">
      
      {/* 1. VEZÉRLŐPULT ÉS STATISZTIKA */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-end">
        
        {/* Szűrő gombok */}
        <div className="flex items-center gap-2 p-1 bg-surface border border-border rounded-lg w-max shadow-sm">
          <button
            onClick={() => setShowOnlyMine(false)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${!showOnlyMine ? 'bg-background text-foreground shadow-sm border border-border/50' : 'text-sona-neutral hover:text-foreground'}`}
          >
            Minden munkaidő
          </button>
          <button
            onClick={() => setShowOnlyMine(true)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${showOnlyMine ? 'bg-background text-foreground shadow-sm border border-border/50' : 'text-sona-neutral hover:text-foreground'}`}
          >
            Saját időim
          </button>
        </div>

        {/* Összegzés kártya */}
        <div className="bg-surface border border-border px-5 py-3 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Timer className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-sona-neutral">
              Kiszűrt összesített idő
            </span>
            <div className="text-2xl font-bold text-foreground leading-none mt-1">
              {totalHoursFormatted}<span className="text-base text-sona-neutral font-medium mx-0.5">ó</span> 
              {totalMinsFormatted}<span className="text-base text-sona-neutral font-medium ml-0.5">p</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. IDŐBEJEGYZÉSEK LISTÁJA */}
      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden flex flex-col mt-2">
        
        {/* Fejléc (csak asztalon) */}
        <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-border bg-sona-neutral/5 text-xs font-bold uppercase tracking-wider text-sona-neutral">
          <div className="col-span-5">Leírás és Projekt</div>
          <div className="col-span-2 text-center">Dátum</div>
          <div className="col-span-3 text-left pl-2">Munkatárs</div>
          <div className="col-span-2 text-right">Időtartam</div>
        </div>

        {/* Elemek */}
        {filteredEntries.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-sona-neutral">
            <LayoutList className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium text-foreground">Nincs még adat</p>
            <p className="text-sm">Nem található időbejegyzés a jelenlegi szűréssel.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredEntries.map(entry => {
              const h = Math.floor(entry.duration_minutes / 60)
              const m = entry.duration_minutes % 60
              const timeString = `${h > 0 ? `${h}ó ` : ''}${m > 0 ? `${m}p` : ''}`

              return (
                <div key={entry.id} className="p-4 hover:bg-sona-neutral/5 transition-colors flex flex-col md:grid md:grid-cols-12 md:items-center gap-4 group">
                  
                  {/* Leírás, Projekt és Feladat (Col 5) */}
                  <div className="col-span-5 flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-foreground truncate">
                      {entry.description}
                    </span>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className="flex items-center gap-1 text-[11px] font-bold text-sona-neutral bg-sona-neutral/10 px-2 py-0.5 rounded uppercase tracking-wider truncate">
                        <FolderKanban className="w-3 h-3" />
                        {entry.project_name}
                      </span>
                      {entry.task_title && (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-sona-neutral border border-border px-1.5 py-0.5 rounded truncate max-w-[150px]">
                          <CheckSquare className="w-3 h-3" />
                          {entry.task_title}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dátum (Col 2) */}
                  <div className="col-span-2 flex items-center md:justify-center gap-1.5 text-xs text-sona-neutral font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(entry.date).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>

                  {/* Munkatárs (Col 3) */}
                  <div className="col-span-3 flex items-center gap-2 pl-0 md:pl-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                      {entry.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-foreground truncate">{entry.user_name}</span>
                      <span className="text-[10px] text-sona-neutral truncate">{entry.user_email}</span>
                    </div>
                  </div>

                  {/* Időtartam (Col 2) */}
                  <div className="col-span-2 flex justify-start md:justify-end">
                    <span className="font-mono font-bold text-sm bg-sona-neutral/10 px-3 py-1.5 rounded text-foreground border border-border shadow-sm">
                      {timeString}
                    </span>
                  </div>

                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}