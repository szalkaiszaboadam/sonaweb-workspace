'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, FileText, FolderKanban, Clock, Folder, ChevronRight, FileCheck2 } from 'lucide-react'

// Kiterjesztett típus a Supabase JOIN miatt
type GlobalDocument = {
  id: string
  title: string
  content: string | null
  folder_name?: string
  updated_at: string
  projects: {
    id: string
    name: string
  }
}

type Props = {
  documents: GlobalDocument[]
  workspaceId: string
}

export function WorkspaceDocumentsView({ documents, workspaceId }: Props) {
  const [searchQuery, setSearchQuery] = useState('')

  // Keresés szűrése (Címre, Projekt névre és Mappa névre is keres!)
  const filteredDocs = documents.filter(doc => {
    const term = searchQuery.toLowerCase()
    return (
      doc.title.toLowerCase().includes(term) ||
      doc.projects.name.toLowerCase().includes(term) ||
      (doc.folder_name && doc.folder_name.toLowerCase().includes(term))
    )
  })

  return (
    <div className="flex flex-col gap-6">
      
      {/* ========================================================= */}
      {/* KERESŐSÁV */}
      {/* ========================================================= */}
      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sona-neutral" />
        <input
          type="text"
          placeholder="Keresés dokumentumra, projektre vagy mappára..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm shadow-sm transition-all text-foreground"
        />
      </div>

      {/* ========================================================= */}
      {/* DOKUMENTUM KÁRTYÁK GRID */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-2">
        {filteredDocs.map(doc => (
          <Link
            key={doc.id}
            href={`/${workspaceId}/projects/${doc.projects.id}/documents`}
            className="group bg-surface border border-border rounded-2xl p-5 hover:border-blue-500/50 hover:shadow-lg transition-all flex flex-col h-[200px] relative cursor-pointer"
          >
            {/* Fejléc: Projekt név */}
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-sona-neutral bg-sona-neutral/10 px-2 py-1 rounded uppercase tracking-wider truncate">
                <FolderKanban className="w-3 h-3" />
                {doc.projects.name}
              </span>
              <div className="w-8 h-8 rounded-full bg-blue-500/5 flex items-center justify-center text-blue-500 group-hover:scale-110 group-hover:bg-blue-500/10 transition-all">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
            
            {/* Cím */}
            <h3 className="text-foreground font-bold text-lg line-clamp-1 mb-2 group-hover:text-blue-500 transition-colors">
              {doc.title}
            </h3>
            
            {/* Előnézet (HTML kód lecsupaszítva) */}
            <p className="text-sm text-sona-neutral line-clamp-2 flex-1 leading-relaxed">
              {doc.content ? doc.content.replace(/<[^>]*>?/gm, '') : 'Még nincs tartalom...'}
            </p>

            {/* Lábjegyzet: Mappa és Dátum */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-1.5 text-xs font-medium text-sona-neutral">
                <Folder className="w-3.5 h-3.5 fill-sona-neutral/20" />
                <span className="truncate max-w-[120px]">{doc.folder_name || 'Általános'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-sona-neutral">
                <Clock className="w-3.5 h-3.5" />
                {new Date(doc.updated_at).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ÜRES ÁLLAPOT (Ha nincs találat) */}
      {filteredDocs.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center text-sona-neutral bg-surface/50 border border-dashed border-border rounded-2xl mt-4">
          <FileCheck2 className="w-16 h-16 mb-4 opacity-20" />
          <p className="text-lg font-medium text-foreground">Nincs találat</p>
          <p className="text-sm mt-1">Nincs ilyen dokumentum, vagy még nem hoztál létre egyet sem.</p>
        </div>
      )}

    </div>
  )
}