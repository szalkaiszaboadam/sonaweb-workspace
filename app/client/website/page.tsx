import { PageHeader } from '@/components/portal-shell'
import { StatCard } from '@/components/stat-card'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { websiteProject } from '@/lib/data'
import {
  Globe,
  ShieldCheck,
  Gauge,
  Activity,
  CheckCircle2,
  Circle,
  Loader2,
  Upload,
  FileText,
  ImageIcon,
  Video,
  FileType,
} from 'lucide-react'

const uploads = [
  { label: 'Logo files', icon: ImageIcon, status: 'Complete' },
  { label: 'Brand guidelines', icon: FileType, status: 'Complete' },
  { label: 'Images', icon: ImageIcon, status: 'In Progress', progress: 60 },
  { label: 'Videos', icon: Video, status: 'Pending' },
  { label: 'Text content', icon: FileText, status: 'In Progress', progress: 40 },
  { label: 'Company information', icon: FileText, status: 'Complete' },
  { label: 'Legal documents', icon: FileText, status: 'Pending' },
]

const maintenance = [
  { date: 'Aug 8', label: 'Security patch + plugin updates' },
  { date: 'Jul 30', label: 'Homepage hero redesign deployed' },
  { date: 'Jul 22', label: 'Image optimization & caching' },
  { date: 'Jul 14', label: 'Contact form spam protection added' },
]

function stageIcon(status: string) {
  if (status === 'Complete')
    return <CheckCircle2 className="h-5 w-5 text-primary" />
  if (status === 'In Progress')
    return <Loader2 className="h-5 w-5 animate-spin text-primary" />
  return <Circle className="h-5 w-5 text-muted-foreground" />
}

export default function WebsitePage() {
  return (
    <>
      <PageHeader
        title="Website"
        description="Project status, health monitoring and your live website development timeline."
        action={
          <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-primary" />
            {websiteProject.status}
          </Badge>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Domain" value="aurelia-studio.com" sub="Registered" />
        <StatCard label="SSL Certificate" value={websiteProject.ssl} sub="Valid 9 months" />
        <StatCard label="Speed Score" value={`${websiteProject.speed}/100`} delta={4} sub="PageSpeed" />
        <StatCard label="Uptime" value={`${websiteProject.uptime}%`} sub="Last 30 days" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Timeline */}
        <Card className="p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground">
            Website Development Timeline
          </h3>
          <p className="text-xs text-muted-foreground">
            8 phases from discovery to post-launch support
          </p>
          <ol className="mt-5 space-y-1">
            {websiteProject.stages.map((stage, i) => (
              <li key={stage.name} className="flex gap-4">
                <div className="flex flex-col items-center">
                  {stageIcon(stage.status)}
                  {i < websiteProject.stages.length - 1 && (
                    <span className="my-1 w-px flex-1 bg-border" />
                  )}
                </div>
                <div className="flex-1 pb-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">
                      {i + 1}. {stage.name}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {stage.date}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${stage.progress}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-xs font-medium text-muted-foreground">
                      {stage.progress}%
                    </span>
                  </div>
                  {stage.status === 'In Progress' && (
                    <p className="mt-1.5 text-xs text-primary">
                      Action needed: upload remaining images & text content
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </Card>

        <div className="space-y-4">
          {/* Health */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-foreground">
              Health Monitoring
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              {[
                { icon: Globe, label: 'Status', value: 'Online' },
                { icon: ShieldCheck, label: 'SSL', value: 'Secure' },
                { icon: Gauge, label: 'Avg. load', value: '0.9s' },
                { icon: Activity, label: 'Form submissions', value: '47 this mo.' },
              ].map((h) => (
                <li key={h.label} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <h.icon className="h-4 w-4" />
                    {h.label}
                  </span>
                  <span className="font-medium text-foreground">{h.value}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Maintenance */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-foreground">
              Maintenance History
            </h3>
            <ul className="mt-4 space-y-3">
              {maintenance.map((m) => (
                <li key={m.date} className="flex gap-3 text-sm">
                  <span className="w-12 shrink-0 text-xs font-medium text-muted-foreground">
                    {m.date}
                  </span>
                  <span className="text-foreground">{m.label}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      {/* Upload center */}
      <Card className="mt-4 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Client Upload Center
            </h3>
            <p className="text-xs text-muted-foreground">
              Upload the assets we need to keep your project moving
            </p>
          </div>
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            Upload files
          </Button>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {uploads.map((u) => (
            <div
              key={u.label}
              className="rounded-lg border border-border bg-secondary/40 p-4"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <u.icon className="h-4 w-4 text-primary" />
                  {u.label}
                </span>
                <Badge
                  variant={u.status === 'Complete' ? 'default' : 'outline'}
                  className="text-[10px]"
                >
                  {u.status}
                </Badge>
              </div>
              {u.status === 'In Progress' && (
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${u.progress}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}
