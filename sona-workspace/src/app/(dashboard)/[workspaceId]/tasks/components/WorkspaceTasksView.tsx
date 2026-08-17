'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, Flag, FolderKanban, Shield, CheckCircle2, Circle, User as UserIcon } from 'lucide-react'
import { TaskModal, type Task } from '../../projects/components/TaskModal'
import { Avatar } from '@/components/ui/Avatar'
export type WorkspaceTask = {
  id: string
  title: string
  status: string
  position: number
  start_date: string | null
  due_date: string | null
  estimated_hours: number | null
  description?: string | null
  priority: 'low' | 'medium' | 'high' | 'urgent'
  project_id: string
  projects?: { name: string }
  user_id?: string
  // 🚀 ÚJ TÖMB MEZŐK A RÉGI assignee_id HELYETT:
  assignees?: string[]
  participants?: string[]
  assignee_roles?: string[]
  participant_roles?: string[]
}

type Props = {
  initialTasks: WorkspaceTask[]
  members: { user_id: string, email: string, name: string, avatar_url?: string }[]
  workspaceId: string
  currentUserId: string
  hasEditOthersPerm: boolean
  hasDeleteOthersPerm: boolean
  // 🚀 ÚJ PROP-OK:
  currentUserRoleIds: string[]
  roles: any[]
}

const COLUMNS = [
  { id: 'todo', title: 'Tennivalók', color: 'bg-slate-500', iconColor: 'text-slate-500' },
  { id: 'in_progress', title: 'Folyamatban', color: 'bg-blue-500', iconColor: 'text-blue-500' },
  { id: 'review', title: 'Ellenőrzésre vár', color: 'bg-purple-500', iconColor: 'text-purple-500' },
  { id: 'done', title: 'Kész', color: 'bg-green-500', iconColor: 'text-green-500' }
] as const

export function WorkspaceTasksView({ initialTasks, members, workspaceId, currentUserId, hasEditOthersPerm, hasDeleteOthersPerm, currentUserRoleIds, roles }: Props) {
  const router = useRouter()
  const [tasks, setTasks] = useState<WorkspaceTask[]>(initialTasks)
  const [showOnlyMine, setShowOnlyMine] = useState(false)
  
  // Modal állapotok
  const [selectedTask, setSelectedTask] = useState<WorkspaceTask | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Szűrés logika
  const filteredTasks = tasks.filter(task => {
    if (showOnlyMine) return task.assignees?.includes(currentUserId)
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
                      <div className="flex items-center gap-1 flex-wrap justify-end">
    {task.assignees?.map(uid => {
        const u = members.find(m => m.user_id === uid)
        return <Avatar key={uid} name={u?.name || u?.email} url={u?.avatar_url} className="w-6 h-6 text-[10px] ring-2 ring-background shadow-sm" />
    })}
    {task.assignee_roles?.map(rid => {
        const r = roles.find(ro => ro.id === rid)
        return <div key={rid} className="w-6 h-6 rounded-full bg-primary/10 ring-2 ring-background flex items-center justify-center text-primary shadow-sm" title={`Felelős szerepkör: ${r?.name}`}><Shield className="w-3 h-3" /></div>
    })}
    {(!task.assignees?.length && !task.assignee_roles?.length) && (
        <div className="text-[10px] font-bold text-sona-neutral bg-sona-neutral/10 px-2 py-0.5 rounded uppercase tracking-wider">Nincs felelős</div>
    )}
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
        currentUserId={currentUserId}              
        hasEditOthersPerm={hasEditOthersPerm}      
        hasDeleteOthersPerm={hasDeleteOthersPerm}
        // 🚀 ÚJ ADATOK ÁTADÁSA:
        currentUserRoleIds={currentUserRoleIds}
        members={members}
        roles={roles}
      />

    </div>
  )
}