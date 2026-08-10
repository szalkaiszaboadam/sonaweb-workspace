import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Users, Shield } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'

// 1. Definiáljuk a pontos típust a TypeScript számára
type Member = {
  id: string
  email: string
  name: string
  role: string
  avatar_url?: string // Biztosítsd, hogy ez benne van!
}

export default async function TeamPage({
  params
}: {
  params: Promise<{ workspaceId: string }>
}) {
  const { workspaceId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membersData } = await supabase.rpc('get_workspace_users', { ws_id: workspaceId })
  
  // 2. Itt rákényszerítjük a Member[] típust a változóra
const members: Member[] = membersData?.map((m: any) => ({
    id: m.user_id,
    email: m.email,
    name: m.name || m.email.split('@')[0],
    role: m.role || 'member',
    avatar_url: m.avatar_url // <--- ÚJ SOR
  })) || []


  return (
    <div className="p-4 sm:p-6 md:p-8 w-full flex flex-col gap-6 animate-in fade-in duration-500">
      
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <Users className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          Csapat áttekintése
        </h1>
        <p className="text-sm text-sona-neutral mt-2 max-w-2xl">
          Tekintsd meg a sonaweb munkaterületen dolgozó aktív tagokat. A jogosultságok, a munkacsoportok és a csapat kezelése a Beállítások menüben található.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-2">
        {/* 3. A TypeScript innentől tudja, hogy a member az egy Member típusú objektum */}
        {members.map((member) => (
          <div key={member.id} className="bg-surface border border-border rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md hover:border-primary/30 transition-all">
            <Avatar 
            name={member.name} 
            url={member.avatar_url} 
            className="w-12 h-12 text-lg" 
            fallbackClass={member.role === 'owner' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 'bg-primary/10 text-primary border-primary/20'} 
          />
          
            <div className="flex flex-col overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground truncate">{member.name}</span>
                {member.role === 'owner' && <Shield className="w-3.5 h-3.5 text-orange-500 shrink-0" />}
              </div>
              <span className="text-xs text-sona-neutral truncate">{member.email}</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider mt-1.5 w-fit px-2 py-0.5 rounded-md ${member.role === 'owner' ? 'bg-orange-500/10 text-orange-500' : 'bg-sona-neutral/10 text-sona-neutral'}`}>
                {member.role === 'owner' ? 'Tulajdonos' : 'Tag'}
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}