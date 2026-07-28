'use client'

import { X } from 'lucide-react'
import { useEffect } from 'react'

type ModalProps = {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

// 1. ITT VESSZÜK ÁT A className PARAMÉTERT:
export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  // Esc gombra bezáródik az ablak
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Sötét háttér overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* 2. ITT HASZNÁLJUK FEL A className-t a max-w-md HELYETT! */}
      <div className={`relative bg-surface w-full rounded-xl shadow-lg border border-border p-6 m-4 animate-in fade-in zoom-in-95 duration-200 ${className || 'max-w-md'}`}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          <button 
            onClick={onClose}
            className="text-sona-neutral hover:text-foreground transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}