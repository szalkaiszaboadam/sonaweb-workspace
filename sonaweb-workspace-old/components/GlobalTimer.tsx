// components/GlobalTimer.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useTimer } from "@/context/TimerContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { StopCircle, Folder, Loader2, ListTodo, Clock } from "lucide-react";

export default function GlobalTimer() {
  const { isActive, seconds, activeTaskName, activeProjectId, stopTimer } = useTimer();
  const [projectName, setProjectName] = useState<string>("Betöltés...");
  const [isStopping, setIsStopping] = useState(false);

  // Projekt nevének dinamikus lekérése ID alapján
  useEffect(() => {
    if (!isActive || !activeProjectId) return;

    let isMounted = true;
    
    const fetchProjectName = async () => {
      setProjectName("Betöltés...");
      try {
        const docRef = doc(db, "projects", activeProjectId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && isMounted) {
          setProjectName(docSnap.data().name);
        } else if (isMounted) {
          setProjectName("Ismeretlen projekt");
        }
      } catch (error) {
        console.error("Hiba a projekt nevének lekérésekor:", error);
        if (isMounted) setProjectName("Hiba");
      }
    };

    fetchProjectName();

    return () => { isMounted = false; };
  }, [isActive, activeProjectId]);



  if (!isActive) return null;

  const formatDisplayTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");
    if (h > 0) return `${h}:${m}:${s}`;
    return `${m}:${s}`;
  };

  const handleStop = async () => {
    setIsStopping(true);
    await stopTimer();
    setIsStopping(false);
  };

  return (
   
<div className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-[#111111] border border-sona/30 shadow-2xl shadow-sona/10 rounded-2xl p-4 flex items-center gap-5 min-w-[280px] max-w-[400px]">
        
        <div className="relative flex h-3 w-3 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sona opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-sona"></span>
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-500 uppercase tracking-widest truncate">
            <Folder className="h-3 w-3 shrink-0" />
            <span className="truncate">{projectName}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-white truncate">
            {activeTaskName === "Általános munka" ? (
              <Clock className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
            ) : (
              <ListTodo className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
            )}
            <span className="truncate">{activeTaskName || "Általános munka"}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0 pl-4 border-l border-neutral-800">
          <div className="text-xl font-mono font-bold text-white tracking-wider w-[75px] text-center">
            {formatDisplayTime(seconds)}
          </div>
          <button
            onClick={handleStop}
            disabled={isStopping}
            className="text-neutral-400 hover:text-sona transition-colors disabled:opacity-50"
            title="Mérés leállítása és mentés"
          >
            {isStopping ? (
              <Loader2 className="h-8 w-8 animate-spin text-sona" />
            ) : (
              <StopCircle className="h-8 w-8" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}