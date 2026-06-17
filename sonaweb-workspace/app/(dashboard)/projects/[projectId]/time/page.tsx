// app/(dashboard)/projects/[projectId]/time/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { collection, query, where, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useTimer } from "@/context/TimerContext"; 
import { Clock, Calendar, User, Trash2, Loader2, Filter, Users, BarChart, ListTodo, PlayCircle, Edit2, X, Save } from "lucide-react"; 
import { TimeEntry, Task } from "@/types";

export default function TimeTrackingPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { user } = useAuth();
  const { startTimer, activeProjectId, activeTaskId, isActive } = useTimer(); 

  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [tasks, setTasks] = useState<Record<string, Task>>({});
  const [loading, setLoading] = useState(true);
  
  // Szűrési állapotok
  const [filterUserId, setFilterUserId] = useState<string>("all");
  const [filterTaskId, setFilterTaskId] = useState<string>("all");

  // --- SZERKESZTÉSI ÁLLAPOTOK ---
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [editHours, setEditHours] = useState<number>(0);
  const [editMinutes, setEditMinutes] = useState<number>(0);
  const [editDesc, setEditDesc] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!projectId) return;

    const qTasks = query(collection(db, "tasks"), where("projectId", "==", projectId));
    const unsubscribeTasks = onSnapshot(qTasks, (snapshot) => {
      const tasksMap: Record<string, Task> = {};
      snapshot.docs.forEach(doc => { tasksMap[doc.id] = { id: doc.id, ...doc.data() } as Task; });
      setTasks(tasksMap);
    });

    const qTime = query(collection(db, "time_entries"), where("projectId", "==", projectId));
    const unsubscribeTime = onSnapshot(qTime, (snapshot) => {
      const fetchedEntries = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TimeEntry[];
      
      fetchedEntries.sort((a, b) => {
        const timeA = a.startTime?.toMillis ? a.startTime.toMillis() : new Date(a.startTime).getTime();
        const timeB = b.startTime?.toMillis ? b.startTime.toMillis() : new Date(b.startTime).getTime();
        return timeB - timeA;
      });

      setTimeEntries(fetchedEntries);
      setLoading(false);
    });

    return () => {
      unsubscribeTasks();
      unsubscribeTime();
    };
  }, [projectId]);

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm("Biztosan törölni szeretné ezt a mérést?")) return;
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
    if (h > 0) return `${h}ó ${m}p`;
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

  const uniqueTasksRaw = Array.from(new Set(timeEntries.map(e => e.taskId).filter(Boolean)));
  const uniqueTasks = uniqueTasksRaw.map(id => ({ id: id as string, name: tasks[id as string]?.title || "Törölt feladat" }));

  const filteredEntries = timeEntries.filter(e => {
    const matchUser = filterUserId === "all" || e.userId === filterUserId;
    const matchTask = 
      filterTaskId === "all" ? true :
      filterTaskId === "no_task" ? !e.taskId :
      e.taskId === filterTaskId;
    return matchUser && matchTask;
  });

  const totalSecondsProject = timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
  const myTotalSecondsProject = timeEntries.filter(e => e.userId === user?.uid).reduce((sum, entry) => sum + (entry.duration || 0), 0);
  const filteredTotalSeconds = filteredEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);

  const groupedEntries: Record<string, TimeEntry[]> = {};
  filteredEntries.forEach(entry => {
    const dayKey = getDayKey(entry.startTime);
    if (!groupedEntries[dayKey]) groupedEntries[dayKey] = [];
    groupedEntries[dayKey].push(entry);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-sona animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#111111] p-2.5 rounded-2xl border border-neutral-800">
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 pl-2 text-neutral-500 text-sm font-medium border-r border-neutral-800 pr-3">
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Szűrés:</span>
          </div>
          
          <div className="flex items-center gap-2 bg-[#0a0a0a] border border-neutral-800 rounded-xl px-2">
            <User className="h-4 w-4 text-neutral-500" />
            <select value={filterUserId} onChange={(e) => setFilterUserId(e.target.value)} className="bg-transparent text-sm text-white py-2 focus:outline-none cursor-pointer min-w-[130px]">
              <option value="all" className="bg-[#1a1a1a]">Mindenki</option>
              {uniqueUsers.map(u => <option key={u.id} value={u.id} className="bg-[#1a1a1a]">{u.name}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-[#0a0a0a] border border-neutral-800 rounded-xl px-2">
            <ListTodo className="h-4 w-4 text-neutral-500" />
            <select value={filterTaskId} onChange={(e) => setFilterTaskId(e.target.value)} className="bg-transparent text-sm text-white py-2 focus:outline-none cursor-pointer max-w-[180px] truncate">
              <option value="all" className="bg-[#1a1a1a]">Minden feladat</option>
              <option value="no_task" className="bg-[#1a1a1a]">-- Általános mérés --</option>
              {uniqueTasks.map(t => <option key={t.id} value={t.id} className="bg-[#1a1a1a]">{t.name}</option>)}
            </select>
          </div>
        </div>

        <div className="shrink-0">
          <button
            onClick={() => {
              if (isActive && activeProjectId === projectId && !activeTaskId) return;
              startTimer(projectId, undefined, "Általános munka");
            }}
            className={`w-full lg:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all shadow-lg ${
              isActive && activeProjectId === projectId && !activeTaskId
                ? "bg-green-500/20 text-green-500 border border-green-500/50 animate-pulse"
                : "bg-[#0a0a0a] border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-500"
            }`}
          >
            <PlayCircle className="h-4 w-4" />
            {isActive && activeProjectId === projectId && !activeTaskId 
              ? "Mérés folyamatban..." 
              : "Általános munka indítása"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-neutral-800 bg-[#111111] p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-400">
            <User className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Saját időm itt</p>
            <h3 className="text-xl font-bold text-white mt-0.5">{formatDuration(myTotalSecondsProject)}</h3>
          </div>
        </div>

        <div className="rounded-2xl border border-sona/30 bg-sona/10 p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-sona/20 flex items-center justify-center text-sona border border-sona/30">
            <BarChart className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-sona uppercase tracking-wider">Szűrt Idő Összege</p>
            <h3 className="text-xl font-bold text-white mt-0.5">{formatDuration(filteredTotalSeconds)}</h3>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-[#111111] p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Projekt Összesen (Csapat)</p>
            <h3 className="text-xl font-bold text-white mt-0.5">{formatDuration(totalSecondsProject)}</h3>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-[#111111] overflow-hidden">
        {Object.keys(groupedEntries).length === 0 ? (
          <div className="p-8 text-center text-neutral-500 text-sm">
            Nincs megjeleníthető időbejegyzés a választott szűrők alapján.
          </div>
        ) : (
          <div className="space-y-4 p-2">
            {Object.entries(groupedEntries).map(([dayLabel, entries]) => (
              <div key={dayLabel} className="border border-neutral-800/60 rounded-xl overflow-hidden bg-[#0a0a0a]/40">
                <div className="px-4 py-2 bg-[#151515] border-b border-neutral-800 flex justify-between text-xs text-neutral-400 font-medium">
                  <span>{dayLabel}</span>
                  <span>Napi részösszeg: {formatDuration(entries.reduce((sum, e) => sum + (e.duration || 0), 0))}</span>
                </div>
                <div className="divide-y divide-neutral-800/40">
                  {entries.map((entry) => {
                    const task = entry.taskId ? tasks[entry.taskId] : null;
                    const isMyEntry = entry.userId === user?.uid;
                    return (
                      <div key={entry.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#111111] transition-colors group">
                        <div className="flex items-start gap-3">
                          <span className="text-xs font-mono text-neutral-500 mt-0.5 shrink-0">{getTimeString(entry.startTime)}</span>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {task ? (
                                <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-400"><ListTodo className="h-3 w-3" /> {task.title}</span>
                              ) : (
                                <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-600"><Clock className="h-3 w-3" /> Általános mérés</span>
                              )}
                            </div>
                            <p className="text-sm font-medium text-white">{entry.description || "Névtelen munkafolyamat"}</p>
                            <div className="flex items-center gap-2 mt-1.5 text-xs">
                              <span className={`flex items-center gap-1.5 ${isMyEntry ? "text-sona" : "text-neutral-500"}`}>
                                <User className="h-3 w-3" />
                                {entry.userName || entry.userEmail?.split("@")[0]} {isMyEntry && "(Én)"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 justify-end">
                          <span className="text-xs font-mono font-bold text-sona bg-sona/5 px-2 py-1 rounded border border-sona/10">
                            {formatDuration(entry.duration || 0)}
                          </span>
                          
                          {/* ÚJ: Szerkesztés és Törlés blokk a belső nézetben is */}
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all shrink-0">
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
            ))}
          </div>
        )}
      </div>

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