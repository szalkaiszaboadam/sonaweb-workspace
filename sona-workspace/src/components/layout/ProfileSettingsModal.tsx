'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Avatar'
import { Input } from '@/components/ui/Input'
import { updateProfilePassword, uploadAvatar } from './profile-actions' // 🚀 Új import útvonal
import { Camera, Loader2, Lock, Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'

type Props = {
    isOpen: boolean
    onClose: () => void
    email: string
    name?: string
    avatarUrl?: string
}

export function ProfileSettingsModal({ isOpen, onClose, email, name, avatarUrl }: Props) {
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [localAvatar, setLocalAvatar] = useState<string | null>(avatarUrl || null)
    const [isUploading, setIsUploading] = useState(false)

    // 🚀 Új State-ek a két jelszóhoz
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [isSavingPass, setIsSavingPass] = useState(false)
    const [passMsg, setPassMsg] = useState({ type: '', text: '' })

    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => { setMounted(true) }, [])

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
            setLocalAvatar(result.avatar_url)
            router.refresh()
        }
        setIsUploading(false)
    }

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSavingPass(true)
        setPassMsg({ type: '', text: '' })
        
        const formData = new FormData()
        formData.append('currentPassword', currentPassword)
        formData.append('newPassword', newPassword)

        const result = await updateProfilePassword(formData)
        
        if (result.error) {
            setPassMsg({ type: 'error', text: result.error })
        } else {
            setPassMsg({ type: 'success', text: 'Jelszó sikeresen frissítve!' })
            setCurrentPassword('')
            setNewPassword('')
        }
        setIsSavingPass(false)
    }

    const displayName = name || email.split('@')[0]

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Profil beállítások">
            <div className="flex flex-col gap-8 pt-2 max-h-[75vh] overflow-y-auto px-1 pb-4 no-scrollbar">
                
                {/* AVATAR ÉS NÉV */}
                <div className="flex flex-col items-center gap-3">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <Avatar name={displayName} url={localAvatar} className="w-20 h-20 text-2xl shadow-sm" />
                        <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                            {isUploading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Camera className="w-5 h-5 text-white" />}
                        </div>
                        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} disabled={isUploading} />
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-bold text-foreground">{displayName}</h3>
                        <p className="text-sm text-sona-neutral">{email}</p>
                    </div>
                </div>

                {/* TÉMAVÁLASZTÓ */}
                {mounted && (
                    <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-bold text-sona-neutral uppercase tracking-wider">Megjelenés</label>
                        <div className="flex items-center gap-2 bg-sona-neutral/5 p-1.5 rounded-xl border border-border/50">
                            <button onClick={() => setTheme('light')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[13px] font-medium transition-colors ${theme === 'light' ? 'bg-surface text-foreground shadow-sm border border-border/50' : 'text-sona-neutral hover:text-foreground hover:bg-sona-neutral/10'}`}>
                                <Sun className="w-4 h-4" /> Világos
                            </button>
                            <button onClick={() => setTheme('dark')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[13px] font-medium transition-colors ${theme === 'dark' ? 'bg-surface text-foreground shadow-sm border border-border/50' : 'text-sona-neutral hover:text-foreground hover:bg-sona-neutral/10'}`}>
                                <Moon className="w-4 h-4" /> Sötét
                            </button>
                            <button onClick={() => setTheme('system')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[13px] font-medium transition-colors ${theme === 'system' ? 'bg-surface text-foreground shadow-sm border border-border/50' : 'text-sona-neutral hover:text-foreground hover:bg-sona-neutral/10'}`}>
                                <Monitor className="w-4 h-4" /> Auto
                            </button>
                        </div>
                    </div>
                )}

                {/* JELSZÓCSERE */}
                <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-bold text-sona-neutral uppercase tracking-wider">Biztonság</label>
                    <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4 p-5 bg-sona-neutral/5 border border-border/50 rounded-xl">
                        
                        {/* 🚀 Régi jelszó */}
                        <Input 
                            label="Jelenlegi jelszó" 
                            type="password" 
                            value={currentPassword} 
                            onChange={(e) => setCurrentPassword(e.target.value)} 
                            required 
                        />
                        
                        {/* 🚀 Új jelszó */}
                        <Input 
                            label="Új jelszó" 
                            type="password" 
                            value={newPassword} 
                            onChange={(e) => setNewPassword(e.target.value)} 
                            required 
                            placeholder="Legalább 6 karakter" 
                            minLength={6} 
                        />

                        {passMsg.text && (
                            <p className={`text-[13px] p-3 rounded-lg border font-medium mt-1 ${passMsg.type === 'error' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
                                {passMsg.text}
                            </p>
                        )}
                        
                        <button 
                            type="submit" 
                            disabled={isSavingPass || !currentPassword || !newPassword} 
                            className="mt-2 inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-foreground text-background font-medium text-[13px] rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            {isSavingPass ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                            Jelszó frissítése
                        </button>
                    </form>
                </div>

            </div>
        </Modal>
    )
}