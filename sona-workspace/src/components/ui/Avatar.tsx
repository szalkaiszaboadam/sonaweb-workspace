import React from 'react'
import { User } from 'lucide-react'

type AvatarProps = {
  name?: string | null
  url?: string | null
  className?: string
  fallbackClass?: string
}

export function Avatar({ 
  name, 
  url, 
  className = "w-10 h-10 text-sm", 
  fallbackClass = "bg-primary/10 text-primary border-primary/20" 
}: AvatarProps) {
  const initial = name ? name.charAt(0).toUpperCase() : <User className="w-1/2 h-1/2" />

  return (
    <div className={`rounded-full flex items-center justify-center font-bold shrink-0 overflow-hidden border ${url ? 'bg-surface border-border' : fallbackClass} ${className}`}>
      {url ? (
        <img src={url} alt={name || 'Avatar'} className="w-full h-full object-cover" />
      ) : (
        initial
      )}
    </div>
  )
}