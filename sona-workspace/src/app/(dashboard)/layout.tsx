import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FloatingTimer } from '@/components/ui/FloatingTimer'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    // h-screen és flex-row az App-Shell architektúrához
    <div className="h-screen w-full flex overflow-hidden bg-background">
      {children}
      <FloatingTimer />
    </div>
  )
}