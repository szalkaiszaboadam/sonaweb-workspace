import { requestPasswordReset } from '../actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import Link from 'next/link'

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>
}) {
  const { message } = await searchParams

  return (
    <div className="flex-1 flex flex-col w-full min-h-screen relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="flex-1 flex flex-col justify-center items-center px-4">
        <div className="w-full max-w-md bg-surface p-8 rounded-xl shadow-sm border border-border">
          <h1 className="text-2xl font-semibold mb-2 text-center text-foreground">
            Elfelejtett jelszó
          </h1>
          <p className="text-sm text-sona-neutral text-center mb-6">
            Add meg az e-mail címed, és küldünk egy linket a jelszavad visszaállításához.
          </p>
          
          <form className="flex-1 flex flex-col w-full gap-5" action={requestPasswordReset}>
            <Input 
              label="Email cím" 
              id="email" 
              name="email"
              type="email" 
              placeholder="pelda@ugynokseg.hu" 
              required 
            />
            
            <Button type="submit" className="mt-2">
              Visszaállító link küldése
            </Button>

            {message && (
              <p className="mt-2 p-3 bg-red-500/10 text-red-500 text-center text-sm rounded-md border border-red-500/20">
                {message}
              </p>
            )}
          </form>

          <div className="mt-8 text-center text-sm text-sona-neutral">
            Vissza a{' '}
            <Link href="/login" className="font-medium text-primary hover:text-primary-hover transition-colors">
              bejelentkezéshez
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}