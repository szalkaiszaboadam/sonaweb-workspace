'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Play, Pause, Square, Loader2, Timer as TimerIcon, Save } from 'lucide-react'
import { useGlobalTimer, formatTimerDisplay } from '@/hooks/useGlobalTimer'
import { addTimeEntry } from '@/app/(dashboard)/[workspaceId]/projects/actions'
import { createClient } from '@/lib/supabase/client'
import { Button } from './Button'

export function FloatingTimer() {
  const { timer, displaySeconds, pause, resume, stop } = useGlobalTimer()
  const [isFinishing, setIsFinishing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [projects, setProjects] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  
  const [finishingData, setFinishingData] = useState({
    description: '',
    projectId: '',
    taskId: ''
  })

  const router = useRouter()

  useEffect(() => {
    if (isFinishing && timer.workspaceId) {
      const loadData = async () => {
        const supabase = createClient()
        const { data: p } = await supabase.from('projects').select('id, name').eq('workspace_id', timer.workspaceId)
        if (p) setProjects(p)
        if (timer.projectId) {
          const { data: t } = await supabase.from('tasks').select('id, title').eq('project_id', timer.projectId)
          if (t) setTasks(t)
        }
      }
      loadData()
    }
  }, [isFinishing, timer.workspaceId, timer.projectId])

  const handleProjectChange = async (newProjectId: string) => {
    setFinishingData({ ...finishingData, projectId: newProjectId, taskId: '' })
    if (newProjectId) {
      const supabase = createClient()
      const { data: t } = await supabase.from('tasks').select('id, title').eq('project_id', newProjectId)
      if (t) setTasks(t)
    } else {
      setTasks([])
    }
  }

  if (timer.status === 'idle') return null

  const handleInitiateStop = () => {
    pause() // Megállítjuk a pörgést
    setFinishingData({
      description: timer.description || '',
      projectId: timer.projectId || '',
      taskId: timer.taskId || ''
    })
    setIsFinishing(true)
  }

  const handleCancelFinish = () => {
    setIsFinishing(false)
    resume() // Újraindítjuk a stoppert, ha mégsem akarja leállítani
  }

  const handleFinalSave = async () => {
    setIsSaving(true)
    const finalData = stop() // Teljesen nullázza és visszaadja a végeredményt
    
    const totalMinutes = Math.max(1, Math.ceil(finalData.totalSeconds / 60))
    const todayDate = new Date().toISOString().split('T')[0]

    await addTimeEntry(
      finalData.workspaceId, 
      finishingData.projectId || null, 
      finishingData.description, 
      todayDate, 
      totalMinutes, 
      finishingData.taskId || null
    )
    
    setIsSaving(false)
    setIsFinishing(false)
    router.refresh()
  }

  // HA ÉPP MENTI AZ IDŐT (Ablak mód)
  if (isFinishing) {
    return (
      <div className="fixed z-[100] bottom-4 right-4 md:bottom-6 md:right-6 bg-surface border border-border shadow-2xl rounded-2xl p-5 w-[calc(100vw-32px)] max-w-sm animate-in slide-in-from-bottom-5">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <TimerIcon className="w-5 h-5 text-primary" /> Időmérés mentése
        </h3>
        <div className="flex flex-col gap-3">
          <input 
            autoFocus
            placeholder="Mit csináltál? (Opcionális)" 
            value={finishingData.description} 
            onChange={e => setFinishingData({...finishingData, description: e.target.value})} 
            className="w-full bg-background border border-border px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-primary" 
          />
          <select 
            value={finishingData.projectId} 
            onChange={e => handleProjectChange(e.target.value)} 
            className="w-full bg-background border border-border px-3 py-2 rounded-lg text-sm focus:outline-none"
          >
            <option value="">Válassz projektet (opcionális)</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          {finishingData.projectId && (
            <select 
              value={finishingData.taskId} 
              onChange={e => setFinishingData({...finishingData, taskId: e.target.value})} 
              className="w-full bg-background border border-border px-3 py-2 rounded-lg text-sm focus:outline-none animate-in fade-in"
            >
              <option value="">Válassz feladatot (opcionális)</option>
              {tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          )}
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <span className="font-mono font-bold text-2xl text-primary">{formatTimerDisplay(displaySeconds)}</span>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={handleCancelFinish} className="px-3 py-1.5 h-auto text-xs" disabled={isSaving}>Mégse</Button>
              <Button type="button" onClick={handleFinalSave} className="px-4 py-1.5 h-auto text-xs gap-1.5" disabled={isSaving}>
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Mentés
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // NORMÁL LEBEGŐ KAPSZULA
  return (
    <div className="fixed z-[100] bottom-4 left-4 right-4 md:left-auto md:bottom-6 md:right-6 animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-none">
      <div className="pointer-events-auto flex items-center justify-between gap-2 md:gap-4 bg-surface/95 backdrop-blur-md border border-border shadow-2xl rounded-full pl-4 md:pl-5 pr-1.5 py-1.5 md:py-2 mx-auto max-w-sm md:max-w-none">
        
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-[10px] md:text-xs text-sona-neutral truncate font-medium flex items-center gap-1.5">
            <TimerIcon className="w-3 h-3 shrink-0" />
            <span className="truncate">{timer.description || 'Névtelen munka'}</span>
          </span>
          <span className={`font-mono font-bold text-base md:text-lg leading-tight ${timer.status === 'running' ? 'text-primary' : 'text-orange-500'}`}>
            {formatTimerDisplay(displaySeconds)}
          </span>
        </div>

        <div className="flex items-center gap-1 border-l border-border/50 pl-2 md:pl-3 shrink-0">
          {timer.status === 'running' ? (
            <button onClick={pause} className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white transition-all shadow-sm" title="Szüneteltetés">
              <Pause className="w-4 h-4 fill-current" />
            </button>
          ) : (
            <button onClick={resume} className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all shadow-sm" title="Folytatás">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </button>
          )}
          <button onClick={handleInitiateStop} disabled={isSaving} className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm disabled:opacity-50" title="Leállítás">
            <Square className="w-4 h-4 fill-current" />
          </button>
        </div>

      </div>
    </div>
  )
}