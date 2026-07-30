'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, Flag, FolderKanban, CheckCircle2, Circle, User as UserIcon } from 'lucide-react'
import { TaskModal, type Task } from '../../projects/components/TaskModal'

// Kiterjesztjük a Task típust a projekt nevével (amit a Supabase JOIN hozott le)
type WorkspaceTask = Task & { 
  projects?: { name: string } 
}

type Props = {
  initialTasks: WorkspaceTask[]
  members: { id: string, email: string, name: string }[]
  workspaceId: string
  currentUserId: string
}

const COLUMNS = [
  { id: 'todo', title: 'Tennivalók', color: 'bg-slate-500', iconColor: 'text-slate-500' },
  { id: 'in_progress', title: 'Folyamatban', color: 'bg-blue-500', iconColor: 'text-blue-500' },
  { id: 'review', title: 'Ellenőrzésre vár', color: 'bg-purple-500', iconColor: 'text-purple-500' },
  { id: 'done', title: 'Kész', color: 'bg-green-500', iconColor: 'text-green-500' }
] as const

export function WorkspaceTasksView({ initialTasks, members, workspaceId, currentUserId }: Props) {
  const router = useRouter()
  const [tasks, setTasks] = useState<WorkspaceTask[]>(initialTasks)
  const [showOnlyMine, setShowOnlyMine] = useState(false)
  
  // Modal állapotok
  const [selectedTask, setSelectedTask] = useState<WorkspaceTask | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Szűrés logika
  const filteredTasks = tasks.filter(task => {
    if (showOnlyMine) return task.assignee_id === currentUserId
    return true
  })

  // Amikor a Modalban frissítenek egy feladatot
  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(currentTasks => currentTasks.map(t => 
      t.id === updatedTask.id ? { ...t, ...updatedTask, projects: t.projects } : t
    ))
    router.refresh()
  }

  // Amikor a Modalban törölnek egy feladatot
  const handleTaskDelete = (taskId: string) => {
    setTasks(currentTasks => currentTasks.filter(t => t.id !== taskId))
    router.refresh()
  }

  // Segédfüggvény a felelős nevének kiírásához
  const getAssigneeName = (id: string | null | undefined) => {
    if (!id) return 'Nincs felelős'
    return members.find(m => m.id === id)?.name || 'Ismeretlen'
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* Eszköztár (Szűrők) */}
      <div className="flex items-center gap-2 p-1 bg-surface border border-border rounded-lg w-max shadow-sm">
        <button
          onClick={() => setShowOnlyMine(false)}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${!showOnlyMine ? 'bg-background text-foreground shadow-sm border border-border/50' : 'text-sona-neutral hover:text-foreground'}`}
        >
          Minden feladat
        </button>
        <button
          onClick={() => setShowOnlyMine(true)}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${showOnlyMine ? 'bg-background text-foreground shadow-sm border border-border/50' : 'text-sona-neutral hover:text-foreground'}`}
        >
          Saját feladataim
        </button>
      </div>

      {/* Feladatok csoportosítva (Státusz alapján) */}
      <div className="flex flex-col gap-10 mt-4">
        {COLUMNS.map((column) => {
          const columnTasks = filteredTasks.filter(t => t.status === column.id)
          
          if (columnTasks.length === 0) return null // Ha üres az oszlop, elrejtjük

          return (
            <div key={column.id} className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Szekció Fejléc */}
              <div className="flex items-center gap-2 px-2">
                <span className={`w-2.5 h-2.5 rounded-full ${column.color}`} />
                <h2 className="text-lg font-bold text-foreground">{column.title}</h2>
                <span className="text-sm font-medium text-sona-neutral bg-sona-neutral/10 px-2 py-0.5 rounded-full ml-1">
                  {columnTasks.length}
                </span>
              </div>

              {/* Feladatok Listája */}
              <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
                {columnTasks.map((task, index) => {
                  const priorityColors = { low: 'text-slate-400', medium: 'text-blue-500', high: 'text-orange-500', urgent: 'text-red-600' }
                  const prioColor = priorityColors[task.priority || 'medium']
                  
                  let dateColorClass = 'text-sona-neutral'
                  if (task.due_date && task.status !== 'done') {
                    const today = new Date(); today.setHours(0, 0, 0, 0)
                    const diffDays = Math.ceil((new Date(task.due_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                    if (diffDays < 0) dateColorClass = 'text-red-500 font-bold'
                    else if (diffDays <= 3) dateColorClass = 'text-orange-500 font-semibold'
                  }

                  return (
                    <div 
                      key={task.id}
                      onClick={() => { setSelectedTask(task); setIsModalOpen(true) }}
                      className={`group flex items-center justify-between p-4 hover:bg-sona-neutral/5 cursor-pointer transition-colors ${index !== columnTasks.length - 1 ? 'border-b border-border/50' : ''}`}
                    >
                      {/* Bal oldal: Státusz ikon, Név, Projekt */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {task.status === 'done' ? (
                          <CheckCircle2 className={`w-5 h-5 shrink-0 ${column.iconColor}`} />
                        ) : (
                          <Circle className={`w-5 h-5 shrink-0 ${column.iconColor}`} />
                        )}
                        
                        <div className="flex flex-col min-w-0">
                          <span className={`text-sm font-semibold truncate ${task.status === 'done' ? 'text-sona-neutral line-through' : 'text-foreground'}`}>
                            {task.title}
                          </span>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 text-[11px] font-medium text-sona-neutral bg-background border border-border px-1.5 py-0.5 rounded uppercase tracking-wider truncate max-w-[150px]">
                              <FolderKanban className="w-3 h-3" />
                              {task.projects?.name || 'Ismeretlen projekt'}
                            </span>
                            <Flag className={`w-3 h-3 ${prioColor}`} />
                          </div>
                        </div>
                      </div>

                      {/* Jobb oldal: Meta adatok (Dátum, Idő, Felelős) */}
                      <div className="flex items-center gap-6 shrink-0 ml-4">
                        
                        {/* Határidő */}
                        {task.due_date ? (
                          <span className={`hidden sm:flex items-center gap-1.5 text-xs w-24 justify-end ${dateColorClass}`}>
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(task.due_date).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' })}
                          </span>
                        ) : (
                          <span className="hidden sm:block w-24" /> // Helykitöltő az igazításhoz
                        )}

                        {/* Becsült idő */}
                        {task.estimated_hours ? (
                          <span className="hidden md:flex items-center gap-1.5 text-xs font-medium text-sona-neutral w-16 justify-end">
                            <Clock className="w-3.5 h-3.5" /> {task.estimated_hours}h
                          </span>
                        ) : (
                          <span className="hidden md:block w-16" />
                        )}

                        {/* Felelős (Avatar) */}
                        <div className="flex items-center gap-2 w-32 justify-end" title={getAssigneeName(task.assignee_id)}>
                          <span className="text-xs font-medium text-sona-neutral truncate hidden lg:block">
                            {getAssigneeName(task.assignee_id)}
                          </span>
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${task.assignee_id ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-sona-neutral/10 text-sona-neutral border border-border border-dashed'}`}>
                            {task.assignee_id ? getAssigneeName(task.assignee_id).charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5"/>}
                          </div>
                        </div>

                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {filteredTasks.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-sona-neutral bg-surface border border-dashed border-border rounded-2xl">
            <CheckCircle2 className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium text-foreground">Nincsenek feladatok</p>
            <p className="text-sm">Jelenleg nincs megjeleníthető feladat ebben a nézetben.</p>
          </div>
        )}
      </div>

      {/* ÚJRAHASZNOSÍTOTT MODAL */}
      <TaskModal
        task={selectedTask}
        isOpen={isModalOpen}
        workspaceId={workspaceId}
        onClose={() => {
          setIsModalOpen(false)
          setTimeout(() => setSelectedTask(null), 200)
        }}
        onUpdate={handleTaskUpdate}
        onDelete={handleTaskDelete}
      />

    </div>
  )
}