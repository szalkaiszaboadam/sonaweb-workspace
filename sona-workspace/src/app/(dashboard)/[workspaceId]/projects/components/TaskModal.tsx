'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { updateTaskDetails, deleteTask } from '../actions'
import { Trash2, AlignLeft, Calendar, Clock, Flag, CheckSquare, Plus, X } from 'lucide-react'
import { RichTextEditor } from '@/components/ui/RichTextEditor'

// Új alfeladat típus
export type Subtask = {
    id: string
    title: string
    completed: boolean
}

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
    subtasks?: Subtask[] | null // <-- ÚJ: Checklist hozzáadva
}

type Props = {
    task: Task | null
    isOpen: boolean
    onClose: () => void
    onUpdate: (updatedTask: Task) => void
    onDelete: (taskId: string) => void
}

export function TaskModal({ task, isOpen, onClose, onUpdate, onDelete }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [descriptionContent, setDescriptionContent] = useState('')

  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [isAddingSubtask, setIsAddingSubtask] = useState(false)

  // ================= A MEGOLDÁS ITT KEZDŐDIK =================
  const [prevTaskId, setPrevTaskId] = useState<string | null>(null)

  // Ez a React hivatalos "Derived State" módszere:
  // Késleltetés nélkül, azonnal frissíti a belső állapotokat, amint egy másik feladatra kattintasz.
  if (task && task.id !== prevTaskId) {
    setPrevTaskId(task.id)
    setDescriptionContent(task.description || '')
    setSubtasks(task.subtasks || [])
  }
  
  // (A RÉGI `useEffect` BLOKKOT, AMI ITT VOLT, TELJESEN TÖRÖLD KI!)
  // ================= A MEGOLDÁS ITT VÉGET ÉR =================

  if (!task) return null
  
  // ... a kód többi része (handleAddSubtask stb.) változatlan marad

    // CHECKLIST LOGIKA
    const handleAddSubtask = () => {
        if (!newSubtaskTitle.trim()) return
        const newSubtask: Subtask = {
            id: Math.random().toString(36).substring(2, 9),
            title: newSubtaskTitle,
            completed: false
        }
        setSubtasks([...subtasks, newSubtask])
        setNewSubtaskTitle('')
        setIsAddingSubtask(false)
    }

    const toggleSubtask = (id: string) => {
        setSubtasks(subtasks.map(st => st.id === id ? { ...st, completed: !st.completed } : st))
    }

    const removeSubtask = (id: string) => {
        setSubtasks(subtasks.filter(st => st.id !== id))
    }

    const completedSubtasks = subtasks.filter(st => st.completed).length
    const progressPercentage = subtasks.length === 0 ? 0 : Math.round((completedSubtasks / subtasks.length) * 100)


    // MENTÉS
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)

        const updates = {
            title: formData.get('title') as string,
            description: descriptionContent, // A state-ből vesszük, nem a formból!
            start_date: formData.get('start_date') ? (formData.get('start_date') as string) : null,
            due_date: formData.get('due_date') ? (formData.get('due_date') as string) : null,
            estimated_hours: formData.get('estimated_hours') ? parseFloat(formData.get('estimated_hours') as string) : null,
            priority: formData.get('priority') as Task['priority'],
            subtasks: subtasks // Mentjük a módosított checklistet
        }

        const result = await updateTaskDetails(task.id, updates)

        if (result.error) {
            setError(result.error)
            setIsLoading(false)
        } else {
            onUpdate({ ...task, ...updates } as Task)
            setIsLoading(false)
            onClose()
        }
    }

    const handleDelete = async () => {
        if (!confirm('Biztosan véglegesen törlöd ezt a feladatot?')) return
        setIsLoading(true)
        const result = await deleteTask(task.id)
        if (result.error) setError(result.error)
        else { onDelete(task.id); onClose() }
        setIsLoading(false)
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Feladat részletei">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                <Input label="Feladat címe" id="title" name="title" defaultValue={task.title} required className="text-lg font-semibold" />

                {/* ================= LEÍRÁS MODUL (WYSIWYG) ================= */}
                <div className="flex flex-col gap-2 w-full">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <AlignLeft className="w-4 h-4 text-sona-neutral" /> Leírás
                    </label>
                    <RichTextEditor
                        key={task.id} /* <--- EZT A SORT KELLETT HOZZÁADNI! Így mindig újratölti az adott feladat szövegét */
                        content={descriptionContent}
                        onChange={setDescriptionContent}
                    />
                </div>

                {/* ================= CHECKLIST MODUL ================= */}
                <div className="flex flex-col gap-3 w-full">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <CheckSquare className="w-4 h-4 text-sona-neutral" /> Checklist
                        </label>
                        <span className="text-xs font-medium text-sona-neutral">
                            {completedSubtasks} / {subtasks.length} kész
                        </span>
                    </div>

                    {/* Progress bar (Folyamatjelző) */}
                    {subtasks.length > 0 && (
                        <div className="w-full h-1.5 bg-sona-neutral/20 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-300 ${progressPercentage === 100 ? 'bg-green-500' : 'bg-primary'}`}
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    )}

                    {/* Checklist elemek */}
                    <div className="flex flex-col gap-1.5 mt-1">
                        {subtasks.map((st) => (
                            <div key={st.id} className="flex items-start gap-2 group hover:bg-sona-neutral/5 p-1 -mx-1 rounded-md transition-colors">
                                <input
                                    type="checkbox"
                                    checked={st.completed}
                                    onChange={() => toggleSubtask(st.id)}
                                    className="mt-1 rounded border-border text-primary focus:ring-primary cursor-pointer"
                                />
                                <span className={`text-sm flex-1 cursor-pointer select-none transition-all ${st.completed ? 'text-sona-neutral line-through' : 'text-foreground'}`} onClick={() => toggleSubtask(st.id)}>
                                    {st.title}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => removeSubtask(st.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-sona-neutral hover:text-red-500 hover:bg-red-500/10 rounded transition-all"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Új elem hozzáadása */}
                    {isAddingSubtask ? (
                        <div className="flex items-center gap-2 mt-1">
                            <input
                                type="text" autoFocus
                                value={newSubtaskTitle}
                                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') { e.preventDefault(); handleAddSubtask(); }
                                    if (e.key === 'Escape') { setIsAddingSubtask(false); setNewSubtaskTitle(''); }
                                }}
                                placeholder="Új elem neve..."
                                className="flex-1 text-sm bg-background border border-primary px-3 py-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            <Button type="button" onClick={handleAddSubtask} className="py-1.5 px-3">Hozzáadás</Button>
                            <button type="button" onClick={() => { setIsAddingSubtask(false); setNewSubtaskTitle('') }} className="p-1.5 text-sona-neutral hover:text-foreground">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setIsAddingSubtask(true)}
                            className="flex items-center gap-1.5 text-sm font-medium text-sona-neutral hover:text-foreground hover:bg-sona-neutral/10 w-fit px-2 py-1.5 -ml-2 rounded-md transition-colors mt-1"
                        >
                            <Plus className="w-4 h-4" /> Elem hozzáadása
                        </button>
                    )}
                </div>

                {/* ================= ALAP MEZŐK (Prioritás, Dátumok) ================= */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border mt-2">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-foreground flex items-center gap-2"><Flag className="w-4 h-4 text-sona-neutral" /> Prioritás</label>
                        <select name="priority" defaultValue={task.priority || 'medium'} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground h-10">
                            <option value="low">Alacsony</option>
                            <option value="medium">Közepes</option>
                            <option value="high">Magas</option>
                            <option value="urgent">Sürgős (Kritikus)</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-foreground flex items-center gap-2"><Clock className="w-4 h-4 text-sona-neutral" /> Becsült idő (óra)</label>
                        <input type="number" name="estimated_hours" step="0.5" min="0" placeholder="Pl.: 2.5" defaultValue={task.estimated_hours || ''} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground h-10" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-foreground flex items-center gap-2"><Calendar className="w-4 h-4 text-sona-neutral" /> Kezdő dátum</label>
                        <input type="date" name="start_date" defaultValue={task.start_date ? task.start_date.split('T')[0] : ''} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground h-10" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-foreground flex items-center gap-2"><Calendar className="w-4 h-4 text-sona-neutral" /> Határidő</label>
                        <input type="date" name="due_date" defaultValue={task.due_date ? task.due_date.split('T')[0] : ''} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground h-10" />
                    </div>
                </div>

                {error && <p className="text-sm text-red-500 bg-red-500/10 p-2 rounded">{error}</p>}

                {/* GOMBOK */}
                <div className="flex justify-between items-center mt-2 pt-4 border-t border-border">
                    <button type="button" onClick={handleDelete} className="text-sm font-medium flex items-center gap-1.5 text-red-500 hover:bg-red-500/10 px-3 py-2 rounded-md transition-colors">
                        <Trash2 className="w-4 h-4" /> Törlés
                    </button>

                    <div className="flex gap-3">
                        <Button type="button" variant="secondary" onClick={onClose}>Mégse</Button>
                        <Button type="submit" disabled={isLoading}>{isLoading ? 'Mentés...' : 'Mentés'}</Button>
                    </div>
                </div>
            </form>
        </Modal>
    )
}