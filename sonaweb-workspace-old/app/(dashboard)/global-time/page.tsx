// app/(dashboard)/global-time/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { collection, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { TimeEntry, Project, Task } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { Clock, Calendar, Folder, User, Trash2, Loader2, Users, Filter, BarChart, ListTodo, Edit2, X, Save } from "lucide-react";

export default function GlobalTimePage() {
  const { user } = useAuth();
  
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [projects, setProjects] = useState<Record<string, Project>>({});
  const [tasks, setTasks] = useState<Record<string, Task>>({});
  const [loading, setLoading] = useState(true);
  
  // Szűrési állapotok
  const [filterUserId, setFilterUserId] = useState<string>("all");
  const [filterProjectId, setFilterProjectId] = useState<string>("all");
  const [filterTaskId, setFilterTaskId] = useState<string>("all");

  // --- SZERKESZTÉSI ÁLLAPOTOK ---
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [editHours, setEditHours] = useState<number>(0);
  const [editMinutes, setEditMinutes] = useState<number>(0);
  const [editDesc, setEditDesc] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsubscribeProjects = onSnapshot(collection(db, "projects"), (snapshot) => {
      const projectsMap: Record<string, Project> = {};
      snapshot.docs.forEach(doc => { projectsMap[doc.id] = { id: doc.id, ...doc.data() } as Project; });
      setProjects(projectsMap);
    });

    const unsubscribeTasks = onSnapshot(collection(db, "tasks"), (snapshot) => {
      const tasksMap: Record<string, Task> = {};
      snapshot.docs.forEach(doc => { tasksMap[doc.id] = { id: doc.id, ...doc.data() } as Task; });
      setTasks(tasksMap);
    });

    const unsubscribeTime = onSnapshot(collection(db, "time_entries"), (snapshot) => {
      const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TimeEntry));
      entries.sort((a, b) => {
        const timeA = a.startTime?.toMillis ? a.startTime.toMillis() : new Date(a.startTime).getTime();
        const timeB = b.startTime?.toMillis ? b.startTime.toMillis() : new Date(b.startTime).getTime();
        return timeB - timeA;
      });
      setTimeEntries(entries);
      setLoading(false);
    });

    return () => {
      unsubscribeProjects();
      unsubscribeTasks();
      unsubscribeTime();
    };
  }, []);

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm("Biztosan törölni szeretné ezt a globális időbejegyzést?")) return;
    try {
      await deleteDoc(doc(db, "time_entries", entryId));
    } catch (error) {
      console.error("Hiba a bejegyzés törlésekor:", error);
    }
  };

  // --- SZERKESZTÉS LOGIKA ---
  const openEditModal = (entry: TimeEntry) => {
    setEditingEntry(entry);
    setEditHours(Math.floor((entry.duration || 0) / 3600));
    setEditMinutes(Math.floor(((entry.duration || 0) % 3600) / 60));
    setEditDesc(entry.description || "");
  };

  const handleSaveEdit = async () => {
    if (!editingEntry) return;
    setIsSaving(true);
    
    // Új másodpercek kiszámítása
    const newDuration = (editHours * 3600) + (editMinutes * 60);

    try {
      await updateDoc(doc(db, "time_entries", editingEntry.id), {
        duration: newDuration,
        description: editDesc,
      });
      setEditingEntry(null);
    } catch (error) {
      console.error("Hiba a mentés során:", error);
      alert("Nem sikerült elmenteni a módosításokat.");
    } finally {
      setIsSaving(false);
    }
  };

  const formatDuration = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h}ó ${m}p ${s}mp`;
    if (m > 0) return `${m}p ${s}mp`;
    return `${s}mp`;
  };

  const getDayKey = (dateData: any) => {
    if (!dateData) return "Ismeretlen dátum";
    const d = dateData.toDate ? dateData.toDate() : new Date(dateData);
    return new Intl.DateTimeFormat('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' }).format(d);
  };

  const getTimeString = (dateData: any) => {
    if (!dateData) return "-";
    const d = dateData.toDate ? dateData.toDate() : new Date(dateData);
    return new Intl.DateTimeFormat('hu-HU', { hour: '2-digit', minute: '2-digit' }).format(d);
  };

  const uniqueUsers = Array.from(new Set(timeEntries.map(e => e.userId))).map(id => {
    const entry = timeEntries.find(e => e.userId === id);
    return { id, name: entry?.userName || entry?.userEmail?.split('@')[0] || "Ismeretlen" };
  });

  const uniqueProjects = Array.from(new Set(timeEntries.map(e => e.projectId))).map(id => {
    return { id, name: projects[id]?.name || "Törölt projekt" };
  });

  const uniqueTasksRaw = Array.from(new Set(timeEntries.map(e => e.taskId).filter(Boolean)));
  const uniqueTasks = uniqueTasksRaw
    .map(id => ({ id: id as string, name: tasks[id as string]?.title || "Törölt feladat", projectId: tasks[id as string]?.projectId }))
    .filter(t => filterProjectId === "all" || t.projectId === filterProjectId);

  const filteredEntries = timeEntries.filter(e => {
    const matchUser = filterUserId === "all" || e.userId === filterUserId;
    const matchProject = filterProjectId === "all" || e.projectId === filterProjectId;
    const matchTask = 
      filterTaskId === "all" ? true :
      filterTaskId === "no_task" ? !e.taskId :
      e.taskId === filterTaskId;
    
    return matchUser && matchProject && matchTask;
  });

  useEffect(() => {
    setFilterTaskId("all");
  }, [filterProjectId]);

  const totalSecondsAll = timeEntries.reduce((sum, e) => sum + (e.duration || 0), 0);
  const myTotalSeconds = timeEntries.filter(e => e.userId === user?.uid).reduce((sum, e) => sum + (e.duration || 0), 0);
  const filteredTotalSeconds = filteredEntries.reduce((sum, e) => sum + (e.duration || 0), 0);

  const groupedEntries: Record<string, TimeEntry[]> = {};
  filteredEntries.forEach(entry => {
    const dayKey = getDayKey(entry.startTime);
    if (!groupedEntries[dayKey]) groupedEntries[dayKey] = [];
    groupedEntries[dayKey].push(entry);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <Loader2 className="h-8 w-8 text-sona animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pt-2 max-w-6xl mx-auto">
      
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 border-b border-neutral-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Clock className="h-7 w-7 text-sona" />
            Munkanapló
          </h1>
          <p className="text-sm text-neutral-500 mt-2">
            A rögzített munkaórák áttekintése, szűrése és utólagos korrekciója.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 bg-[#111111] border border-neutral-800 p-2 rounded-2xl">
          <div className="flex items-center gap-2 pl-2 text-neutral-500 text-sm border-r border-neutral-800 pr-3">
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Szűrés:</span>
          </div>

          <div className="flex items-center gap-2 bg-[#0a0a0a] border border-neutral-800 rounded-xl px-2">
            <User className="h-4 w-4 text-neutral-500" />
            <select value={filterUserId} onChange={(e) => setFilterUserId(e.target.value)} className="bg-transparent text-sm text-white py-2 focus:outline-none cursor-pointer max-w-[140px] truncate">
              <option value="all" className="bg-[#1a1a1a]">Mindenki</option>
              {uniqueUsers.map(u => <option key={u.id} value={u.id} className="bg-[#1a1a1a]">{u.name}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-[#0a0a0a] border border-neutral-800 rounded-xl px-2">
            <Folder className="h-4 w-4 text-neutral-500" />
            <select value={filterProjectId} onChange={(e) => setFilterProjectId(e.target.value)} className="bg-transparent text-sm text-white py-2 focus:outline-none cursor-pointer max-w-[140px] truncate">
              <option value="all" className="bg-[#1a1a1a]">Minden projekt</option>
              {uniqueProjects.map(p => <option key={p.id} value={p.id} className="bg-[#1a1a1a]">{p.name}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-[#0a0a0a] border border-neutral-800 rounded-xl px-2">
            <ListTodo className="h-4 w-4 text-neutral-500" />
            <select value={filterTaskId} onChange={(e) => setFilterTaskId(e.target.value)} className="bg-transparent text-sm text-white py-2 focus:outline-none cursor-pointer max-w-[160px] truncate">
              <option value="all" className="bg-[#1a1a1a]">Minden feladat</option>
              <option value="no_task" className="bg-[#1a1a1a]">-- Általános munka --</option>
              {uniqueTasks.map(t => <option key={t.id} value={t.id} className="bg-[#1a1a1a]">{t.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-neutral-800 bg-[#111111] p-5 relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-neutral-800 rounded-lg border border-neutral-700">
              <User className="h-4 w-4 text-neutral-300" />
            </div>
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Saját Időm Összesen</h3>
          </div>
          <div className="text-2xl font-bold text-white mt-3">
            {formatDuration(myTotalSeconds)}
          </div>
        </div>

        <div className="rounded-2xl border border-sona/20 bg-sona/5 p-5 relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-sona/10 rounded-lg border border-sona/20">
              <BarChart className="h-4 w-4 text-sona" />
            </div>
            <h3 className="text-xs font-bold text-sona uppercase tracking-wider">Szűrt Idő Összege</h3>
          </div>
          <div className="text-2xl font-bold text-white mt-3">
            {formatDuration(filteredTotalSeconds)}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-[#111111] p-5 relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Users className="h-4 w-4 text-blue-500" />
            </div>
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Teljes Cég Összesen</h3>
          </div>
          <div className="text-2xl font-bold text-white mt-3">
            {formatDuration(totalSecondsAll)}
          </div>
        </div>
      </div>

      {Object.keys(groupedEntries).length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-800 p-12 text-center bg-[#0a0a0a]">
          <Clock className="h-12 w-12 text-neutral-700 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white">Nincs megjeleníthető adat</h3>
          <p className="text-sm text-neutral-500 mt-1">A beállított szűrők alapján nem található időmérés.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedEntries).map(([dayLabel, entries]) => {
            const dailySeconds = entries.reduce((sum, e) => sum + (e.duration || 0), 0);
            
            return (
              <div key={dayLabel} className="rounded-2xl border border-neutral-800 bg-[#111111] overflow-hidden">
                <div className="px-5 py-3 border-b border-neutral-800 bg-[#151515] flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-neutral-400" />
                    {dayLabel}
                  </h3>
                  <span className="text-xs font-medium text-neutral-400">
                    Napi összegzés: <span className="text-white ml-1">{formatDuration(dailySeconds)}</span>
                  </span>
                </div>
                
                <div className="divide-y divide-neutral-800/50">
                  {entries.map((entry) => {
                    const project = projects[entry.projectId];
                    const task = entry.taskId ? tasks[entry.taskId] : null;
                    const isMyEntry = entry.userId === user?.uid;

                    return (
                      <div key={entry.id} className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#161616] transition-colors group">
                        
                        <div className="flex items-start gap-4">
                          <div className="text-xs font-mono text-neutral-500 mt-0.5 w-12 shrink-0">
                            {getTimeString(entry.startTime)}
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-3 text-xs font-medium text-neutral-500 mb-1">
                              <span className="flex items-center gap-1.5"><Folder className="h-3 w-3" /> {project?.name || "Törölt projekt"}</span>
                              {task && <span className="flex items-center gap-1.5 text-neutral-400 border-l border-neutral-700 pl-3"><ListTodo className="h-3 w-3" /> {task.title}</span>}
                            </div>
                            <p className="text-sm font-medium text-white">
                              {entry.description || "Névtelen munkafolyamat"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 sm:gap-8 justify-end">
                          <div className={`flex items-center gap-2 text-xs ${isMyEntry ? "text-sona font-medium" : "text-neutral-500"}`} title={entry.userEmail}>
                            <User className="h-3.5 w-3.5" />
                            {entry.userName || entry.userEmail?.split("@")[0]} {isMyEntry && "(Én)"}
                          </div>
                          
                          <div className="text-right w-24">
                            <span className="text-sm font-mono font-bold text-sona bg-sona/10 px-2 py-1 rounded border border-sona/20 inline-block">
                              {formatDuration(entry.duration || 0)}
                            </span>
                          </div>

                          {/* ÚJ: Szerkesztés és Törlés gombok egy blokkban */}
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                            {/* Csak a saját bejegyzéseit (vagy egy admin) tudja szerkeszteni */}
                            {isMyEntry && (
                              <button onClick={() => openEditModal(entry)} className="text-neutral-500 hover:text-white p-1.5 rounded-lg hover:bg-neutral-800 transition-all" title="Szerkesztés">
                                <Edit2 className="h-4 w-4" />
                              </button>
                            )}
                            <button onClick={() => handleDeleteEntry(entry.id)} className="text-neutral-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-all" title="Törlés">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- SZERKESZTŐ MODÁL --- */}
      {editingEntry && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#111111] border border-neutral-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-sona" />
                Munkanapló javítása
              </h2>
              <button onClick={() => setEditingEntry(null)} className="text-neutral-500 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">Feladat / Munka leírása</label>
                <input
                  type="text"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sona transition-colors"
                  placeholder="Mit csináltál pontosan?"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">Eltöltött óra</label>
                  <input
                    type="number"
                    min="0"
                    value={editHours}
                    onChange={(e) => setEditHours(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sona transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">Perc</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={editMinutes}
                    onChange={(e) => setEditMinutes(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sona transition-colors"
                  />
                </div>
              </div>

              <div className="bg-sona/10 border border-sona/20 rounded-xl p-3 flex items-start gap-2">
                <Clock className="h-4 w-4 text-sona shrink-0 mt-0.5" />
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Új összesített idő: <strong className="text-white">{(editHours * 3600) + (editMinutes * 60) > 0 ? formatDuration((editHours * 3600) + (editMinutes * 60)) : "0mp"}</strong>. Ezzel felülírja az automatikusan mért másodperceket.
                </p>
              </div>

              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 bg-sona hover:bg-sona-hover text-white py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 mt-2"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Módosítások mentése
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}