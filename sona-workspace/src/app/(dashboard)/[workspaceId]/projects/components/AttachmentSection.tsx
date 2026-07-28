'use client'

import { useState, useEffect, useRef } from 'react'
import { Paperclip, X, Download, File as FileIcon, Loader2 } from 'lucide-react'
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

  return (
    <div className="flex flex-col gap-4 mt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-sona-neutral" /> Csatolmányok
        </h3>
        
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden" 
        />
        <Button 
          type="button" 
          variant="secondary" 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="text-xs py-1.5 px-3 h-auto"
        >
          {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Új fájl'}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {attachments.length === 0 && !isUploading && (
          <p className="text-xs text-sona-neutral italic col-span-full">Nincsenek csatolt fájlok.</p>
        )}
        
        {attachments.map((file) => (
          <div key={file.id} className="flex items-center justify-between p-2.5 bg-background border border-border rounded-lg group">
            <a 
              href={file.file_url} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-3 overflow-hidden flex-1 hover:opacity-80 transition-opacity"
            >
              <div className="p-2 bg-sona-neutral/10 rounded-md text-primary shrink-0">
                <FileIcon className="w-4 h-4" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-medium text-foreground truncate">{file.file_name}</span>
                <span className="text-[10px] text-sona-neutral">{formatSize(file.file_size)}</span>
              </div>
            </a>
            
            <button 
              onClick={() => handleDelete(file.id, file.file_url)}
              className="p-1.5 ml-2 rounded text-sona-neutral hover:bg-red-500/10 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
              title="Törlés"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}