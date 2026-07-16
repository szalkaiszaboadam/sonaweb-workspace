// app/(dashboard)/layout.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { useWorkspace } from "@/context/WorkspaceContext"; // BEIMPORTÁLTUK A WORKSPACE CONTEXT-ET
import { useTimer } from "@/context/TimerContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { LogOut, LayoutDashboard, Clock, UserCircle, ListTodo, Building2, ArrowLeftRight } from "lucide-react"; // BEHOZTUNK KÉT ÚJ IKONT
import GlobalTimer from "@/components/GlobalTimer";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { activeWorkspace } = useWorkspace(); // LEKÉRJÜK AZ AKTÍV WORKSPACE-T
  const { isActive, seconds } = useTimer();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith('/projects/')) return;

    let baseTitle = "Workspace";
    if (pathname === '/') baseTitle = "Központ";
    if (pathname === '/tasks') baseTitle = "Minden feladat";
    if (pathname === '/global-time') baseTitle = "Munkanapló";

    if (isActive) {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      
      let timeStr = "";
      if (h > 0) timeStr = `${h}ó ${m}p ${s}mp`;
      else if (m > 0) timeStr = `${m}p ${s}mp`;
      else timeStr = `${s}mp`;

      document.title = `${timeStr} | ${baseTitle} | SONAWEB`;
    } else {
      document.title = `${baseTitle} | SONAWEB Workspace`;
    }
  }, [pathname, isActive, seconds]);

  const handleLogout = async () => {
    try {
      // 1. LÉPÉS: TÖRLÜK A MEGJEGYZETT WORKSPACE-T A BÖNGÉSZŐBŐL
      localStorage.removeItem("active_workspace");
      
      // 2. LÉPÉS: KIJELENTKEZÉS A FIREBASE-BŐL
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Hiba a kijelentkezéskor", error);
    }
  };

const navItems = [
    { name: "Központ", href: "/", icon: LayoutDashboard },
    { name: "Minden feladat", href: "/tasks", icon: ListTodo },
    { name: "Munkanapló", href: "/global-time", icon: Clock },
  ];

  // IDE ILLESZD BE EZT A 3 SORT:
  if (!activeWorkspace) {
    return <div className="min-h-screen bg-[#050505]"></div>; // Teljesen fekete képernyő a másodperc töredékéig az átirányítás alatt
  }

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 flex flex-col font-sans">
      
      {/* FELSŐ NAVIGÁCIÓS SÁV */}
      <header className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-[#0a0a0a]/90 backdrop-blur-md">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6 max-w-[1800px] mx-auto w-full">
          
          <div className="flex items-center gap-6 md:gap-10">
            
            {/* LOGÓ ÉS WORKSPACE VÁLTÓ SZEKCIÓ */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3 group shrink-0">
                <img src="/logo.png" alt="SONAWEB" className="h-5 w-auto object-contain transition-opacity group-hover:opacity-80" />
              </Link>

              {/* Ha van betöltve workspace, kiírjuk a nevét és adunk egy váltás gombot */}
              {activeWorkspace && (
                <div className="flex items-center gap-2 pl-3 border-l border-neutral-800">
                  <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#111111] border border-neutral-800 rounded-md">
                    <Building2 className="w-3.5 h-3.5 text-sona" />
                    <span className="text-xs font-semibold text-neutral-300 truncate max-w-[100px] lg:max-w-[180px]">
                      {activeWorkspace.name}
                    </span>
                  </div>
                  <Link 
                    href="/workspaces" 
                    className="p-1.5 bg-neutral-800/50 hover:bg-neutral-700 rounded-md text-neutral-400 hover:text-white transition-colors flex items-center justify-center"
                    title="Munkaterület váltása"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>

            {/* Asztali menü */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActiveMenu = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      isActiveMenu 
                        ? "bg-sona/10 text-sona" 
                        : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-neutral-400 border-r border-neutral-800 pr-4">
              <UserCircle className="h-5 w-5" />
              {user?.displayName || user?.email?.split('@')[0]}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center p-2 rounded-xl text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Kijelentkezés"
            >
              <LogOut className="h-5 w-5" />
              <span className="hidden sm:inline ml-2 text-sm font-medium">Kilépés</span>
            </button>
          </div>
        </div>
      </header>

      {/* FŐ TARTALOM (Mobilon kap egy extra alsó paddingot a menü miatt) */}
      <main className="flex-1 w-full max-w-[1800px] mx-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
        {children}
      </main>

      {/* MOBIL ALSÓ NAVIGÁCIÓ (Csak telefonon látszik) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-neutral-800 z-50 flex items-center justify-around pb-safe">
        {navItems.map((item) => {
          const isActiveMenu = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 w-full py-3 transition-colors ${
                isActiveMenu ? "text-sona" : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActiveMenu ? "fill-sona/20" : ""}`} />
              <span className="text-[10px] font-medium mt-0.5">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <GlobalTimer />
    </div>
  );
}