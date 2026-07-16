import { login } from '../actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import Link from 'next/link'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>
}) {
  const { message } = await searchParams

  return (
    <div className="flex min-h-screen w-full bg-background p-4 lg:p-6 items-center justify-center">
      
      {/* FŐ KONTÉNER (A lebegő "kártya") */}
      <div className="flex w-full max-w-[1400px] min-h-[85vh] bg-background rounded-[2rem] border border-border shadow-2xl overflow-hidden">
        
        {/* BAL OLDAL - FORM SÁV (kb 35-40%) */}
        <div className="w-full lg:w-[40%] xl:w-[35%] flex flex-col p-8 lg:p-14 relative justify-center">
          <div className="absolute top-8 right-8">
            <ThemeToggle />
          </div>

          <div className="absolute top-8 left-8 lg:left-14 font-bold text-2xl text-foreground tracking-tight">
            SONA<span className="text-primary">.</span>
          </div>

          <div className="w-full max-w-sm mx-auto mt-12">
            <h2 className="text-3xl font-semibold mb-2 text-foreground">
              Üdvözlünk újra!
            </h2>
            <p className="text-sm text-sona-neutral mb-8">
              Jelentkezz be a fiókodba a folytatáshoz.
            </p>
            
            <form className="flex flex-col w-full gap-5" action={login}>
              <Input 
                label="Email cím" 
                id="email" 
                name="email"
                type="email" 
                placeholder="pelda@ugynokseg.hu" 
                required 
              />
              
              <div className="flex flex-col gap-1">
                <Input 
                  label="Jelszó" 
                  id="password" 
                  name="password"
                  type="password" 
                  placeholder="••••••••" 
                  required 
                />
                <div className="flex justify-end mt-1">
                  <Link href="/forgot-password" className="text-xs font-medium text-primary hover:text-primary-hover transition-colors">
                    Elfelejtetted a jelszavad?
                  </Link>
                </div>
              </div>
              
              <Button type="submit" className="mt-4 w-full">
                Bejelentkezés
              </Button>

              {message && (
                <p className="mt-2 p-3 bg-red-500/10 text-red-500 text-center text-sm rounded-md border border-red-500/20">
                  {message}
                </p>
              )}
            </form>

            <div className="mt-10 text-center text-sm text-sona-neutral">
              Nincs még fiókod?{' '}
              <Link href="/register" className="font-medium text-foreground underline hover:text-primary transition-colors">
                Regisztrálj itt
              </Link>
            </div>
          </div>
        </div>

        {/* JOBB OLDAL - VIZUÁLIS SÁV (kb 60-65%) */}
        <div className="hidden lg:flex flex-1 p-4 pl-0">
          <div className="w-full h-full bg-surface rounded-3xl border border-border flex flex-col items-center justify-center relative overflow-hidden">
            
            {/* Finom háttérszín átmenet */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />

            {/* UI Mockup (A statisztikai kártya) */}
            <div className="relative z-10 w-full max-w-md bg-background rounded-2xl shadow-xl border border-border overflow-hidden mb-12 transform hover:scale-105 transition-transform duration-500">
              {/* Mockup Fejléc */}
              <div className="border-b border-border p-4 flex items-center justify-between bg-surface/50">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-border" />
                  <div className="w-3 h-3 rounded-full bg-border" />
                  <div className="w-3 h-3 rounded-full bg-border" />
                </div>
                <div className="h-4 w-24 bg-border/50 rounded" />
              </div>
              
              {/* Mockup Tartalom */}
              <div className="p-8 space-y-4">
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <div className="text-xs font-medium text-sona-neutral mb-2 uppercase tracking-wider">Havi Bevétel</div>
                    <div className="text-3xl font-bold text-foreground">2 450 000 Ft</div>
                  </div>
                  <div className="px-3 py-1.5 bg-green-500/10 text-green-500 text-xs rounded-full font-semibold">
                    + 12.5%
                  </div>
                </div>
                
                {/* Oszlopdiagram illusztráció */}
                <div className="w-full h-28 flex items-end gap-3">
                  {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                    <div key={i} className="flex-1 bg-primary/20 rounded-t-md hover:bg-primary/40 transition-colors" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Információs szöveg */}
            <div className="relative z-10 text-center px-8">
              <h3 className="text-2xl font-semibold text-foreground mb-3">
                Ügynökségi folyamatok, egy helyen
              </h3>
              <p className="text-sona-neutral text-sm max-w-sm mx-auto leading-relaxed">
                Kezeld a projektjeidet, kövesd a feladatokat és növeld a hatékonyságot a letisztult munkaterületen.
              </p>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  )
}