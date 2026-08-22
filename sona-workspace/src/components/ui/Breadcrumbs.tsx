'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

type Props = {
    workspaceId: string
    workspaceName: string
    projects: { id: string, name: string }[]
}

export function Breadcrumbs({ workspaceId, workspaceName, projects }: Props) {
    const pathname = usePathname()
    const segments = pathname.replace(/\/$/, '').split('/').filter(Boolean)
    
    const crumbs: { label: string, href: string }[] = []

    // 1. Gyökér
    crumbs.push({ label: workspaceName, href: `/${workspaceId}/overview` })

    // 2. Szekciók
    if (segments.length > 1 && segments[1] !== 'overview') {
        const section = segments[1]
        const sectionNames: Record<string, string> = {
            projects: 'Projektek',
            tasks: 'Feladatok',
            documents: 'Dokumentumok',
            files: 'Fájlok',
            time: 'Időmérés',
            team: 'Csapat',
            settings: 'Beállítások',
            help: 'Súgó',
            report: 'Hibabejelentés',
        }
        
        crumbs.push({ label: sectionNames[section] || section, href: `/${workspaceId}/${section}` })

        // 3. Projekt belseje
        if (section === 'projects' && segments.length > 2) {
            const projectId = segments[2]
            const project = projects.find(p => p.id === projectId)
            if (project) crumbs.push({ label: project.name, href: `/${workspaceId}/projects/${projectId}` })

            // 4. Projekt modul
            if (segments.length > 3) {
                const subSection = segments[3]
                crumbs.push({ label: sectionNames[subSection] || subSection, href: `/${workspaceId}/projects/${projectId}/${subSection}` })
            }
        }
    }

    const uniqueCrumbs = crumbs.filter((crumb, index, self) => index === self.findIndex((c) => c.href === crumb.href))

    return (
        <nav className="flex items-center text-sm font-medium text-sona-neutral overflow-x-auto no-scrollbar">
            {uniqueCrumbs.map((crumb, index) => {
                const isLast = index === uniqueCrumbs.length - 1
                const isFirst = index === 0
                const isMiddle = !isFirst && !isLast

                return (
                    <div key={`crumb-${index}`} className={`items-center whitespace-nowrap ${isMiddle ? 'hidden sm:flex' : 'flex'}`}>
                        
                        {/* 🚀 APPLE DESIGN: Mobilon a középső elemek helyett "..." jelenik meg */}
                        {isLast && uniqueCrumbs.length > 2 && (
                            <div className="flex sm:hidden items-center text-sona-neutral mr-1.5">
                                <span className="font-bold tracking-widest leading-none mb-2">...</span>
                                <ChevronRight className="w-4 h-4 mx-1.5 opacity-40 shrink-0" />
                            </div>
                        )}

                        <Link 
                            href={crumb.href} 
                            className={`flex items-center gap-1.5 transition-colors ${isLast ? 'text-foreground font-semibold' : 'hover:text-foreground'}`}
                        >
                            {isFirst && <Home className="w-4 h-4 shrink-0 mb-0.5" />}
                            <span className={`truncate ${isLast ? 'max-w-[140px] sm:max-w-[200px]' : 'max-w-[120px]'}`}>
                                {crumb.label}
                            </span>
                        </Link>
                        {!isLast && <ChevronRight className="w-4 h-4 mx-1.5 opacity-40 shrink-0" />}
                    </div>
                )
            })}
        </nav>
    )
}