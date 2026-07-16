"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase"; // Beimportáltuk az auth-ot is
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { signOut } from "firebase/auth"; // Beimportáltuk a signOut függvényt
import { useAuth } from "@/context/AuthContext";
import { Loader2, Plus, LogIn, Building2, ChevronRight, X, LogOut } from "lucide-react";

// Típusdefiníció a Workspace-hez
interface Workspace {
  id: string;
  name: string;
  owner: string;
}

export default function WorkspacesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

  // Állapotok a modális ablakokhoz (létrehozás / csatlakozás)
  const [showCreate, setShowCreate] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  // Amikor a felhasználó betöltődik, lekérjük a workspace-eket
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchWorkspaces = async () => {
      try {
        const q = query(
          collection(db, "workspaces"),
          where("members", "array-contains", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const fetchedWorkspaces: Workspace[] = [];
        
        querySnapshot.forEach((doc) => {
          fetchedWorkspaces.push({ id: doc.id, ...doc.data() } as Workspace);
        });
        
        setWorkspaces(fetchedWorkspaces);
      } catch (err) {
        console.error("Hiba a munkaterületek lekérésekor:", err);
        setError("Nem sikerült betölteni a munkaterületeket.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, [user, authLoading, router]);

// Kijelentkezés kezelése
  const handleLogout = async () => {
    try {
      // IDE TESZÜK BE: Töröljük a memóriából a workspace-t
      localStorage.removeItem("active_workspace");
      
      await signOut(auth);
      router.push("/login");
    } catch (err) {
      console.error("Hiba a kijelentkezés során:", err);
      setError("Nem sikerült kijelentkezni.");
    }
  };

  // Új Workspace létrehozása
  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim() || !user) return;
    
    setActionLoading(true);
    setError("");

    try {
      const docRef = await addDoc(collection(db, "workspaces"), {
        name: newWorkspaceName,
        owner: user.uid,
        members: [user.uid], // Az alapító automatikusan tag lesz
        createdAt: serverTimestamp(),
      });

      // Létrehozás után egyből kiválasztjuk és belépünk
      handleSelectWorkspace(docRef.id);
    } catch (err) {
      console.error(err);
      setError("Hiba történt a létrehozás során.");
      setActionLoading(false);
    }
  };

  // Workspace kiválasztása (belépés a dashboardra)
  const handleSelectWorkspace = (workspaceId: string) => {
    localStorage.setItem("active_workspace", workspaceId);
    router.push("/");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-sona animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 font-sans">
      <div className="max-w-4xl mx-auto pt-10">
        
        {/* FELSŐ SÁV: Logó, Cím és a Kijelentkezés gomb */}
        <div className="flex items-center justify-between mb-10 border-b border-neutral-900 pb-6">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="SONAWEB" className="h-8 w-auto object-contain" />
            <h1 className="text-2xl font-bold border-l border-neutral-800 pl-4">Munkaterületek</h1>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-850 bg-[#111111]/50 hover:bg-red-500/10 hover:border-red-500/40 text-neutral-400 hover:text-red-400 transition-all text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Kijelentkezés
          </button>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6">{error}</div>}

        <div className="grid md:grid-cols-2 gap-8">
          
          {/* BAL OLDAL: Meglévő munkaterületek listája (ha van) */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-neutral-300 mb-4">
              {workspaces.length > 0 ? "Saját munkaterületeid" : "Nincs még munkaterületed"}
            </h2>
            
            {workspaces.length === 0 ? (
              <div className="bg-[#111111] border border-neutral-800 rounded-2xl p-8 text-center">
                <Building2 className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                <p className="text-neutral-400 text-sm">
                  Jelenleg egyetlen munkaterületnek sem vagy a tagja. Hozz létre egyet, vagy fogadj el egy meghívást a kezdéshez!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => handleSelectWorkspace(ws.id)}
                    className="w-full text-left bg-[#111111] border border-neutral-800 hover:border-sona/50 rounded-2xl p-5 flex items-center justify-between group transition-all"
                  >
                    <div>
                      <h3 className="font-medium text-white group-hover:text-sona transition-colors">{ws.name}</h3>
                      <p className="text-xs text-neutral-500 mt-1">Belépés a projektbe</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-neutral-600 group-hover:text-sona transition-colors" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* JOBB OLDAL: Új létrehozása vagy csatlakozás */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-neutral-300 mb-4">Lehetőségek</h2>
            
            {!showCreate ? (
              <>
                <button 
                  onClick={() => setShowCreate(true)}
                  className="w-full bg-[#111111] border border-neutral-800 hover:border-sona rounded-2xl p-5 flex items-center gap-4 transition-all group"
                >
                  <div className="bg-sona/10 p-3 rounded-xl group-hover:bg-sona transition-colors">
                    <Plus className="w-5 h-5 text-sona group-hover:text-white transition-colors" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-white">Új munkaterület létrehozása</h3>
                    <p className="text-xs text-neutral-500 mt-1">Kezdj egy teljesen új projektet a nulláról</p>
                  </div>
                </button>

                <button className="w-full bg-[#111111] border border-neutral-800 hover:border-blue-500/50 rounded-2xl p-5 flex items-center gap-4 transition-all group">
                  <div className="bg-blue-500/10 p-3 rounded-xl group-hover:bg-blue-500 transition-colors">
                    <LogIn className="w-5 h-5 text-blue-500 group-hover:text-white transition-colors" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-white">Meghívás fogadása</h3>
                    <p className="text-xs text-neutral-500 mt-1">Csatlakozás kóddal egy meglévő csapathoz</p>
                  </div>
                </button>
              </>
            ) : (
              // Létrehozó form
              <div className="bg-[#111111] border border-sona/30 rounded-2xl p-6 relative">
                <button 
                  onClick={() => setShowCreate(false)}
                  className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <h3 className="font-medium text-white mb-4">Adj nevet a munkaterületnek</h3>
                <form onSubmit={handleCreateWorkspace} className="space-y-4">
                  <input
                    type="text"
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    required
                    autoFocus
                    placeholder="Pl.: Céges Projektek, Marketing..."
                    className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-sona transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-2 bg-sona hover:bg-sona-hover text-white py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Létrehozás és belépés"}
                  </button>
                </form>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}