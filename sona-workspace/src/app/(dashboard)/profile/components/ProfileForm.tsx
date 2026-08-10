'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { updateProfilePassword, uploadAvatar } from '../actions'
import { Camera, Check, Loader2, Lock } from 'lucide-react'

export function ProfileForm({ user }: { user: any }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.user_metadata?.avatar_url || null)
  const [isUploading, setIsUploading] = useState(false)
  
  const [password, setPassword] = useState('')
  const [isSavingPass, setIsSavingPass] = useState(false)
  const [passMsg, setPassMsg] = useState({ type: '', text: '' })

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert('A kép maximum 5MB lehet.')
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append('avatar', file)

    const result = await uploadAvatar(formData)
    if (result.error) {
      alert(result.error)
    } else if (result.avatar_url) {
      setAvatarUrl(result.avatar_url)
      router.refresh()
    }
    setIsUploading(false)
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingPass(true)
    setPassMsg({ type: '', text: '' })

    const formData = new FormData()
    formData.append('password', password)

    const result = await updateProfilePassword(formData)
    if (result.error) {
      setPassMsg({ type: 'error', text: result.error })
    } else {
      setPassMsg({ type: 'success', text: 'Jelszó sikeresen frissítve!' })
      setPassword('')
    }
    setIsSavingPass(false)
  }

  const name = user.user_metadata?.name || user.email?.split('@')[0]

  return (
    <div className="flex flex-col gap-8">
      {/* PROFILKÉP SZEKCIÓ */}
      <section className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex items-center gap-6">
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <Avatar name={name} url={avatarUrl} className="w-24 h-24 text-2xl" />
          <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
            {isUploading ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Camera className="w-6 h-6 text-white" />}
          </div>
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} disabled={isUploading} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">{name}</h2>
          <p className="text-sm text-sona-neutral">{user.email}</p>
          <button onClick={() => fileInputRef.current?.click()} className="mt-2 text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
            Kép módosítása
          </button>
        </div>
      </section>

      {/* JELSZÓ SZEKCIÓ */}
      <section className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-border bg-sona-neutral/5 flex items-center gap-2">
          <Lock className="w-5 h-5 text-sona-neutral" />
          <h2 className="text-base font-semibold text-foreground">Jelszó módosítása</h2>
        </div>
        <form onSubmit={handlePasswordSubmit} className="p-6 flex flex-col gap-4 max-w-xl">
          <Input label="Új jelszó" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" minLength={6} />
          {passMsg.text && (
            <p className={`text-sm p-3 rounded-lg border ${passMsg.type === 'error' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
              {passMsg.text}
            </p>
          )}
          <div className="flex justify-start mt-2">
            <Button type="submit" disabled={isSavingPass || !password} className="w-auto gap-2">
              {isSavingPass ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Mentés
            </Button>
          </div>
        </form>
      </section>
    </div>
  )
}