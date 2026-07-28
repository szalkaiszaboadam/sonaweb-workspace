'use client'

import { File, Download, ExternalLink, HardDrive } from 'lucide-react'

type FileItem = {
  id: string
  file_name: string
  file_url: string
  file_size: number
  created_at: string
}

export function FilesView({ files, title = "Fájlok" }: { files: FileItem[], title?: string }) {
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return (
    <div className="flex flex-col h-full bg-surface border border-border rounded-xl shadow-sm p-6 overflow-hidden">
      <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
        <HardDrive className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        <span className="ml-2 px-2 py-0.5 bg-sona-neutral/10 text-sona-neutral rounded-full text-xs font-medium">
          {files.length} db
        </span>
      </div>

      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-sona-neutral">
          <File className="w-12 h-12 mb-4 opacity-20" />
          <p className="text-sm">Nincsenek feltöltött fájlok.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-4">
          {files.map((file) => (
            <div key={file.id} className="flex flex-col bg-background border border-border rounded-lg p-4 group hover:border-primary/50 transition-colors">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-3 bg-primary/10 text-primary rounded-lg shrink-0">
                  <File className="w-6 h-6" />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-semibold text-foreground truncate" title={file.file_name}>
                    {file.file_name}
                  </span>
                  <span className="text-xs text-sona-neutral mt-0.5">
                    {formatSize(file.file_size)} • {new Date(file.created_at).toLocaleDateString('hu-HU')}
                  </span>
                </div>
              </div>
              
              <div className="mt-auto pt-3 border-t border-border flex items-center justify-end gap-2">
                <a 
                  href={file.file_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs font-medium text-sona-neutral hover:text-primary transition-colors p-1.5 hover:bg-primary/10 rounded-md"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Megnyitás
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}