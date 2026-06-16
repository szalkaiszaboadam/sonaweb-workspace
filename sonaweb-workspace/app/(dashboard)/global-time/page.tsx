// app/(dashboard)/global-time/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { TimeEntry, Project } from "@/types";
import { Clock, Calendar, Folder, User, Trash2, Loader2, BarChart3, Activity } from "lucide-react";

export default function GlobalTimePage() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [projects, setProjects] = useState<Record<string, Project>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Projektek betöltése (a nevek megfeleltetéséhez)
    const unsubscribeProjects = onSnapshot(collection(db, "projects"), (snapshot) => {
      const projectsMap: Record<string, Project> = {};
      snapshot.docs.forEach(doc => {
        projectsMap[doc.id] = { id: doc.id, ...doc.data() } as Project;
      });
      setProjects(projectsMap);
    });

    // 2. Összes időmérés betöltése
    const unsubscribeTime = onSnapshot(collection(db, "time_entries"), (snapshot) => {
      const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TimeEntry));
      
      // Rendezés csökkenő sorrendben (legújabb elöl)
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

  // --- IDŐFORMÁZÓ SEGÉDFÜGGVÉNYEK ---
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

  // --- STATISZTIKAI KALKULÁCIÓK ---
  const now = new Date();
  
  // Összes idő
  const totalSecondsAll = timeEntries.reduce((sum, e) => sum + (e.duration || 0), 0);
  
  // Mai nap
  const todaysEntries = timeEntries.filter(e => {
    if (!e.startTime) return false;
    const d = e.startTime.toDate ? e.startTime.toDate() : new Date(e.startTime);
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const totalSecondsToday = todaysEntries.reduce((sum, e) => sum + (e.duration || 0), 0);

  // E havi
  const thisMonthEntries = timeEntries.filter(e => {
    if (!e.startTime) return false;
    const d = e.startTime.toDate ? e.startTime.toDate() : new Date(e.startTime);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const totalSecondsThisMonth = thisMonthEntries.reduce((sum, e) => sum + (e.duration || 0), 0);

  // --- CSOPORTOSÍTÁS NAPOK SZERINT ---
  const groupedEntries: Record<string, TimeEntry[]> = {};
  timeEntries.forEach(entry => {
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
      
      {/* Fejléc */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Clock className="h-7 w-7 text-sona" />
            Globális Időmérés
          </h1>
          <p className="text-sm text-neutral-500 mt-2">
            A teljes ügynökség összes rögzített munkaideje egyetlen átfogó nézetben.
          </p>
        </div>
      </div>

      {/* Statisztikai Kártyák */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-neutral-800 bg-[#111111] p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-sona/10 rounded-lg">
              <Activity className="h-4 w-4 text-sona" />
            </div>
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Mai Munka</h3>
          </div>
          <div className="text-2xl font-bold text-white mt-3">
            {formatDuration(totalSecondsToday)}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-[#111111] p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <BarChart3 className="h-4 w-4 text-blue-500" />
            </div>
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">E Havi Összesítés</h3>
          </div>
          <div className="text-2xl font-bold text-white mt-3">
            {formatDuration(totalSecondsThisMonth)}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-[#111111] p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-neutral-800 rounded-lg border border-neutral-700">
              <Clock className="h-4 w-4 text-neutral-300" />
            </div>
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Minden Idők</h3>
          </div>
          <div className="text-2xl font-bold text-white mt-3">
            {Math.floor(totalSecondsAll / 3600)}ó {Math.floor((totalSecondsAll % 3600) / 60)}p
          </div>
        </div>
      </div>

      {/* Időbejegyzések naponta csoportosítva */}
      {Object.keys(groupedEntries).length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-800 p-12 text-center bg-[#0a0a0a]">
          <Clock className="h-12 w-12 text-neutral-700 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white">Nincs rögzített adat</h3>
          <p className="text-sm text-neutral-500 mt-1">Még senki sem indította el a stoppert a rendszerben.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedEntries).map(([dayLabel, entries]) => {
            // Napi összesített idő
            const dailySeconds = entries.reduce((sum, e) => sum + (e.duration || 0), 0);
            
            return (
              <div key={dayLabel} className="rounded-2xl border border-neutral-800 bg-[#111111] overflow-hidden">
                {/* Nap Fejléce */}
                <div className="px-5 py-3 border-b border-neutral-800 bg-[#151515] flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-neutral-400" />
                    {dayLabel}
                  </h3>
                  <span className="text-xs font-medium text-neutral-400">
                    Napi összesen: <span className="text-white ml-1">{formatDuration(dailySeconds)}</span>
                  </span>
                </div>
                
                {/* Napi Bejegyzések */}
                <div className="divide-y divide-neutral-800/50">
                  {entries.map((entry) => {
                    const project = projects[entry.projectId];
                    return (
                      <div key={entry.id} className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#161616] transition-colors group">
                        
                        {/* Bal oldal: Időpont, Projekt, Feladat */}
                        <div className="flex items-start gap-4">
                          <div className="text-xs font-mono text-neutral-500 mt-0.5 w-12 shrink-0">
                            {getTimeString(entry.startTime)}
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 mb-1">
                              <Folder className="h-3.5 w-3.5" />
                              <span className="text-neutral-400">{project?.name || "Törölt projekt"}</span>
                            </div>
                            <p className="text-sm font-medium text-white">
                              {entry.description || "Névtelen munkafolyamat"}
                            </p>
                          </div>
                        </div>

                        {/* Jobb oldal: Munkatárs, Eltelt idő, Törlés */}
                        <div className="flex items-center gap-6 sm:gap-8 justify-end">
                          <div className="flex items-center gap-2 text-xs text-neutral-500" title={entry.userEmail}>
                            <User className="h-3.5 w-3.5" />
                            {entry.userName || entry.userEmail?.split("@")[0] || "Ismeretlen"}
                          </div>
                          
                          <div className="text-right w-24">
                            <span className="text-sm font-mono font-bold text-sona bg-sona/10 px-2 py-1 rounded border border-sona/20 inline-block">
                              {formatDuration(entry.duration || 0)}
                            </span>
                          </div>

                          <button 
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                            title="Törlés"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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
    </div>
  );
}