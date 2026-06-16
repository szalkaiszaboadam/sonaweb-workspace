// components/GlobalTimer.tsx
"use client";

import { useTimer } from "@/context/TimerContext";
import { Square, Loader2 } from "lucide-react";
import { useState } from "react";

export default function GlobalTimer() {
  const { isActive, seconds, activeTaskName, stopTimer } = useTimer();
  const [isStopping, setIsStopping] = useState(false);

  if (!isActive) return null;

  // Másodpercek formázása 00:00:00 alakba
  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");
    if (h === "00") return `${m}:${s}`;
    return `${h}:${m}:${s}`;
  };

  const handleStop = async () => {
    setIsStopping(true);
    await stopTimer();
    setIsStopping(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="flex items-center gap-4 bg-[#111111] border border-sona/30 p-3 pr-4 rounded-full shadow-2xl shadow-sona/10">
        
        {/* Lényegi rész: Zöld villogó pont és az idő */}
        <div className="flex items-center gap-3 pl-2 border-r border-neutral-800 pr-4">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </div>
          <span className="font-mono text-lg font-bold text-white tracking-wider">
            {formatTime(seconds)}
          </span>
        </div>

        {/* Feladat neve és Stop gomb */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-neutral-300 max-w-[150px] truncate">
            {activeTaskName}
          </span>
          
          <button
            onClick={handleStop}
            disabled={isStopping}
            className="h-8 w-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-red-500/20 disabled:opacity-50"
            title="Mérés leállítása"
          >
            {isStopping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Square className="h-3.5 w-3.5 fill-current" />}
          </button>
        </div>
      </div>
    </div>
  );
}