// app/(dashboard)/projects/[projectId]/layout.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Project } from "@/types";
import { LayoutDashboard, KanbanSquare, FileText, Clock, Settings, Loader2 } from "lucide-react";

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const projectId = params.projectId as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // Projekt adatainak valós idejű betöltése
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

  // A projekt belső aloldalainak definíciója
  const tabs = [
    { name: "Áttekintés", href: `/projects/${projectId}`, icon: LayoutDashboard },
    { name: "Feladatok", href: `/projects/${projectId}/tasks`, icon: KanbanSquare },
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
    <div className="space-y-6">
      {/* Projekt Fejléc */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{project.name}</h1>
        <p className="text-sm text-neutral-500 mt-1">{project.description}</p>
      </div>

      {/* Vízszintes navigációs fülek (Tabs) */}
      <div className="border-b border-neutral-800">
        <nav className="flex gap-6 overflow-x-auto custom-scrollbar pb-[-1px]">
          {tabs.map((tab) => {
            // Pontos útvonal egyezés vizsgálata a Dashboardhoz, különben a prefix alapján
            const isActive = tab.href === `/projects/${projectId}` 
              ? pathname === tab.href 
              : pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`flex items-center gap-2 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? "border-sona text-sona" // Aktív állapot piros aláhúzással
                    : "border-transparent text-neutral-400 hover:text-neutral-200 hover:border-neutral-700"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Itt fog megjelenni a Feladatok / Dokumetumok / stb. tartalma */}
      <div className="pt-2">
        {children}
      </div>
    </div>
  );
}