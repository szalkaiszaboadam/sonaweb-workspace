import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Sparkles } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function WelcomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // 🚀 VÉDELEM: Ha már van munkaterülete, AZONNAL kidobjuk innen!
  const { data: memberData } = await supabase
    .from('workspace_members')
    .select('id')
    .eq('user_id', user.id)

  if (memberData && memberData.length > 0) {
    redirect('/workspaces')
  }

  const firstName = user.user_metadata?.name?.split(' ')[0] || 'Kolléga'

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background font-sans relative overflow-hidden p-6">
      
      {/* PRÉMIUM HÁTTÉREFFEKTEK */}
      <div className="absolute inset-0 bg-[radial-gradient(#80808020_1px,transparent_1px)] [background-size:24px_24px] opacity-30 mix-blend-luminosity pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-md flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* KÖZÉPRE ZÁRT LOGÓ */}
        <div className="mb-10 flex justify-center">
          <img src="/sonaweb-workspace-logo-black.png" alt="Sonaweb" className="h-6 w-auto block dark:hidden" />
          <img src="/sonaweb-workspace-logo-white.png" alt="Sonaweb" className="h-6 w-auto hidden dark:block" />
        </div>

        {/* LEBEGŐ KÁRTYA */}
        <div className="bg-surface border border-border rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 shadow-inner border border-primary/20">
            <Sparkles className="w-8 h-8" />
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mb-3">
            Üdvözlünk a fedélzeten, {firstName}!
          </h1>
          <p className="text-sona-neutral font-medium mb-8">
            A fiókod sikeresen elkészült. A következő lépésben létrehozhatod a saját munkaterületedet, vagy csatlakozhatsz egy meglévőhöz.
          </p>

          <Link href="/workspaces" className="w-full">
            <Button className="w-full font-bold py-3 text-base shadow-md shadow-primary/20 hover:shadow-lg transition-all">
              Tovább a munkaterületekre
            </Button>
          </Link>
        </div>

      </div>
    </div>
  )
}