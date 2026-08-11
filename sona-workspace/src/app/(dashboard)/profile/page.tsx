import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ProfileForm } from './components/ProfileForm'
import { TopNavbar } from '@/components/layout/TopNavbar'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-background flex flex-col w-full">
      
      {/* Teljesen "tiszta" Navbar */}
      <TopNavbar 
        userEmail={user.email || ''}
        userName={user.user_metadata?.name}
        userAvatar={user.user_metadata?.avatar_url}
      />

      <main className="flex-1 w-full overflow-y-auto p-4 md:p-8">
        <div className="max-w-3xl mx-auto w-full flex flex-col gap-10 pb-20 mt-4 md:mt-8">
          
          <div>
            {/* ÚJ VISSZA GOMB POZÍCIÓ */}
            <Link 
              href="/workspaces" 
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-sona-neutral hover:text-foreground transition-colors mb-6 -ml-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Vissza a munkaterületekre
            </Link>

            <div className="flex flex-col gap-2 border-b border-border pb-6">
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Beállítások</h1>
              <p className="text-sona-neutral font-medium">Kezeld a személyes fiókod adatait.</p>
            </div>
          </div>

          <section className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-6">Fiók adatai</h2>
            <ProfileForm user={user} />
          </section>
          
        </div>
      </main>

    </div>
  )
}