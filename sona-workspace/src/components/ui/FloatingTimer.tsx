'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Play, Pause, Square, Loader2, Timer as TimerIcon } from 'lucide-react'
import { useGlobalTimer, formatTimerDisplay } from '@/hooks/useGlobalTimer'
import { addTimeEntry } from '@/app/(dashboard)/[workspaceId]/projects/actions'

export function FloatingTimer() {
  const { timer, displaySeconds, pause, resume, stop } = useGlobalTimer()
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  if (timer.status === 'idle') return null

  const handleStop = async () => {
    setIsSaving(true)
    const finalData = stop()
    
    const totalMinutes = Math.max(1, Math.ceil(finalData.totalSeconds / 60))
    const todayDate = new Date().toISOString().split('T')[0]

    await addTimeEntry(
      finalData.workspaceId, 
      finalData.projectId, 
      finalData.description, 
      todayDate, 
      totalMinutes, 
      finalData.taskId
    )
    
    setIsSaving(false)
    router.refresh()
  }

  return (
    // ASZTALON: Jobb alsó sarok | MOBILON: Középre zárt lebegő sáv a képernyő alján
    <div className="fixed z-[100] bottom-4 left-4 right-4 md:left-auto md:bottom-6 md:right-6 animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-none">
      
      {/* A pointer-events-auto visszakapcsolja a kattinthatóságot csak a dobozra */}
      <div className="pointer-events-auto flex items-center justify-between gap-2 md:gap-4 bg-surface/95 backdrop-blur-md border border-border shadow-2xl rounded-full pl-4 md:pl-5 pr-1.5 py-1.5 md:py-2 mx-auto max-w-sm md:max-w-none">
        
        {/* Bal oldal: Szöveg és Idő */}
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-[10px] md:text-xs text-sona-neutral truncate font-medium flex items-center gap-1.5">
            <TimerIcon className="w-3 h-3 shrink-0" />
            <span className="truncate">{timer.description || 'Nincs leírás...'}</span>
          </span>
          <span className={`font-mono font-bold text-base md:text-lg leading-tight ${timer.status === 'running' ? 'text-primary' : 'text-orange-500'}`}>
            {formatTimerDisplay(displaySeconds)}
          </span>
        </div>

        {/* Jobb oldal: Gombok */}
        <div className="flex items-center gap-1 border-l border-border/50 pl-2 md:pl-3 shrink-0">
          {timer.status === 'running' ? (
            <button 
              onClick={pause} 
              className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white transition-all shadow-sm"
              title="Szüneteltetés"
            >
              <Pause className="w-4 h-4 fill-current" />
            </button>
          ) : (
            <button 
              onClick={resume} 
              className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all shadow-sm"
              title="Folytatás"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </button>
          )}

          <button 
            onClick={handleStop} 
            disabled={isSaving} 
            className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm disabled:opacity-50"
            title="Leállítás és Mentés"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4 fill-current" />}
          </button>
        </div>

      </div>
    </div>
  )
}