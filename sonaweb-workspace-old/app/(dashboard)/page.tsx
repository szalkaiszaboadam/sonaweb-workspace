// app/(dashboard)/page.tsx
"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, query, where, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Project, Task, TimeEntry } from "@/types";
import Link from "next/link";
import { Folder, Radio, Plus, CheckCircle2, Clock, Activity, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useWorkspace } from "@/context/WorkspaceContext"; // BEIMPORTÁLVA

export default function ProjectsPage() {
  const { user } = useAuth();
  const { activeWorkspace } = useWorkspace(); // AKTÍV WORKSPACE LEKÉRÉSE
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ha még nincs aktív workspace betöltve, azonnal álljunk le (nincs lekérdezés)
    if (!activeWorkspace) return;

    // 1. Csak az aktív workspace projektjeinek lekérése
    const qProjects = query(
      collection(db, "projects"),
      where("workspaceId", "==", activeWorkspace.id)
    );
    const unsubscribeProjects = onSnapshot(qProjects, (snapshot) => {
      const fetchedProjects = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Project[];
      
      // Kliens oldali rendezés, hogy ne kelljen manuálisan Firebase Indexet építened
      fetchedProjects.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });
      
      setProjects(fetchedProjects);
      setLoading(false);
    });

    // 2. Csak az aktív workspace feladatainak lekérése
    const qTasks = query(
      collection(db, "tasks"),
      where("workspaceId", "==", activeWorkspace.id)
    );
    const unsubscribeTasks = onSnapshot(qTasks, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)));
    });

    // 3. Csak az aktív workspace időbejegyzéseinek lekérése
    const qTime = query(
      collection(db, "time_entries"),
      where("workspaceId", "==", activeWorkspace.id)
    );
    const unsubscribeTime = onSnapshot(qTime, (snapshot) => {
      setTimeEntries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TimeEntry)));
    });

    return () => {
      unsubscribeProjects();
      unsubscribeTasks();
      unsubscribeTime();
    };
  }, [activeWorkspace]); // Ha workspace-t vált a felhasználó, ez automatikusan újratölti az adatokat!

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || !activeWorkspace) return;

    try {
      await addDoc(collection(db, "projects"), {
        name: newProjectName,
        description: newProjectDesc,
        workspaceId: activeWorkspace.id, // BEKÖTÉS AZ AKTÍV WORKSPACE-HEZ!
        createdAt: serverTimestamp(),
      });

      setNewProjectName("");
      setNewProjectDesc("");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Hiba a projekt létrehozásakor:", error);
    }
  };

  // --- STATISZTIKAI KALKULÁCIÓK ---
  const activeProjectsCount = projects.length;
  const activeTasksCount = tasks.filter(t => t.status !== "done").length;

  const now = new Date();

  // 1. Saját mai idő összesítése
  const myTodaysTotalSeconds = timeEntries
    .filter(entry => {
      if (!entry.startTime || entry.userId !== user?.uid) return false;
      const entryDate = entry.startTime.toDate ? entry.startTime.toDate() : new Date(entry.startTime);
      return (
        entryDate.getDate() === now.getDate() &&
        entryDate.getMonth() === now.getMonth() &&
        entryDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, entry) => sum + (entry.duration || 0), 0);

  const myHours = Math.floor(myTodaysTotalSeconds / 3600);
  const myMinutes = Math.floor((myTodaysTotalSeconds % 3600) / 60);

  // 2. Csapat mai idő összesítése
  const teamTodaysTotalSeconds = timeEntries
    .filter(entry => {
      if (!entry.startTime) return false;
      const entryDate = entry.startTime.toDate ? entry.startTime.toDate() : new Date(entry.startTime);
      return (
        entryDate.getDate() === now.getDate() &&
        entryDate.getMonth() === now.getMonth() &&
        entryDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, entry) => sum + (entry.duration || 0), 0);

  const teamHours = Math.floor(teamTodaysTotalSeconds / 3600);
  const teamMinutes = Math.floor((teamTodaysTotalSeconds % 3600) / 60);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 10) return "Jó reggelt";
    if (hour < 18) return "Szép napot";
    return "Jó estét";
  };

  // !!! VILLANÁS ELLENI VÉDELEM (FOUC) !!!
  // Ha a gép ezen a ponton még nem tudja, hogy mi a workspace (vagy épp átirányít), nem mutatunk SEMMIT a felületből.
  if (!activeWorkspace) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 text-sona animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            {getGreeting()}, <span className="text-sona">{user?.displayName || user?.email?.split('@')[0] || "Munkatárs"}</span>!
          </h1>
          <p className="text-sm text-neutral-500 mt-1">Itt az aktuális globális áttekintés a rendszerről.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-sona hover:bg-sona-hover text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg shadow-sona/10"
        >
          <Plus className="h-4 w-4" />
          Új projekt
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-neutral-800 bg-[#111111] p-5 relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-neutral-800/50 rounded-lg border border-neutral-700/50">
              <Activity className="h-4 w-4 text-neutral-300" />
            </div>
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Aktív Projektek</h3>
          </div>
          <div className="text-3xl font-bold text-white mt-2">{activeProjectsCount}</div>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-[#111111] p-5 relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-sona/10 rounded-lg border border-sona/20">
              <CheckCircle2 className="h-4 w-4 text-sona" />
            </div>
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Nyitott Feladatok</h3>
          </div>
          <div className="text-3xl font-bold text-white mt-2">{activeTasksCount}</div>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-[#111111] p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Clock className="h-16 w-16" />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Clock className="h-4 w-4 text-blue-500" />
            </div>
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Mai Munkaidők</h3>
          </div>
          <div className="mt-2 space-y-1">
            <div className="text-2xl font-bold text-white">
              {myHours}ó {myMinutes}p <span className="text-xs font-normal text-neutral-500 ml-1">(Saját)</span>
            </div>
            <div className="text-sm text-neutral-400">
              Csapat összesen: <span className="font-semibold text-neutral-200">{teamHours}ó {teamMinutes}p</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-semibold text-white">Projektjei</h2>
          <div className="flex items-center gap-1 text-sona text-[10px] font-bold tracking-widest uppercase bg-sona/10 px-2 py-0.5 rounded-md border border-sona/20">
            <Radio className="h-3 w-3 animate-pulse" />
            Live
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-neutral-500">Projektek betöltése...</div>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-800 p-12 text-center bg-[#0a0a0a]">
            <Folder className="h-10 w-10 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-base font-medium text-neutral-300">Nincs aktív projekt</h3>
            <p className="text-sm text-neutral-500 mt-1">Hozza létre az elsőt a fenti gombbal.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Link 
                key={project.id}
                href={`/projects/${project.id}`}
                className="group flex flex-col justify-between rounded-2xl border border-neutral-800 bg-[#111111] hover:border-neutral-700 hover:bg-[#151515] p-5 h-full transition-all cursor-pointer"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-base font-semibold text-white group-hover:text-sona transition-colors line-clamp-1">
                      {project.name}
                    </h3>
                    <div className="text-[10px] font-medium text-neutral-400 bg-neutral-800 px-2 py-1 rounded-md shrink-0">
                      Aktív
                    </div>
                  </div>
                  <p className="text-xs text-neutral-500 line-clamp-2">
                    {project.description || "Nincs megadva leírás."}
                  </p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-neutral-800/50 flex items-center justify-between text-xs text-neutral-500">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {tasks.filter(t => t.projectId === project.id && t.status !== "done").length} feladat
                  </span>
                  <span className="text-sona group-hover:underline">Megnyitás &rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="w-full max-w-md bg-[#111111] border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-6">
            <h2 className="text-lg font-semibold text-white">Új projekt</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-neutral-400">Projekt neve</label>
                <input
                  type="text"
                  required
                  autoFocus
                  className="mt-1.5 w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] px-4 py-2.5 text-sm text-white focus:border-sona focus:outline-none"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-400">Leírás</label>
                <textarea
                  rows={3}
                  className="mt-1.5 w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] px-4 py-2.5 text-sm text-white focus:border-sona focus:outline-none resize-none"
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-400 hover:text-white transition-all"
                >
                  Mégse
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sona hover:bg-sona-hover text-white rounded-xl text-sm font-medium transition-all"
                >
                  Létrehozás
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}