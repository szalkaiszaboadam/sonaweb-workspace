// app/(dashboard)/projects/[projectId]/tasks/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Plus, Clock, AlignLeft, Loader2, CheckCircle2, Trash2, PlayCircle } from "lucide-react";
import { Task, TaskStatus, TaskPriority, TimeEntry } from "@/types";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { useTimer } from "@/context/TimerContext";

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: "backlog", title: "Backlog" },
  { id: "todo", title: "Teendő" },
  { id: "in_progress", title: "Folyamatban" },
  { id: "review", title: "Review" },
  { id: "done", title: "Kész" },
];

export default function TasksPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { startTimer, activeTaskId, isActive } = useTimer();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]); // ÚJ: Időmérések állapota
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>("todo");
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>("medium");
  const [newTaskHours, setNewTaskHours] = useState<number | "">("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Feladatok és Időmérések betöltése
  useEffect(() => {
    if (!projectId) return;

    // 1. Feladatok lekérdezése
    const qTasks = query(
      collection(db, "tasks"),
      where("projectId", "==", projectId),
      orderBy("createdAt", "asc")
    );

    const unsubscribeTasks = onSnapshot(qTasks, (snapshot) => {
      const fetchedTasks = snapshot.docs.map((doc) => ({
        id: doc.id, ...doc.data(),
      })) as Task[];
      setTasks(fetchedTasks);
      setLoading(false);
    });

    // 2. Időmérések lekérdezése a kártyákhoz
    const qTime = query(collection(db, "time_entries"), where("projectId", "==", projectId));
    const unsubscribeTime = onSnapshot(qTime, (snapshot) => {
      const fetchedTime = snapshot.docs.map((doc) => ({
        id: doc.id, ...doc.data(),
      })) as TimeEntry[];
      setTimeEntries(fetchedTime);
    });

    return () => {
      unsubscribeTasks();
      unsubscribeTime();
    };
  }, [projectId]);

  // --- Segédfüggvény a mért idő formázásához ---
  const formatTrackedTime = (totalSeconds: number) => {
    if (!totalSeconds) return "0p";
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    if (h > 0) return `${h}ó ${m}p`;
    return `${m}p`;
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      await addDoc(collection(db, "tasks"), {
        projectId,
        title: newTaskTitle,
        description: newTaskDesc,
        status: newTaskStatus,
        priority: newTaskPriority,
        estimatedHours: newTaskHours === "" ? 0 : Number(newTaskHours),
        tags: [],
        order: tasks.length,
        createdAt: serverTimestamp(),
      });

      setNewTaskTitle("");
      setNewTaskDesc("");
      setNewTaskHours("");
      setNewTaskPriority("medium");
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Hiba a feladat létrehozásakor:", error);
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editingTask.title.trim()) return;

    try {
      const taskRef = doc(db, "tasks", editingTask.id);
      await updateDoc(taskRef, {
        title: editingTask.title,
        description: editingTask.description || "",
        priority: editingTask.priority,
        estimatedHours: editingTask.estimatedHours,
        status: editingTask.status,
      });

      setIsEditModalOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error("Hiba a feladat frissítésekor:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Biztosan törölni szeretné ezt a feladatot?")) return;
    try {
      await deleteDoc(doc(db, "tasks", taskId));
      setIsEditModalOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error("Hiba a feladat törlésekor:", error);
    }
  };

  const handleQuickComplete = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateDoc(doc(db, "tasks", taskId), { status: "done" });
    } catch (error) {
      console.error("Hiba a feladat kipipálásakor:", error);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId as TaskStatus;
    const updatedTasks = tasks.map((t) => t.id === draggableId ? { ...t, status: newStatus } : t);
    setTasks(updatedTasks);

    try {
      await updateDoc(doc(db, "tasks", draggableId), { status: newStatus });
    } catch (error) {
      console.error("Hiba a feladat állapotának frissítésekor:", error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "text-red-400 bg-red-400/10 border-red-400/20";
      case "high": return "text-orange-400 bg-orange-400/10 border-orange-400/20";
      case "medium": return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "low": return "text-neutral-400 bg-neutral-800 border-neutral-700";
      default: return "text-neutral-400 bg-neutral-800 border-neutral-700";
    }
  };

  if (!isMounted) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] pt-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 bg-[#111111] border border-neutral-800 rounded-lg text-xs font-medium text-white hover:bg-neutral-800 transition-all">
            Kanban
          </button>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-sona hover:bg-sona-hover text-white px-4 py-2 rounded-xl font-medium text-sm transition-all shadow-lg shadow-sona/10"
        >
          <Plus className="h-4 w-4" />
          Új feladat
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-sona animate-spin" />
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex flex-1 gap-5 overflow-x-auto custom-scrollbar pb-4">
            {COLUMNS.map((column) => (
              <div key={column.id} className="flex flex-col min-w-[320px] w-[320px]">
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-neutral-300">{column.title}</h3>
                    <span className="flex items-center justify-center bg-[#111111] border border-neutral-800 text-neutral-500 text-[10px] font-bold h-5 w-5 rounded-full">
                      {tasks.filter((t) => t.status === column.id).length}
                    </span>
                  </div>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex-1 rounded-2xl p-2 transition-colors duration-200 ${
                        snapshot.isDraggingOver ? "bg-[#111111]/80 border border-neutral-800 border-dashed" : "bg-[#0a0a0a]"
                      }`}
                    >
                      <div className="flex flex-col gap-3 min-h-[150px]">
                        {tasks
                          .filter((task) => task.status === column.id)
                          .map((task, index) => {
                            
                            // TÉNYLEGES IDŐ KISZÁMÍTÁSA A KÁRTYÁHOZ
                            const trackedSeconds = timeEntries.filter(e => e.taskId === task.id).reduce((sum, e) => sum + (e.duration || 0), 0);
                            const estHours = task.estimatedHours || 0;
                            const hasTracked = trackedSeconds > 0;
                            const hasEst = estHours > 0;
                            const isOverBudget = hasEst && (trackedSeconds / 3600) > estHours;

                            return (
                              <Draggable key={task.id} draggableId={task.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    onClick={() => {
                                      setEditingTask(task);
                                      setIsEditModalOpen(true);
                                    }}
                                    className={`group relative rounded-xl border bg-[#111111] p-4 cursor-pointer transition-all ${
                                      snapshot.isDragging
                                        ? "border-sona/50 shadow-2xl shadow-sona/10 rotate-2 z-50"
                                        : "border-neutral-800 hover:border-neutral-500 hover:shadow-lg"
                                    }`}
                                  >
                                    {task.status !== "done" && (
                                      <div className="absolute -top-2 -right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (isActive && activeTaskId === task.id) return;
                                            startTimer(projectId, task.id, task.title);
                                          }}
                                          className={`rounded-full p-1 shadow-lg border transition-all ${
                                            isActive && activeTaskId === task.id
                                              ? "bg-green-500/20 text-green-500 border-green-500/50 animate-pulse"
                                              : "bg-neutral-800 hover:bg-sona/20 text-neutral-400 hover:text-sona border-neutral-700"
                                          }`}
                                          title={isActive && activeTaskId === task.id ? "A mérés már fut" : "Időmérő indítása"}
                                        >
                                          <PlayCircle className="h-4 w-4" />
                                        </button>
                                        <button 
                                          onClick={(e) => handleQuickComplete(task.id, e)}
                                          className="bg-neutral-800 hover:bg-green-500/20 text-neutral-400 hover:text-green-500 border border-neutral-700 rounded-full p-1 shadow-lg transition-all"
                                        >
                                          <CheckCircle2 className="h-4 w-4" />
                                        </button>
                                      </div>
                                    )}

                                    <div className="flex flex-col gap-3">
                                      <div className="flex items-start justify-between gap-2">
                                        <h4 className={`text-sm font-medium transition-colors leading-snug ${task.status === "done" ? "text-neutral-500 line-through" : "text-white group-hover:text-sona"}`}>
                                          {task.title}
                                        </h4>
                                        <div className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
                                          {task.priority === "urgent" ? "Urgent" : task.priority}
                                        </div>
                                      </div>

                                      <div className="flex items-center justify-between mt-1 pt-3 border-t border-neutral-800/60">
                                        <div className="flex items-center gap-3 text-neutral-500">
                                          {task.description && task.description !== "<p></p>" && (
                                            <span title="Tartalmaz leírást">
                                              <AlignLeft className="h-3.5 w-3.5" />
                                            </span>
                                          )}
                                          
                                          {/* IDŐMÉRŐ ÉS BECSLÉS MEGJELENÍTÉSE */}
                                          {(hasTracked || hasEst) && (
                                            <div 
                                              className={`flex items-center gap-1.5 text-xs font-medium ${isOverBudget ? 'text-red-400' : 'text-neutral-400'}`}
                                              title={`Tényleges: ${formatTrackedTime(trackedSeconds)} / Becsült: ${estHours}ó`}
                                            >
                                              <Clock className="h-3.5 w-3.5" />
                                              <span>
                                                {hasTracked ? formatTrackedTime(trackedSeconds) : '0p'}
                                                {hasEst && ` / ${estHours}ó`}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>

                <button 
                  onClick={() => {
                    setNewTaskStatus(column.id);
                    setIsCreateModalOpen(true);
                  }}
                  className="flex items-center gap-2 text-xs font-medium text-neutral-500 hover:text-white mt-3 px-2 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Új feladat
                </button>
              </div>
            ))}
          </div>
        </DragDropContext>
      )}

      {/* LÉTREHOZÁS MODÁL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="w-full max-w-lg bg-[#111111] border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-6">
            <h2 className="text-lg font-semibold text-white">Új feladat létrehozása</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-neutral-400">Feladat címe</label>
                <input
                  type="text"
                  required
                  autoFocus
                  className="mt-1.5 w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] px-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:border-sona focus:outline-none"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-400 block mb-1.5">Leírás (Rich Text)</label>
                <RichTextEditor value={newTaskDesc} onChange={setNewTaskDesc} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-neutral-400">Prioritás</label>
                  <select
                    className="mt-1.5 w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] px-4 py-2.5 text-sm text-white focus:border-sona focus:outline-none appearance-none"
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                  >
                    <option value="low">Alacsony</option>
                    <option value="medium">Közepes</option>
                    <option value="high">Magas</option>
                    <option value="urgent">Sürgős (Urgent)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-400">Becsült idő (óra)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    className="mt-1.5 w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] px-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:border-sona focus:outline-none"
                    value={newTaskHours}
                    onChange={(e) => setNewTaskHours(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-400 hover:text-white transition-all"
                >
                  Mégse
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sona hover:bg-sona-hover text-white rounded-xl text-sm font-medium transition-all"
                >
                  Létrehozás
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SZERKESZTÉS MODÁL */}
      {isEditModalOpen && editingTask && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="w-full max-w-lg bg-[#111111] border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Feladat szerkesztése</h2>
              <button 
                type="button"
                onClick={() => handleDeleteTask(editingTask.id)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 text-xs font-medium transition-all"
              >
                <Trash2 className="h-4 w-4" />
                Törlés
              </button>
            </div>
            
            <form onSubmit={handleUpdateTask} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-neutral-400">Feladat címe</label>
                <input
                  type="text"
                  required
                  className="mt-1.5 w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] px-4 py-2.5 text-sm text-white focus:border-sona focus:outline-none"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-400 block mb-1.5">Leírás (Rich Text)</label>
                <RichTextEditor 
                  value={editingTask.description || ""} 
                  onChange={(html) => setEditingTask({ ...editingTask, description: html })} 
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-neutral-400">Státusz</label>
                  <select
                    className="mt-1.5 w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] px-3 py-2.5 text-sm text-white focus:border-sona focus:outline-none appearance-none"
                    value={editingTask.status}
                    onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value as TaskStatus })}
                  >
                    {COLUMNS.map(col => <option key={col.id} value={col.id}>{col.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-400">Prioritás</label>
                  <select
                    className="mt-1.5 w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] px-3 py-2.5 text-sm text-white focus:border-sona focus:outline-none appearance-none"
                    value={editingTask.priority}
                    onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as TaskPriority })}
                  >
                    <option value="low">Alacsony</option>
                    <option value="medium">Közepes</option>
                    <option value="high">Magas</option>
                    <option value="urgent">Sürgős (Urgent)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-400">Becsült (óra)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    className="mt-1.5 w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] px-3 py-2.5 text-sm text-white focus:border-sona focus:outline-none"
                    value={editingTask.estimatedHours === 0 ? "" : editingTask.estimatedHours}
                    onChange={(e) => setEditingTask({ ...editingTask, estimatedHours: e.target.value === "" ? 0 : Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => { setIsEditModalOpen(false); setEditingTask(null); }}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-400 hover:text-white transition-all"
                >
                  Mégse
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sona hover:bg-sona-hover text-white rounded-xl text-sm font-medium transition-all"
                >
                  Mentés
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}