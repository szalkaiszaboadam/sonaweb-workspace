// context/TimerContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp, doc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

interface TimerContextType {
  isActive: boolean;
  seconds: number;
  activeTaskId: string | null;
  activeProjectId: string | null;
  activeTaskName: string | null;
  startTimer: (projectId: string, taskId?: string, taskName?: string) => Promise<void>;
  stopTimer: () => Promise<void>;
}

const TimerContext = createContext<TimerContextType>({
  isActive: false,
  seconds: 0,
  activeTaskId: null,
  activeProjectId: null,
  activeTaskName: null,
  startTimer: async () => {},
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

  // 1. VALÓS IDEJŰ FELHŐALAPÚ SZINKRONIZÁCIÓ (Eszközök között)
  useEffect(() => {
    if (!user) {
      setIsActive(false);
      setSeconds(0);
      return;
    }

    // Feliratkozunk a felhasználó saját aktív timer dokumentumára a Firestore-ban
    const activeTimerRef = doc(db, "active_timers", user.uid);
    
    const unsubscribe = onSnapshot(activeTimerRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Kezeljük a Firebase Timestamp formátumot és a sima ISO stringet is
        const start = data.startTime?.toDate ? data.startTime.toDate() : new Date(data.startTime);
        const now = new Date();
        const diffSeconds = Math.floor((now.getTime() - start.getTime()) / 1000);

        setStartTime(start);
        setActiveProjectId(data.projectId);
        setActiveTaskId(data.taskId);
        setActiveTaskName(data.taskName);
        setSeconds(diffSeconds > 0 ? diffSeconds : 0);
        setIsActive(true);
      } else {
        // Ha törlődik a dokumentum (leállt a timer valahol), a felület is azonnal alaphelyzetbe áll
        setIsActive(false);
        setActiveProjectId(null);
        setActiveTaskId(null);
        setActiveTaskName(null);
        setSeconds(0);
        setStartTime(null);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // 2. Helyi számláló az egyenletes másodpercenkénti UI frissítéshez
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  // 3. Timer elindítása -> Most már közvetlenül a felhőbe írunk
  const startTimer = async (projectId: string, taskId?: string, taskName?: string) => {
    if (!user) return;

    // Ha már fut egy mérés, az automatikus váltás logikája szerint leállítjuk azt
    if (isActive) {
      await stopTimer();
    }
    
    const start = new Date();

    // A dokumentum ID-ja a user.uid lesz, így kényszerítjük ki az egyetlen futó timert
    try {
      await setDoc(doc(db, "active_timers", user.uid), {
        projectId,
        taskId: taskId || null,
        taskName: taskName || "Általános munka",
        startTime: start,
      });
    } catch (error) {
      console.error("Hiba a timer felhőbe indításakor:", error);
    }
  };

  // 4. Timer leállítása -> Áthelyezés a végleges naplóba és törlés az aktívak közül
  const stopTimer = async () => {
    if (!user || !activeProjectId || !startTime) return;
    
    // Lokális változókba mentjük az értékeket a Firestore aszinkron hívás előtt
    const finalSeconds = seconds;
    const project = activeProjectId;
    const task = activeTaskId;
    const taskName = activeTaskName;
    const start = startTime;

    try {
      // 1. Töröljük az aktív státuszt a felhőből (az onSnapshot miatt a UI azonnal leáll minden eszközön)
      await deleteDoc(doc(db, "active_timers", user.uid));

      // 2. Elmentjük a végleges lezárt bejegyzést a munkanaplóba
      await addDoc(collection(db, "time_entries"), {
        userId: user.uid,
        userEmail: user.email || "Ismeretlen",
        userName: user.displayName || "",
        projectId: project,
        taskId: task,
        duration: finalSeconds,
        startTime: start,
        endTime: new Date(),
        description: taskName,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Hiba az idő leállításakor és mentésekor:", error);
    }
  };

  return (
    <TimerContext.Provider value={{ isActive, seconds, activeTaskId, activeProjectId, activeTaskName, startTimer, stopTimer }}>
      {children}
    </TimerContext.Provider>
  );
};