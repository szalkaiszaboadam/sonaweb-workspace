// app/(dashboard)/projects/[projectId]/settings/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Save, Trash2, Loader2, AlertTriangle } from "lucide-react";

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  // Projekt jelenlegi adatainak betöltése az űrlaphoz
  useEffect(() => {
    if (!projectId) return;

    const fetchProjectData = async () => {
      try {
        const docRef = doc(db, "projects", projectId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || "");
          setDescription(data.description || "");
        }
      } catch (error) {
        console.error("Hiba a projekt adatainak betöltésekor:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]);

  // Adatok módosításának mentése
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      const docRef = doc(db, "projects", projectId);
      await updateDoc(docRef, {
        name: name.trim(),
        description: description.trim(),
      });
      
      // Rövid vizuális visszajelzés
      setTimeout(() => setIsSaving(false), 500);
    } catch (error) {
      console.error("Hiba a mentés során:", error);
      setIsSaving(false);
    }
  };

  // A projekt és az összes kapcsolódó adat (feladatok, dokumentumok stb.) törlése
  const handleDeleteProject = async () => {
    if (deleteConfirm !== name) return;

    setIsDeleting(true);
    try {
      // 1. Kapcsolódó feladatok (tasks) törlése
      const tasksQuery = query(collection(db, "tasks"), where("projectId", "==", projectId));
      const tasksSnapshot = await getDocs(tasksQuery);
      const taskDeletePromises = tasksSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(taskDeletePromises);

      // 2. Kapcsolódó dokumentumok (pages) törlése
      const pagesQuery = query(collection(db, "pages"), where("projectId", "==", projectId));
      const pagesSnapshot = await getDocs(pagesQuery);
      const pageDeletePromises = pagesSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(pageDeletePromises);

      // 3. Kapcsolódó időmérések (time_entries) törlése
      const timeQuery = query(collection(db, "time_entries"), where("projectId", "==", projectId));
      const timeSnapshot = await getDocs(timeQuery);
      const timeDeletePromises = timeSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(timeDeletePromises);

      // 4. Maga a projekt dokumentum törlése
      await deleteDoc(doc(db, "projects", projectId));

      // Visszairányítás a főoldalra
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Hiba a projekt törlésekor:", error);
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-sona animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6 pt-4">
      
      {/* Általános beállítások kártya */}
      <div className="rounded-2xl border border-neutral-800 bg-[#111111] p-6 shadow-sm">
        <h3 className="text-base font-semibold text-white mb-4">Projekt adatai</h3>
        
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-neutral-400">Projekt neve</label>
            <input
              type="text"
              required
              className="mt-1.5 w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] px-4 py-2.5 text-sm text-white focus:border-sona focus:outline-none focus:ring-1 focus:ring-sona transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-400">Leírás</label>
            <textarea
              rows={4}
              className="mt-1.5 w-full rounded-xl border border-neutral-800 bg-[#0a0a0a] px-4 py-2.5 text-sm text-white focus:border-sona focus:outline-none focus:ring-1 focus:ring-sona transition-all resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="flex items-center gap-2 bg-sona hover:bg-sona-hover text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isSaving ? "Mentés..." : "Módosítások mentése"}
            </button>
          </div>
        </form>
      </div>

      {/* VESZÉLYES ZÓNA KÁRTYA */}
      <div className="rounded-2xl border border-red-900/30 bg-[#111111] p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-red-400">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="text-base font-semibold">Veszélyes zóna</h3>
        </div>
        
        <p className="text-xs text-neutral-400 leading-relaxed">
          A projekt törlésével az összes hozzá tartozó feladat, rögzített időbejegyzés és belső dokumentum véglegesen megsemmisül. Ez a művelet nem vonható vissza.
        </p>

        <div className="pt-2 space-y-3">
          <label className="text-xs font-medium text-neutral-400 block">
            A megerősítéshez gépelje be a projekt pontos nevét: <span className="text-white font-mono bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800 ml-1">{name}</span>
          </label>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Projekt neve..."
              className="flex-1 rounded-xl border border-neutral-800 bg-[#0a0a0a] px-4 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
            />
            
            <button
              type="button"
              disabled={deleteConfirm !== name || isDeleting}
              onClick={handleDeleteProject}
              className="flex items-center justify-center gap-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 hover:border-red-500 px-5 py-2.5 rounded-xl font-medium text-sm transition-all disabled:opacity-30 disabled:hover:bg-red-500/10 disabled:hover:text-red-400 disabled:hover:border-red-500/20 whitespace-nowrap"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Projekt végleges törlése
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}