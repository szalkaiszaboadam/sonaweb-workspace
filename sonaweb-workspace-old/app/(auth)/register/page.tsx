"use client";

import React, { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      // Felhasználó mentése a globális users gyűjteménybe
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        createdAt: new Date(),
      });

      await sendEmailVerification(user);
      
      setMessage("Sikeres regisztráció! Kérlek ellenőrizd az email fiókodat a megerősítéshez.");
      
      setTimeout(() => {
        // Később ide jön a /workspaces
        router.push("/");
      }, 3000);

    } catch (err: any) {
      setError(err.message || "Hiba történt a regisztráció során.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] p-4 font-sans">
      <div className="w-full max-w-md bg-[#111111] border border-neutral-800 p-8 rounded-2xl shadow-2xl">
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="SONAWEB" className="h-8 w-auto object-contain" />
        </div>
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Regisztráció</h2>
        
        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-4 text-sm">{error}</div>}
        {message && <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-3 rounded-xl mb-4 text-sm">{message}</div>}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Teljes név</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sona transition-colors" 
              placeholder="Vezeték- és keresztnév"
            />
          </div>
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
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Jelszó</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              minLength={6}
              className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sona transition-colors" 
              placeholder="Legalább 6 karakter"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-sona hover:bg-sona-hover text-white py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 mt-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Fiók létrehozása"}
          </button>
        </form>
        
        <p className="mt-6 text-sm text-center text-neutral-500">
          Már van fiókod? <Link href="/login" className="text-white hover:text-sona transition-colors font-medium">Lépj be itt</Link>
        </p>
      </div>
    </div>
  );
}