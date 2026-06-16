// app/(dashboard)/projects/[projectId]/docs/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { FileText, Plus, Trash2, Save, Loader2, FilePenLine } from "lucide-react";
import { Page } from "@/types";
import RichTextEditor from "@/components/editor/RichTextEditor";

export default function DocsPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { user } = useAuth();

  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePageId, setActivePageId] = useState<string | null>(null);

  // A szerkesztő lokális állapotai
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Adatok betöltése
  useEffect(() => {
    if (!projectId) return;

    // Csak a projektre szűrünk, a rendezést lejjebb kliens oldalon végezzük (Így nem kér indexet a Firebase)
    const q = query(collection(db, "pages"), where("projectId", "==", projectId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Page[];
      
      // Rendezés: Legutóbb frissített elöl
      fetchedPages.sort((a, b) => {
        const timeA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0;
        const timeB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0;
        return timeB - timeA;
      });

      setPages(fetchedPages);
      setLoading(false);

      // Ha nincs aktív oldal, de vannak lapok, automatikusan megnyitjuk a legelsőt
      if (!activePageId && fetchedPages.length > 0) {
        setActivePageId(fetchedPages[0].id);
      }
    });

    return () => unsubscribe();
  }, [projectId]);

  // Ha az aktív lap megváltozik, betöltjük az adatokat a szerkesztő állapotába
  useEffect(() => {
    if (activePageId) {
      const activePage = pages.find((p) => p.id === activePageId);
      if (activePage) {
        setEditTitle(activePage.title);
        setEditContent(activePage.content);
      }
    } else {
      setEditTitle("");
      setEditContent("");
    }
  }, [activePageId, pages]);

  // Új dokumentum létrehozása
  const handleCreatePage = async () => {
    try {
      const docRef = await addDoc(collection(db, "pages"), {
        projectId,
        title: "Névtelen dokumentum",
        content: "",
        lastEditedBy: user?.displayName || user?.email || "Ismeretlen",
        updatedAt: serverTimestamp(),
      });
      // Azonnal aktívvá tesszük az új lapot
      setActivePageId(docRef.id);
    } catch (error) {
      console.error("Hiba a dokumentum létrehozásakor:", error);
    }
  };

  // Aktuális dokumentum mentése
  const handleSavePage = async () => {
    if (!activePageId) return;
    setIsSaving(true);
    
    try {
      await updateDoc(doc(db, "pages", activePageId), {
        title: editTitle || "Névtelen dokumentum",
        content: editContent,
        lastEditedBy: user?.displayName || user?.email || "Ismeretlen",
        updatedAt: serverTimestamp(),
      });
      // Pici vizuális késleltetés a "Mentve" gombhoz
      setTimeout(() => setIsSaving(false), 500);
    } catch (error) {
      console.error("Hiba a dokumentum mentésekor:", error);
      setIsSaving(false);
    }
  };

  // Dokumentum törlése
  const handleDeletePage = async () => {
    if (!activePageId) return;
    if (!confirm("Biztosan törölni szeretné ezt a dokumentumot? Ez a művelet nem vonható vissza.")) return;
    
    try {
      await deleteDoc(doc(db, "pages", activePageId));
      setActivePageId(null);
    } catch (error) {
      console.error("Hiba a dokumentum törlésekor:", error);
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
    <div className="flex flex-col md:flex-row h-[calc(100vh-10rem)] gap-6 pt-4">
      
      {/* BAL OLDAL: Dokumentumok Listája (Sidebar) */}
      <div className="w-full md:w-64 flex flex-col bg-[#0a0a0a] border border-neutral-800 rounded-2xl overflow-hidden shrink-0">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-[#111111]">
          <h2 className="text-sm font-semibold text-neutral-300">Dokumentumok</h2>
          <button 
            onClick={handleCreatePage}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md transition-all"
            title="Új dokumentum"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {pages.length === 0 ? (
            <div className="text-center p-4 mt-4">
              <FileText className="h-6 w-6 text-neutral-700 mx-auto mb-2" />
              <p className="text-xs text-neutral-500">Nincs még dokumentum.</p>
            </div>
          ) : (
            pages.map((page) => (
              <button
                key={page.id}
                onClick={() => setActivePageId(page.id)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-sm transition-all ${
                  activePageId === page.id
                    ? "bg-sona/10 text-sona font-medium"
                    : "text-neutral-400 hover:bg-[#111111] hover:text-white"
                }`}
              >
                <FileText className="h-4 w-4 shrink-0" />
                <span className="truncate">{page.title}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* JOBB OLDAL: Dokumentum Szerkesztő */}
      <div className="flex-1 flex flex-col bg-[#111111] border border-neutral-800 rounded-2xl overflow-hidden">
        {!activePageId ? (
          // Üres állapot, ha nincs kiválasztva semmi
          <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 p-8 text-center">
            <FilePenLine className="h-12 w-12 text-neutral-800 mb-4" />
            <h3 className="text-base font-medium text-neutral-300 mb-1">Válasszon egy dokumentumot</h3>
            <p className="text-sm">Vagy hozzon létre egy újat a bal oldali panelen.</p>
          </div>
        ) : (
          // Aktív Szerkesztő
          <div className="flex-1 flex flex-col h-full">
            {/* Szerkesztő Fejléc (Mentés és Törlés gombokkal) */}
            <div className="flex items-center justify-end gap-3 p-4 border-b border-neutral-800 bg-[#111111]">
              {/*<div className="text-xs text-neutral-500 mr-auto hidden sm:block">
                Szerkeszti: <span className="text-neutral-300">{user?.email}</span>
              </div>*/}ß
              <button
                onClick={handleDeletePage}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-red-400 hover:text-white hover:bg-red-500 rounded-lg transition-colors border border-red-500/20 hover:border-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Törlés</span>
              </button>
              <button
                onClick={handleSavePage}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-1.5 text-xs font-medium text-white bg-sona hover:bg-sona-hover rounded-lg transition-colors disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                {isSaving ? "Mentés..." : "Mentés"}
              </button>
            </div>

            {/* Szövegszerkesztő Terület */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
              <div className="max-w-3xl mx-auto space-y-6">
                {/* Cím beviteli mező */}
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Névtelen dokumentum"
                  className="w-full bg-transparent text-3xl font-bold text-white placeholder-neutral-700 border-none focus:ring-0 px-0 outline-none"
                />
                
                {/* Tiptap Univerzális Szerkesztő */}
                <RichTextEditor 
                  value={editContent} 
                  onChange={setEditContent} 
                  placeholder="Kezdje el gépelni a dokumentum tartalmát (használjon formázásokat, listákat...)"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}