import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, User } from 'lucide-react'
import { ProfileForm } from './components/ProfileForm'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

return (
    <div className="max-w-4xl mx-auto w-full p-6 md:p-12 animate-in fade-in duration-500 relative">
      <div className="absolute top-6 right-6 md:top-12 md:right-12">
         <ThemeToggle />
      </div>

      <div className="mb-8">
        <Link href="/workspaces" className="inline-flex items-center gap-1 text-sm font-medium text-sona-neutral hover:text-foreground transition-colors mb-4 -ml-2">
          <ChevronLeft className="w-4 h-4" /> Vissza a Dashboardra
        </Link>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <User className="w-7 h-7" />
          </div>
          Saját Profil
        </h1>
        <p className="text-sm text-sona-neutral mt-2">
          Kezeld a fiókod adatait, a profilképedet és a biztonsági beállításokat. A profilképed minden munkaterületen meg fog jelenni.
        </p>
      </div>

      <ProfileForm user={user} />
    </div>
  )
}