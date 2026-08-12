import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ArrowLeft } from 'lucide-react'
// import { resetPassword } from '../actions' // <-- Használd a saját actionödet a jelszó visszaállításra!

export const dynamic = 'force-dynamic'

export default async function ForgotPasswordPage(props: { searchParams: Promise<{ error?: string, message?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/workspaces')

  const searchParams = await props.searchParams

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background font-sans relative overflow-hidden p-6">
      
      <div className="absolute inset-0 bg-[radial-gradient(#80808020_1px,transparent_1px)] [background-size:24px_24px] opacity-30 mix-blend-luminosity pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-md flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <div className="mb-10 flex justify-center">
          <img src="/sonaweb-workspace-logo-black.png" alt="Sonaweb" className="h-6 w-auto block dark:hidden" />
          <img src="/sonaweb-workspace-logo-white.png" alt="Sonaweb" className="h-6 w-auto hidden dark:block" />
        </div>

        <div className="bg-surface border border-border rounded-3xl p-8 sm:p-10 shadow-xl">
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight mb-2">Elfelejtetted a jelszavad?</h1>
          <p className="text-sona-neutral font-medium mb-8 text-sm">
            Add meg az e-mail címedet, és küldünk egy linket a jelszavad visszaállításához.
          </p>

          <form className="flex flex-col gap-5"> {/* action={resetPassword} */}
            <Input label="E-mail cím" name="email" type="email" required autoFocus placeholder="kollega@ugynokseg.hu" />

            {searchParams?.error && (
              <p className="text-sm font-medium text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-center animate-in fade-in">
                {searchParams.error}
              </p>
            )}
            {searchParams?.message && (
              <p className="text-sm font-medium text-green-500 bg-green-500/10 p-3 rounded-lg border border-green-500/20 text-center animate-in fade-in">
                {searchParams.message}
              </p>
            )}

            <Button type="submit" className="mt-2 font-bold py-3 text-base shadow-md shadow-primary/20 hover:shadow-lg transition-all">
              Visszaállító link küldése
            </Button>
          </form>

          <div className="mt-6 flex justify-center">
            <Link href="/login" className="flex items-center gap-1.5 text-sm font-bold text-sona-neutral hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" /> Vissza a bejelentkezéshez
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}