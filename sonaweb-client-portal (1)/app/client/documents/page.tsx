import { PageHeader } from '@/components/portal-shell'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { documents } from '@/lib/data'
import { FileText, Download, Search, Upload } from 'lucide-react'

export default function DocumentsPage() {
  return (
    <>
      <PageHeader
        title="Documents"
        description="Contracts, reports, marketing plans and shared creative assets."
        action={
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </Button>
        }
      />

      <Card className="p-5">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            className="border-border bg-background pl-9"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((d) => (
            <div
              key={d.id}
              className="group flex flex-col rounded-lg border border-border bg-secondary/40 p-4 transition-colors hover:border-primary/50"
            >
              <div className="flex items-start justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 text-primary">
                  <FileText className="h-4 w-4" />
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label={`Download ${d.name}`}
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </div>
              <p className="mt-3 line-clamp-1 text-sm font-medium text-foreground">
                {d.name}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {d.type} · {d.size}
              </p>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Added {d.date}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}
