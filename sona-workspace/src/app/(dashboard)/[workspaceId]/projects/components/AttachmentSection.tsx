'use client'

import { useState, useEffect, useRef } from 'react'
// ÚJ IKONOK BEIMPORTÁLVA: Plus, Trash2
import { Paperclip, Plus, Trash2, X, Download, File as FileIcon, Loader2 } from 'lucide-react'
import { getAttachments, deleteAttachment, uploadAttachment } from '../actions'
import { Button } from '@/components/ui/Button'

type Attachment = {
  id: string
  file_name: string
  file_url: string
  file_size: number
}

export function AttachmentSection({ targetType, targetId }: { targetType: 'task' | 'document', targetId: string }) {
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function loadAttachments() {
      const { attachments: data } = await getAttachments(targetType, targetId)
      if (data) setAttachments(data)
    }
    loadAttachments()
  }, [targetType, targetId])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 5MB korlát példaként
    if (file.size > 5 * 1024 * 1024) {
      alert('A fájl mérete nem haladhatja meg az 5MB-ot.')
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    const { attachment, error } = await uploadAttachment(targetType, targetId, formData)
    
    if (error) {
      alert(error)
    } else if (attachment) {
      setAttachments([attachment, ...attachments])
    }
    
    setIsUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = '' // Töröljük az inputot
  }

  const handleDelete = async (id: string, fileUrl: string) => {
    if (!confirm('Törlöd a csatolmányt?')) return
    
    // Kinyerjük a fájlnevet a végéből a Storage törléshez
    const urlParts = fileUrl.split('/')
    const storageFileName = urlParts[urlParts.length - 1]

    await deleteAttachment(id, storageFileName)
    setAttachments(attachments.filter(a => a.id !== id))
  }

  // Fájlméret formázó
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  // 1. ESET: NINCSENEK FÁJLOK (TELJESEN REJTETT NÉZET)
  if (attachments.length === 0) {
    return (
      // A felületen semmi sem látszik, de a rejtett input itt csücsül a háttérben, 
      // így a TaskModal "Hozzáadás..." menüje tudja használni (JavaScript .click()-el)!
      <div className="hidden">
        <input
          type="file"
          id={`file-upload-${targetId}`}
          onChange={handleFileChange} 
          disabled={isUploading}
          ref={fileInputRef}
        />
      </div>
    )
  }

  // 2. ESET: VANNAK FÁJLOK (MEGJELENIK A SZEKCIÓ)
  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300">
      
      {/* Fejléc */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Paperclip className="w-5 h-5 text-sona-neutral" /> Csatolmányok
        </h3>
        
        {/* Feltöltő gomb - Rejtett inputtal */}
        <div className="relative">
          <input
            type="file"
            id={`file-upload-${targetId}`}
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
            ref={fileInputRef}
          />
          <label
            htmlFor={`file-upload-${targetId}`}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer transition-colors ${
              isUploading 
                ? 'bg-sona-neutral/20 text-sona-neutral cursor-not-allowed' 
                : 'bg-primary/10 text-primary hover:bg-primary/20'
            }`}
          >
            <Plus className="w-4 h-4" />
            {isUploading ? 'Feltöltés...' : 'Új fájl'}
          </label>
        </div>
      </div>

      {/* Fájlok rácsa */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {attachments.map((file) => (
          <div 
            key={file.id} 
            className="group relative flex items-center justify-between p-3 bg-surface border border-border rounded-xl hover:border-primary/50 transition-colors"
          >
            <a 
              href={file.file_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 flex-1 min-w-0"
            >
              <div className="p-2 bg-sona-neutral/10 rounded-lg shrink-0">
                <Paperclip className="w-4 h-4 text-foreground" />
              </div>
              
              {/* ITT VAN A JAVÍTOTT, TÖBBSOROS FÁJLNÉV! */}
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-medium text-foreground break-all line-clamp-2 whitespace-normal leading-tight">
                  {file.file_name}
                </span>
                <span className="text-xs text-sona-neutral mt-0.5">
                  {formatSize(file.file_size)}
                </span>
              </div>
            </a>

            <button
              onClick={() => handleDelete(file.id, file.file_url)}
              className="p-2 text-sona-neutral hover:text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-2"
              title="Fájl törlése"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}