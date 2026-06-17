import { PageHeader } from '@/components/portal-shell'
import { StatCard } from '@/components/stat-card'
import { TikTokChart } from '@/components/dashboard-charts'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play, TrendingUp } from 'lucide-react'

const topVideos = [
  { title: 'Behind the Brew', views: '182K', engagement: '11.4%', status: 'Published' },
  { title: 'Morning ritual ASMR', views: '141K', engagement: '9.8%', status: 'Published' },
  { title: 'Founder story pt.1', views: '98K', engagement: '8.2%', status: 'Published' },
  { title: 'New flavor drop', views: '67K', engagement: '7.1%', status: 'Published' },
]

const workflow = [
  { stage: 'Scripting', count: 3 },
  { stage: 'Filming', count: 2 },
  { stage: 'Editing', count: 4 },
  { stage: 'Approval', count: 2 },
  { stage: 'Scheduled', count: 5 },
]

export default function TikTokPage() {
  return (
    <>
      <PageHeader
        title="TikTok"
        description="Your dedicated TikTok analytics, content workflow and monthly plan."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Views" value="568K" delta={35.2} sub="this month" />
        <StatCard label="Reach" value="412K" delta={28.4} sub="unique" />
        <StatCard label="Engagement Rate" value="9.6%" delta={1.8} sub="avg" />
        <StatCard label="Avg. Watch Time" value="18.2s" delta={2.1} sub="per view" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Monthly Growth
              </h3>
              <p className="text-xs text-muted-foreground">
                Views & follower trajectory
              </p>
            </div>
            <Badge variant="secondary" className="gap-1">
              <TrendingUp className="h-3 w-3 text-primary" /> +205% YoY
            </Badge>
          </div>
          <div className="mt-4">
            <TikTokChart />
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-foreground">
            Production Workflow
          </h3>
          <p className="text-xs text-muted-foreground">Videos by stage</p>
          <ul className="mt-4 space-y-3">
            {workflow.map((w) => (
              <li key={w.stage}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{w.stage}</span>
                  <span className="font-medium text-foreground">{w.count}</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(w.count / 5) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-foreground">
            Top Performing Videos
          </h3>
          <ul className="mt-4 space-y-3">
            {topVideos.map((v) => (
              <li
                key={v.title}
                className="flex items-center gap-3 rounded-lg border border-border bg-secondary/40 p-3"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 text-primary">
                  <Play className="h-4 w-4" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{v.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {v.views} views · {v.engagement} engagement
                  </p>
                </div>
                <Badge variant="default" className="text-[10px]">
                  {v.status}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-foreground">
            Monthly Content Plan
          </h3>
          <p className="text-xs text-muted-foreground">August calendar</p>
          <div className="mt-4 grid grid-cols-7 gap-1.5">
            {Array.from({ length: 31 }).map((_, i) => {
              const hasPost = [2, 5, 8, 11, 14, 17, 20, 23].includes(i)
              return (
                <div
                  key={i}
                  className={`flex aspect-square items-center justify-center rounded-md text-xs ${
                    hasPost
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'bg-secondary/40 text-muted-foreground'
                  }`}
                >
                  {i + 1}
                </div>
              )
            })}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            8 videos scheduled · 6 published · 2 awaiting approval
          </p>
        </Card>
      </div>
    </>
  )
}
