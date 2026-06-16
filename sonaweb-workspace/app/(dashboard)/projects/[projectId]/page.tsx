// app/(dashboard)/projects/[projectId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Task, TimeEntry } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react";

export default function ProjectDashboardPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { user } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Adatok valós idejű betöltése
  useEffect(() => {
    if (!projectId) return;

    // 1. Feladatok lekérdezése
    const tasksQuery = query(collection(db, "tasks"), where("projectId", "==", projectId));
    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)));
    });

    // 2. Időmérések lekérdezése (Később a Toggl modul fogja tölteni)
    const timeQuery = query(collection(db, "time_entries"), where("projectId", "==", projectId));
    const unsubscribeTime = onSnapshot(timeQuery, (snapshot) => {
      setTimeEntries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TimeEntry)));
      setLoading(false);
    });

    return () => {
      unsubscribeTasks();
      unsubscribeTime();
    };
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 text-sona animate-spin" />
      </div>
    );
  }

  // --- 1. HALADÁS KALKULÁCIÓ (Feladatok) ---
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "done").length;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // --- 2. FIGYELMEZTETÉSEK KALKULÁCIÓ (Késő vagy Sürgős feladatok) ---
  const warningTasks = tasks.filter(t => {
    if (t.status === "done") return false;
    
    // Sürgős prioritású feladatok
    if (t.priority === "urgent") return true;

    // Lejárt határidejű feladatok (ha majd adunk hozzá határidőt a formon)
    if (t.dueDate) {
      const deadline = t.dueDate.toDate ? t.dueDate.toDate() : new Date(t.dueDate);
      if (deadline < new Date()) return true;
    }
    return false;
  }).length;

  // --- 3. IDŐMÉRÉS KALKULÁCIÓ (Mai munka) ---
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  // Mai naphoz tartozó bejegyzések szűrése
  const todaysEntries = timeEntries.filter(entry => {
    if (!entry.startTime) return false;
    const entryDate = entry.startTime.toDate ? entry.startTime.toDate() : new Date(entry.startTime);
    return entryDate >= startOfToday;
  });

  // Mai teljes másodperc kiszámítása
  const todaysTotalSeconds = todaysEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
  const todaysHours = Math.floor(todaysTotalSeconds / 3600);
  const todaysMinutes = Math.floor((todaysTotalSeconds % 3600) / 60);

  // Legtöbbet dolgozó tag keresése (Mai napon)
  const userTimes: Record<string, number> = {};
  todaysEntries.forEach(entry => {
    userTimes[entry.userId] = (userTimes[entry.userId] || 0) + (entry.duration || 0);
  });

  let topUserId = "";
  let topUserSeconds = 0;
  Object.entries(userTimes).forEach(([userId, seconds]) => {
    if (seconds > topUserSeconds) {
      topUserSeconds = seconds;
      topUserId = userId;
    }
  });

  const topUserHours = Math.floor(topUserSeconds / 3600);
  const topUserMinutes = Math.floor((topUserSeconds % 3600) / 60);
  
  // Megjelenítendő név logikája (Ideiglenesen az aktív felhasználót jelenítjük meg, amíg nincs Teams modul)
  const topUserName = topUserId === user?.uid ? "Ön" : topUserId ? "Más munkatárs" : "Nincs adat";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Haladás / Feladatok Widget */}
      <div className="rounded-2xl border border-neutral-800 bg-[#111111] p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider">Feladatok</h3>
        </div>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-white">{completedTasks}</span>
          <span className="text-sm text-neutral-500 mb-1">/ {totalTasks} kész</span>
        </div>
        <div className="w-full bg-neutral-800 rounded-full h-1.5 mt-4">
          <div 
            className="bg-green-500 h-1.5 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <p className="text-xs text-neutral-500 mt-2">{progressPercent}% Haladás</p>
      </div>

      {/* Időmérő Widget */}
      <div className="rounded-2xl border border-neutral-800 bg-[#111111] p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Clock className="h-5 w-5 text-blue-500" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider">Mai munka</h3>
        </div>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-white">
            {todaysHours}ó {todaysMinutes}p
          </span>
        </div>
        <p className="text-xs text-neutral-500 mt-4">
          Legterheltebb tag: <span className="text-neutral-300">{topUserName} ({topUserHours}ó {topUserMinutes}p)</span>
        </p>
      </div>

      {/* Figyelmeztetések Widget */}
      <div className="rounded-2xl border border-neutral-800 bg-[#111111] p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider">Figyelmeztetés</h3>
        </div>
        <div className="flex items-end gap-2">
          <span className={`text-3xl font-bold ${warningTasks > 0 ? "text-red-400" : "text-green-500"}`}>
            {warningTasks}
          </span>
          <span className="text-sm text-neutral-500 mb-1">feladat</span>
        </div>
        <p className="text-xs text-neutral-500 mt-4">Késésben vagy sürgős (Urgent) státuszú</p>
      </div>
    </div>
  );
}