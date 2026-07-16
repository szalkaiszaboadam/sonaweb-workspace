"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";
import { Loader2 } from "lucide-react";

interface Workspace {
  id: string;
  name: string;
  owner: string;
  members: string[];
}

interface WorkspaceContextType {
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (id: string) => void;
  loading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  activeWorkspace: null,
  setActiveWorkspace: () => {},
  loading: true,
});

export const useWorkspace = () => useContext(WorkspaceContext);

export const WorkspaceProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const [activeWorkspace, setActiveWorkspaceState] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ha még tölt az auth, ne csináljunk semmit
    if (authLoading) return;
    
    // Ha a bejelentkezésen, regisztráción vagy a workspace választón vagyunk, 
    // ott nem kötelező a betöltött workspace, így leállítjuk a töltést
    if (pathname.startsWith("/login") || pathname.startsWith("/register") || pathname === "/workspaces") {
        setLoading(false);
        return;
    }

    if (!user) return;

    const loadWorkspace = async () => {
      const storedWorkspaceId = localStorage.getItem("active_workspace");
      
      if (!storedWorkspaceId) {
        // Ha nincs elmentett workspace, menjen a választóba
        router.push("/workspaces");
        return;
      }

      try {
        const docRef = doc(db, "workspaces", storedWorkspaceId);
        const docSnap = await getDoc(docRef);

        // Ellenőrizzük, hogy létezik-e, és a felhasználó tagja-e (biztonság)
        if (docSnap.exists() && docSnap.data().members.includes(user.uid)) {
          setActiveWorkspaceState({ id: docSnap.id, ...docSnap.data() } as Workspace);
        } else {
          // Ha trükközni próbált egy ID-vel, vagy törölték a workspace-t, dobjuk ki
          localStorage.removeItem("active_workspace");
          router.push("/workspaces");
        }
      } catch (error) {
        console.error("Hiba a workspace betöltésekor:", error);
      } finally {
        setLoading(false);
      }
    };

    loadWorkspace();
  }, [user, authLoading, router, pathname]);

  // Ezt a függvényt hívhatjuk meg, ha workspace-t akarunk váltani a beállításokban
  const setActiveWorkspace = (id: string) => {
    localStorage.setItem("active_workspace", id);
    // Újratöltjük az oldalt, hogy minden projekt/feladat az új workspace-hez frissüljön
    window.location.href = "/";
  };

  // Amíg a rendszer a háttérben ellenőrzi a workspace jogosultságot, egy töltőképernyőt mutatunk
  if (loading && !pathname.startsWith("/login") && !pathname.startsWith("/register") && pathname !== "/workspaces") {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-sona animate-spin" />
      </div>
    );
  }

  return (
    <WorkspaceContext.Provider value={{ activeWorkspace, setActiveWorkspace, loading }}>
      {children}
    </WorkspaceContext.Provider>
  );
};