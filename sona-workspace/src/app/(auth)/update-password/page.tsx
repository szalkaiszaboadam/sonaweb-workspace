import { updatePassword } from '../actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>
}) {
  // Biztonsági ellenőrzés: csak bejelentkezett (linkről érkező) felhasználó láthatja
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login?message=' + encodeURIComponent('Nincs jogosultságod ehhez az oldalhoz.'))
  }

  const { message } = await searchParams

  return (
    <div className="flex-1 flex flex-col w-full min-h-screen relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="flex-1 flex flex-col justify-center items-center px-4">
        <div className="w-full max-w-md bg-surface p-8 rounded-xl shadow-sm border border-border">
          <h1 className="text-2xl font-semibold mb-6 text-center text-foreground">
            Új jelszó megadása
          </h1>
          
          <form className="flex-1 flex flex-col w-full gap-5" action={updatePassword}>
            <Input 
              label="Új jelszó" 
              id="password" 
              name="password"
              type="password" 
              placeholder="••••••••" 
              required 
            />
            
            <Button type="submit" className="mt-2">
              Jelszó mentése
            </Button>

            {message && (
              <p className="mt-2 p-3 bg-red-500/10 text-red-500 text-center text-sm rounded-md border border-red-500/20">
                {message}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}