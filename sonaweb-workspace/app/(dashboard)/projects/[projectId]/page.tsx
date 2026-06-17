// app/(dashboard)/projects/[projectId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Task, TimeEntry } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { CheckCircle2, Clock, AlertCircle, Loader2, History, Calendar, User } from "lucide-react";

export default function ProjectDashboardPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { user } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  
  const [tasksLoading, setTasksLoading] = useState(true);
  const [timeLoading, setTimeLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;

    const tasksQuery = query(collection(db, "tasks"), where("projectId", "==", projectId));
    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)));
      setTasksLoading(false);
    });

    const timeQuery = query(collection(db, "time_entries"), where("projectId", "==", projectId));
    const unsubscribeTime = onSnapshot(timeQuery, (snapshot) => {
      const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TimeEntry));
      
      entries.sort((a, b) => {
        const timeA = a.startTime?.toMillis ? a.startTime.toMillis() : new Date(a.startTime).getTime();
        const timeB = b.startTime?.toMillis ? b.startTime.toMillis() : new Date(b.startTime).getTime();
        return timeB - timeA;
      });

      setTimeEntries(entries);
      setTimeLoading(false);
    });

    return () => {
      unsubscribeTasks();
      unsubscribeTime();
    };
  }, [projectId]);

  if (tasksLoading || timeLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-sona animate-spin" />
      </div>
    );
  }

  // --- HALADÁS KALKULÁCIÓ ---
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "done").length;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // --- FIGYELMEZTETÉSEK KALKULÁCIÓ ---
  const warningTasks = tasks.filter(t => t.status !== "done" && t.priority === "urgent").length;

  // --- IDŐMÉRÉS KALKULÁCIÓ (Javított sorrend) ---
  const now = new Date();
  const todaysEntries = timeEntries.filter(entry => {
    if (!entry.startTime) return false;
    const entryDate = entry.startTime.toDate ? entry.startTime.toDate() : new Date(entry.startTime);
    return (
      entryDate.getDate() === now.getDate() &&
      entryDate.getMonth() === now.getMonth() &&
      entryDate.getFullYear() === now.getFullYear()
    );
  });

  // Csapat teljes ideje ma
  const todaysTotalSeconds = todaysEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
  const teamProjHours = Math.floor(todaysTotalSeconds / 3600);
  const teamProjMinutes = Math.floor((todaysTotalSeconds % 3600) / 60);

  // Saját időm ma ebben a projektben
  const myProjectSeconds = todaysEntries
    .filter(e => e.userId === user?.uid)
    .reduce((sum, entry) => sum + (entry.duration || 0), 0);

  const myProjHours = Math.floor(myProjectSeconds / 3600);
  const myProjMinutes = Math.floor((myProjectSeconds % 3600) / 60);

  const formatDuration = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h}ó ${m}p`;
    if (m > 0) return `${m}p ${s}mp`;
    return `${s}mp`;
  };

  const formatDate = (dateData: any) => {
    if (!dateData) return "-";
    const d = dateData.toDate ? dateData.toDate() : new Date(dateData);
    return new Intl.DateTimeFormat('hu-HU', { hour: '2-digit', minute: '2-digit' }).format(d);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Feladatok Widget */}
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
            <div className="bg-green-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
          </div>
          <p className="text-xs text-neutral-500 mt-2">{progressPercent}% Haladás</p>
        </div>

        {/* Időmérő Widget (Frissített elrendezés) */}
        <div className="rounded-2xl border border-neutral-800 bg-[#111111] p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider">Mai munka itt</h3>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-white">
              {myProjHours}ó {myProjMinutes}p <span className="text-xs font-normal text-neutral-500 ml-1">(Saját)</span>
            </div>
            <div className="text-sm text-neutral-400">
              Csapat összesen: <span className="font-semibold text-neutral-200">{teamProjHours}ó {teamProjMinutes}p</span>
            </div>
          </div>
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
            <span className={`text-3xl font-bold ${warningTasks > 0 ? "text-red-400" : "text-green-500"}`}>{warningTasks}</span>
            <span className="text-sm text-neutral-500 mb-1">feladat</span>
          </div>
          <p className="text-xs text-neutral-500 mt-4">Sürgős (Urgent) prioritású teendők száma.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-[#111111] overflow-hidden">
        <div className="p-4 border-b border-neutral-800 bg-[#151515] flex items-center gap-2">
          <History className="h-4 w-4 text-sona" />
          <h3 className="text-sm font-semibold text-white">Legutóbbi időmérések a projektben</h3>
        </div>

        {timeEntries.length === 0 ? (
          <div className="p-6 text-center text-sm text-neutral-500">
            Még nincs rögzített tevékenység ebben a projektben.
          </div>
        ) : (
          <div className="divide-y divide-neutral-800/40">
            {timeEntries.slice(0, 4).map((entry) => {
              const isMyEntry = entry.userId === user?.uid;
              return (
                <div key={entry.id} className="p-4 flex items-center justify-between gap-4 hover:bg-[#161616] transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-1.5 bg-neutral-800 rounded-lg text-neutral-400 shrink-0">
                      <Clock className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {entry.description || "Általános feladat"}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Ma {formatDate(entry.startTime)}
                        </span>
                        <span className={`flex items-center gap-1 ${isMyEntry ? "text-sona font-medium" : ""}`}>
                          <User className="h-3 w-3" />
                          {entry.userName || entry.userEmail?.split("@")[0]} {isMyEntry && "(Én)"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <span className="font-mono text-xs font-bold text-sona bg-sona/5 px-2 py-1 rounded border border-sona/10">
                      +{formatDuration(entry.duration || 0)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}