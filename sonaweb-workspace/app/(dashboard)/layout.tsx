// app/(dashboard)/layout.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { FolderKanban, LogOut, Menu, X } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Hiba a kijelentkezés során:", error);
    }
  };

  // Csak a Projektek menüpont maradt
  const navItems = [
    { name: "Projektek", href: "/", icon: FolderKanban },
  ];

  return (
    <div className="flex min-h-screen bg-black text-gray-100">
      
      {/* Mobil Fejléc */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0a0a0a] border-b border-neutral-800 flex items-center justify-between px-4 z-40">
        {/* Vonalba igazított logó és szöveg (items-center) */}
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="SONAWEB" className="h-4 object-contain" />
          <span className="text-lg font-medium text-neutral-400">Workspace</span>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="text-neutral-400 hover:text-white">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}

      {/* Oldalsáv */}
      <aside 
        className={`fixed inset-y-0 left-0 w-64 border-r border-neutral-800 bg-[#0a0a0a] flex flex-col justify-between p-4 z-50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="space-y-6">
          
          {/* Asztali LOGÓ RÉSZ */}
<div className="hidden md:flex items-center px-2 h-11 border-b border-neutral-800/60 overflow-hidden">
  
  <div className="flex items-center gap-2 min-w-0">

    <img
      src="/logo.png"
      alt="SONAWEB"
      className="h-4 w-auto object-contain shrink-0"
    />

   

    <span className="text-[15px] text-neutral-400 bg-neutral-900/60 px-2 py-[2px] rounded-md border border-neutral-800 whitespace-nowrap shrink-0">
      Workspace
    </span>

  </div>

</div>

          {/* Mobilon a bezáró gomb */}
          <div className="flex md:hidden items-center justify-between px-2 py-4 border-b border-neutral-800">
             <span className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Menü</span>
             <button onClick={() => setIsSidebarOpen(false)} className="text-neutral-400 hover:text-white">
               <X className="h-6 w-6" />
             </button>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                    isActive
                      ? "bg-sona/10 text-sona font-semibold border border-sona/20"
                      : "text-neutral-400 font-medium hover:bg-neutral-900 hover:text-white"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-neutral-800 pt-4 space-y-3">
          <div className="px-2">
            <p className="text-xs text-neutral-600 font-semibold uppercase tracking-wider">Felhasználó</p>
            <p className="text-sm font-medium text-neutral-300 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut className="h-5 w-5" />
            Kijelentkezés
          </button>
        </div>
      </aside>

      <main className="flex-1 w-full md:pl-64 pt-16 md:pt-0">
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}