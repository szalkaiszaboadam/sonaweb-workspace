// app/(dashboard)/page.tsx
"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Project } from "@/types";
import Link from "next/link";
import { Folder, Radio } from "lucide-react";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Project[];
      
      setProjects(projectList);
      setLoading(false);
    }, (error) => {
      console.error("Hiba a projektek letöltésekor:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      await addDoc(collection(db, "projects"), {
        name: newProjectName,
        description: newProjectDesc,
        createdAt: serverTimestamp(),
      });

      setNewProjectName("");
      setNewProjectDesc("");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Hiba a projekt létrehozásakor:", error);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-lg md:text-xl font-semibold text-white">Your live projects</h1>
          <div className="flex items-center gap-1 text-sona text-xs font-bold tracking-widest uppercase bg-sona/10 px-2 py-0.5 rounded-md border border-sona/20">
            <Radio className="h-3 w-3" />
            Live
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-sona hover:bg-sona-hover text-white w-full sm:w-auto px-5 py-2.5 rounded-xl font-medium text-sm transition-all text-center"
        >
          Új projekt
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-neutral-500">Projektek betöltése...</div>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-800 p-8 md:p-12 text-center bg-[#0a0a0a]">
          <Folder className="h-10 w-10 text-neutral-600 mx-auto mb-4" />
          <h3 className="text-base font-medium text-neutral-300">Nincs aktív projekt</h3>
          <p className="text-sm text-neutral-500 mt-1">Hozza létre az elsőt a fenti gombbal.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="rounded-2xl border border-neutral-800 bg-[#111111] hover:border-neutral-700 transition-all"
            >
              {/* Projekt Fejléc - A teljes kártya tartalom egyetlen Link lett */}
              <Link 
                href={`/projects/${project.id}`}
                className="group/link flex flex-col sm:flex-row justify-between items-start gap-3 cursor-pointer p-4 md:p-5 w-full h-full"
              >
                <div>
                  <h3 className="text-base font-semibold text-white group-hover/link:text-sona transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                    {project.description || "Nincs megadva leírás."}
                  </p>
                </div>
                <div className="text-[10px] sm:text-xs font-medium text-sona bg-sona/10 px-3 py-1 rounded-full border border-sona/20 shrink-0">
                  In Progress
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="w-full max-w-md bg-[#111111] border border-neutral-800 rounded-2xl p-5 md:p-6 shadow-2xl space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Új projekt</h2>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-neutral-400">Projekt neve</label>
                <input
                  type="text"
                  required
                  className="mt-1.5 w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] px-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:border-sona focus:outline-none focus:ring-1 focus:ring-sona transition-all"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-400">Leírás</label>
                <textarea
                  rows={2}
                  className="mt-1.5 w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] px-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:border-sona focus:outline-none focus:ring-1 focus:ring-sona transition-all resize-none"
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