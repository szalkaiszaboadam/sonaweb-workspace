'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Calendar, Clock, CheckSquare, User, Shield, Layout, List, CalendarDays, MoreHorizontal, Flag, Circle, ChevronLeft, ChevronRight } from 'lucide-react'
import { updateTaskStatus, updateTaskOrders, deleteTask, createTask } from '../actions'
import { TaskModal } from './TaskModal'
import { Avatar } from '@/components/ui/Avatar'

export type Task = {
    id: string
    title: string
    status: string
    position: number
    start_date: string | null
    due_date: string | null
    estimated_hours: number | null
    description?: string | null
    priority: 'low' | 'medium' | 'high' | 'urgent'
    subtasks?: any[] | null 
    user_id?: string 
    // 🚀 ÚJ TÖMB MEZŐK
    assignees?: string[]
    participants?: string[]
    assignee_roles?: string[]
    participant_roles?: string[]
}

type Props = {
    initialTasks: Task[]
    workspaceId: string
    projectId: string
    currentUserId: string          
    currentUserRoleIds: string[]   // <-- ÚJ
    hasEditOthersPerm: boolean     
    hasDeleteOthersPerm: boolean   
    members: any[]                 // <-- ÚJ
    roles: any[]                   // <-- ÚJ
}

const COLUMNS = [
    { id: 'todo', title: 'Tennivalók', color: 'bg-slate-500' },
    { id: 'in_progress', title: 'Folyamatban', color: 'bg-blue-500' },
    { id: 'review', title: 'Ellenőrzésre vár', color: 'bg-purple-500' },
    { id: 'done', title: 'Kész', color: 'bg-green-500' }
] as const

export function TaskManager({ initialTasks, workspaceId, projectId, currentUserId, currentUserRoleIds, hasEditOthersPerm, hasDeleteOthersPerm, members, roles }: Props) {   
    const router = useRouter()

    const [tasks, setTasks] = useState<Task[]>(initialTasks)
    const [view, setView] = useState<'kanban' | 'list' | 'calendar'>('kanban')

    const [addingInColumn, setAddingInColumn] = useState<string | null>(null)
    const [newTaskTitle, setNewTaskTitle] = useState('')
    const [isAdding, setIsAdding] = useState(false)
    const [activeColumn, setActiveColumn] = useState<string | null>(null)

    // -- NAPTÁR ÁLLAPOT --
    const [currentDate, setCurrentDate] = useState(new Date()) 

    // -- MODAL ÁLLAPOTOK --
    const [selectedTask, setSelectedTask] = useState<Task | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleTaskUpdate = (updatedTask: Task) => {
        setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t))
        router.refresh() 
    }

    const handleTaskDelete = (taskId: string) => {
        setTasks(tasks.filter(t => t.id !== taskId))
        router.refresh()
    }

    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        e.dataTransfer.setData('taskId', taskId)
        setTimeout(() => { (e.target as HTMLElement).style.opacity = '0.5' }, 0)
    }

    const handleDragEnd = (e: React.DragEvent) => {
        (e.target as HTMLElement).style.opacity = '1'
    }

    const handleDragOver = (e: React.DragEvent, columnId: string) => {
        e.preventDefault()
        setActiveColumn(columnId)
    }

    const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
        e.preventDefault()
        setActiveColumn(null)

        const taskId = e.dataTransfer.getData('taskId')
        if (!taskId) return

        const draggedTask = tasks.find(t => t.id === taskId)
        if (!draggedTask) return

        const container = e.currentTarget.querySelector('.task-list-container')
        let targetIndex = -1 

        if (container) {
            const cards = Array.from(container.querySelectorAll('[data-task-id]'))
            for (let i = 0; i < cards.length; i++) {
                const rect = cards[i].getBoundingClientRect()
                if (e.clientY < rect.top + rect.height / 2) {
                    targetIndex = i
                    break
                }
            }
        }

        const otherTasks = tasks.filter(t => t.id !== taskId && t.status !== targetStatus)
        let targetColumnTasks = tasks
            .filter(t => t.id !== taskId && t.status === targetStatus)
            .sort((a, b) => (a.position || 0) - (b.position || 0))

        draggedTask.status = targetStatus
        if (targetIndex === -1) {
            targetColumnTasks.push(draggedTask)
        } else {
            targetColumnTasks.splice(targetIndex, 0, draggedTask) 
        }

        targetColumnTasks = targetColumnTasks.map((t, idx) => ({ ...t, position: idx }))

        const newTasksState = [...otherTasks, ...targetColumnTasks]
        setTasks(newTasksState)

        const updates = targetColumnTasks.map(t => ({ id: t.id, status: t.status, position: t.position }))
        const result = await updateTaskOrders(updates)

        if (result?.error) {
            alert('Hiba történt a feladat mozgatásakor.')
            router.refresh() 
        }
    }

    const handleAddTask = async (e: React.FormEvent, status: string) => {
        e.preventDefault()
        if (!newTaskTitle.trim()) {
            setAddingInColumn(null)
            return
        }

        setIsAdding(true)
        const result = await createTask(workspaceId, projectId, newTaskTitle, status)

        if (result.success && result.task) {
            setTasks([...tasks, { ...result.task, position: 999 }])
            setNewTaskTitle('')
            setAddingInColumn(null)
            router.refresh()
        }
        setIsAdding(false)
    }

    return (
        <div className="flex flex-col h-full flex-1 min-h-[500px]">

            {/* NÉZETVÁLTÓ */}
            <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
                <div className="flex items-center bg-sona-neutral/10 p-1 rounded-lg">
                    <button onClick={() => setView('kanban')} className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${view === 'kanban' ? 'bg-surface text-foreground shadow-sm' : 'text-sona-neutral hover:text-foreground'}`}>
                        <Layout className="w-4 h-4" /> Tábla
                    </button>
                    <button onClick={() => setView('list')} className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${view === 'list' ? 'bg-surface text-foreground shadow-sm' : 'text-sona-neutral hover:text-foreground'}`}>
                        <List className="w-4 h-4" /> Lista
                    </button>
                    <button onClick={() => setView('calendar')} className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${view === 'calendar' ? 'bg-surface text-foreground shadow-sm' : 'text-sona-neutral hover:text-foreground'}`}>
                        <CalendarDays className="w-4 h-4" /> Naptár
                    </button>
                </div>
            </div>

            {/* KANBAN TÁBLA */}
            {view === 'kanban' && (
                <div className="flex gap-6 overflow-x-auto pb-4 flex-1 items-start h-full">
                    {COLUMNS.map((column) => {
                        const columnTasks = tasks
                            .filter(t => t.status === column.id)
                            .sort((a, b) => (a.position || 0) - (b.position || 0))

                        return (
                            <div
                                key={column.id}
                                onDragOver={(e) => handleDragOver(e, column.id)}
                                onDragLeave={() => setActiveColumn(null)}
                                onDrop={(e) => handleDrop(e, column.id)}
                                className={`min-w-[280px] max-w-[280px] rounded-xl p-3 flex flex-col max-h-full border transition-colors ${activeColumn === column.id ? 'bg-sona-neutral/10 border-primary/30' : 'bg-sona-neutral/5 border-transparent'
                                    }`}
                            >

                                <div className="flex items-center justify-between mb-3 px-1">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${column.color}`} />
                                        <h3 className="text-sm font-semibold text-foreground">{column.title}</h3>
                                        <span className="text-xs text-sona-neutral bg-sona-neutral/10 px-2 py-0.5 rounded-full">
                                            {columnTasks.length}
                                        </span>
                                    </div>
                                    <button className="text-sona-neutral hover:text-foreground"><MoreHorizontal className="w-4 h-4" /></button>
                                </div>

                                {/* TASK CONTAINER */}
                                <div className="task-list-container flex flex-col gap-2 overflow-y-auto min-h-[30px]">
                                    {columnTasks.map(task => {
                                        const priorityColors = { low: 'text-slate-400', medium: 'text-blue-500', high: 'text-orange-500', urgent: 'text-red-600' }
                                        const prioColor = priorityColors[task.priority || 'medium']

                                        let dateColorClass = 'bg-sona-neutral/10 text-sona-neutral'
                                        if (task.due_date && task.status !== 'done') {
                                            const today = new Date()
                                            today.setHours(0, 0, 0, 0)
                                            const dueDate = new Date(task.due_date)
                                            const diffTime = dueDate.getTime() - today.getTime()
                                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

                                            if (diffDays < 0) dateColorClass = 'bg-red-500/10 text-red-500 font-semibold' 
                                            else if (diffDays <= 3) dateColorClass = 'bg-orange-500/10 text-orange-500 font-semibold' 
                                        }

                                        return (
                                            <div
                                                key={task.id}
                                                data-task-id={task.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, task.id)}
                                                onDragEnd={handleDragEnd}
                                                onClick={() => {
                                                    setSelectedTask(task)
                                                    setIsModalOpen(true)
                                                }}
                                                className="bg-surface border border-border p-3 rounded-lg shadow-sm hover:border-primary transition-all cursor-grab active:cursor-grabbing hover:shadow-md group relative"
                                            >
                                                <div className="absolute top-3 right-3">
                                                    <Flag className={`w-3.5 h-3.5 ${prioColor}`} />
                                                </div>

                                                <p className="text-sm font-medium text-foreground mb-2 pr-6">{task.title}</p>

                                                {(task.start_date || task.due_date || task.estimated_hours || (task.subtasks && task.subtasks.length > 0)) && (
                                                    <div className="flex items-center gap-2 text-xs mt-3 flex-wrap">
                                                        {task.subtasks && task.subtasks.length > 0 && (
                                                          <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded font-medium ${
                                                            task.subtasks.filter(st => st.completed).length === task.subtasks.length 
                                                              ? 'bg-green-500/10 text-green-600' 
                                                              : 'bg-sona-neutral/10 text-sona-neutral'
                                                          }`}>
                                                            <CheckSquare className="w-3 h-3" />
                                                            {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}
                                                          </span>
                                                        )}

                                                        {(task.start_date || task.due_date) && (
                                                            <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${dateColorClass}`}>
                                                                <Calendar className="w-3 h-3" />
                                                                {task.start_date && new Date(task.start_date).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' })}
                                                                {task.start_date && task.due_date && ' - '}
                                                                {task.due_date && new Date(task.due_date).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' })}
                                                            </span>
                                                        )}

                                                        {task.estimated_hours && (
                                                            <span className="flex items-center gap-1 bg-sona-neutral/10 text-sona-neutral px-1.5 py-0.5 rounded">
                                                                <Clock className="w-3 h-3" />
                                                                {task.estimated_hours}ó
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                {/* 🚀 ÚJ AVATAR SÁV (Felelősök és Szerepkörök a kártya alján) */}
                                                <div className="mt-3 flex items-center justify-end gap-1 flex-wrap pt-2 border-t border-border">
                                                    {task.assignees?.map(uid => {
                                                        const u = members.find(m => m.user_id === uid)
                                                        return <Avatar key={uid} name={u?.name || u?.email} url={u?.avatar_url} className="w-6 h-6 text-[10px] ring-2 ring-background shadow-sm" />
                                                    })}
                                                    {task.assignee_roles?.map(rid => {
                                                        const r = roles.find(ro => ro.id === rid)
                                                        return <div key={rid} className="w-6 h-6 rounded-full bg-primary/10 ring-2 ring-background flex items-center justify-center text-primary shadow-sm" title={`Felelős szerepkör: ${r?.name}`}><Shield className="w-3 h-3" /></div>
                                                    })}
                                                    {(!task.assignees?.length && !task.assignee_roles?.length) && (
                                                        <div className="text-[9px] font-bold text-sona-neutral bg-sona-neutral/10 px-2 py-0.5 rounded uppercase tracking-wider">Nincs felelős</div>
                                                    )}
                                                </div>

                                            </div>
                                        )
                                    })}
                                </div>

                                {addingInColumn === column.id ? (
                                    <form onSubmit={(e) => handleAddTask(e, column.id)} className="mt-2">
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="Mit kell csinálni?"
                                            value={newTaskTitle}
                                            onChange={(e) => setNewTaskTitle(e.target.value)}
                                            onBlur={() => { if (!newTaskTitle.trim()) setAddingInColumn(null) }}
                                            className="w-full text-sm bg-surface border border-primary px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
                                            disabled={isAdding}
                                        />
                                    </form>
                                ) : (
                                    <button onClick={() => setAddingInColumn(column.id)} className="flex items-center gap-2 mt-2 px-2 py-2 text-sm text-sona-neutral hover:text-foreground hover:bg-sona-neutral/10 rounded-lg transition-colors w-full">
                                        <Plus className="w-4 h-4" /> Új feladat
                                    </button>
                                )}

                            </div>
                        )
                    })}
                </div>
            )}

            {/* ================= LISTA NÉZET ================= */}
            {view === 'list' && (
                <div className="flex flex-col gap-6 overflow-y-auto pb-4 flex-1">
                    {COLUMNS.map((column) => {
                        const columnTasks = tasks
                            .filter(t => t.status === column.id)
                            .sort((a, b) => (a.position || 0) - (b.position || 0))

                        if (columnTasks.length === 0) return null 

                        return (
                            <div key={column.id} className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
                                <div className="px-4 py-3 bg-sona-neutral/5 border-b border-border flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${column.color}`} />
                                    <h3 className="font-semibold text-foreground text-sm">{column.title}</h3>
                                    <span className="text-xs text-sona-neutral bg-sona-neutral/10 px-2 py-0.5 rounded-full">
                                        {columnTasks.length}
                                    </span>
                                </div>

                                <div className="divide-y divide-border">
                                    {columnTasks.map(task => {
                                        const priorityColors = { low: 'text-slate-400', medium: 'text-blue-500', high: 'text-orange-500', urgent: 'text-red-600' }
                                        const prioColor = priorityColors[task.priority || 'medium']

                                        let dateColorClass = 'text-sona-neutral'
                                        if (task.due_date && task.status !== 'done') {
                                            const today = new Date()
                                            today.setHours(0, 0, 0, 0)
                                            const diffDays = Math.ceil((new Date(task.due_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                                            if (diffDays < 0) dateColorClass = 'text-red-500 font-medium'
                                            else if (diffDays <= 3) dateColorClass = 'text-orange-500 font-medium'
                                        }

                                        return (
                                            <div
                                                key={task.id}
                                                onClick={() => { setSelectedTask(task); setIsModalOpen(true) }}
                                                className="flex items-center justify-between px-4 py-3 hover:bg-sona-neutral/5 transition-colors cursor-pointer group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Circle className="w-4 h-4 text-sona-neutral group-hover:text-primary transition-colors" />
                                                    <span className="text-sm font-medium text-foreground">{task.title}</span>
                                                    <Flag className={`w-3.5 h-3.5 ml-2 ${prioColor}`} />
                                                </div>

                                                <div className="flex items-center gap-6 text-sm">
                                                    {task.estimated_hours && (
                                                        <span className="flex items-center gap-1.5 text-sona-neutral w-16 justify-end">
                                                            <Clock className="w-3.5 h-3.5" /> {task.estimated_hours}ó
                                                        </span>
                                                    )}
                                                    {task.due_date && (
                                                        <span className={`flex items-center gap-1.5 w-24 justify-end ${dateColorClass}`}>
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            {new Date(task.due_date).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' })}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* ================= NAPTÁR NÉZET ================= */}
            {view === 'calendar' && (() => {
                const year = currentDate.getFullYear()
                const month = currentDate.getMonth()
                
                const daysInMonth = new Date(year, month + 1, 0).getDate()
                let firstDay = new Date(year, month, 1).getDay()
                firstDay = firstDay === 0 ? 6 : firstDay - 1
                
                const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
                const emptyDays = Array.from({ length: firstDay }, (_, i) => i)
                
                const monthNames = ['Január', 'Február', 'Március', 'Április', 'Május', 'Június', 'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December']

                const unscheduledTasks = tasks.filter(t => !t.due_date && t.status !== 'done')

                return (
                <div className="flex flex-col md:flex-row gap-6 h-full items-start flex-1">
                    
                    <div className="flex flex-col flex-1 w-full bg-surface border border-border rounded-xl shadow-sm overflow-hidden h-full">
                    
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-sona-neutral/5">
                        <h2 className="text-lg font-semibold text-foreground">
                        {year}. {monthNames[month]}
                        </h2>
                        <div className="flex gap-2">
                        <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-1.5 rounded-md hover:bg-sona-neutral/10 text-sona-neutral hover:text-foreground transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 text-sm font-medium rounded-md hover:bg-sona-neutral/10 text-sona-neutral hover:text-foreground transition-colors">
                            Ma
                        </button>
                        <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-1.5 rounded-md hover:bg-sona-neutral/10 text-sona-neutral hover:text-foreground transition-colors">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 border-b border-border bg-background">
                        {['Hét', 'Kedd', 'Szer', 'Csüt', 'Pén', 'Szo', 'Vas'].map(day => (
                        <div key={day} className="py-2 text-center text-xs font-semibold text-sona-neutral">{day}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 flex-1 auto-rows-fr bg-border gap-px">
                        {emptyDays.map(empty => (
                        <div key={`empty-${empty}`} className="bg-surface min-h-[100px]" />
                        ))}
                        
                        {days.map(day => {
                        const currentDayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                        const dayTasks = tasks.filter(t => t.due_date && t.due_date.startsWith(currentDayStr))
                        const isToday = new Date().toDateString() === new Date(year, month, day).toDateString()

                        return (
                            <div key={day} className="bg-surface min-h-[100px] p-2 hover:bg-sona-neutral/5 transition-colors overflow-y-auto">
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-sm w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-primary-foreground font-bold' : 'text-foreground font-medium'}`}>
                                {day}
                                </span>
                            </div>
                            
                            <div className="flex flex-col gap-1">
                                {dayTasks.map(task => {
                                const colColor = COLUMNS.find(c => c.id === task.status)?.color || 'bg-sona-neutral'
                                return (
                                    <div 
                                    key={task.id}
                                    onClick={() => { setSelectedTask(task); setIsModalOpen(true) }}
                                    className="text-[11px] truncate px-1.5 py-1 rounded bg-sona-neutral/10 text-foreground cursor-pointer hover:bg-sona-neutral/20 border-l-2 border-transparent transition-all"
                                    style={{ borderLeftColor: 'var(--color)' }}
                                    >
                                    <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${colColor}`} />
                                    {task.title}
                                    </div>
                                )
                                })}
                            </div>
                            </div>
                        )
                        })}
                    </div>
                    </div>

                    <div className="w-full md:w-72 bg-surface border border-border rounded-xl shadow-sm flex flex-col max-h-[600px]">
                    <div className="px-4 py-3 bg-sona-neutral/5 border-b border-border flex items-center justify-between">
                        <h3 className="font-semibold text-foreground text-sm">Nincs dátumozva</h3>
                        <span className="text-xs text-sona-neutral bg-sona-neutral/10 px-2 py-0.5 rounded-full">
                        {unscheduledTasks.length}
                        </span>
                    </div>
                    
                    <div className="p-3 flex flex-col gap-2 overflow-y-auto flex-1">
                        {unscheduledTasks.length === 0 ? (
                        <p className="text-sm text-sona-neutral text-center py-4">Minden feladat be van osztva!</p>
                        ) : (
                        unscheduledTasks.map(task => {
                            const colColor = COLUMNS.find(c => c.id === task.status)?.color || 'bg-sona-neutral'
                            return (
                            <div 
                                key={task.id}
                                onClick={() => { setSelectedTask(task); setIsModalOpen(true) }}
                                className="p-3 rounded-lg border border-border bg-background hover:border-primary transition-colors cursor-pointer group"
                            >
                                <div className="flex items-start gap-2 mb-2">
                                <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${colColor}`} />
                                <p className="text-sm font-medium text-foreground leading-tight group-hover:text-primary transition-colors">
                                    {task.title}
                                </p>
                                </div>
                                <p className="text-xs text-sona-neutral ml-4">
                                Kattints a dátumozáshoz
                                </p>
                            </div>
                            )
                        })
                        )}
                    </div>
                    </div>

                </div>
                )
            })()}

            {/* 🚀 AZ OKOSÍTOTT TASK MODAL */}
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
                currentUserRoleIds={currentUserRoleIds}    // <-- ÁTADVA!
                hasEditOthersPerm={hasEditOthersPerm}      
                hasDeleteOthersPerm={hasDeleteOthersPerm}
                members={members}                          // <-- ÁTADVA!
                roles={roles}                              // <-- ÁTADVA!
            />
        </div>
    )
}