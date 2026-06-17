import { PageHeader } from '@/components/portal-shell'
import { StatCard } from '@/components/stat-card'
import { AdsChart } from '@/components/dashboard-charts'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LockedGate } from '@/components/locked-gate'

const campaigns = [
  { name: 'Summer retargeting', platform: 'Facebook', status: 'Active', spend: 1240, leads: 86, roas: '5.2x' },
  { name: 'Launch awareness', platform: 'Instagram', status: 'Active', spend: 980, leads: 64, roas: '4.6x' },
  { name: 'TikTok spark ads', platform: 'TikTok', status: 'Active', spend: 1450, leads: 112, roas: '6.1x' },
  { name: 'Lookalike prospecting', platform: 'Facebook', status: 'Paused', spend: 720, leads: 38, roas: '3.4x' },
]

export default function AdsPage() {
  return (
    <LockedGate route="/client/ads">
      <PageHeader
        title="Advertisements"
        description="Performance across Facebook, Instagram and TikTok advertising."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Ad Spend" value="$4,390" sub="this month" />
        <StatCard label="Cost per Lead" value="$14.60" delta={-8.2} sub="vs last month" />
        <StatCard label="Cost per Click" value="$0.42" delta={-5.1} sub="blended" />
        <StatCard label="Blended ROAS" value="4.9x" delta={0.6} sub="all platforms" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground">
            ROAS by Platform
          </h3>
          <p className="text-xs text-muted-foreground">Weekly trend</p>
          <div className="mt-4">
            <AdsChart />
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-foreground">Results</h3>
          <ul className="mt-4 space-y-4 text-sm">
            {[
              { label: 'Generated leads', value: '300' },
              { label: 'Conversions', value: '94' },
              { label: 'Impressions', value: '1.8M' },
              { label: 'Total clicks', value: '42.1K' },
            ].map((r) => (
              <li key={r.label} className="flex items-center justify-between">
                <span className="text-muted-foreground">{r.label}</span>
                <span className="font-semibold text-foreground">{r.value}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mt-4 p-5">
        <h3 className="text-sm font-semibold text-foreground">
          Campaign Performance
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="pb-2 font-medium">Campaign</th>
                <th className="pb-2 font-medium">Platform</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 text-right font-medium">Spend</th>
                <th className="pb-2 text-right font-medium">Leads</th>
                <th className="pb-2 text-right font-medium">ROAS</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.name} className="border-b border-border/50">
                  <td className="py-3 font-medium text-foreground">{c.name}</td>
                  <td className="py-3 text-muted-foreground">{c.platform}</td>
                  <td className="py-3">
                    <Badge
                      variant={c.status === 'Active' ? 'default' : 'outline'}
                      className="text-[10px]"
                    >
                      {c.status}
                    </Badge>
                  </td>
                  <td className="py-3 text-right text-foreground">${c.spend}</td>
                  <td className="py-3 text-right text-foreground">{c.leads}</td>
                  <td className="py-3 text-right font-semibold text-primary">
                    {c.roas}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </LockedGate>
  )
}
