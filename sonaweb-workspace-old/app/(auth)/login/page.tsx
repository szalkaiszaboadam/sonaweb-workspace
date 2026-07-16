"use client";

import React, { useState } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Később ide jön a /workspaces
      router.push("/");
    } catch (err: any) {
      setError("Hibás email vagy jelszó.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Kérlek írd be az email címedet a jelszó visszaállításához!");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Jelszó-visszaállító email elküldve! Ellenőrizd a fiókodat.");
      setError("");
    } catch (err: any) {
      setError("Hiba történt a jelszó visszaállítása közben.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] p-4 font-sans">
      <div className="w-full max-w-md bg-[#111111] border border-neutral-800 p-8 rounded-2xl shadow-2xl">
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="SONAWEB" className="h-8 w-auto object-contain" />
        </div>
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Bejelentkezés</h2>
        
        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-4 text-sm">{error}</div>}
        {message && <div className="bg-sona/10 border border-sona/50 text-sona p-3 rounded-xl mb-4 text-sm">{message}</div>}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sona transition-colors" 
              placeholder="pelda@sonaweb.hu"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-medium text-neutral-400">Jelszó</label>
              <button type="button" onClick={handleForgotPassword} className="text-xs font-medium text-sona hover:text-sona-hover transition-colors">
                Elfelejtett jelszó?
              </button>
            </div>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sona transition-colors" 
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-sona hover:bg-sona-hover text-white py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 mt-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Belépés a rendszerbe"}
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-neutral-500">
          Nincs még fiókod? <Link href="/register" className="text-white hover:text-sona transition-colors font-medium">Regisztrálj itt</Link>
        </p>
      </div>
    </div>
  );
}