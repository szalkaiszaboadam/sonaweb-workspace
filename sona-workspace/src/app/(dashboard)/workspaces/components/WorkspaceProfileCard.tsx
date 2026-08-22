'use client'

import { useState } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { LogOut, Settings } from 'lucide-react'
import { logout } from '@/app/(auth)/actions'
import { ProfileSettingsModal } from '@/components/layout/ProfileSettingsModal'

export function WorkspaceProfileCard({ user }: { user: any }) {
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
    const displayName = user.user_metadata?.name || user.email?.split('@')[0] || 'Felhasználó'

    return (
        <>
            {/* 🚀 JAVÍTÁS: Levettük a margót és az árnyékot, hogy szerves része legyen a fő kártyának! */}
            <div className="w-full bg-sona-neutral/5 border border-border/60 rounded-[16px] p-4 flex items-center justify-between mb-2">
                <div className="flex items-center gap-4 min-w-0">
                    <Avatar name={displayName} url={user.user_metadata?.avatar_url} className="w-11 h-11 text-lg border-border shadow-sm" />
                    <div className="flex flex-col min-w-0 pr-2">
                        <span className="text-[10px] font-bold text-sona-neutral uppercase tracking-wider mb-0.5">
                            Bejelentkezve mint
                        </span>
                        <span className="text-[15px] font-bold text-foreground truncate leading-tight">
                            {displayName}
                        </span>
                        <span className="text-[12px] font-medium text-sona-neutral truncate">
                            {user.email}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => setIsProfileModalOpen(true)} className="w-9 h-9 flex items-center justify-center rounded-full bg-background border border-border/40 text-sona-neutral hover:text-foreground hover:bg-sona-neutral/10 transition-colors shrink-0 shadow-sm" title="Beállítások">
                        <Settings className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                    <form action={logout}>
                        <button type="submit" className="w-9 h-9 flex items-center justify-center rounded-full bg-background border border-border/40 text-sona-neutral hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20 transition-colors shrink-0 shadow-sm" title="Kijelentkezés">
                            <LogOut className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                    </form>
                </div>
            </div>

            <ProfileSettingsModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                email={user.email}
                name={user.user_metadata?.name}
                avatarUrl={user.user_metadata?.avatar_url}
            />
        </>
    )
}