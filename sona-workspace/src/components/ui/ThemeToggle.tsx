'use client'

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "./Button"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Megvárjuk, amíg a kliens betölt, hogy elkerüljük a hydration errort
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div className="w-10 h-10"></div>

  return (
    <Button
      variant="secondary"
      className="w-10 h-10 !p-0 rounded-full flex items-center justify-center bg-transparent border-none hover:bg-sona-neutral/10"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Téma váltása"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 text-foreground" />
      ) : (
        <Moon className="h-5 w-5 text-foreground" />
      )}
    </Button>
  )
}