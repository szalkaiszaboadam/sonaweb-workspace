import { Folder, Rocket, Lightbulb, Laptop, Smartphone, Palette, BarChart, Wrench, Target, Sparkles } from 'lucide-react'

export const PROJECT_ICONS = [
  { id: 'folder', icon: Folder },
  { id: 'rocket', icon: Rocket },
  { id: 'lightbulb', icon: Lightbulb },
  { id: 'laptop', icon: Laptop },
  { id: 'smartphone', icon: Smartphone },
  { id: 'palette', icon: Palette },
  { id: 'barchart', icon: BarChart },
  { id: 'wrench', icon: Wrench },
  { id: 'target', icon: Target },
  { id: 'sparkles', icon: Sparkles },
]

export const PROJECT_COLORS = [
  { id: 'primary', bg: 'bg-primary/20', text: 'text-primary', border: 'border-primary' },
  { id: 'blue', bg: 'bg-blue-500/20', text: 'text-blue-500', border: 'border-blue-500' },
  { id: 'emerald', bg: 'bg-emerald-500/20', text: 'text-emerald-500', border: 'border-emerald-500' },
  { id: 'violet', bg: 'bg-violet-500/20', text: 'text-violet-500', border: 'border-violet-500' },
  { id: 'amber', bg: 'bg-amber-500/20', text: 'text-amber-500', border: 'border-amber-500' },
  { id: 'rose', bg: 'bg-rose-500/20', text: 'text-rose-500', border: 'border-rose-500' }
]

// Segédfüggvény, ami visszaadja a kért ikont (ha nincs, mappát ad)
export function getProjectIcon(id: string) {
  return PROJECT_ICONS.find(i => i.id === id)?.icon || Folder
}

// Segédfüggvény a színekhez
export function getProjectColor(id: string) {
  return PROJECT_COLORS.find(c => c.id === id) || PROJECT_COLORS[0]
}