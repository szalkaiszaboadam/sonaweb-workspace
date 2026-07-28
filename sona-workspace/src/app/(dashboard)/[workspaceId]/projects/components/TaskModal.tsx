'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { updateTaskDetails, deleteTask } from '../actions'
import { Trash2, AlignLeft, Calendar, Clock, Flag, CheckSquare, Plus, X } from 'lucide-react'
import { RichTextEditor } from '@/components/ui/RichTextEditor'
import { CommentSection } from './CommentSection'
import { AttachmentSection } from './AttachmentSection'

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
    subtasks?: Subtask[] | null 
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

  const [title, setTitle] = useState('')
  const [descriptionContent, setDescriptionContent] = useState('')

  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [isAddingSubtask, setIsAddingSubtask] = useState(false)

  const [prevTaskId, setPrevTaskId] = useState<string | null>(null)

  if (task && task.id !== prevTaskId) {
    setPrevTaskId(task.id)
    setTitle(task.title || '')
    setDescriptionContent(task.description || '')
    setSubtasks(task.subtasks || [])
  }

  if (!task) return null

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
          title: title, // <-- Kijavítva: egyből a state-ből olvassuk a címet!
          description: descriptionContent, 
          start_date: formData.get('start_date') ? (formData.get('start_date') as string) : null,
          due_date: formData.get('due_date') ? (formData.get('due_date') as string) : null,
          estimated_hours: formData.get('estimated_hours') ? parseFloat(formData.get('estimated_hours') as string) : null,
          priority: formData.get('priority') as Task['priority'],
          subtasks: subtasks 
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

  // Dátum formázó az input mezők default értékéhez
  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return ''
    return new Date(dateString).toISOString().split('T')[0]
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Feladat szerkesztése"
      className="max-w-5xl w-full"
    >
      <form onSubmit={handleSubmit} className="flex flex-col max-h-[85vh]">
        
        {/* Belső görgetősáv és 2-oszlopos rács */}
        <div className="flex-1 overflow-y-auto pr-4 grid grid-cols-1 md:grid-cols-3 gap-8 pb-4">
          
          {/* ================= BAL OSZLOP (2/3 szélesség) ================= */}
          <div className="md:col-span-2 flex flex-col gap-6">
            
            {/* FELADAT CÍME */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-foreground">Feladat neve</label>
              <input
                autoFocus
                type="text"
                value={title} 
                onChange={e => setTitle(e.target.value)}
                className="w-full text-lg font-medium px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Feladat neve..."
                required
              />
            </div>

            {/* LEÍRÁS (RichTextEditor) */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <AlignLeft className="w-4 h-4 text-sona-neutral" /> Leírás
              </label>
              <div className="border border-border rounded-xl overflow-hidden bg-background">
                <RichTextEditor 
                  key={task.id} 
                  content={descriptionContent} 
                  onChange={setDescriptionContent} 
                />
              </div>
            </div>

            {/* CHECKLIST (Részfeladatok) */}
            <div className="flex flex-col gap-3 mt-2 border-t border-border pt-4">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-sona-neutral" /> Részfeladatok
                  {subtasks.length > 0 && (
                    <span className="ml-auto text-xs font-medium text-sona-neutral">
                      {progressPercentage}% kész
                    </span>
                  )}
              </label>
              
              {/* Folyamatjelző sáv */}
              {subtasks.length > 0 && (
                <div className="w-full bg-sona-neutral/20 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-300" 
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              )}

              <div className="flex flex-col gap-2 mt-2">
                {subtasks.map((st) => (
                  <div key={st.id} className="flex items-center gap-3 group">
                    <input 
                      type="checkbox" 
                      checked={st.completed}
                      onChange={() => toggleSubtask(st.id)}
                      className="w-4 h-4 rounded border-sona-neutral/30 text-primary focus:ring-primary/50 bg-background cursor-pointer"
                    />
                    <span className={`text-sm flex-1 ${st.completed ? 'line-through text-sona-neutral' : 'text-foreground'}`}>
                      {st.title}
                    </span>
                    <button 
                      type="button"
                      onClick={() => removeSubtask(st.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-sona-neutral hover:text-red-500 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {/* Új részfeladat hozzáadása */}
                {isAddingSubtask ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      autoFocus
                      type="text"
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
                      placeholder="Mit kell csinálni?"
                      className="flex-1 text-sm bg-background border border-primary px-3 py-1.5 rounded-md focus:outline-none"
                    />
                    <Button type="button" onClick={handleAddSubtask} className="py-1.5 px-3 text-xs">Mentés</Button>
                    <button type="button" onClick={() => setIsAddingSubtask(false)} className="p-2 text-sona-neutral hover:bg-sona-neutral/10 rounded-md">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button 
                    type="button" 
                    onClick={() => setIsAddingSubtask(true)}
                    className="flex items-center gap-2 text-sm text-sona-neutral hover:text-foreground transition-colors mt-1 w-fit"
                  >
                    <Plus className="w-4 h-4" /> Új elem hozzáadása
                  </button>
                )}
              </div>
            </div>

            {/* HOZZÁSZÓLÁSOK */}
            <div className="mt-2 border-t border-border pt-4">
              <CommentSection targetType="task" targetId={task.id} />
            </div>

          </div>

          {/* ================= JOBB OSZLOP (1/3 szélesség) ================= */}
          <div className="flex flex-col gap-6 border-l border-border pl-0 md:pl-6">
            
            {/* BEÁLLÍTÁSOK (Prioritás, Dátumok) */}
            <div className="flex flex-col gap-4 bg-sona-neutral/5 p-4 rounded-xl">
              
              {/* Prioritás */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-sona-neutral flex items-center gap-1.5">
                  <Flag className="w-3.5 h-3.5" /> Prioritás
                </label>
                <select 
                  name="priority" 
                  defaultValue={task.priority}
                  className="w-full text-sm bg-background border border-border px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="low">Alacsony</option>
                  <option value="medium">Közepes</option>
                  <option value="high">Magas</option>
                  <option value="urgent">Sürgős ⚡</option>
                </select>
              </div>

              {/* Kezdés */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-sona-neutral flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Kezdés
                </label>
                <input 
                  type="date" 
                  name="start_date" 
                  defaultValue={formatDateForInput(task.start_date)}
                  className="w-full text-sm bg-background border border-border px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Határidő */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-sona-neutral flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Határidő
                </label>
                <input 
                  type="date" 
                  name="due_date" 
                  defaultValue={formatDateForInput(task.due_date)}
                  className="w-full text-sm bg-background border border-border px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Becsült idő */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-sona-neutral flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Becsült idő (óra)
                </label>
                <input 
                  type="number" 
                  step="0.5"
                  min="0"
                  name="estimated_hours" 
                  defaultValue={task.estimated_hours || ''}
                  className="w-full text-sm bg-background border border-border px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="pl. 2.5"
                />
              </div>

            </div>

            {/* CSATOLMÁNYOK */}
            <div className="border-t border-border pt-4">
              <AttachmentSection targetType="task" targetId={task.id} />
            </div>
            
            {/* Hibaüzenet ha van */}
            {error && (
              <p className="text-xs text-red-500 font-medium">{error}</p>
            )}

            {/* GOMBOK (Lent) */}
            <div className="flex flex-col gap-3 mt-auto pt-6 border-t border-border">
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full py-2.5 font-medium shadow-md"
              >
                {isLoading ? 'Mentés folyamatban...' : 'Mentés és Bezárás'}
              </Button>
              <button 
                type="button" 
                onClick={handleDelete} 
                className="w-full py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-md transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Feladat törlése
              </button>
            </div>

          </div>
        </div>
      </form>
    </Modal>
  )
}