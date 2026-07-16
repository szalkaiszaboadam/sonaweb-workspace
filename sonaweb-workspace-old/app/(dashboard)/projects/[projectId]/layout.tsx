// app/(dashboard)/projects/[projectId]/layout.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Project } from "@/types";
import { LayoutDashboard, KanbanSquare, FileText, Clock, Settings, Loader2 } from "lucide-react";
import { useTimer } from "@/context/TimerContext";

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const projectId = params.projectId as string;
  
  const { isActive, seconds } = useTimer();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    const docRef = doc(db, "projects", projectId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setProject({ id: docSnap.id, ...docSnap.data() } as Project);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [projectId]);

  useEffect(() => {
    if (!project?.name) return;

    if (isActive) {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      
      let timeStr = "";
      if (h > 0) timeStr = `${h}ó ${m}p ${s}mp`;
      else if (m > 0) timeStr = `${m}p ${s}mp`;
      else timeStr = `${s}mp`;

      document.title = `${timeStr} | ${project.name} | SONAWEB`;
    } else {
      document.title = `${project.name} | SONAWEB Workspace`;
    }
  }, [project?.name, isActive, seconds]);

const tabs = [
    { name: "Áttekintés", href: `/projects/${projectId}`, icon: LayoutDashboard },
    { name: "Tábla", href: `/projects/${projectId}/tasks`, icon: KanbanSquare },
    { name: "Dokumentumok", href: `/projects/${projectId}/docs`, icon: FileText },
    { name: "Időmérés", href: `/projects/${projectId}/time`, icon: Clock },
    { name: "Beállítások", href: `/projects/${projectId}/settings`, icon: Settings },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-sona animate-spin" />
      </div>
    );
  }

  if (!project) {
    return <div className="text-neutral-500">A projekt nem található.</div>;
  }

  return (
    // Csökkentettük a gap-et lg:gap-8-ról lg:gap-5-re
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 h-full pt-2">
      
      {/* Szélesség visszavéve lg:w-[170px]-re, padding csökkentve lg:pr-4-re */}
      <aside className="w-full lg:w-[170px] shrink-0 flex flex-col gap-4 lg:border-r lg:border-neutral-800 lg:pr-4 lg:min-h-[calc(100vh-8rem)]">
        
        <div>
          {/* Cím kisebb (text-lg), leírás csak 1 soros (line-clamp-1) */}
          <h1 className="text-lg font-bold text-white tracking-tight leading-tight line-clamp-2">{project.name}</h1>
          <p className="text-[11px] text-neutral-500 mt-1 line-clamp-1" title={project.description}>
            {project.description}
          </p>
        </div>

        <nav className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {tabs.map((tab) => {
            const isActiveTab = tab.href === `/projects/${projectId}` 
              ? pathname === tab.href 
              : pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.name}
                href={tab.href}
                // Asztali nézeten kompaktabb belső margók (lg:px-2.5 lg:py-1.5) és kisebb betűméret (lg:text-[13px])
                className={`flex items-center gap-2.5 px-4 py-2 lg:px-2.5 lg:py-1.5 text-sm lg:text-[13px] font-medium rounded-lg transition-all whitespace-nowrap snap-start shrink-0 ${
                  isActiveTab
                    ? "bg-sona/10 text-sona border border-sona/20 lg:border-transparent" 
                    : "bg-[#0a0a0a] lg:bg-transparent text-neutral-400 hover:text-neutral-200 border border-neutral-800 lg:border-transparent hover:bg-neutral-800/50"
                }`}
              >
                <tab.icon className="h-4 w-4 shrink-0" />
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 min-w-0">
        {children}
      </main>

    </div>
  );
}