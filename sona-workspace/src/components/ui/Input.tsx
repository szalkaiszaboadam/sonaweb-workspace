'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

// Ha korábban definiáltál saját típusokat, azokat nyugodtan hagyd meg, 
// a lényeg a belső logika!
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Input({ label, type = 'text', ...props }: InputProps) {
  const [showPassword, setShowPassword] = useState(false)
  
  const isPassword = type === 'password'
  const currentType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="relative flex items-center">
        <input
          type={currentType}
          className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground"
          {...props}
        />
        {/* Jelszó láthatóság kapcsoló gomb */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 text-sona-neutral hover:text-foreground transition-colors"
            tabIndex={-1} // Ne ugorjon rá a Tab billentyűvel
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  )
}