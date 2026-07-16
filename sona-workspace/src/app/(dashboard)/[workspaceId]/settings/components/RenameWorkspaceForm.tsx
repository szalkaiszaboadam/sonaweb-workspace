'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { updateWorkspaceName } from '../actions'
import { Save, Check } from 'lucide-react'

export function RenameWorkspaceForm({ 
  workspaceId, 
  initialName 
}: { 
  workspaceId: string
  initialName: string 
}) {
  const [name, setName] = useState(initialName)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)

  const handleSave = async () => {
    if (name === initialName) return

    setIsLoading(true)
    setError(null)
    setIsSaved(false)

    const result = await updateWorkspaceName(workspaceId, name)

    if (result.error) {
      setError(result.error)
    } else {
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
    }
    setIsLoading(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <Input 
            label="Munkaterület neve"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="pl. Marketing Csapat"
          />
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isLoading || name === initialName || !name.trim()}
          className="w-full sm:w-auto flex items-center gap-2"
        >
          {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {isLoading ? 'Mentés...' : isSaved ? 'Mentve!' : 'Mentés'}
        </Button>
      </div>
      {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
    </div>
  )
}