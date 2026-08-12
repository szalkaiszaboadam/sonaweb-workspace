'use client'

import { useState, useEffect, useRef } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { updateTaskDetails, deleteTask, getWorkspaceMembers } from '../actions'
import { Trash2, AlignLeft, Calendar, Clock, Flag, CheckSquare, Plus, X, Users, Paperclip } from 'lucide-react'
import { RichTextEditor } from '@/components/ui/RichTextEditor'
import { CommentSection } from './CommentSection'
import { AttachmentSection } from './AttachmentSection'
import { SelectDropdown } from '@/components/ui/SelectDropdown'

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
    assignee_id?: string | null
    user_id?: string // <-- ÚJ: Hogy tudjuk, ki hozta létre!
}

type Props = {
    task: Task | null
    workspaceId: string
    isOpen: boolean
    onClose: () => void
    onUpdate: (updatedTask: Task) => void
    onDelete: (taskId: string) => void
    currentUserId: string          // <-- ÚJ
    hasEditOthersPerm: boolean     // <-- ÚJ
    hasDeleteOthersPerm: boolean   // <-- ÚJ
}

export function TaskModal({ task, workspaceId, isOpen, onClose, onUpdate, onDelete, currentUserId, hasEditOthersPerm, hasDeleteOthersPerm }: Props) {  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 🚀 AZ ÚJ FELADAT SZINTŰ JOGOSULTSÁG-KALKULÁTOR
    const isCreator = task?.user_id === currentUserId
    const isAssignee = task?.assignee_id === currentUserId
    const canEdit = isCreator || isAssignee || hasEditOthersPerm
    const canDelete = isCreator || hasDeleteOthersPerm

  // -- ALAP ADATOK --
  const [title, setTitle] = useState('')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [descriptionContent, setDescriptionContent] = useState('')
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null)
  
  // -- META ADATOK --
  const [priority, setPriority] = useState<Task['priority']>('medium')
  const [startDate, setStartDate] = useState<string>('')
  const [dueDate, setDueDate] = useState<string>('')
  const [estimatedHours, setEstimatedHours] = useState<string>('')

  // -- DINAMIKUS MEGJELENÍTÉS ÁLLAPOTOK --
  const [showStartDate, setShowStartDate] = useState(false)
  const [showDueDate, setShowDueDate] = useState(false)
  const [showEstHours, setShowEstHours] = useState(false)

  // -- UI ÁLLAPOTOK --
  const [isEditingDesc, setIsEditingDesc] = useState(false)
  const [isDescExpanded, setIsDescExpanded] = useState(false)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [isAddingSubtask, setIsAddingSubtask] = useState(false)
  const [members, setMembers] = useState<any[]>([])
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false)
  
  const addMenuRef = useRef<HTMLDivElement>(null)
  const [prevTaskId, setPrevTaskId] = useState<string | null>(null)

  // ==========================================
  // SPLIT PANE (OKOS BÖNGÉSZŐS MEMÓRIÁVAL)
  // ==========================================
  const containerRef = useRef<HTMLDivElement>(null)
  const [leftWidth, setLeftWidth] = useState(60) // Alap: 60% bal, 40% jobb
  const leftWidthRef = useRef(60) // Ref a pontos mentéshez húzás után
  const [isDragging, setIsDragging] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)

  // 1. Betöltéskor kiolvassuk az elmentett méretet a böngészőből
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedWidth = localStorage.getItem('sona-task-modal-width')
      if (savedWidth) {
        setLeftWidth(parseFloat(savedWidth))
        leftWidthRef.current = parseFloat(savedWidth)
      }
    }
  }, [])

  // 2. Szinkronban tartjuk a ref-et, hogy az egér elengedésekor jó adatot mentsünk
  useEffect(() => {
    leftWidthRef.current = leftWidth
  }, [leftWidth])

  // Képernyőméret figyelése (Mobilon ne legyen osztott nézet)
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024)
    if (typeof window !== 'undefined') {
      setIsDesktop(window.innerWidth >= 1024)
      window.addEventListener('resize', handleResize)
    }
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Húzóka logikája
  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return
      
      const containerRect = containerRef.current.getBoundingClientRect()
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100
      
      // Szigorított korlátok: Bal oldal minimum 45%, maximum 70%
      if (newLeftWidth >= 45 && newLeftWidth <= 70) {
        setLeftWidth(newLeftWidth)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      // 3. Amikor elengedjük a vonalat, elmentjük a böngészőbe a friss szélességet!
      if (typeof window !== 'undefined') {
        localStorage.setItem('sona-task-modal-width', leftWidthRef.current.toString())
      }
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    } else {
      document.body.style.cursor = 'default'
      document.body.style.userSelect = 'auto'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'default'
      document.body.style.userSelect = 'auto'
    }
  }, [isDragging])

  // ==========================================

  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return ''
    return new Date(dateString).toISOString().split('T')[0]
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setIsAddMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && workspaceId) {
      getWorkspaceMembers(workspaceId).then(({ members: data }) => {
        if (data) setMembers(data)
      })
    }
  }, [isOpen, workspaceId])

  if (task && task.id !== prevTaskId) {
    setPrevTaskId(task.id)
    setTitle(task.title || '')
    setDescriptionContent(task.description || '')
    setSubtasks(task.subtasks || [])
    setSelectedAssignee(task.assignee_id || null)
    setPriority(task.priority)
    
    setStartDate(formatDateForInput(task.start_date))
    setDueDate(formatDateForInput(task.due_date))
    setEstimatedHours(task.estimated_hours ? task.estimated_hours.toString() : '')

    setShowStartDate(!!task.start_date)
    setShowDueDate(!!task.due_date)
    setShowEstHours(!!task.estimated_hours)

    setIsEditingTitle(false)
    setIsEditingDesc(false)
    setIsDescExpanded(false)
    setIsAddingSubtask(false)
    setIsAddMenuOpen(false)
    // FIGYELEM: Innen kivettem a setLeftWidth(60)-at, így a megnyitáskor MEGTARTJA a te mentett szélességedet!
  }

  if (!task) return null

  const handleAddSubtask = () => {
      if (!newSubtaskTitle.trim()) return
      const newSubtask: Subtask = {
          id: Math.random().toString(36).substring(2, 9),
          title: newSubtaskTitle,
          completed: false
      }
      setSubtasks([...subtasks, newSubtask])
      setNewSubtaskTitle('')
  }
  const toggleSubtask = (id: string) => setSubtasks(subtasks.map(st => st.id === id ? { ...st, completed: !st.completed } : st))
  const removeSubtask = (id: string) => setSubtasks(subtasks.filter(st => st.id !== id))
  
  const completedSubtasks = subtasks.filter(st => st.completed).length
  const progressPercentage = subtasks.length === 0 ? 0 : Math.round((completedSubtasks / subtasks.length) * 100)

  const handleSave = async () => {
      setIsLoading(true)
      setError(null)

      const updates = {
          title: title || 'Névtelen feladat', 
          description: descriptionContent, 
          start_date: showStartDate && startDate ? startDate : null,
          due_date: showDueDate && dueDate ? dueDate : null,
          estimated_hours: showEstHours && estimatedHours ? parseFloat(estimatedHours) : null,
          priority,
          assignee_id: selectedAssignee,
          subtasks 
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
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Feladat részletei"
      className="max-w-6xl w-full"
    >
      <div className="flex flex-col h-[85vh] overflow-hidden relative">
        
{/* FEJLÉC */}
        <div className="shrink-0 pb-2 flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0 flex items-center h-12">
            {isEditingTitle ? (
              <input
                autoFocus
                type="text"
                value={title} 
                onChange={e => setTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)} 
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                className="w-full text-3xl font-bold bg-background border border-primary px-3 py-1.5 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary/20 shadow-sm transition-all"
                placeholder="Feladat neve..."
              />
            ) : (
              <h2 
                // 🔒 CSAK AKKOR ENGEDJÜK KATTINTANI, HA SZERKESZTHETI!
                onClick={() => { if(canEdit) setIsEditingTitle(true) }}
                className={`text-3xl font-bold text-foreground px-3 py-1.5 rounded-lg transition-colors border border-transparent truncate -ml-3 ${canEdit ? 'cursor-pointer hover:bg-sona-neutral/10 hover:border-border' : ''}`}
                title={canEdit ? "Kattints a szerkesztéshez" : ""}
              >
                {title || 'Névtelen feladat'}
              </h2>
            )}
          </div>
        </div>

        {/* GÖRGETHETŐ TARTALOM (SPLIT PANE) */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden mt-2" ref={containerRef}>
          
          {/* --- BAL OSZLOP (Munkatér) --- */}
          <div 
            className="h-full overflow-y-auto pr-0 lg:pr-2 pb-10 w-full flex-shrink-0"
            style={{ width: isDesktop ? `${leftWidth}%` : '100%' }}
          >
            <div className="flex flex-col gap-6">
              
              {/* VEZÉRLŐSÁV */}
              <div className="flex flex-wrap items-center gap-3 pb-2">
                {canEdit && (
                <div className="relative inline-block" ref={addMenuRef}>
                  <button type="button" onClick={() => setIsAddMenuOpen(!isAddMenuOpen)} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-foreground bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors">
                    <Plus className="w-4 h-4" /> Hozzáadás...
                  </button>

                  {isAddMenuOpen && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-surface border border-border rounded-xl shadow-xl z-50 p-1.5 flex flex-col animate-in fade-in slide-in-from-top-2 duration-150">
                      <button type="button" onClick={() => { setIsAddingSubtask(true); setIsAddMenuOpen(false) }} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-foreground hover:bg-sona-neutral/10 rounded-md text-left transition-colors">
                        <CheckSquare className="w-4 h-4 text-sona-neutral" /> Részfeladat
                      </button>
                      <button type="button" onClick={() => { setIsAddMenuOpen(false); const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement; if (fileInput) fileInput.click(); }} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-foreground hover:bg-sona-neutral/10 rounded-md text-left transition-colors">
                        <Paperclip className="w-4 h-4 text-sona-neutral" /> Fájl csatolása
                      </button>

                      {(!showStartDate || !showDueDate || !showEstHours) && <div className="h-px bg-border my-1.5 mx-2" />}

                      {!showStartDate && (
                        <button type="button" onClick={() => { setShowStartDate(true); setIsAddMenuOpen(false) }} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-foreground hover:bg-sona-neutral/10 rounded-md text-left transition-colors">
                          <Calendar className="w-4 h-4 text-sona-neutral" /> Kezdés dátuma
                        </button>
                      )}
                      {!showDueDate && (
                        <button type="button" onClick={() => { setShowDueDate(true); setIsAddMenuOpen(false) }} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-foreground hover:bg-sona-neutral/10 rounded-md text-left transition-colors">
                          <Calendar className="w-4 h-4 text-sona-neutral text-red-400" /> Határidő
                        </button>
                      )}
                      {!showEstHours && (
                        <button type="button" onClick={() => { setShowEstHours(true); setIsAddMenuOpen(false) }} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-foreground hover:bg-sona-neutral/10 rounded-md text-left transition-colors">
                          <Clock className="w-4 h-4 text-sona-neutral" /> Becsült idő
                        </button>
                      )}
                      
                    </div>
                  )}
                  
                </div>
                )}

                <div className={`w-48 ${!canEdit ? 'opacity-70 pointer-events-none' : ''}`}>
                  <SelectDropdown value={selectedAssignee} onChange={(val) => setSelectedAssignee(val)} placeholder="Felelős..." icon={<Users className="w-4 h-4" />} options={members.map(m => ({ id: m.user_id, label: m.email }))} />
                </div>
                
                <div className={`flex items-center gap-2 bg-background border border-border px-3 py-1.5 rounded-md transition-colors ${canEdit ? 'hover:border-primary/50' : 'opacity-70'}`}>
                  <Flag className="w-4 h-4 text-sona-neutral" />
                  <select disabled={!canEdit} value={priority} onChange={(e) => setPriority(e.target.value as Task['priority'])} className="text-sm bg-transparent outline-none text-foreground font-medium cursor-pointer disabled:cursor-not-allowed">
                     <option value="low">Alacsony</option>
                    <option value="medium">Közepes</option>
                    <option value="high">Magas</option>
                    <option value="urgent">Sürgős ⚡</option>
                  </select>
                </div>

                {showStartDate && (
                  <div className="flex items-center gap-2 bg-background border border-border px-3 py-1.5 rounded-md hover:border-primary/50 transition-colors animate-in fade-in duration-200">
                    <Calendar className="w-4 h-4 text-sona-neutral" />
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent text-xs font-medium outline-none text-foreground cursor-pointer" />
                    <button type="button" onClick={() => { setStartDate(''); setShowStartDate(false) }} className="ml-1 text-sona-neutral hover:text-red-500"><X className="w-3 h-3"/></button>
                  </div>
                )}
                {showDueDate && (
                  <div className="flex items-center gap-2 bg-background border border-border px-3 py-1.5 rounded-md hover:border-primary/50 transition-colors animate-in fade-in duration-200">
                    <Calendar className="w-4 h-4 text-sona-neutral text-red-400" />
                    <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="bg-transparent text-xs font-medium outline-none text-foreground cursor-pointer" />
                    <button type="button" onClick={() => { setDueDate(''); setShowDueDate(false) }} className="ml-1 text-sona-neutral hover:text-red-500"><X className="w-3 h-3"/></button>
                  </div>
                )}
                {showEstHours && (
                  <div className="flex items-center gap-2 bg-background border border-border px-3 py-1.5 rounded-md hover:border-primary/50 transition-colors animate-in fade-in duration-200">
                    <Clock className="w-4 h-4 text-sona-neutral" />
                    <input type="number" step="0.5" min="0" value={estimatedHours} onChange={(e) => setEstimatedHours(e.target.value)} className="bg-transparent text-sm font-medium outline-none text-foreground w-12" placeholder="0h" />
                    <button type="button" onClick={() => { setEstimatedHours(''); setShowEstHours(false) }} className="ml-1 text-sona-neutral hover:text-red-500"><X className="w-3 h-3"/></button>
                  </div>
                )}
              </div>

              {/* LEÍRÁS */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <AlignLeft className="w-5 h-5 text-sona-neutral" /> Leírás
                  </label>
                  {/* 🔒 CSAK AKKOR MUTATJUK A GOMBOT */}
                  {!isEditingDesc && descriptionContent && canEdit && (
                    <button type="button" onClick={() => setIsEditingDesc(true)} className="text-xs font-medium px-3 py-1.5 bg-sona-neutral/10 hover:bg-sona-neutral/20 text-foreground rounded-md transition-colors">Szerkesztés</button>
                  )}
                </div>


                {isEditingDesc ? (
                    <RichTextEditor key={task.id} content={descriptionContent} onChange={setDescriptionContent} editable={canEdit} />
                ) : (
                  <div onClick={() => { if (!descriptionContent && canEdit) setIsEditingDesc(true) }} className={`relative rounded-xl border border-transparent transition-colors ${!descriptionContent ? (canEdit ? 'bg-sona-neutral/5 cursor-pointer hover:border-border p-4 text-center border-dashed' : 'py-2') : 'p-0'}`}>
                    {!descriptionContent ? (
                      <p className="text-sm text-sona-neutral font-medium">{canEdit ? 'Nincs megadva leírás. Kattints ide a szerkesztéshez...' : 'Nincs megadva leírás.'}</p>
                    ) : (
                      <div className={`relative flex flex-col bg-background border border-border rounded-xl overflow-hidden transition-all duration-300 ${!isDescExpanded ? 'max-h-40' : 'max-h-max'}`}>
                        <div className="text-sm p-5 [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_p]:mb-2 [&_a]:text-primary" dangerouslySetInnerHTML={{ __html: descriptionContent }} />
                        {!isDescExpanded && (
                          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background via-background/80 to-transparent flex items-end justify-center pb-2">
                            <button type="button" onClick={(e) => { e.stopPropagation(); setIsDescExpanded(true) }} className="text-xs font-bold text-foreground bg-surface border border-border px-5 py-2 rounded-full shadow-md hover:bg-sona-neutral/10 transition-colors">Mutass többet</button>
                          </div>
                        )}
                      </div>
                    )}
                    {isDescExpanded && descriptionContent && (
                       <button type="button" onClick={(e) => { e.stopPropagation(); setIsDescExpanded(false) }} className="mt-3 text-xs font-semibold text-sona-neutral hover:text-foreground transition-colors px-2 py-1 flex mx-auto">Mutass kevesebbet</button>
                    )}
                  </div>
                )}
              </div>

              {/* RÉSZFELADATOK */}
              {(subtasks.length > 0 || isAddingSubtask) && (
                <div className="flex flex-col gap-3 pt-2">
                  <label className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <CheckSquare className="w-5 h-5 text-sona-neutral" /> Részfeladatok
                      {subtasks.length > 0 && <span className="ml-auto text-sm font-medium px-2.5 py-0.5 bg-sona-neutral/10 rounded-full text-sona-neutral">{progressPercentage}% kész</span>}
                  </label>
                  
                  {subtasks.length > 0 && (
                    <div className="w-full bg-sona-neutral/20 h-2 rounded-full overflow-hidden mb-1">
                      <div className="bg-primary h-full transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    {subtasks.map((st) => (
                      <div key={st.id} className="flex items-center gap-3 group p-2 hover:bg-sona-neutral/5 rounded-lg transition-colors border border-transparent hover:border-border">
                        <input type="checkbox" disabled={!canEdit} checked={st.completed} onChange={() => toggleSubtask(st.id)} className="w-4 h-4 rounded border-sona-neutral/30 text-primary focus:ring-primary/50 bg-background cursor-pointer disabled:cursor-not-allowed" />
                        <span className={`text-sm flex-1 ${st.completed ? 'line-through text-sona-neutral' : 'text-foreground font-medium'}`}>{st.title}</span>
                        {/* 🔒 CSAK AKKOR MUTATJUK A KUKÁT */}
                        {canEdit && (
                          <button type="button" onClick={() => removeSubtask(st.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-sona-neutral hover:bg-red-500/10 hover:text-red-500 rounded-md transition-all"><X className="w-4 h-4" /></button>
                        )}
                      </div>
                    ))}
                    
                    {isAddingSubtask && (
                      <div className="flex items-center gap-2 mt-1">
                        <input autoFocus type="text" value={newSubtaskTitle} onChange={(e) => setNewSubtaskTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())} placeholder="Mit kell csinálni?" className="flex-1 text-sm bg-background border border-primary px-3 py-2 rounded-md focus:outline-none shadow-sm" />
                        <Button type="button" onClick={handleAddSubtask} className="py-2 px-4 text-xs">Mentés</Button>
                        <button type="button" onClick={() => setIsAddingSubtask(false)} className="p-2 text-sona-neutral hover:bg-sona-neutral/10 rounded-md"><X className="w-4 h-4" /></button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* FÁJLOK */}
              <div className="flex flex-col gap-2 pt-2">
                <AttachmentSection targetType="task" targetId={task.id} />
              </div>

            </div>
          </div>

          {/* --- HÚZÓKA (SPLITTER) --- */}
          <div 
            className={`hidden lg:flex w-2 mx-1 cursor-col-resize hover:bg-primary/30 items-center justify-center rounded-full transition-colors flex-shrink-0 relative group z-10 ${isDragging ? 'bg-primary/30' : ''}`}
            onMouseDown={startResizing}
          >
            <div className="absolute inset-y-0 -left-2 -right-2 z-10" />
            <div className={`h-12 w-1 rounded-full transition-colors ${isDragging ? 'bg-primary' : 'bg-border group-hover:bg-primary/60'}`} />
          </div>

          {/* --- JOBB OSZLOP (Kommentek) --- */}
          <div className="h-full overflow-y-auto pl-0 lg:pl-2 w-full flex-1 mt-6 lg:mt-0 pb-10">
            <CommentSection targetType="task" targetId={task.id} />
          </div>
        </div>

        {error && (
          <div className="shrink-0 mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg">
            {error}
          </div>
        )}

        {/* LÁBLÉC */}
        <div className="shrink-0 pt-3 flex items-center justify-between mt-2 border-t border-border">
          {/* Törlés gomb (Ha nincs joga, halvány és kattinthatatlan) */}
          {canDelete ? (
            <button type="button" onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-sona-neutral hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Törlés
            </button>
          ) : (
            <div className="px-4 py-2 text-sm font-medium text-sona-neutral/40 flex items-center gap-2 cursor-not-allowed" title="Nincs jogosultságod">
              <Trash2 className="w-4 h-4" /> Törlés
            </div>
          )}

          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-sona-neutral hover:text-foreground transition-colors">
              Bezárás
            </button>
            {canEdit && (
              <Button type="button" onClick={handleSave} disabled={isLoading} className="py-2.5 px-6 font-medium shadow-md">
                {isLoading ? 'Mentés...' : 'Mentés & Bezárás'}
              </Button>
            )}
          </div>
        </div>

      </div>
    </Modal>
  )
}