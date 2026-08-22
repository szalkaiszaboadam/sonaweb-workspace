import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Sparkles, ArrowRight } from 'lucide-react'

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
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-4 sm:p-8 font-sans selection:bg-primary/20 relative">
      
      <main className="w-full max-w-[440px] flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
        
        {/* 🚀 LOGÓ A KÁRTYA FELETT */}
        <div className="mb-8 flex items-center justify-center">
          <img 
            src="/sonaweb-workspace-logo-black.png" 
            alt="SONA Workspace" 
            className="h-6 sm:h-8 w-auto block [.dark_&]:hidden" 
          />
          <img 
            src="/sonaweb-workspace-logo-white.png" 
            alt="SONA Workspace" 
            className="h-6 sm:h-8 w-auto hidden [.dark_&]:block" 
          />
        </div>

        {/* 🚀 FŐ KÁRTYA */}
        <div className="w-full bg-surface border border-border/60 rounded-[24px] shadow-xl p-8 sm:p-10 flex flex-col items-center text-center">
          
          <div className="w-16 h-16 bg-primary/10 rounded-[18px] flex items-center justify-center text-primary mb-6 border border-primary/15 shadow-sm">
            <Sparkles className="w-8 h-8" strokeWidth={1.5} />
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mb-3">
            Üdv a fedélzeten, {firstName}!
          </h1>
          
          <p className="text-[15px] text-sona-neutral font-medium mb-10 leading-relaxed max-w-[320px]">
            A fiókod sikeresen elkészült. A következő lépésben létrehozhatod a saját munkaterületedet, vagy csatlakozhatsz egy meglévőhöz.
          </p>

          <Link href="/workspaces" className="w-full outline-none">
            <Button className="w-full flex items-center justify-center gap-2 font-semibold py-3 rounded-xl shadow-sm active:scale-[0.98] transition-all">
              Tovább a munkaterületekre
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

      </main>
    </div>
  )
}