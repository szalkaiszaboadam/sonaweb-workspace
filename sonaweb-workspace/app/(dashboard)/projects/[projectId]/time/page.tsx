// app/(dashboard)/projects/[projectId]/time/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { collection, query, where, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Clock, Calendar, User, Trash2, Timer, Loader2 } from "lucide-react";
import { TimeEntry } from "@/types";

export default function TimeTrackingPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Adatok betöltése és kliens oldali rendezése
  useEffect(() => {
    if (!projectId) return;

    const q = query(collection(db, "time_entries"), where("projectId", "==", projectId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedEntries = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TimeEntry[];
      
      // Rendezés: Legújabb elöl (Időbélyegek kezelésével)
      fetchedEntries.sort((a, b) => {
        const timeA = a.startTime?.toMillis ? a.startTime.toMillis() : new Date(a.startTime).getTime();
        const timeB = b.startTime?.toMillis ? b.startTime.toMillis() : new Date(b.startTime).getTime();
        return timeB - timeA;
      });

      setTimeEntries(fetchedEntries);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [projectId]);

  // Időbejegyzés törlése
  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm("Biztosan törölni szeretné ezt a mérést?")) return;
    try {
      await deleteDoc(doc(db, "time_entries", entryId));
    } catch (error) {
      console.error("Hiba a bejegyzés törlésekor:", error);
    }
  };

  // Másodpercek formázása óra:perc:mp alakra
  const formatDuration = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    
    if (h > 0) return `${h}ó ${m}p ${s}mp`;
    if (m > 0) return `${m}p ${s}mp`;
    return `${s}mp`;
  };

  // Dátum formázása
  const formatDate = (dateData: any) => {
    if (!dateData) return "-";
    const d = dateData.toDate ? dateData.toDate() : new Date(dateData);
    return new Intl.DateTimeFormat('hu-HU', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d);
  };

  // Teljes idő kiszámítása
  const totalSeconds = timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
  const totalHours = Math.floor(totalSeconds / 3600);
  const totalMinutes = Math.floor((totalSeconds % 3600) / 60);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-sona animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4">
      {/* Fejléc és Statisztika widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-neutral-800 bg-[#111111] p-6 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-sona/10 flex items-center justify-center text-sona shrink-0">
            <Timer className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">Projekt Teljes Idő</p>
            <h3 className="text-2xl font-bold text-white">
              {totalHours}ó {totalMinutes}p
            </h3>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-[#111111] p-6 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">Munkamenetek</p>
            <h3 className="text-2xl font-bold text-white">
              {timeEntries.length} <span className="text-sm font-normal text-neutral-500">bejegyzés</span>
            </h3>
          </div>
        </div>
      </div>

      {/* Időbejegyzések Listája */}
      <div className="rounded-2xl border border-neutral-800 bg-[#111111] overflow-hidden">
        <div className="p-4 border-b border-neutral-800 bg-[#151515]">
          <h3 className="text-sm font-semibold text-white">Rögzített munkafolyamatok</h3>
        </div>
        
        {timeEntries.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 text-sm">
            Még nincs rögzített idő ebben a projektben. <br/> Indítsa el a stoppert egy feladatnál a rögzítéshez!
          </div>
        ) : (
          <div className="divide-y divide-neutral-800/50">
            {timeEntries.map((entry) => (
              <div key={entry.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#1a1a1a] transition-colors group">
                
                {/* Bal oldal: Feladat neve és Dátum */}
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Clock className="h-4 w-4 text-neutral-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {entry.description || "Névtelen munkafolyamat"}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-neutral-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(entry.startTime)}
                      </span>
                      <span className="flex items-center gap-1" title={entry.userEmail}>
  <User className="h-3 w-3" />
  {entry.userName || entry.userEmail?.split("@")[0] || "Ismeretlen"}
</span>
                    </div>
                  </div>
                </div>

                {/* Jobb oldal: Eltelt idő és Akciók */}
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="text-sm font-mono font-bold text-sona bg-sona/10 px-2.5 py-1 rounded-md border border-sona/20">
                      {formatDuration(entry.duration || 0)}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    title="Törlés"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}