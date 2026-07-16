import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { UserMenu } from '@/components/layout/UserMenu'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Vékonyabb felső sáv: h-16 helyett h-14, és behozzuk a profilmenüt */}
<header className="h-14 border-b border-border bg-surface flex items-center justify-between px-6 z-10">
        <div className="font-bold text-xl text-primary tracking-tight">SONA</div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {/* ÚJ: Átadjuk a nevet is a metaadatokból */}
          <UserMenu 
            email={user.email || ''} 
            name={user.user_metadata?.name} 
          />
        </div>
      </header>

      <main className="flex-1 bg-background flex overflow-hidden">
        {children}
      </main>
    </div>
  )
}