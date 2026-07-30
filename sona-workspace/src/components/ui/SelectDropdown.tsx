
'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, User } from 'lucide-react'

type Option = {
  id: string
  label: string
  subLabel?: string
}

type Props = {
  options: Option[]
  value: string | null
  onChange: (value: string | null) => void
  placeholder?: string
  icon?: React.ReactNode
}

export function SelectDropdown({ options, value, onChange, placeholder = "Válassz...", icon }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Bezárás, ha kákattintunk a komponensen kívülre
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find(o => o.id === value)

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Kiválasztott elem / Gomb */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-sm bg-background border border-border px-3 py-2 rounded-md hover:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary transition-colors text-foreground"
      >
        <div className="flex items-center gap-2 truncate">
          {icon && <span className="text-sona-neutral shrink-0">{icon}</span>}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-sona-neutral shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Legördülő doboz */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto p-1 animate-in fade-in zoom-in-95 duration-150">
          <button
            type="button"
            onClick={() => {
              onChange(null)
              setIsOpen(false)
            }}
            className="w-full flex items-center justify-between px-3 py-2 text-sm text-sona-neutral hover:bg-sona-neutral/10 rounded-md transition-colors text-left"
          >
            <span>Nincs kiosztva</span>
            {!value && <Check className="w-4 h-4 text-primary" />}
          </button>

          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                onChange(opt.id)
                setIsOpen(false)
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors text-left ${
                value === opt.id ? 'bg-primary/10 text-primary font-medium' : 'text-foreground hover:bg-sona-neutral/10'
              }`}
            >
              <div className="flex flex-col truncate">
                <span className="truncate">{opt.label}</span>
                {opt.subLabel && <span className="text-xs text-sona-neutral">{opt.subLabel}</span>}
              </div>
              {value === opt.id && <Check className="w-4 h-4 text-primary shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}