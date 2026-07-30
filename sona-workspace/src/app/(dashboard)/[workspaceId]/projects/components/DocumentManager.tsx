'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Plus, Trash2, Edit3, Check, X, File, Folder, ChevronDown, ChevronRight, PanelLeft, MessageSquare, FolderPlus } from 'lucide-react'
import { createDocument, updateDocument, deleteDocument } from '../actions'
import { RichTextEditor } from '@/components/ui/RichTextEditor'
import { CommentSection } from './CommentSection'
import { AttachmentSection } from './AttachmentSection'

export type ProjectDocument = {
  id: string
  title: string
  content: string
  folder_name?: string
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
  
  // -- UI ÁLLAPOTOK (Kinyitható panelek) --
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true)
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false)
  
  // -- SZERKESZTŐ ÁLLAPOTOK --
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null)
  const [editTitleValue, setEditTitleValue] = useState('')
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved')

  // -- MAPPA ÁLLAPOTOK --
  const [isCreatingDoc, setIsCreatingDoc] = useState<string | null>(null)
  const [newDocTitle, setNewDocTitle] = useState('')
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['Általános'])
  const [newFolderInput, setNewFolderInput] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')

  const uniqueFolders = Array.from(new Set(documents.map(d => d.folder_name || 'Általános')))
  const allFolders = Array.from(new Set([...uniqueFolders, 'Általános'])) 
  
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsLeftPanelOpen(false)
    }
  }, [])

  const activeDoc = documents.find(d => d.id === activeDocId)

  const toggleFolder = (folder: string) => {
    setExpandedFolders(prev => 
      prev.includes(folder) ? prev.filter(f => f !== folder) : [...prev, folder]
    )
  }

  const handleCreateDocument = async (e: React.FormEvent, folderName: string) => {
    e.preventDefault()
    if (!newDocTitle.trim()) { setIsCreatingDoc(null); return }
    
    const result = await createDocument(projectId, newDocTitle, folderName)
    if (result.document) {
      setDocuments([...documents, result.document])
      setActiveDocId(result.document.id)
      setNewDocTitle('')
      setIsCreatingDoc(null)
      if (window.innerWidth < 1024) setIsLeftPanelOpen(false) 
      router.refresh()
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Biztosan törlöd ezt a dokumentumot?')) return
    await deleteDocument(id)
    const newDocs = documents.filter(d => d.id !== id)
    setDocuments(newDocs)
    if (activeDocId === id) setActiveDocId(newDocs[0]?.id || null)
    router.refresh()
  }

  const handleUpdateTitle = async (id: string) => {
    if (!editTitleValue.trim()) { setEditingTitleId(null); return }
    setSaveStatus('saving')
    
    setDocuments(docs => docs.map(d => d.id === id ? { ...d, title: editTitleValue } : d))
    setEditingTitleId(null)
    
    await updateDocument(id, { title: editTitleValue })
    setSaveStatus('saved')
    router.refresh()
  }

  const handleContentChange = async (html: string) => {
    if (!activeDocId) return
    setSaveStatus('saving')
    
    setDocuments(docs => docs.map(d => d.id === activeDocId ? { ...d, content: html, updated_at: new Date().toISOString() } : d))
    await updateDocument(activeDocId, { content: html })
    
    setSaveStatus('saved')
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] min-h-[600px] border border-border rounded-xl bg-surface shadow-sm overflow-hidden relative">
      
      {/* ========================================================= */}
      {/* 1. BAL OLDALSÁV (MAPPÁK ÉS DOKUMENTUMOK) */}
      {/* ========================================================= */}
      <div 
        className={`absolute lg:relative z-20 h-full bg-surface border-r border-border flex flex-col transition-all duration-300 ease-in-out ${
          isLeftPanelOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full lg:translate-x-0 lg:w-0 lg:border-none opacity-0'
        }`}
      >
        <div className="p-4 border-b border-border flex items-center justify-between bg-sona-neutral/5">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Tudásbázis
          </h2>
          <button 
            onClick={() => { setNewFolderInput(true); setNewFolderName('') }}
            className="p-1.5 rounded-md text-sona-neutral hover:bg-sona-neutral/10 hover:text-foreground transition-colors"
            title="Új mappa létrehozása"
          >
            <FolderPlus className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
          
          {newFolderInput && (
            <div className="flex items-center gap-2 px-2">
              <Folder className="w-4 h-4 text-sona-neutral" />
              <input
                autoFocus
                type="text"
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                onBlur={() => {
                  if (newFolderName.trim()) {
                    allFolders.push(newFolderName.trim()) 
                    setExpandedFolders([...expandedFolders, newFolderName.trim()])
                  }
                  setNewFolderInput(false)
                }}
                onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()}
                placeholder="Mappa neve..."
                className="flex-1 text-sm bg-background border border-primary px-2 py-1 rounded focus:outline-none"
              />
            </div>
          )}

          {allFolders.map(folder => {
            const folderDocs = documents.filter(d => (d.folder_name || 'Általános') === folder)
            const isExpanded = expandedFolders.includes(folder)

            if (folderDocs.length === 0 && folder !== 'Általános' && !expandedFolders.includes(folder)) return null

            return (
              <div key={folder} className="flex flex-col gap-1">
                <div 
                  className="group flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-sona-neutral/10 cursor-pointer transition-colors"
                  onClick={() => toggleFolder(folder)}
                >
                  <div className="flex items-center gap-2 text-foreground font-medium text-sm">
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-sona-neutral" /> : <ChevronRight className="w-4 h-4 text-sona-neutral" />}
                    <Folder className="w-4 h-4 text-sona-neutral fill-sona-neutral/20" />
                    {folder}
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsCreatingDoc(folder); setExpandedFolders([...expandedFolders, folder]) }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-sona-neutral hover:text-primary transition-opacity"
                    title="Új dokumentum ide"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {isExpanded && (
                  <div className="flex flex-col ml-6 pl-2 border-l border-border/50 gap-0.5 mt-1">
                    {isCreatingDoc === folder && (
                      <form onSubmit={(e) => handleCreateDocument(e, folder)} className="mb-2">
                        <input
                          autoFocus
                          type="text"
                          value={newDocTitle}
                          onChange={e => setNewDocTitle(e.target.value)}
                          onBlur={() => { if (!newDocTitle.trim()) setIsCreatingDoc(null) }}
                          placeholder="Dokumentum neve..."
                          className="w-full text-sm px-2 py-1.5 bg-background border border-primary rounded-md focus:outline-none"
                        />
                      </form>
                    )}

                    {folderDocs.map(doc => (
                      <div 
                        key={doc.id}
                        onClick={() => {
                          setActiveDocId(doc.id);
                          if (window.innerWidth < 1024) setIsLeftPanelOpen(false); 
                        }}
                        className={`group flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer transition-colors text-sm ${
                          activeDocId === doc.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-sona-neutral/10 text-sona-neutral hover:text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <File className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{doc.title}</span>
                        </div>
                        <button 
                          onClick={(e) => handleDelete(doc.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/10 hover:text-red-500 transition-all shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    
                    {folderDocs.length === 0 && isCreatingDoc !== folder && (
                      <span className="text-xs text-sona-neutral/50 italic py-1">Üres mappa</span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Sötétítő overlay mobilon a bal menühöz */}
      {isLeftPanelOpen && (
        <div 
          className="absolute inset-0 bg-black/20 z-10 lg:hidden"
          onClick={() => setIsLeftPanelOpen(false)}
        />
      )}

      {/* ========================================================= */}
      {/* 2. KÖZÉPSŐ RÉSZ (FŐ SZERKESZTŐ ÉS FEJLÉC) */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col bg-background overflow-hidden min-w-0 z-0">
        
        {/* KÖZÖS FEJLÉC (Gondosan elszeparálva a bal és jobb oldal, hogy ne csússzanak össze) */}
        <div className="h-14 px-4 border-b border-border flex items-center justify-between bg-surface shrink-0 gap-4">
          
          {/* Bal oldal: Menü gomb és Cím */}
          <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
            <button 
              onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
              className={`shrink-0 p-1.5 rounded-md transition-colors ${isLeftPanelOpen ? 'bg-primary/10 text-primary' : 'text-sona-neutral hover:bg-sona-neutral/10 hover:text-foreground'}`}
              title="Mappák mutatása/elrejtése"
            >
              <PanelLeft className="w-5 h-5" />
            </button>

            {activeDoc ? (
              editingTitleId === activeDoc.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    autoFocus
                    type="text"
                    value={editTitleValue}
                    onChange={e => setEditTitleValue(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleUpdateTitle(activeDoc.id); if (e.key === 'Escape') setEditingTitleId(null) }}
                    className="flex-1 text-lg font-bold bg-background border border-primary px-3 py-1 rounded-md focus:outline-none"
                  />
                  <button onClick={() => handleUpdateTitle(activeDoc.id)} className="text-green-600 shrink-0"><Check className="w-5 h-5" /></button>
                  <button onClick={() => setEditingTitleId(null)} className="text-sona-neutral shrink-0"><X className="w-5 h-5" /></button>
                </div>
              ) : (
                <div className="flex items-center gap-3 group min-w-0">
                  <h1 className="text-lg font-bold text-foreground truncate">{activeDoc.title}</h1>
                  <button 
                    onClick={() => { setEditingTitleId(activeDoc.id); setEditTitleValue(activeDoc.title) }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-sona-neutral hover:bg-sona-neutral/10 rounded-md transition-all shrink-0"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )
            ) : (
              <span className="text-sm font-medium text-sona-neutral">Nincs kiválasztott dokumentum</span>
            )}
          </div>

          {/* Jobb oldal: Mentés állapot és Kommentek gomb */}
          {activeDoc && (
            <div className="flex items-center gap-4 shrink-0">
              
              <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                {saveStatus === 'saving' && <span className="text-sona-neutral animate-pulse flex items-center gap-1.5"><Edit3 className="w-3 h-3"/> Mentés...</span>}
                {saveStatus === 'saved' && <span className="text-green-500 flex items-center gap-1.5"><Check className="w-3.5 h-3.5"/> Mentve</span>}
              </div>

              <button 
                onClick={() => setIsRightPanelOpen(true)}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${isRightPanelOpen ? 'bg-primary/10 text-primary' : 'bg-sona-neutral/10 text-sona-neutral hover:text-foreground'}`}
              >
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Részletek</span>
              </button>
            </div>
          )}
        </div>

        {/* MAGA A SZÖVEGSZERKESZTŐ */}
        <div className="flex-1 overflow-y-auto">
          {activeDoc ? (
            <div className="max-w-4xl mx-auto w-full p-6 sm:p-10 h-full">
              <RichTextEditor 
                key={activeDoc.id} 
                content={activeDoc.content} 
                onChange={handleContentChange} 
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-sona-neutral">
              <FileText className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-base font-medium text-foreground">Válassz egy dokumentumot</p>
              <p className="text-sm mt-1">vagy hozz létre egy újat a mappáknál.</p>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. JOBB OLDALSÁV (OVERLAY - Ráúszó panel) */}
      {/* ========================================================= */}
      {activeDoc && (
        <div 
          className={`absolute top-0 right-0 bottom-0 z-30 w-80 sm:w-96 bg-surface border-l border-border shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
            isRightPanelOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Jobb panel fejléce bezáró gombbal */}
          <div className="h-14 px-4 border-b border-border flex items-center justify-between bg-surface shrink-0">
            <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-sona-neutral" />
              Részletek
            </h3>
            <button 
              onClick={() => setIsRightPanelOpen(false)} 
              className="p-1.5 rounded-md text-sona-neutral hover:bg-sona-neutral/10 hover:text-foreground transition-colors"
              title="Bezárás"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tartalom */}
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-8 bg-sona-neutral/5">
            <AttachmentSection targetType="document" targetId={activeDoc.id} />
            <div className="w-full h-px bg-border" />
            <CommentSection targetType="document" targetId={activeDoc.id} />
          </div>
        </div>
      )}

    </div>
  )
}