'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Plus, Trash2, Edit3, Check, X, File, Folder, ChevronDown, ChevronRight, PanelLeft, MessageSquare, FolderPlus, GripVertical } from 'lucide-react'
import { createDocument, updateDocument, deleteDocument, updateDocumentOrders } from '../actions'
import { RichTextEditor } from '@/components/ui/RichTextEditor'
import { CommentSection } from './CommentSection'
import { AttachmentSection } from './AttachmentSection'

export type ProjectDocument = {
    id: string
    title: string
    content: string
    folder_name?: string
    position?: number
    updated_at: string
    user_id: string // <-- Ezt feltétlenül add hozzá!
}

type Props = {
    initialDocuments: ProjectDocument[]
    projectId: string
    currentUserId: string          // <-- ÚJ
    hasEditOthersPerm: boolean     // <-- ÚJ
    hasDeleteOthersPerm: boolean   // <-- ÚJ
}

export function DocumentManager({ initialDocuments, projectId, currentUserId, hasEditOthersPerm, hasDeleteOthersPerm }: Props) {
    const router = useRouter()
    // Rendezzük az induló dokumentumokat pozíció szerint
    const [documents, setDocuments] = useState<ProjectDocument[]>([...initialDocuments].sort((a, b) => (a.position || 0) - (b.position || 0)))
    const [activeDocId, setActiveDocId] = useState<string | null>(initialDocuments[0]?.id || null)

    const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true)
    const [isRightPanelOpen, setIsRightPanelOpen] = useState(false)

    const [editingTitleId, setEditingTitleId] = useState<string | null>(null)
    const [editTitleValue, setEditTitleValue] = useState('')
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved')

    // ÚJ: Időzítő a késleltetett mentéshez
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

    const [isCreatingDoc, setIsCreatingDoc] = useState<string | null>(null)
    const [newDocTitle, setNewDocTitle] = useState('')
    const [expandedFolders, setExpandedFolders] = useState<string[]>(['Általános'])
    const [newFolderInput, setNewFolderInput] = useState(false)
    const [newFolderName, setNewFolderName] = useState('')

    // JAVÍTÁS 1: A saját (még üres) mappákat külön állapottal mentjük meg az eltűnéstől
    const [customFolders, setCustomFolders] = useState<string[]>(['Általános'])

    // Összeszámoljuk a létező mappákat (DB + Lokális üresek)
    const allUniqueFolders = Array.from(new Set([...customFolders, ...documents.map(d => d.folder_name || 'Általános')]))
    const [orderedFolders, setOrderedFolders] = useState<string[]>(allUniqueFolders)

    useEffect(() => {
        // Frissítjük a mappasorrendet, ha új dokumentum (és vele új mappa) jön be a szerverről
        const freshFolders = Array.from(new Set([...customFolders, ...documents.map(d => d.folder_name || 'Általános')]))
        const newOrdered = freshFolders.sort((a, b) => {
            const idxA = orderedFolders.indexOf(a)
            const idxB = orderedFolders.indexOf(b)
            if (idxA === -1) return 1
            if (idxB === -1) return -1
            return idxA - idxB
        })
        setOrderedFolders(newOrdered)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [documents.length])

    useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 1024) setIsLeftPanelOpen(false)
    }, [])

    const activeDoc = documents.find(d => d.id === activeDocId)

    // 🚀 AZ ÚJ DOKUMENTUM SZINTŰ JOGOSULTSÁG-KALKULÁTOR
    const canEditActive = activeDoc?.user_id === currentUserId || hasEditOthersPerm
    const canDeleteDoc = (docUserId: string) => docUserId === currentUserId || hasDeleteOthersPerm

    // ==========================================
    // DRAG & DROP LOGIKA (Mappák és Doksik)
    // ==========================================
    const [activeDragTarget, setActiveDragTarget] = useState<string | null>(null)

    const handleDragStart = (e: React.DragEvent, type: 'folder' | 'doc', idOrName: string) => {
        e.dataTransfer.setData('dragType', type)
        e.dataTransfer.setData('dragId', idOrName)
        // Csökkentett opacitás húzás közben
        setTimeout(() => { (e.target as HTMLElement).style.opacity = '0.4' }, 0)
    }

    const handleDragEnd = (e: React.DragEvent) => {
        (e.target as HTMLElement).style.opacity = '1'
        setActiveDragTarget(null)
    }

    const handleDragOver = (e: React.DragEvent, targetId: string) => {
        e.preventDefault()
        e.stopPropagation()
        if (activeDragTarget !== targetId) setActiveDragTarget(targetId)
    }

    const handleDrop = async (e: React.DragEvent, targetType: 'folder' | 'doc', targetIdOrName: string) => {
        e.preventDefault()
        e.stopPropagation()
        setActiveDragTarget(null)

        const dragType = e.dataTransfer.getData('dragType')
        const dragId = e.dataTransfer.getData('dragId')
        if (!dragType || !dragId) return

        // 1. MAPPÁK ÁTRENDEZÉSE
        if (dragType === 'folder' && targetType === 'folder') {
            if (dragId === targetIdOrName) return

            const newFolders = [...orderedFolders]
            const draggedIndex = newFolders.indexOf(dragId)
            const targetIndex = newFolders.indexOf(targetIdOrName)

            newFolders.splice(draggedIndex, 1)
            newFolders.splice(targetIndex, 0, dragId)
            setOrderedFolders(newFolders)
            return
        }

        // 2. DOKUMENTUMOK MOZGATÁSA ÉS ÁTRENDEZÉSE
        if (dragType === 'doc') {
            const draggedDoc = documents.find(d => d.id === dragId)
            if (!draggedDoc) return

            let targetFolder = draggedDoc.folder_name || 'Általános'
            let targetIndex = -1 // A végére kerül

            // Ha egy másik doksira ejtették rá (Sorrend csere a mappán belül)
            if (targetType === 'doc') {
                const targetDoc = documents.find(d => d.id === targetIdOrName)
                if (targetDoc) {
                    targetFolder = targetDoc.folder_name || 'Általános'
                    const folderDocs = documents.filter(d => (d.folder_name || 'Általános') === targetFolder)
                    targetIndex = folderDocs.findIndex(d => d.id === targetIdOrName)
                }
            }
            // Ha egy mappára ejtették rá (Átmozgatás a mappába)
            else if (targetType === 'folder') {
                targetFolder = targetIdOrName
                // Ha ugyanabba a mappába dobta rá a mappa fejlécre, akkor tegye a végére
            }

            // Frissítjük a dokumentumok tömbjét
            const otherDocs = documents.filter(d => d.id !== dragId && (d.folder_name || 'Általános') !== targetFolder)
            let currentFolderDocs = documents.filter(d => d.id !== dragId && (d.folder_name || 'Általános') === targetFolder)

            draggedDoc.folder_name = targetFolder

            if (targetIndex === -1) {
                currentFolderDocs.push(draggedDoc)
            } else {
                currentFolderDocs.splice(targetIndex, 0, draggedDoc)
            }

            // Újrapozícionálás
            currentFolderDocs = currentFolderDocs.map((d, idx) => ({ ...d, position: idx }))

            // Azonnali UI Frissítés
            setDocuments([...otherDocs, ...currentFolderDocs])

            // Háttér mentés az adatbázisba
            const updates = currentFolderDocs.map(d => ({ id: d.id, folder_name: d.folder_name || 'Általános', position: d.position || 0 }))
            const result = await updateDocumentOrders(updates)
            if (result?.error) {
                alert(result.error)
                router.refresh()
            }
        }
    }

    // ==========================================

    const toggleFolder = (folder: string) => {
        setExpandedFolders(prev => prev.includes(folder) ? prev.filter(f => f !== folder) : [...prev, folder])
    }

    const handleCreateFolder = () => {
        if (newFolderName.trim() && !customFolders.includes(newFolderName.trim())) {
            const finalName = newFolderName.trim()
            setCustomFolders([...customFolders, finalName])
            setOrderedFolders([...orderedFolders, finalName])
            setExpandedFolders([...expandedFolders, finalName])
        }
        setNewFolderInput(false)
    }

    const handleCreateDocument = async (e: React.FormEvent, folderName: string) => {
        e.preventDefault()
        if (!newDocTitle.trim()) { setIsCreatingDoc(null); return }

        const result = await createDocument(projectId, newDocTitle, folderName)
        if (result.document) {
            setDocuments([...documents, { ...result.document, position: 999 }])
            setActiveDocId(result.document.id)
            setNewDocTitle('')
            setIsCreatingDoc(null)
            if (window.innerWidth < 1024) setIsLeftPanelOpen(false)
        }
    }

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (!confirm('Biztosan törlöd ezt a dokumentumot?')) return
        await deleteDocument(id)
        const newDocs = documents.filter(d => d.id !== id)
        setDocuments(newDocs)
        if (activeDocId === id) setActiveDocId(newDocs[0]?.id || null)
    }

    const handleUpdateTitle = async (id: string) => {
        if (!editTitleValue.trim()) { setEditingTitleId(null); return }
        setSaveStatus('saving')
        setDocuments(docs => docs.map(d => d.id === id ? { ...d, title: editTitleValue } : d))
        setEditingTitleId(null)
        await updateDocument(id, { title: editTitleValue })
        setSaveStatus('saved')
    }

const handleContentChange = (html: string) => {
    // Kimentjük az aktuális ID-t, hogy ha gépelés közben gyorsan átkattintana 
    // egy másik doksira, akkor is a jó dokumentumot mentse el!
    const currentDocId = activeDocId
    if (!currentDocId) return
    
    // 1. Azonnali UI frissítés (Látszólag elmentettük, hogy a gépelés ne akadjon)
    setSaveStatus('saving')
    setDocuments(docs => docs.map(d => d.id === currentDocId ? { ...d, content: html, updated_at: new Date().toISOString() } : d))
    
    // 2. Ha folyamatosan gépel, töröljük az előző (még le nem futott) mentési parancsot
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // 3. Beállítunk egy 1.5 másodperces (1500ms) időzítőt. 
    // Ez csak akkor fut le, ha a felhasználó másfél másodpercig nem ütött le új billentyűt.
    debounceTimerRef.current = setTimeout(async () => {
      await updateDocument(currentDocId, { content: html })
      setSaveStatus('saved') // Ha végzett az adatbázissal, kiírjuk, hogy Mentve.
    }, 1500)
  }

   return (
        <div className="flex h-[calc(100vh-12rem)] min-h-[600px] border border-border rounded-xl bg-surface shadow-sm overflow-hidden relative">
            {/* 1. BAL OLDALSÁV (MAPPÁK ÉS DOKUMENTUMOK) */}
            <div className={`absolute lg:relative z-20 h-full bg-surface border-r border-border flex flex-col transition-all duration-300 ease-in-out ${isLeftPanelOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full lg:translate-x-0 lg:w-0 lg:border-none opacity-0'}`}>
                <div className="p-4 border-b border-border flex items-center justify-between bg-sona-neutral/5">
                    <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        Tudásbázis
                    </h2>
                    <button onClick={() => { setNewFolderInput(true); setNewFolderName('') }} className="p-1.5 rounded-md text-sona-neutral hover:bg-sona-neutral/10 hover:text-foreground transition-colors" title="Új mappa">
                        <FolderPlus className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
                    {newFolderInput && (
                        <div className="flex items-center gap-2 px-2 mb-2">
                            <Folder className="w-4 h-4 text-sona-neutral" />
                            <input autoFocus type="text" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} onBlur={handleCreateFolder} onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()} placeholder="Mappa neve..." className="flex-1 text-sm bg-background border border-primary px-2 py-1 rounded focus:outline-none" />
                        </div>
                    )}

                    {orderedFolders.map(folder => {
                        const folderDocs = documents.filter(d => (d.folder_name || 'Általános') === folder)
                        const isExpanded = expandedFolders.includes(folder)
                        return (
                            <div key={folder} className="flex flex-col gap-1" onDragOver={(e) => handleDragOver(e, `folder-${folder}`)} onDrop={(e) => handleDrop(e, 'folder', folder)}>
                                <div draggable onDragStart={(e) => handleDragStart(e, 'folder', folder)} onDragEnd={handleDragEnd} className={`group flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer transition-colors border ${activeDragTarget === `folder-${folder}` ? 'bg-primary/5 border-primary/50 border-dashed' : 'hover:bg-sona-neutral/10 border-transparent'}`} onClick={() => toggleFolder(folder)}>
                                    <div className="flex items-center gap-2 text-foreground font-medium text-sm">
                                        {isExpanded ? <ChevronDown className="w-4 h-4 text-sona-neutral shrink-0" /> : <ChevronRight className="w-4 h-4 text-sona-neutral shrink-0" />}
                                        <Folder className="w-4 h-4 text-sona-neutral fill-sona-neutral/20 shrink-0" />
                                        <span className="truncate">{folder}</span>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span title="Mappa húzása" className="flex items-center">
                                            <GripVertical className="w-3.5 h-3.5 text-sona-neutral cursor-grab active:cursor-grabbing" />
                                        </span>
                                        <button onClick={(e) => { e.stopPropagation(); setIsCreatingDoc(folder); setExpandedFolders([...expandedFolders, folder]) }} className="p-1 text-sona-neutral hover:text-primary" title="Új dokumentum">
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                                {isExpanded && (
                                    <div className="flex flex-col ml-6 pl-2 border-l border-border/50 gap-0.5 mt-1 min-h-[10px]">
                                        {isCreatingDoc === folder && (
                                            <form onSubmit={(e) => handleCreateDocument(e, folder)} className="mb-2">
                                                <input autoFocus type="text" value={newDocTitle} onChange={e => setNewDocTitle(e.target.value)} onBlur={() => { if (!newDocTitle.trim()) setIsCreatingDoc(null) }} placeholder="Dokumentum neve..." className="w-full text-sm px-2 py-1.5 bg-background border border-primary rounded-md focus:outline-none" />
                                            </form>
                                        )}
                                        {folderDocs.map(doc => (
                                            <div key={doc.id} draggable onDragStart={(e) => handleDragStart(e, 'doc', doc.id)} onDragEnd={handleDragEnd} onDragOver={(e) => handleDragOver(e, `doc-${doc.id}`)} onDrop={(e) => handleDrop(e, 'doc', doc.id)} onClick={() => { setActiveDocId(doc.id); if (window.innerWidth < 1024) setIsLeftPanelOpen(false); }} className={`group flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer transition-colors border text-sm ${activeDragTarget === `doc-${doc.id}` ? 'border-primary/50 border-dashed bg-primary/5' : activeDocId === doc.id ? 'bg-primary/10 text-primary font-medium border-transparent' : 'hover:bg-sona-neutral/10 text-sona-neutral hover:text-foreground border-transparent'}`}>
                                                <div className="flex items-center gap-2 truncate">
                                                    <GripVertical className="w-3 h-3 text-sona-neutral opacity-0 group-hover:opacity-100 cursor-grab shrink-0" />
                                                    <File className="w-3.5 h-3.5 shrink-0" />
                                                    <span className="truncate">{doc.title}</span>
                                                </div>
                                                {/* 🔒 CSAK AKKOR MUTATJUK A KUKÁT, HA VAN JOGA TÖRÖLNI */}
                                                {canDeleteDoc(doc.user_id) && (
                                                    <button onClick={(e) => handleDelete(doc.id, e)} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/10 hover:text-red-500 transition-all shrink-0">
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        {folderDocs.length === 0 && isCreatingDoc !== folder && <span className="text-[10px] text-sona-neutral/50 italic py-1 px-2 uppercase tracking-wide">Ejtés ide</span>}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {isLeftPanelOpen && <div className="absolute inset-0 bg-black/20 z-10 lg:hidden" onClick={() => setIsLeftPanelOpen(false)} />}

            {/* 2. KÖZÉPSŐ RÉSZ (Szerkesztő) */}
            <div className="flex-1 flex flex-col bg-background overflow-hidden min-w-0 z-0">
                <div className="h-14 px-4 border-b border-border flex items-center justify-between bg-surface shrink-0 gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
                        <button onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)} className={`shrink-0 p-1.5 rounded-md transition-colors ${isLeftPanelOpen ? 'bg-primary/10 text-primary' : 'text-sona-neutral hover:bg-sona-neutral/10 hover:text-foreground'}`}>
                            <PanelLeft className="w-5 h-5" />
                        </button>
                        
                        {activeDoc ? (
                            editingTitleId === activeDoc.id ? (
                                <div className="flex items-center gap-2 flex-1">
                                    <input autoFocus type="text" value={editTitleValue} onChange={e => setEditTitleValue(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && activeDoc?.id) handleUpdateTitle(activeDoc.id); if (e.key === 'Escape') setEditingTitleId(null) }} className="flex-1 text-lg font-bold bg-background border border-primary px-3 py-1 rounded-md focus:outline-none" />
                                    <button onClick={() => activeDoc?.id && handleUpdateTitle(activeDoc.id)} className="text-green-600 shrink-0"><Check className="w-5 h-5" /></button>
                                    <button onClick={() => setEditingTitleId(null)} className="text-sona-neutral shrink-0"><X className="w-5 h-5" /></button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 group min-w-0">
                                    <h1 className="text-lg font-bold text-foreground truncate">{activeDoc.title}</h1>
                                    {/* 🔒 CSAK AKKOR MUTATJUK A CÍM SZERKESZTŐT, HA VAN JOGA */}
                                    {canEditActive && (
                                      <button onClick={() => { if(activeDoc?.id) { setEditingTitleId(activeDoc.id); setEditTitleValue(activeDoc.title) } }} className="opacity-0 group-hover:opacity-100 p-1 text-sona-neutral hover:bg-sona-neutral/10 rounded-md transition-all shrink-0"><Edit3 className="w-4 h-4" /></button>
                                    )}
                                </div>
                            )
                        ) : <span className="text-sm font-medium text-sona-neutral">Nincs kiválasztott dokumentum</span>}
                    </div>

                    {activeDoc && (
                        <div className="flex items-center gap-4 shrink-0">
                            <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                                {saveStatus === 'saving' && <span className="text-sona-neutral animate-pulse flex items-center gap-1.5"><Edit3 className="w-3 h-3" /> Mentés...</span>}
                                {saveStatus === 'saved' && <span className="text-green-500 flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> Mentve</span>}
                            </div>
                            <button onClick={() => setIsRightPanelOpen(true)} className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${isRightPanelOpen ? 'bg-primary/10 text-primary' : 'bg-sona-neutral/10 text-sona-neutral hover:text-foreground'}`}>
                                <MessageSquare className="w-4 h-4" />
                                <span className="hidden sm:inline">Részletek</span>
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto">
                    {activeDoc ? (
                        <div className="max-w-4xl mx-auto w-full p-6 sm:p-10 h-full">
                            <RichTextEditor key={activeDoc.id} content={activeDoc.content} onChange={handleContentChange} editable={canEditActive} />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-sona-neutral">
                            <FileText className="w-16 h-16 mb-4 opacity-20" />
                            <p className="text-base font-medium text-foreground">Válassz egy dokumentumot</p>
                            <p className="text-sm mt-1">vagy hozz létre egy újat a mappákból.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* 3. JOBB OLDALSÁV (OVERLAY) */}
            {activeDoc && (
                <div className={`absolute top-0 right-0 bottom-0 z-30 w-80 sm:w-96 bg-surface border-l border-border shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${isRightPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="h-14 px-4 border-b border-border flex items-center justify-between bg-surface shrink-0">
                        <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-sona-neutral" /> Részletek
                        </h3>
                        <button onClick={() => setIsRightPanelOpen(false)} className="p-1.5 rounded-md text-sona-neutral hover:bg-sona-neutral/10">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
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