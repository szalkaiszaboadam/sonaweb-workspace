// app/(dashboard)/tasks/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Task, Project } from "@/types";
import Link from "next/link";
import { ListTodo, AlertCircle, Clock, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

export default function GlobalTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Record<string, Project>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Minden projekt lekérése (hogy tudjuk a nevüket a kártyákon)
    const unsubscribeProjects = onSnapshot(collection(db, "projects"), (snapshot) => {
      const projectsMap: Record<string, Project> = {};
      snapshot.docs.forEach(doc => {
        projectsMap[doc.id] = { id: doc.id, ...doc.data() } as Project;
      });
      setProjects(projectsMap);
    });

    // 2. Minden NYITOTT feladat lekérése az összes projektből
    // ("in" operátorral szűrjük a be nem fejezett státuszokat)
    const qTasks = query(
      collection(db, "tasks"),
      where("status", "in", ["backlog", "todo", "in_progress", "review"])
    );

    const unsubscribeTasks = onSnapshot(qTasks, (snapshot) => {
      const fetchedTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      
      // Rendezés: Sürgősek (Urgent) előre, majd High, Medium, Low
      const priorityWeight: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
      
      fetchedTasks.sort((a, b) => {
        const weightA = priorityWeight[a.priority] || 0;
        const weightB = priorityWeight[b.priority] || 0;
        return weightB - weightA; // Csökkenő sorrend
      });

      setTasks(fetchedTasks);
      setLoading(false);
    });

    return () => {
      unsubscribeProjects();
      unsubscribeTasks();
    };
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "text-red-400 bg-red-400/10 border-red-400/20";
      case "high": return "text-orange-400 bg-orange-400/10 border-orange-400/20";
      case "medium": return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "low": return "text-neutral-400 bg-neutral-800 border-neutral-700";
      default: return "text-neutral-400 bg-neutral-800 border-neutral-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "backlog": return "Backlog";
      case "todo": return "Teendő";
      case "in_progress": return "Folyamatban";
      case "review": return "Review";
      default: return status;
    }
  };

  const urgentTasksCount = tasks.filter(t => t.priority === "urgent").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <Loader2 className="h-8 w-8 text-sona animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-2 max-w-5xl mx-auto">
      
      {/* Fejléc */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <ListTodo className="h-7 w-7 text-sona" />
            Globális Feladatlista
          </h1>
          <p className="text-sm text-neutral-500 mt-2">
            Az összes projekt nyitott és folyamatban lévő feladata egy helyen, prioritás szerint rendezve.
          </p>
        </div>
        
        {/* Sürgős feladatok számlálója */}
        {urgentTasksCount > 0 && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-xl text-sm font-medium">
            <AlertCircle className="h-4 w-4" />
            {urgentTasksCount} Sürgős teendő!
          </div>
        )}
      </div>

      {/* Feladatok Listája */}
      {tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-800 p-12 text-center bg-[#0a0a0a]">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-white">Minden feladat kész!</h3>
          <p className="text-sm text-neutral-500 mt-1">Jelenleg egyetlen projektben sincs nyitott teendő.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {tasks.map((task) => {
            const project = projects[task.projectId];
            
            return (
              <Link
                key={task.id}
                href={`/projects/${task.projectId}/tasks`}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-neutral-800 bg-[#111111] hover:bg-[#151515] hover:border-neutral-700 transition-all cursor-pointer"
              >
                {/* Bal oldal: Projekt név és Feladat cím */}
                <div className="flex flex-col gap-1.5 min-w-0">
                  <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
                    <span className="truncate max-w-[200px]">{project?.name || "Törölt projekt"}</span>
                    <span className="w-1 h-1 rounded-full bg-neutral-700"></span>
                    <span className="uppercase">{getStatusLabel(task.status)}</span>
                  </div>
                  <h3 className="text-base font-medium text-white group-hover:text-sona transition-colors truncate">
                    {task.title}
                  </h3>
                </div>

                {/* Jobb oldal: Tagek, Idő, és Ugrás Gomb */}
                <div className="flex items-center gap-4 shrink-0">
                  
                  {/* Prioritás Tag */}
                  <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </div>

                  {/* Becsült Idő */}
                  {(task.estimatedHours || 0) > 0 ? (
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400 w-16 justify-end">
                      <Clock className="h-3.5 w-3.5" />
                      {task.estimatedHours}ó
                    </div>
                  ) : (
                    <div className="w-16"></div> /* Helykitöltő a szép igazításért */
                  )}

                  {/* Ugrás Ikon */}
                  <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-neutral-800 flex items-center justify-center text-neutral-400 group-hover:bg-sona/10 group-hover:text-sona group-hover:border-sona/30 transition-all">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}