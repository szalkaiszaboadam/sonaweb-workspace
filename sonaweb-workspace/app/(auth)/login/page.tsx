// app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Mail } from "lucide-react";

import Logo from '@/public/logo.png'; // Ha az alias be van állítva
// Vagy relatív útvonallal:

import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [jelszo, setJelszo] = useState("");
  const [hiba, setHiba] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setHiba("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, jelszo);
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setHiba("A belépési adatok nem megfelelőek.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] px-4">
      <div className="w-full max-w-sm space-y-8 rounded-2xl border border-neutral-800 bg-[#0a0a0a] p-8 shadow-2xl">
        <div className="text-center">
<Image src={Logo} alt="SONAWEB" />
          
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {hiba && (
            <div className="rounded-lg bg-red-950/20 p-3 text-sm text-red-400 border border-red-900/50 flex items-center gap-2">
              <span className="text-lg">!</span> {hiba}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="relative">
              <label className="text-[10px] font-bold text-neutral-500 uppercase ml-1">E-mail cím</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-neutral-600" />
                <input
                  type="email"
                  required
                  className="w-full rounded-xl border border-neutral-800 bg-[#050505] pl-10 pr-4 py-3 text-white text-sm focus:border-sona focus:outline-none focus:ring-1 focus:ring-sona transition-all"
                  placeholder="admin@teszt.hu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            <div className="relative">
              <label className="text-[10px] font-bold text-neutral-500 uppercase ml-1">Jelszó</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-neutral-600" />
                <input
                  type="password"
                  required
                  className="w-full rounded-xl border border-neutral-800 bg-[#050505] pl-10 pr-4 py-3 text-white text-sm focus:border-sona focus:outline-none focus:ring-1 focus:ring-sona transition-all"
                  placeholder="••••••••"
                  value={jelszo}
                  onChange={(e) => setJelszo(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-sona px-4 py-3 text-sm font-semibold text-white hover:bg-sona-hover focus:outline-none focus:ring-2 focus:ring-sona focus:ring-offset-2 focus:ring-offset-[#0a0a0a] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Belépés...</> : "Bejelentkezés"}
          </button>
        </form>
      </div>
    </div>
  );
}