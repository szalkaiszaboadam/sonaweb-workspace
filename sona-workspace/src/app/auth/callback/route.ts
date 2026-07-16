import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // Ha nem kapunk 'next' paramétert (tehát ez egy sima regisztráció), 
  // akkor a default cél az új 'welcome' oldal lesz
  const next = searchParams.get('next') ?? '/welcome'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Sikeres hitelesítés után továbbengedjük az adott oldalra
      // (Ez vagy az /update-password, vagy az új /welcome oldal lesz)
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Hibás link esetén megy a loginra a hibaüzenettel
  return NextResponse.redirect(
    `${origin}/login?message=${encodeURIComponent('Hibás vagy lejárt megerősítő link.')}`
  )
}