'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HardDrive } from 'lucide-react'

export function ProjectNavbar({ workspaceId, projectId }: { workspaceId: string, projectId: string }) {
  const pathname = usePathname()
  const baseUrl = `/${workspaceId}/projects/${projectId}`

  const navItems = [
    { name: 'Áttekintés', href: baseUrl, exact: true },
    { name: 'Feladatok', href: `${baseUrl}/tasks`, exact: false },
    { name: 'Dokumentumok', href: `${baseUrl}/documents`, exact: false },
    { name: 'Fájlok', href: `${baseUrl}/files`, exact: false }, // <-- Ezt az egy sort adtuk hozzá
    { name: 'Beállítások', href: `${baseUrl}/settings`, exact: false },
  ]

  return (
    <nav className="flex items-center gap-6 border-b border-border mb-6">
      {navItems.map((item) => {
        // Ellenőrizzük, hogy aktív-e az adott fül
        const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
              isActive
                ? 'border-primary text-primary'
                : 'border-transparent text-sona-neutral hover:text-foreground hover:border-border'
            }`}
          >
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}