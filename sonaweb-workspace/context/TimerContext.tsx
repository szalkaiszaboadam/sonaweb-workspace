// context/TimerContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

interface TimerContextType {
  isActive: boolean;
  seconds: number;
  activeTaskId: string | null;
  activeProjectId: string | null;
  activeTaskName: string | null;
  startTimer: (projectId: string, taskId?: string, taskName?: string) => void;
  stopTimer: () => Promise<void>;
}

const TimerContext = createContext<TimerContextType>({
  isActive: false,
  seconds: 0,
  activeTaskId: null,
  activeProjectId: null,
  activeTaskName: null,
  startTimer: () => {},
  stopTimer: async () => {},
});

export const useTimer = () => useContext(TimerContext);

export const TimerProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [activeTaskName, setActiveTaskName] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // 1. Oldalbetöltéskor (Hydration) megkeressük, hogy futott-e már timer
  useEffect(() => {
    const savedTimer = localStorage.getItem("sona_active_timer");
    if (savedTimer) {
      try {
        const parsed = JSON.parse(savedTimer);
        if (parsed.isActive && parsed.startTime) {
          const start = new Date(parsed.startTime);
          const now = new Date();
          // Kiszámoljuk az eltelt másodperceket a kezdés óta
          const diffSeconds = Math.floor((now.getTime() - start.getTime()) / 1000);

          setStartTime(start);
          setActiveProjectId(parsed.activeProjectId);
          setActiveTaskId(parsed.activeTaskId);
          setActiveTaskName(parsed.activeTaskName);
          setSeconds(diffSeconds > 0 ? diffSeconds : 0);
          setIsActive(true);
        }
      } catch (e) {
        console.error("Hiba a mentett időmérő betöltésekor", e);
        localStorage.removeItem("sona_active_timer");
      }
    }
  }, []);

  // 2. A másodperc-számláló, ami csak akkor ketyeg, ha aktív
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  // 3. Timer elindítása és elmentése a LocalStorage-be
  const startTimer = (projectId: string, taskId?: string, taskName?: string) => {
    if (isActive) return;
    
    const start = new Date();
    setActiveProjectId(projectId);
    setActiveTaskId(taskId || null);
    setActiveTaskName(taskName || "Általános munka");
    setSeconds(0);
    setStartTime(start);
    setIsActive(true);

    // Biztonsági mentés a böngésző memóriájába
    localStorage.setItem("sona_active_timer", JSON.stringify({
      isActive: true,
      startTime: start.toISOString(),
      activeProjectId: projectId,
      activeTaskId: taskId || null,
      activeTaskName: taskName || "Általános munka"
    }));
  };

  // 4. Timer leállítása, adatok mentése a Firestore-ba, és törlés a memóriából
  const stopTimer = async () => {
    if (!isActive || !user || !activeProjectId || !startTime) return;
    
    const finalSeconds = seconds;
    const project = activeProjectId;
    const task = activeTaskId;
    const taskName = activeTaskName;
    const start = startTime;
    
    // Azonnali vizuális leállítás, hogy gyorsnak tűnjön a felület
    setIsActive(false);
    setActiveProjectId(null);
    setActiveTaskId(null);
    setActiveTaskName(null);
    setSeconds(0);
    setStartTime(null);

    // Töröljük a memóriából, hogy frissítés után ne induljon újra
    localStorage.removeItem("sona_active_timer");

    // Adatbázisba írás
    // Adatbázisba írás
    try {
      await addDoc(collection(db, "time_entries"), {
        userId: user.uid,
        userEmail: user.email || "Ismeretlen", // Ezt mentjük mostantól!
        userName: user.displayName || "",      // Ha van beállítva neve
        projectId: project,
        taskId: task,
        duration: finalSeconds,
        startTime: start,
        endTime: new Date(),
        description: taskName,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Hiba az idő mentésekor:", error);
    }
  };

  return (
    <TimerContext.Provider value={{ isActive, seconds, activeTaskId, activeProjectId, activeTaskName, startTimer, stopTimer }}>
      {children}
    </TimerContext.Provider>
  );
};