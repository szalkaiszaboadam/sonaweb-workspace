import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function WelcomePage() {
  return (
    <div className="flex-1 flex flex-col w-full min-h-screen relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="flex-1 flex flex-col justify-center items-center px-4">
        <div className="w-full max-w-md bg-surface p-8 rounded-xl shadow-sm border border-border text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <h1 className="text-2xl font-semibold mb-2 text-foreground">
            Sikeres megerősítés!
          </h1>
          <p className="text-sm text-sona-neutral mb-8">
            Az e-mail címedet hitelesítettük, a regisztrációd véglegesítve lett. Üdvözlünk a rendszerben!
          </p>
          
          {/* Itt van a te általad kért utolsó, véglegesítő gombnyomás */}
          <Link href="/workspaces" className="block w-full">
            <Button className="w-full">
              Belépés a fiókba
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}