import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { acceptInviteAction } from './actions'
import { Building2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = await createClient()

  // 1. Megnézzük, be van-e jelentkezve (ha nincs, a Loginra kell küldenünk)
  const { data: { user } } = await supabase.auth.getUser()

  // 2. Lekérjük a meghívó adatait a biztonságos SQL függvénnyel
  const { data: inviteInfo, error } = await supabase.rpc('get_invite_info', {
    token_val: token
  })

  // Ha rossz a token, vagy hiba történt
  if (error || !inviteInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full bg-surface p-8 rounded-xl border border-border text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-foreground mb-2">Érvénytelen meghívó</h1>
          <p className="text-sona-neutral mb-6">Ez a meghívó link hibás, lejárt, vagy már felhasználták.</p>
          <Link href="/">
            <Button variant="secondary" className="w-full">Vissza a főoldalra</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      <div className="max-w-md w-full bg-surface p-8 rounded-xl shadow-sm border border-border text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-6">
          <Building2 className="w-8 h-8 text-primary transform rotate-6" />
        </div>
        
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Meghívó munkaterülethez
        </h1>
        <p className="text-sona-neutral mb-8">
          Meghívást kaptál a(z) <span className="font-semibold text-foreground">{inviteInfo.workspace_name}</span> nevű munkaterülethez.
        </p>

       {!user ? (
          <div className="space-y-4">
            <p className="text-sm text-amber-600 bg-amber-500/10 p-3 rounded-md border border-amber-500/20">
              A meghívó elfogadásához be kell jelentkezned, vagy létre kell hoznod egy fiókot.
            </p>
            <Link href={`/login?redirect=/invite/${token}`} className="block w-full">
              <Button className="w-full">Bejelentkezés / Regisztráció</Button>
            </Link>
          </div>
        ) : (
          <form action={async () => {
            "use server"
            await acceptInviteAction(token)
          }}>
            <div className="text-sm text-sona-neutral mb-6">
              Bejelentkezve mint: <span className="font-medium text-foreground">{user.email}</span>
            </div>
            <Button type="submit" className="w-full">
              Meghívó elfogadása
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}