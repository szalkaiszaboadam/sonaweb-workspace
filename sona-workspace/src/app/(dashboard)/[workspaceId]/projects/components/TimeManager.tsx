'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, Plus, Trash2, Calendar as CalendarIcon, Timer, FileText, CheckCircle2, Play, CheckSquare, Loader2, Edit3, FolderKanban } from 'lucide-react'
import { addTimeEntry, deleteTimeEntry, updateTimeEntry } from '../actions'
import { Button } from '@/components/ui/Button'
import { useGlobalTimer } from '@/hooks/useGlobalTimer'
import { Avatar } from '@/components/ui/Avatar'

export type TimeEntry = {
  id: string
  description: string
  date: string
  duration_minutes: number
  user_email: string
  user_avatar_url?: string | null
  created_at: string
  task_title?: string | null
  project_name?: string | null
  project_id?: string | null
  task_id?: string | null
}

export type SimpleProject = { id: string, name: string }
export type SimpleTask = { id: string, title: string, project_id?: string }

type Props = {
  initialEntries: TimeEntry[]
  projects?: SimpleProject[] // Opcionális, csak workspace nézetben kell
  projectTasks: SimpleTask[]
  workspaceId: string
  projectId?: string // Ha van, akkor be van zárva a projektre
}

export function TimeManager({ initialEntries, projects, projectTasks, workspaceId, projectId }: Props) {
  const router = useRouter()
  const [entries, setEntries] = useState<TimeEntry[]>(initialEntries)

  useEffect(() => { setEntries(initialEntries) }, [initialEntries])

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState<'timer' | 'manual'>('timer')
  const [description, setDescription] = useState('')
  const [selectedTask, setSelectedTask] = useState<string>('')
  const [selectedProject, setSelectedProject] = useState<string>(projectId || '')

  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [hours, setHours] = useState('')
  const [minutes, setMinutes] = useState('')

  // SZERKESZTÉS ÁLLAPOTAI
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<TimeEntry>>({})

  const { timer, start } = useGlobalTimer()

  const handleStartTimer = () => {
    setError(null)
    start(workspaceId, selectedProject || null, description, selectedTask || null)
    setDescription('') // Kiürítjük a formot
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const totalDuration = (parseInt(hours || '0') * 60) + parseInt(minutes || '0')
    if (totalDuration <= 0) {
      setError('Kérlek adj meg érvényes időtartamot!')
      setIsLoading(false); return
    }

    const result = await addTimeEntry(workspaceId, selectedProject || null, description, date, totalDuration, selectedTask || null)
    if (result.error) setError(result.error)
    else {
      setDescription(''); setHours(''); setMinutes(''); setSelectedTask('')
      if (!projectId) setSelectedProject('') // Ha workspace nézet, ürítsük ki
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

  const startEditing = (entry: TimeEntry) => {
    setEditingId(entry.id)
    setEditData({ ...entry })
  }

  const handleSaveEdit = async () => {
    if (!editingId) return
    setIsLoading(true)
    const result = await updateTimeEntry(editingId, {
      description: editData.description,
      duration_minutes: editData.duration_minutes,
      project_id: editData.project_id || null,
      task_id: editData.task_id || null,
      date: editData.date
    })
    
    if (result.error) alert(result.error)
    else {
      setEditingId(null)
      router.refresh()
    }
    setIsLoading(false)
  }

  const totalMinutes = entries.reduce((sum, entry) => sum + entry.duration_minutes, 0)

  // Feladatok szűrése a kiválasztott projekt alapján
  const availableTasks = projectTasks.filter(t => !selectedProject || t.project_id === selectedProject)

  return (
    <div className="flex flex-col gap-6 pb-10">
      
      {/* 1. STATISZTIKA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm flex flex-col justify-between h-32">
          <div className="flex items-center gap-2 text-sona-neutral mb-2">
            <Timer className="w-5 h-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">Összes ráfordított idő</span>
          </div>
          <div className="text-4xl font-bold text-foreground">
            {Math.floor(totalMinutes / 60)}<span className="text-xl text-sona-neutral font-medium mx-1">ó</span> 
            {totalMinutes % 60}<span className="text-xl text-sona-neutral font-medium ml-1">p</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start mt-2">
        
        {/* 2. RÖGZÍTŐ (Bento Card) */}
        <div className="w-full lg:w-4/12 bg-surface border border-border rounded-2xl shadow-sm shrink-0 overflow-hidden">
          
          <div className="flex items-center border-b border-border bg-sona-neutral/5">
            <button onClick={() => setActiveTab('timer')} className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${activeTab === 'timer' ? 'bg-surface text-primary border-b-2 border-primary' : 'text-sona-neutral hover:text-foreground'}`}>
              <Timer className="w-4 h-4" /> Stopper
            </button>
            <button onClick={() => setActiveTab('manual')} className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${activeTab === 'manual' ? 'bg-surface text-primary border-b-2 border-primary' : 'text-sona-neutral hover:text-foreground'}`}>
              <Clock className="w-4 h-4" /> Kézi
            </button>
          </div>

          <div className="p-5">
            <div className="flex flex-col gap-4 mb-6">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Mit csinálsz éppen? (Opcionális)</label>
                <input placeholder="pl. Tervezés..." value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary text-foreground" />
              </div>

              {!projectId && projects && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Projekt</label>
                  <select value={selectedProject} onChange={e => { setSelectedProject(e.target.value); setSelectedTask('') }} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none text-foreground cursor-pointer">
                    <option value="">Válassz projektet...</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              )}

              {/* Ha van projekt kiválasztva (vagy be van zárva), mutassuk a feladatokat is */}
              {selectedProject && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Feladat</label>
                  <select value={selectedTask} onChange={e => setSelectedTask(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none text-foreground cursor-pointer">
                    <option value="">Válassz feladatot...</option>
                    {availableTasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                  </select>
                </div>
              )}

            </div>

            {activeTab === 'timer' && (
              <button 
                onClick={handleStartTimer}
                disabled={timer.status === 'running'}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-primary hover:bg-primary/90"
              >
                <Play className="w-4 h-4 fill-white" /> IDŐMÉRÉS INDÍTÁSA
              </button>
            )}

            {activeTab === 'manual' && (
              <form onSubmit={handleManualSubmit} className="flex flex-col gap-4 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-sona-neutral uppercase">Dátum</label>
                    <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary text-foreground" />
                  </div>
                  <div className="flex-[0.8] flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-sona-neutral uppercase">Időtartam</label>
                    <div className="flex items-center gap-1">
                      <input type="number" min="0" placeholder="Ó" value={hours} onChange={e => setHours(e.target.value)} className="w-full px-2 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none text-center" />
                      <span className="font-bold text-sona-neutral">:</span>
                      <input type="number" min="0" max="59" placeholder="P" value={minutes} onChange={e => setMinutes(e.target.value)} className="w-full px-2 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none text-center" />
                    </div>
                  </div>
                </div>
                {error && <p className="text-xs text-red-500 font-medium bg-red-500/10 p-2 rounded text-center">{error}</p>}
                <Button type="submit" disabled={isLoading} className="mt-2 w-full font-semibold">
                  {isLoading ? 'Mentés...' : 'Rögzítés'}
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* 3. NAPLÓZOTT IDŐK LISTÁJA */}
        <div className="flex-1 w-full flex flex-col gap-3">
          <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" /> Naplózott munkaidő
          </h2>
          
          {entries.length === 0 ? (
            <div className="bg-surface/50 border border-dashed border-border rounded-2xl p-10 flex flex-col items-center justify-center text-center">
              <Timer className="w-12 h-12 text-sona-neutral/30 mb-3" />
              <h3 className="text-foreground font-medium mb-1">Még nincs regisztrált idő</h3>
              <p className="text-sm text-sona-neutral max-w-sm">Indítsd el a stoppert, vagy használj kézi rögzítést.</p>
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
              <div className="divide-y divide-border">
                {entries.map(entry => {
                  
                  // SZERKESZTŐ MÓD
                  if (editingId === entry.id) {
                    return (
                      <div key={entry.id} className="p-4 bg-primary/5 flex flex-col gap-4 animate-in fade-in">
                        <div className="flex flex-col sm:flex-row gap-3">
                          <input value={editData.description || ''} onChange={e => setEditData({...editData, description: e.target.value})} className="flex-1 bg-background border border-primary px-3 py-2 rounded-lg text-sm focus:outline-none" placeholder="Mit csináltál?" />
                          <div className="flex gap-2 shrink-0 items-center">
                            <input type="number" min="0" value={Math.floor((editData.duration_minutes || 0) / 60)} onChange={e => setEditData({...editData, duration_minutes: (parseInt(e.target.value || '0')*60) + ((editData.duration_minutes || 0)%60) })} className="w-16 bg-background border border-primary px-3 py-2 rounded-lg text-sm text-center" />
                            <span className="font-bold">:</span>
                            <input type="number" min="0" max="59" value={(editData.duration_minutes || 0) % 60} onChange={e => setEditData({...editData, duration_minutes: (Math.floor((editData.duration_minutes || 0)/60)*60) + parseInt(e.target.value || '0') })} className="w-16 bg-background border border-primary px-3 py-2 rounded-lg text-sm text-center" />
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          {!projectId && projects && (
                            <select value={editData.project_id || ''} onChange={e => setEditData({...editData, project_id: e.target.value, task_id: null})} className="flex-1 bg-background border border-border px-3 py-2 rounded-lg text-sm">
                              <option value="">Nincs projekt</option>
                              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                          )}
                          <select value={editData.task_id || ''} onChange={e => setEditData({...editData, task_id: e.target.value})} className="flex-1 bg-background border border-border px-3 py-2 rounded-lg text-sm">
                            <option value="">Nincs feladat</option>
                            {projectTasks.filter(t => !editData.project_id || t.project_id === editData.project_id).map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                          </select>
                          <input type="date" value={editData.date || ''} onChange={e => setEditData({...editData, date: e.target.value})} className="bg-background border border-border px-3 py-2 rounded-lg text-sm" />
                        </div>
                        <div className="flex justify-end gap-2 mt-1">
                          <Button variant="secondary" onClick={() => setEditingId(null)} className="h-auto py-1.5 px-4 text-xs w-auto">Mégse</Button>
                          <Button onClick={handleSaveEdit} disabled={isLoading} className="h-auto py-1.5 px-4 text-xs w-auto gap-1">
                            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Mentés'}
                          </Button>
                        </div>
                      </div>
                    )
                  }

                  // NORMÁL NÉZET
                  const h = Math.floor(entry.duration_minutes / 60)
                  const m = entry.duration_minutes % 60
                  const timeString = `${h > 0 ? `${h}ó ` : ''}${m > 0 ? `${m}p` : ''}`

                  return (
                    <div key={entry.id} className="p-4 hover:bg-sona-neutral/5 transition-colors flex flex-col sm:flex-row gap-4 sm:items-center justify-between group">
                      <div className="flex flex-col flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate mb-1">
                          {entry.description || 'Névtelen munka'}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {entry.project_name && !projectId && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-sona-neutral bg-background border border-border px-1.5 py-0.5 rounded uppercase tracking-wider truncate max-w-[150px]">
                              <FolderKanban className="w-3 h-3" /> {entry.project_name}
                            </span>
                          )}
                          {entry.task_title && (
                            <span className="flex items-center gap-1 text-[11px] font-medium text-sona-neutral bg-background border border-border px-1.5 py-0.5 rounded truncate max-w-[200px]">
                              <CheckSquare className="w-3 h-3" /> {entry.task_title}
                            </span>
                          )}
                        </div>
                       <div className="flex items-center gap-4 mt-1.5">
                          {/* Szép, nagy profilkép és kiemelt név */}
                          <div className="flex items-center gap-2">
                            <Avatar 
                              name={entry.user_email} 
                              url={entry.user_avatar_url} 
                              className="w-7 h-7 text-xs shadow-sm" 
                            />
                            <span className="text-sm font-semibold text-foreground truncate">
                              {entry.user_email}
                            </span>
                          </div>

                          <span className="w-1.5 h-1.5 rounded-full bg-border" />
                          
                          {/* Dátum egy picit halványabban */}
                          <span className="flex items-center gap-1.5 text-xs font-medium text-sona-neutral">
                            <CalendarIcon className="w-3.5 h-3.5" /> 
                            {new Date(entry.date).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono font-bold text-sm bg-sona-neutral/10 px-2.5 py-1 rounded text-foreground border border-border shadow-sm">
                          {timeString}
                        </span>
                        {/* Láthatatlan gombok, hover-re előjönnek */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEditing(entry)} className="p-1.5 text-sona-neutral hover:text-primary hover:bg-primary/10 rounded-md transition-colors" title="Szerkesztés">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(entry.id)} className="p-1.5 text-sona-neutral hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors" title="Törlés">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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