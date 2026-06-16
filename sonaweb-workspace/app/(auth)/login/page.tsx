// app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

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
      router.refresh(); // Frissítjük a routert, hogy a middleware azonnal érzékelje a sütit
    } catch (err: any) {
      setHiba("Érvénytelen e-mail cím vagy jelszó. Kérjük, próbálja újra.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-gray-800 bg-gray-900 p-8 shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">Workspace</h2>
          <p className="mt-2 text-sm text-gray-400">Jelentkezzen be a rendszer használatához</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {hiba && (
            <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
              {hiba}
            </div>
          )}
          
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">E-mail cím</label>
              <input
                type="email"
                required
                className="mt-1 w-full rounded-xl border border-gray-800 bg-gray-950 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                placeholder="pelda@domain.hu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Jelszó</label>
              <input
                type="password"
                required
                className="mt-1 w-full rounded-xl border border-gray-800 bg-gray-950 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                placeholder="••••••••"
                value={jelszo}
                onChange={(e) => setJelszo(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all disabled:opacity-50"
            >
              {loading ? "Bejelentkezés..." : "Bejelentkezés"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}