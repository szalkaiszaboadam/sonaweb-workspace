import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { signup } from '../actions' // <-- Ellenőrizd, hogy az actions fájlodban így hívják-e a regisztrációs függvényt!

export const dynamic = 'force-dynamic'

export default async function RegisterPage(props: { searchParams: Promise<{ error?: string, message?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/workspaces')

  const searchParams = await props.searchParams

  return (
    <div className="min-h-screen w-full flex bg-background font-sans">
      
      {/* BAL OLDAL: Brand */}
      <div className="hidden lg:flex w-1/2 bg-surface border-r border-border relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#80808020_1px,transparent_1px)] [background-size:24px_24px] opacity-30 mix-blend-luminosity" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <Link href="/">
            <img src="/sonaweb-workspace-logo-black.png" alt="Sonaweb" className="h-6 w-auto block dark:hidden" />
            <img src="/sonaweb-workspace-logo-white.png" alt="Sonaweb" className="h-6 w-auto hidden dark:block" />
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-extrabold text-foreground mb-6 tracking-tight leading-tight">
            Építs nagyszerű dolgokat.
          </h1>
          <p className="text-sona-neutral text-lg font-medium leading-relaxed">
            Csatlakozz a Sonaweb rendszeréhez, hozz létre saját munkaterületet, és hívd meg a csapatodat percek alatt.
          </p>
        </div>

        <div className="relative z-10 text-xs font-bold text-sona-neutral tracking-wider uppercase">
          © {new Date().getFullYear()} Sonaweb Workspace
        </div>
      </div>

      {/* JOBB OLDAL: Letisztult űrlap */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-sm flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">

          <div className="lg:hidden mb-12 flex justify-start">
            <Link href="/">
              <img src="/sonaweb-workspace-logo-black.png" alt="Sonaweb" className="h-6 w-auto block dark:hidden" />
              <img src="/sonaweb-workspace-logo-white.png" alt="Sonaweb" className="h-6 w-auto hidden dark:block" />
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">Hozd létre a fiókod</h2>
            <p className="text-sona-neutral font-medium">Add meg az adataidat az induláshoz.</p>
          </div>

          <form action={signup} className="flex flex-col gap-5">
            <Input label="Teljes név" name="name" type="text" required autoFocus placeholder="Kovács János" />
            <Input label="E-mail cím" name="email" type="email" required placeholder="janos@ugynokseg.hu" />
            <Input label="Jelszó" name="password" type="password" required minLength={6} placeholder="••••••••" />

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

            <Button type="submit" className="mt-2 font-bold py-3 text-base shadow-lg shadow-primary/20 hover:shadow-xl transition-all">
              Regisztráció
            </Button>
          </form>

          <p className="text-center text-sm font-medium text-sona-neutral mt-8">
            Már van fiókod? <Link href="/login" className="text-primary font-bold hover:text-primary/80 transition-colors">Bejelentkezés</Link>
          </p>

        </div>
      </div>

    </div>
  )
}