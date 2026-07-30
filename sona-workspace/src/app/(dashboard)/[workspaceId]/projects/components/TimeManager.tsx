'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, Plus, Trash2, Calendar as CalendarIcon, Timer, FileText, CheckCircle2, Play, Square, CheckSquare, Pause, Loader2 } from 'lucide-react'
import { addTimeEntry, deleteTimeEntry } from '../actions'
import { Button } from '@/components/ui/Button'
import { SelectDropdown } from '@/components/ui/SelectDropdown'
import { useGlobalTimer, formatTimerDisplay } from '@/hooks/useGlobalTimer'

export type TimeEntry = {
  id: string
  description: string
  date: string
  duration_minutes: number
  user_email: string
  created_at: string
  task_title?: string | null
}

export type SimpleTask = {
  id: string
  title: string
}

type Props = {
  initialEntries: TimeEntry[]
  projectTasks: SimpleTask[]
  workspaceId: string
  projectId: string
}

export function TimeManager({ initialEntries, projectTasks, workspaceId, projectId }: Props) {
  const router = useRouter()
  const [entries, setEntries] = useState<TimeEntry[]>(initialEntries)

// =========================================================
  // EZT A BLOKKOT ADD HOZZÁ! 
  // Ez biztosítja, hogy ha a lebegő stopper elment egy időt,
  // az azonnal, frissítés nélkül megjelenjen a listádban is!
  // =========================================================
  useEffect(() => {
    setEntries(initialEntries)
  }, [initialEntries])
  // =========================================================


  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fülek (Tabs)
  const [activeTab, setActiveTab] = useState<'timer' | 'manual'>('timer')

  // Közös űrlap állapotok
  const [description, setDescription] = useState('')
  const [selectedTask, setSelectedTask] = useState<string | null>(null)

  // Kézi rögzítő állapotok
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [hours, setHours] = useState('')
  const [minutes, setMinutes] = useState('')

  // ==========================================
  // GLOBÁLIS OKOS STOPPER BEKÖTÉSE
  // ==========================================
  const { timer, displaySeconds, start, pause, resume, stop } = useGlobalTimer()

  // Megnézzük, hogy a futó stopper EBBEN a projektben van-e elindítva
  const isThisProjectTimer = timer.projectId === projectId
  const isOtherProjectTimer = timer.status !== 'idle' && timer.projectId !== projectId

  // Szinkronizáljuk a szövegmezőket, ha már megy a stopper ebben a projektben
  useEffect(() => {
    if (isThisProjectTimer && timer.status !== 'idle') {
      setDescription(timer.description)
      setSelectedTask(timer.taskId)
    }
  }, [isThisProjectTimer, timer.status, timer.description, timer.taskId])

  const handleStartTimer = () => {
    if (!description.trim()) {
      setError('Kérlek írd be, hogy min fogsz dolgozni!')
      return
    }
    setError(null)
    start(workspaceId, projectId, description, selectedTask)
  }

  const handleStopTimer = async () => {
    setIsLoading(true)
    const finalData = stop()
    
    // Felfelé kerekítünk: minden megkezdett perc számít, de minimum 1 perc!
    const totalMinutes = Math.max(1, Math.ceil(finalData.totalSeconds / 60))
    const todayDate = new Date().toISOString().split('T')[0]

    const result = await addTimeEntry(workspaceId, projectId, finalData.description, todayDate, totalMinutes, finalData.taskId)

    if (result.error) {
      setError(result.error)
    } else {
      // OPTIMISTA UI FRISSÍTÉS: Azonnal betoljuk a listába frissítés nélkül!
      const taskName = finalData.taskId ? projectTasks.find(t => t.id === finalData.taskId)?.title : null
      
      const newEntry: TimeEntry = {
        id: Math.random().toString(),
        description: finalData.description,
        date: todayDate,
        duration_minutes: totalMinutes,
        user_email: 'Te (Most mentve)',
        created_at: new Date().toISOString(),
        task_title: taskName
      }

      setEntries(prevEntries => [newEntry, ...prevEntries])
      setDescription('')
      setSelectedTask(null)
      router.refresh()
    }
    setIsLoading(false)
  }

  // ==========================================
  // MANUÁLIS MENTÉS ÉS TÖRLÉS LOGIKA
  // ==========================================

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const parsedHours = parseInt(hours) || 0
    const parsedMinutes = parseInt(minutes) || 0
    const totalDuration = (parsedHours * 60) + parsedMinutes

    if (totalDuration <= 0) {
      setError('Kérlek adj meg érvényes időtartamot!')
      setIsLoading(false)
      return
    }

    const result = await addTimeEntry(workspaceId, projectId, description, date, totalDuration, selectedTask)

    if (result.error) {
      setError(result.error)
    } else {
      const taskName = selectedTask ? projectTasks.find(t => t.id === selectedTask)?.title : null
      
      const newEntry: TimeEntry = {
        id: Math.random().toString(),
        description,
        date,
        duration_minutes: totalDuration,
        user_email: 'Te (Most mentve)',
        created_at: new Date().toISOString(),
        task_title: taskName
      }

      setEntries(prevEntries => [newEntry, ...prevEntries])

      setDescription('')
      setHours('')
      setMinutes('')
      setSelectedTask(null)
      router.refresh()
    }
    setIsLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Biztosan törlöd ezt az időbejegyzést?')) return
    const result = await deleteTimeEntry(id)
    if (result.error) alert(result.error)
    else { setEntries(entries.filter(e => e.id !== id)); router.refresh() }
  }

  // Statisztikák (Összesítés)
  const totalMinutes = entries.reduce((sum, entry) => sum + entry.duration_minutes, 0)
  const totalHoursFormatted = Math.floor(totalMinutes / 60)
  const totalMinsFormatted = totalMinutes % 60

  return (
    <div className="flex flex-col gap-6 pb-10">
      
      {/* 1. STATISZTIKA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm flex flex-col justify-between h-32">
          <div className="flex items-center gap-2 text-sona-neutral mb-2">
            <Timer className="w-5 h-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">Összes rögzített idő</span>
          </div>
          <div className="text-4xl font-bold text-foreground">
            {totalHoursFormatted}<span className="text-xl text-sona-neutral font-medium mx-1">ó</span> 
            {totalMinsFormatted}<span className="text-xl text-sona-neutral font-medium ml-1">p</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start mt-2">
        
        {/* ========================================================= */}
        {/* 2. RÖGZÍTŐ (Bento Card) */}
        {/* ========================================================= */}
        <div className="w-full lg:w-5/12 bg-surface border border-border rounded-2xl shadow-sm shrink-0 overflow-hidden">
          
          {/* Fülek (Tabs) */}
          <div className="flex items-center border-b border-border bg-sona-neutral/5">
            <button 
              onClick={() => setActiveTab('timer')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${activeTab === 'timer' ? 'bg-surface text-primary border-b-2 border-primary' : 'text-sona-neutral hover:text-foreground'}`}
            >
              <Timer className="w-4 h-4" /> Stopper
            </button>
            <button 
              onClick={() => setActiveTab('manual')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${activeTab === 'manual' ? 'bg-surface text-primary border-b-2 border-primary' : 'text-sona-neutral hover:text-foreground'}`}
            >
              <Clock className="w-4 h-4" /> Kézi rögzítés
            </button>
          </div>

          <div className="p-6">
            {/* Közös mezők (Leírás és Feladat) */}
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-sona-neutral" /> Mit csinálsz éppen? <span className="text-red-500">*</span>
                </label>
                <input 
                  required
                  disabled={isThisProjectTimer && timer.status !== 'idle'}
                  placeholder="pl. Landing page design..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-sona-neutral" /> Kapcsolódó feladat (Opcionális)
                </label>
                <div className={isThisProjectTimer && timer.status !== 'idle' ? 'opacity-50 pointer-events-none' : ''}>
                  <SelectDropdown 
                    value={selectedTask} 
                    onChange={(val) => setSelectedTask(val)} 
                    placeholder="Válassz feladatot..." 
                    options={projectTasks.map(t => ({ id: t.id, label: t.title }))} 
                  />
                </div>
              </div>
            </div>

            {/* TAB: STOPPER */}
            {activeTab === 'timer' && (
              <div className="pt-2">
                {isOtherProjectTimer ? (
                  <div className="text-center p-5 bg-orange-500/10 border border-orange-500/20 text-orange-600 rounded-xl font-medium shadow-sm">
                    Jelenleg egy <strong className="font-bold">másik projektben</strong> fut a stopper. Kérlek, állítsd le azt a jobb alsó sarokban, mielőtt újat indítasz!
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className={`text-5xl font-bold mb-6 font-mono tracking-tight transition-colors ${timer.status === 'running' ? 'text-primary' : timer.status === 'paused' ? 'text-orange-500' : 'text-foreground'}`}>
                      {formatTimerDisplay(timer.status === 'idle' ? 0 : displaySeconds)}
                    </div>
                    
                    {error && <p className="text-xs text-red-500 font-medium bg-red-500/10 p-2 rounded mb-4 w-full text-center">{error}</p>}

                    {timer.status === 'idle' ? (
                      <button 
                        onClick={handleStartTimer}
                        disabled={isLoading || !description.trim()}
                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-green-600 hover:bg-green-700 shadow-green-600/20"
                      >
                        <Play className="w-5 h-5 fill-white ml-1" /> INDÍTÁS
                      </button>
                    ) : (
                      <div className="flex flex-col sm:flex-row w-full gap-3">
                        {timer.status === 'running' ? (
                          <button 
                            onClick={pause}
                            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white transition-all shadow-md bg-orange-500 hover:bg-orange-600 shadow-orange-500/20 active:scale-95"
                          >
                            <Pause className="w-5 h-5 fill-white" /> SZÜNET
                          </button>
                        ) : (
                          <button 
                            onClick={resume}
                            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white transition-all shadow-md bg-green-600 hover:bg-green-700 shadow-green-600/20 active:scale-95"
                          >
                            <Play className="w-5 h-5 fill-white ml-1" /> FOLYTATÁS
                          </button>
                        )}
                        <button 
                          onClick={handleStopTimer}
                          disabled={isLoading}
                          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white transition-all shadow-md bg-red-500 hover:bg-red-600 shadow-red-500/20 active:scale-95 disabled:opacity-50"
                        >
                          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Square className="w-5 h-5 fill-white" />} MENTÉS
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB: MANUÁLIS */}
            {activeTab === 'manual' && (
              <form onSubmit={handleManualSubmit} className="flex flex-col gap-4 animate-in fade-in">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <CalendarIcon className="w-4 h-4 text-sona-neutral" /> Dátum
                  </label>
                  <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground cursor-pointer" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-sona-neutral" /> Időtartam
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input type="number" min="0" placeholder="0" value={hours} onChange={e => setHours(e.target.value)} className="w-full pl-3 pr-8 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sona-neutral text-sm font-medium pointer-events-none">ó</span>
                    </div>
                    <div className="relative flex-1">
                      <input type="number" min="0" max="59" placeholder="0" value={minutes} onChange={e => setMinutes(e.target.value)} className="w-full pl-3 pr-8 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sona-neutral text-sm font-medium pointer-events-none">p</span>
                    </div>
                  </div>
                </div>

                {error && <p className="text-xs text-red-500 font-medium bg-red-500/10 p-2 rounded">{error}</p>}
                
                <Button type="submit" disabled={isLoading || !description.trim()} className="mt-2 w-full font-semibold">
                  {isLoading ? 'Mentés...' : 'Rögzítés'}
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. NAPLÓZOTT IDŐK LISTÁJA */}
        {/* ========================================================= */}
        <div className="flex-1 w-full flex flex-col gap-3">
          <h2 className="text-lg font-bold text-foreground mb-1 ml-1 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            Napló
          </h2>

          {entries.length === 0 ? (
            <div className="bg-surface/50 border border-dashed border-border rounded-2xl p-10 flex flex-col items-center justify-center text-center">
              <Timer className="w-12 h-12 text-sona-neutral/30 mb-3" />
              <h3 className="text-foreground font-medium mb-1">Még nincs rögzített idő</h3>
              <p className="text-sm text-sona-neutral max-w-sm">
                Indítsd el a stoppert, vagy használj kézi rögzítést az első munkaórád naplózásához.
              </p>
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
              <div className="divide-y divide-border">
                {entries.map(entry => {
                  const h = Math.floor(entry.duration_minutes / 60)
                  const m = entry.duration_minutes % 60
                  const timeString = `${h > 0 ? `${h}ó ` : ''}${m > 0 ? `${m}p` : ''}`

                  return (
                    <div key={entry.id} className="p-4 hover:bg-sona-neutral/5 transition-colors flex flex-col sm:flex-row gap-4 sm:items-center justify-between group">
                      
                      <div className="flex flex-col flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate mb-1">
                          {entry.description}
                        </p>
                        
                        {/* Ha van feladat hozzárendelve, mutatjuk egy szép badge-ben */}
                        {entry.task_title && (
                          <div className="flex items-center gap-1.5 mb-2">
                            <span className="flex items-center gap-1 text-[11px] font-medium text-sona-neutral bg-background border border-border px-1.5 py-0.5 rounded uppercase tracking-wider truncate max-w-[200px]">
                              <CheckSquare className="w-3 h-3" />
                              {entry.task_title}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-3 text-xs text-sona-neutral">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="w-3.5 h-3.5" /> 
                            {new Date(entry.date).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' })}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-border" />
                          <span className="truncate">{entry.user_email}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <span className="font-mono font-bold text-sm bg-sona-neutral/10 px-2.5 py-1 rounded text-foreground">
                          {timeString}
                        </span>
                        <button onClick={() => handleDelete(entry.id)} className="p-1.5 text-sona-neutral hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors opacity-0 group-hover:opacity-100 sm:block hidden" title="Törlés">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(entry.id)} className="p-1.5 text-sona-neutral hover:text-red-500 rounded-md sm:hidden block">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}