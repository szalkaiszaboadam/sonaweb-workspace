// Fájl: src/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Létrehozunk egy alap választ
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Létrehozzuk a Supabase klienst a middleware-hez
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Ha frissíteni kell a tokent, ez a rész gondoskodik róla, 
          // hogy a böngésződ meg is kapja a frissített sütit!
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. Ez a legfontosabb sor: Ellenőrzi a usert. 
  // Ha a token lejárt, de van érvényes refresh token, a fenti setAll() lefut és megmenti a munkamenetet!
  await supabase.auth.getUser()

  return supabaseResponse
}

// 4. Megadjuk, hogy hol fusson le (mindenhol, kivéve a statikus fájloknál és képeknél)
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}