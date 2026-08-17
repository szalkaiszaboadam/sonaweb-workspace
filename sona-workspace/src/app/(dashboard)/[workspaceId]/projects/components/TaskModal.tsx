'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Calendar, AlignLeft, CheckSquare, Plus, Trash2, Clock, Check, Flag, User, Shield } from 'lucide-react'
import { updateTaskDetails } from '../actions'
import { Button } from '@/components/ui/Button'
import { RichTextEditor } from '@/components/ui/RichTextEditor'
import { AttachmentSection } from './AttachmentSection'
import { CommentSection } from './CommentSection'

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
    assignees?: string[]
    participants?: string[]
    assignee_roles?: string[]
    participant_roles?: string[]
}

type Props = {
    task: Task | null
    workspaceId: string
    isOpen: boolean
    onClose: () => void
    onUpdate: (updatedTask: Task) => void
    onDelete: (taskId: string) => void
    currentUserId: string          
    currentUserRoleIds: string[]   
    hasEditOthersPerm: boolean     
    hasDeleteOthersPerm: boolean   
    members: any[]                 
    roles: any[]                   
}

// 🚀 ÚJ: EGYEDI MULTI-SELECT KOMPONENS SZEMÉLYEKHEZ ÉS SZEREPKÖRÖKHÖZ
function AssignmentSelector({ label, selectedUsers, setSelectedUsers, selectedRoles, setSelectedRoles, members, roles, disabled }: any) {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <div className="relative flex-1">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-1.5">{label}</label>
            <div onClick={() => !disabled && setIsOpen(true)} className={`min-h-[42px] p-2 border rounded-xl flex flex-wrap gap-1.5 items-center bg-background transition-colors ${disabled ? 'opacity-70 pointer-events-none border-border' : 'cursor-pointer hover:border-primary/50 border-border'}`}>
                {selectedUsers.length === 0 && selectedRoles.length === 0 && (
                    <span className="text-sm text-sona-neutral px-1 font-medium">Kattints a választáshoz...</span>
                )}
                {selectedUsers.map((uid: string) => {
                    const u = members.find((m: any) => m.user_id === uid)
                    return <div key={uid} className="flex items-center gap-1.5 bg-sona-neutral/10 px-2.5 py-1 rounded-md text-xs font-semibold text-foreground shadow-sm"><User className="w-3 h-3 text-sona-neutral"/> {u?.name || u?.email}</div>
                })}
                {selectedRoles.map((rid: string) => {
                    const r = roles.find((r: any) => r.id === rid)
                    return <div key={rid} className="flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-md text-xs font-bold shadow-sm"><Shield className="w-3 h-3"/> {r?.name}</div>
                })}
            </div>
            
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full left-0 w-72 mt-2 bg-surface border border-border shadow-xl rounded-2xl z-50 p-3 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                        
                        <div className="text-[10px] font-bold text-sona-neutral uppercase tracking-wider mb-2 px-2">Személyek</div>
                        {members.length === 0 && <span className="text-xs text-sona-neutral px-2">Nincsenek tagok.</span>}
                        {members.map((m: any) => (
                            <label key={m.user_id} className="flex items-center gap-3 p-2 hover:bg-sona-neutral/5 rounded-xl cursor-pointer transition-colors">
                                <input type="checkbox" checked={selectedUsers.includes(m.user_id)} onChange={(e) => {
                                    if (e.target.checked) setSelectedUsers([...selectedUsers, m.user_id])
                                    else setSelectedUsers(selectedUsers.filter((id: string) => id !== m.user_id))
                                }} className="w-4 h-4 rounded border-sona-neutral/30 text-primary focus:ring-primary/50 bg-background" />
                                <span className="text-sm font-semibold text-foreground truncate">{m.name || m.email}</span>
                            </label>
                        ))}

                        <div className="text-[10px] font-bold text-sona-neutral uppercase tracking-wider mt-5 mb-2 px-2">Szerepkörök</div>
                        {roles.length === 0 && <span className="text-xs text-sona-neutral px-2">Nincsenek szerepkörök.</span>}
                        {roles.map((r: any) => (
                            <label key={r.id} className="flex items-center gap-3 p-2 hover:bg-sona-neutral/5 rounded-xl cursor-pointer transition-colors">
                                <input type="checkbox" checked={selectedRoles.includes(r.id)} onChange={(e) => {
                                    if (e.target.checked) setSelectedRoles([...selectedRoles, r.id])
                                    else setSelectedRoles(selectedRoles.filter((id: string) => id !== r.id))
                                }} className="w-4 h-4 rounded border-sona-neutral/30 text-primary focus:ring-primary/50 bg-background" />
                                <span className="text-sm font-bold text-foreground truncate">{r.name}</span>
                            </label>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}


export function TaskModal({ task, workspaceId, isOpen, onClose, onUpdate, onDelete, currentUserId, currentUserRoleIds, hasEditOthersPerm, hasDeleteOthersPerm, members, roles }: Props) {
  
  const [title, setTitle] = useState(task?.title || '')
  const [descriptionContent, setDescriptionContent] = useState(task?.description || '')
  const [status, setStatus] = useState(task?.status || 'todo')
  const [priority, setPriority] = useState<Task['priority']>(task?.priority || 'medium')
  const [startDate, setStartDate] = useState(task?.start_date || '')
  const [dueDate, setDueDate] = useState(task?.due_date || '')
  const [estimatedHours, setEstimatedHours] = useState(task?.estimated_hours?.toString() || '')
  const [subtasks, setSubtasks] = useState<any[]>(task?.subtasks || [])
  
  // 🚀 ÚJ ÁLLAPOTOK A TÖMBÖKHÖZ
  const [assignees, setAssignees] = useState<string[]>([])
  const [participants, setParticipants] = useState<string[]>([])
  const [assigneeRoles, setAssigneeRoles] = useState<string[]>([])
  const [participantRoles, setParticipantRoles] = useState<string[]>([])

  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingDesc, setIsEditingDesc] = useState(!task?.description)
  const [isLoading, setIsLoading] = useState(false)
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false)
  const addMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescriptionContent(task.description || '')
      setStatus(task.status)
      setPriority(task.priority)
      setStartDate(task.start_date || '')
      setDueDate(task.due_date || '')
      setEstimatedHours(task.estimated_hours?.toString() || '')
      setSubtasks(task.subtasks || [])
      setIsEditingDesc(!task.description)
      // TÖMBÖK INICIALIZÁLÁSA
      setAssignees(task.assignees || [])
      setParticipants(task.participants || [])
      setAssigneeRoles(task.assignee_roles || [])
      setParticipantRoles(task.participant_roles || [])
    }
  }, [task])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
        setIsAddMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!isOpen || !task) return null

  // 🚀 AZ ÚJ FELADAT SZINTŰ JOGOSULTSÁG-KALKULÁTOR
  const isCreator = task.user_id === currentUserId
  const isDirect = task.assignees?.includes(currentUserId) || task.participants?.includes(currentUserId)
  const hasRole = task.assignee_roles?.some(r => currentUserRoleIds.includes(r)) || task.participant_roles?.some(r => currentUserRoleIds.includes(r))
  
  const canEdit = isCreator || isDirect || hasRole || hasEditOthersPerm
  const canDelete = isCreator || hasDeleteOthersPerm

  const handleSave = async () => {
    setIsLoading(true)
    const updates = {
      title,
      description: descriptionContent,
      status,
      priority,
      start_date: startDate || null,
      due_date: dueDate || null,
      estimated_hours: estimatedHours ? parseFloat(estimatedHours) : null,
      subtasks,
      // ELKÜLDJÜK A TÖMBÖKET MENTÉSRE
      assignees,
      participants,
      assignee_roles: assigneeRoles,
      participant_roles: participantRoles
    }

    const result = await updateTaskDetails(task.id, updates)
    setIsLoading(false)
    if (result.error) alert(result.error)
    else {
      onUpdate({ ...task, ...updates })
      onClose()
    }
  }

  const handleDelete = () => {
    if (confirm('Biztosan törlöd ezt a feladatot?')) onDelete(task.id)
  }

  const addSubtask = () => {
    setSubtasks([...subtasks, { id: crypto.randomUUID(), title: 'Új részfeladat', completed: false }])
    setIsAddMenuOpen(false)
  }

  const toggleSubtask = (id: string) => {
    setSubtasks(subtasks.map(st => st.id === id ? { ...st, completed: !st.completed } : st))
  }

  const removeSubtask = (id: string) => {
    setSubtasks(subtasks.filter(st => st.id !== id))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-surface rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border animate-in zoom-in-95 duration-200">
        
        {/* FEJLÉC */}
        <div className="shrink-0 p-6 sm:p-8 border-b border-border bg-surface flex flex-col gap-4">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1 min-w-0 flex items-center h-12">
              {isEditingTitle ? (
                <div className="flex items-center gap-2 w-full">
                  <input autoFocus type="text" value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') setIsEditingTitle(false) }} onBlur={() => setIsEditingTitle(false)} className="flex-1 text-2xl font-bold bg-background border border-primary px-3 py-1.5 rounded-lg focus:outline-none" />
                  <button type="button" onClick={() => setIsEditingTitle(false)} className="text-green-600 shrink-0 bg-green-500/10 p-2 rounded-lg hover:bg-green-500/20"><Check className="w-5 h-5" /></button>
                </div>
              ) : (
                <h2 
                  onClick={() => { if(canEdit) setIsEditingTitle(true) }}
                  className={`text-2xl sm:text-3xl font-bold text-foreground px-3 py-1.5 rounded-lg transition-colors border border-transparent truncate -ml-3 ${canEdit ? 'cursor-pointer hover:bg-sona-neutral/10 hover:border-border' : ''}`}
                  title={canEdit ? "Kattints a szerkesztéshez" : ""}
                >
                  {title || 'Névtelen feladat'}
                </h2>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {canEdit && (
                <div className="relative inline-block" ref={addMenuRef}>
                  <button type="button" onClick={() => setIsAddMenuOpen(!isAddMenuOpen)} className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-foreground bg-primary/10 text-primary hover:bg-primary/20 rounded-xl transition-colors shadow-sm">
                    <Plus className="w-4 h-4" /> Hozzáadás...
                  </button>
                  {isAddMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-surface rounded-xl shadow-xl border border-border py-1 z-10 animate-in fade-in slide-in-from-top-2">
                      <button type="button" onClick={addSubtask} className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-sona-neutral/10 flex items-center gap-2 font-medium">
                        <CheckSquare className="w-4 h-4 text-sona-neutral" /> Részfeladat
                      </button>
                    </div>
                  )}
                </div>
              )}
              <button type="button" onClick={onClose} className="p-2 text-sona-neutral hover:bg-sona-neutral/10 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-6">
            <select disabled={!canEdit} value={status} onChange={(e) => setStatus(e.target.value)} className={`text-sm font-bold uppercase tracking-wider bg-transparent outline-none px-1 ${status === 'done' ? 'text-green-500' : status === 'in_progress' ? 'text-blue-500' : 'text-sona-neutral'} disabled:opacity-70 disabled:cursor-not-allowed`}>
              <option value="todo">Tennivaló</option>
              <option value="in_progress">Folyamatban</option>
              <option value="review">Ellenőrzésre vár</option>
              <option value="done">Kész</option>
            </select>

            <div className="w-px h-4 bg-border hidden sm:block" />

            <div className={`flex items-center gap-2 bg-background border border-border px-3 py-1.5 rounded-lg transition-colors shadow-sm ${canEdit ? 'hover:border-primary/50' : 'opacity-70'}`}>
              <Flag className={`w-4 h-4 ${priority === 'urgent' ? 'text-red-500' : priority === 'high' ? 'text-orange-500' : priority === 'medium' ? 'text-blue-500' : 'text-sona-neutral'}`} />
              <select disabled={!canEdit} value={priority} onChange={(e) => setPriority(e.target.value as Task['priority'])} className="text-sm bg-transparent outline-none text-foreground font-bold cursor-pointer disabled:cursor-not-allowed">
                <option value="low">Alacsony</option>
                <option value="medium">Közepes</option>
                <option value="high">Magas</option>
                <option value="urgent">Sürgős</option>
              </select>
            </div>
          </div>
        </div>

        {/* TARTALOM GÖRGETHETŐ RÉSZE */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col lg:flex-row gap-8 sm:gap-12 bg-background">
          
          <div className="flex-1 flex flex-col gap-10 min-w-0">
            
            {/* 🚀 ÚJ: FELELŐSÖK ÉS RÉSZTVEVŐK MULTI-SELECT */}
            <div className="flex flex-col sm:flex-row gap-6">
              <AssignmentSelector 
                label="Felelősök" 
                selectedUsers={assignees} setSelectedUsers={setAssignees} 
                selectedRoles={assigneeRoles} setSelectedRoles={setAssigneeRoles} 
                members={members} roles={roles} disabled={!canEdit} 
              />
              <AssignmentSelector 
                label="Résztvevők" 
                selectedUsers={participants} setSelectedUsers={setParticipants} 
                selectedRoles={participantRoles} setSelectedRoles={setParticipantRoles} 
                members={members} roles={roles} disabled={!canEdit} 
              />
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-lg font-bold text-foreground flex items-center gap-2">
                  <AlignLeft className="w-5 h-5 text-sona-neutral" /> Leírás
                </label>
                {!isEditingDesc && descriptionContent && canEdit && (
                  <button type="button" onClick={() => setIsEditingDesc(true)} className="text-xs font-bold px-3 py-1.5 bg-sona-neutral/10 hover:bg-sona-neutral/20 text-foreground rounded-lg transition-colors">Szerkesztés</button>
                )}
              </div>

              {isEditingDesc ? (
                  <RichTextEditor key={task.id} content={descriptionContent} onChange={setDescriptionContent} editable={canEdit} />
              ) : (
                <div onClick={() => { if (!descriptionContent && canEdit) setIsEditingDesc(true) }} className={`relative rounded-xl border border-transparent transition-colors ${!descriptionContent ? (canEdit ? 'bg-sona-neutral/5 cursor-pointer hover:border-border p-6 text-center border-dashed' : 'py-2') : 'p-0'}`}>
                  {!descriptionContent ? (
                    <p className="text-sm text-sona-neutral font-medium">{canEdit ? 'Nincs megadva leírás. Kattints ide a szerkesztéshez...' : 'Nincs megadva leírás.'}</p>
                  ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none text-foreground bg-surface p-4 rounded-xl border border-border" dangerouslySetInnerHTML={{ __html: descriptionContent }} />
                  )}
                </div>
              )}
            </div>

            {subtasks.length > 0 && (
              <div className="flex flex-col gap-3">
                <label className="text-lg font-bold text-foreground flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-sona-neutral" /> Részfeladatok
                </label>
                <div className="flex flex-col gap-2">
                  {subtasks.map((st) => (
                    <div key={st.id} className="flex items-center gap-3 group p-3 bg-surface border border-border rounded-xl transition-colors hover:border-primary/50">
                      <input type="checkbox" disabled={!canEdit} checked={st.completed} onChange={() => toggleSubtask(st.id)} className="w-5 h-5 rounded border-sona-neutral/30 text-primary focus:ring-primary/50 bg-background cursor-pointer disabled:cursor-not-allowed" />
                      {canEdit ? (
                        <input type="text" value={st.title} onChange={(e) => setSubtasks(subtasks.map(s => s.id === st.id ? { ...s, title: e.target.value } : s))} className={`flex-1 bg-transparent border-none focus:outline-none text-sm ${st.completed ? 'line-through text-sona-neutral' : 'text-foreground font-semibold'}`} />
                      ) : (
                         <span className={`text-sm flex-1 ${st.completed ? 'line-through text-sona-neutral' : 'text-foreground font-semibold'}`}>{st.title}</span>
                      )}
                      {canEdit && (
                        <button type="button" onClick={() => removeSubtask(st.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-sona-neutral hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all"><X className="w-4 h-4" /></button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <AttachmentSection targetType="task" targetId={task.id} />
          </div>

          {/* JOBB OLDALI SÁV: IDŐPONTOK ÉS KOMMENTEK */}
          <div className="w-full lg:w-72 flex flex-col gap-8 shrink-0">
            <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-5 shadow-sm">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Határidők & Idő</h3>
              
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-sona-neutral flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Kezdés</label>
                <input disabled={!canEdit} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full text-sm bg-background border border-border px-3 py-2 rounded-lg focus:outline-none focus:border-primary text-foreground disabled:opacity-70 font-medium" />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-sona-neutral flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Határidő</label>
                <input disabled={!canEdit} type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={`w-full text-sm bg-background border px-3 py-2 rounded-lg focus:outline-none text-foreground disabled:opacity-70 font-medium ${dueDate && new Date(dueDate) < new Date() && status !== 'done' ? 'border-red-500 text-red-500 focus:border-red-500' : 'border-border focus:border-primary'}`} />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-sona-neutral flex items-center gap-1.5"><Clock className="w-3 h-3" /> Becsült idő (óra)</label>
                <input disabled={!canEdit} type="number" min="0" step="0.5" value={estimatedHours} onChange={(e) => setEstimatedHours(e.target.value)} placeholder="pl. 4.5" className="w-full text-sm bg-background border border-border px-3 py-2 rounded-lg focus:outline-none focus:border-primary text-foreground disabled:opacity-70 font-medium" />
              </div>
            </div>

            <CommentSection targetType="task" targetId={task.id} />
          </div>

        </div>

        {/* LÁBLÉC: GOMBOK */}
        <div className="shrink-0 p-4 sm:p-6 bg-surface border-t border-border flex items-center justify-between">
          {canDelete ? (
            <button type="button" onClick={handleDelete} className="px-4 py-2 text-sm font-bold text-sona-neutral hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Törlés
            </button>
          ) : (
            <div className="px-4 py-2 text-sm font-bold text-sona-neutral/40 flex items-center gap-2 cursor-not-allowed" title="Nincs jogosultságod">
              <Trash2 className="w-4 h-4" /> Törlés
            </div>
          )}

          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-sona-neutral hover:text-foreground transition-colors">
              Mégse
            </button>
            {canEdit && (
              <Button type="button" onClick={handleSave} disabled={isLoading} className="py-2.5 px-6 font-bold shadow-md">
                {isLoading ? 'Mentés...' : 'Mentés & Bezárás'}
              </Button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}