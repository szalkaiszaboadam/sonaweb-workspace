// app/(dashboard)/layout.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LogOut, LayoutDashboard, Clock, ListTodo, UserCircle } from "lucide-react";
import GlobalTimer from "@/components/GlobalTimer";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Hiba a kijelentkezéskor", error);
    }
  };

  // Központi menüpontok (A globális időmérés most csak egy "vak" link, amíg meg nem csináljuk)
  const navItems = [
    { name: "Áttekintés", href: "/", icon: LayoutDashboard },
    { name: "Minden feladat", href: "/tasks", icon: ListTodo }, // ÚJ MENÜPONT
    { name: "Időmérés", href: "/global-time", icon: Clock }, 
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 flex flex-col font-sans">
      
      {/* FELSŐ NAVIGÁCIÓS SÁV (Top Navbar) */}
      <header className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-[#0a0a0a]/90 backdrop-blur-md">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6 max-w-[1800px] mx-auto w-full">
          
         {/* Bal oldal: Logó és Fő linkek */}
          <div className="flex items-center gap-6 md:gap-10">
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              {/* Kisebbre szabott SONAWEB logó (h-5 = 20px magasság) */}
              <img 
                src="/logo.png" 
                alt="SONAWEB" 
                className="h-5 w-auto object-contain transition-opacity group-hover:opacity-80" 
              />
            
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      isActive 
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

          {/* Jobb oldal: Profil és Kijelentkezés */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-neutral-400 border-r border-neutral-800 pr-4">
              <UserCircle className="h-5 w-5" />
              {user?.displayName || user?.email?.split('@')[0]}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-neutral-400 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10"
              title="Kijelentkezés"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Kilépés</span>
            </button>
          </div>
        </div>
      </header>

      {/* FŐ TARTALOM (Kiszabadítva az oldalsáv rabságából!) */}
      <main className="flex-1 w-full max-w-[1800px] mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* A Globális Lebegő Időmérőnk */}
      <GlobalTimer />
    </div>
  );
}