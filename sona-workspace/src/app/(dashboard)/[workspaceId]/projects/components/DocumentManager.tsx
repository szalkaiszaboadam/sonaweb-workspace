'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Plus, Trash2, Edit3, Check, X, File } from 'lucide-react'
import { createDocument, updateDocument, deleteDocument } from '../actions'
import { RichTextEditor } from '@/components/ui/RichTextEditor'
import { CommentSection } from './CommentSection'
import { AttachmentSection } from './AttachmentSection'

export type ProjectDocument = {
  id: string
  title: string
  content: string
  updated_at: string
}

type Props = {
  initialDocuments: ProjectDocument[]
  projectId: string
}

export function DocumentManager({ initialDocuments, projectId }: Props) {
  const router = useRouter()
  const [documents, setDocuments] = useState<ProjectDocument[]>(initialDocuments)
  const [activeDocId, setActiveDocId] = useState<string | null>(initialDocuments[0]?.id || null)
  
  const [isCreating, setIsCreating] = useState(false)
  const [newDocTitle, setNewDocTitle] = useState('')
  
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null)
  const [editTitleValue, setEditTitleValue] = useState('')

  // Kikeressük az épp aktív dokumentumot
  const activeDoc = documents.find(d => d.id === activeDocId)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDocTitle.trim()) { setIsCreating(false); return }

    const result = await createDocument(projectId, newDocTitle)
    if (result.document) {
      setDocuments([result.document, ...documents])
      setActiveDocId(result.document.id) // Rögtön meg is nyitjuk
      setNewDocTitle('')
      setIsCreating(false)
      router.refresh()
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation() // Ne nyissa meg a dokumentumot, ha a kukára kattint
    if (!confirm('Biztosan törlöd ezt a dokumentumot?')) return

    await deleteDocument(id)
    const newDocs = documents.filter(d => d.id !== id)
    setDocuments(newDocs)
    if (activeDocId === id) setActiveDocId(newDocs[0]?.id || null)
    router.refresh()
  }

  const handleUpdateTitle = async (id: string) => {
    if (!editTitleValue.trim()) { setEditingTitleId(null); return }
    
    // Azonnali UI frissítés
    setDocuments(docs => docs.map(d => d.id === id ? { ...d, title: editTitleValue } : d))
    setEditingTitleId(null)
    
    await updateDocument(id, { title: editTitleValue })
    router.refresh()
  }

  // Ez menti el a szövegszerkesztő tartalmát. 
  // Egy kicsit "okosan" csináljuk: nem minden gombnyomásra ment az adatbázisba, hanem rábízzuk a TipTap OnChange-re, hogy ő azonnal frissítse a state-et, és mi csak akkor mentünk az adatbázisba, ha tényleg kell.
  const handleContentChange = async (html: string) => {
    if (!activeDocId) return
    
    // UI frissítése azonnal
    setDocuments(docs => docs.map(d => d.id === activeDocId ? { ...d, content: html, updated_at: new Date().toISOString() } : d))
    
    // Adatbázis mentés a háttérben
    await updateDocument(activeDocId, { content: html })
  }

  return (
    <div className="flex h-[calc(100vh-16rem)] min-h-[600px] border border-border rounded-xl bg-surface shadow-sm overflow-hidden">
      
      {/* BAL OLDALSÁV: Dokumentumok listája */}
      <div className="w-64 border-r border-border bg-sona-neutral/5 flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <FileText className="w-4 h-4 text-sona-neutral" />
            Jegyzetek
          </h2>
          <button 
            onClick={() => setIsCreating(true)}
            className="p-1 rounded-md text-sona-neutral hover:bg-sona-neutral/10 hover:text-foreground transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {isCreating && (
            <form onSubmit={handleCreate} className="mb-2 p-2">
              <input
                autoFocus
                type="text"
                value={newDocTitle}
                onChange={e => setNewDocTitle(e.target.value)}
                onBlur={() => { if (!newDocTitle.trim()) setIsCreating(false) }}
                placeholder="Dokumentum neve..."
                className="w-full text-sm px-2 py-1.5 bg-background border border-primary rounded-md focus:outline-none"
              />
            </form>
          )}

          {documents.length === 0 && !isCreating ? (
            <p className="text-xs text-sona-neutral text-center py-4">Még nincsenek jegyzetek.</p>
          ) : (
            <div className="flex flex-col gap-1">
              {documents.map(doc => (
                <div 
                  key={doc.id}
                  onClick={() => setActiveDocId(doc.id)}
                  className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${activeDocId === doc.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-sona-neutral/10 text-foreground'}`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <File className={`w-3.5 h-3.5 flex-shrink-0 ${activeDocId === doc.id ? 'text-primary' : 'text-sona-neutral'}`} />
                    <span className="text-sm truncate">{doc.title}</span>
                  </div>
                  
                  {/* Törlés gomb (csak hover esetén látszik) */}
                  <button 
                    onClick={(e) => handleDelete(doc.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/10 hover:text-red-500 text-sona-neutral transition-all flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* JOBB OLDAL: Szerkesztő felület */}
      <div className="flex-1 flex flex-col bg-background overflow-hidden relative">
        {activeDoc ? (
          <>
            {/* Fejléc: Cím szerkesztése */}
            <div className="h-16 px-8 border-b border-border flex items-center bg-surface shrink-0">
              {editingTitleId === activeDoc.id ? (
                <div className="flex items-center gap-2 w-full max-w-md">
                  <input
                    autoFocus
                    type="text"
                    value={editTitleValue}
                    onChange={e => setEditTitleValue(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleUpdateTitle(activeDoc.id); if (e.key === 'Escape') setEditingTitleId(null) }}
                    className="flex-1 text-xl font-bold bg-background border border-primary px-3 py-1.5 rounded-md focus:outline-none"
                  />
                  <button onClick={() => handleUpdateTitle(activeDoc.id)} className="p-2 text-green-600 hover:bg-green-500/10 rounded-md"><Check className="w-5 h-5" /></button>
                  <button onClick={() => setEditingTitleId(null)} className="p-2 text-sona-neutral hover:bg-sona-neutral/10 rounded-md"><X className="w-5 h-5" /></button>
                </div>
              ) : (
                <div className="flex items-center gap-3 group w-full">
                  <h1 className="text-xl font-bold text-foreground truncate">{activeDoc.title}</h1>
                  <button 
                    onClick={() => { setEditingTitleId(activeDoc.id); setEditTitleValue(activeDoc.title) }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-sona-neutral hover:bg-sona-neutral/10 rounded-md transition-all"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  
                  <div className="ml-auto flex items-center gap-2 text-xs text-sona-neutral">
                    <span>Mentve: {new Date(activeDoc.updated_at).toLocaleTimeString('hu-HU', {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Szövegszerkesztő és Extrák */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-4xl mx-auto w-full p-8 h-full flex flex-col">
                
                {/* A WYSIWYG szerkesztő */}
                <RichTextEditor 
                  key={activeDoc.id} 
                  content={activeDoc.content} 
                  onChange={handleContentChange} 
                />

                {/* ================= EXTRA FUNKCIÓK (ÚJ!) ================= */}
                <div className="border-t border-border mt-12 pt-8 pb-12 flex flex-col gap-8">
                  <AttachmentSection targetType="document" targetId={activeDoc.id} />
                  <CommentSection targetType="document" targetId={activeDoc.id} />
                </div>

              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-sona-neutral">
            <FileText className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm font-medium">Válassz egy dokumentumot a bal oldali listából,</p>
            <p className="text-xs mt-1">vagy hozz létre egy újat a '+' gombbal.</p>
          </div>
        )}
      </div>
    </div>
  )
}