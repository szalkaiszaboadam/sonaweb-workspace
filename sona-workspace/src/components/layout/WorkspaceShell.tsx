'use client'

import { useState, useEffect } from 'react'
import { PanelLeft, PanelLeftClose, Bell } from 'lucide-react'
import { WorkspaceSidebar } from './WorkspaceSidebar'
import { WorkspaceMobileMenu } from './WorkspaceMobileMenu'
import { Breadcrumbs } from '../ui/Breadcrumbs'

type Props = {
    children: React.ReactNode
    workspaceId: string
    currentWorkspaceName: string
    allWorkspaces: any[]
    projects: { id: string, name: string }[]
    canCreateProject: boolean
    canManageSettings: boolean
    userProfile: { email: string, name?: string, avatarUrl?: string }
}

export function WorkspaceShell({
    children, workspaceId, currentWorkspaceName, allWorkspaces, projects, canCreateProject, canManageSettings, userProfile
}: Props) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
        const saved = localStorage.getItem('sona-sidebar-collapsed')
        if (saved === 'true') setIsCollapsed(true)
    }, [])

    const toggleSidebar = () => {
        setIsCollapsed(prev => {
            const newState = !prev
            localStorage.setItem('sona-sidebar-collapsed', String(newState))
            return newState
        })
    }

    if (!isMounted) return <div className="flex h-screen w-full bg-background overflow-hidden" />

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden">
            
            <WorkspaceSidebar
                currentWorkspaceId={workspaceId}
                currentWorkspaceName={currentWorkspaceName}
                workspaces={allWorkspaces}
                projects={projects}
                canCreateProject={canCreateProject}
                canManageSettings={canManageSettings}
                userProfile={userProfile}
                isCollapsed={isCollapsed}
            />

            {/* Letisztult tartalom-konténer. Visszafogott lekerekítés, solid színek. */}
            <main className="flex-1 flex flex-col py-0 md:py-2 pr-0 md:pr-2 min-w-0">
                <div className="flex-1 bg-surface border-y border-border md:border md:rounded-xl shadow-sm overflow-hidden flex flex-col relative">
                    
                    {/* Tiszta, átlátszatlan fejléc */}
                    <header className="h-14 border-b border-border flex items-center justify-between px-4 shrink-0 bg-surface z-10">
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={toggleSidebar} 
                                className="hidden md:flex p-1.5 text-sona-neutral hover:bg-sona-neutral/10 hover:text-foreground rounded-lg transition-colors"
                            >
                                {isCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
                            </button>

                            <Breadcrumbs 
                                workspaceId={workspaceId} 
                                workspaceName={currentWorkspaceName} 
                                projects={projects} 
                            />
                        </div>

                        <div className="flex items-center">
                            <button className="relative p-1.5 text-sona-neutral hover:bg-sona-neutral/10 hover:text-foreground rounded-md transition-colors" title="Értesítések">
                                <Bell className="w-4 h-4" />
                                <span className="absolute top-1 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
                            </button>
                        </div>
                    </header>

                    {/* A tartalmi terület paddingja marad egyenletes, de mobilon le kell hagyni a Bottom Bar helyét */}
                    <div className="flex-1 overflow-y-auto relative bg-surface p-4 pb-20 sm:p-6 md:p-8 md:pb-8">
                        {children}
                    </div>

                </div>
            </main>

            {/* Mobil menü konténere */}
            <div className="md:hidden">
                <WorkspaceMobileMenu
                    workspaceId={workspaceId}
                    workspaceName={currentWorkspaceName}
                    workspaces={allWorkspaces}
                    projects={projects}
                    canCreateProject={canCreateProject}
                    canManageSettings={canManageSettings}
                    userProfile={userProfile}
                />
            </div>

        </div>
    )
}