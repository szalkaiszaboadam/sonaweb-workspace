'use client'

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  visitorsSeries,
  channelSplit,
  adsPerformance,
  tiktokSeries,
} from '@/lib/data'

const visitorsConfig = {
  visitors: { label: 'Visitors', color: 'var(--chart-1)' },
  leads: { label: 'Leads', color: 'var(--chart-4)' },
} satisfies ChartConfig

export function VisitorsChart() {
  return (
    <ChartContainer config={visitorsConfig} className="h-[260px] w-full">
      <AreaChart data={visitorsSeries} margin={{ left: 4, right: 4, top: 8 }}>
        <defs>
          <linearGradient id="fillVisitors" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-visitors)" stopOpacity={0.5} />
            <stop offset="95%" stopColor="var(--color-visitors)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          className="text-xs"
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          dataKey="visitors"
          type="monotone"
          fill="url(#fillVisitors)"
          stroke="var(--color-visitors)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  )
}

const channelConfig = {
  value: { label: 'Share' },
  TikTok: { label: 'TikTok', color: 'var(--chart-1)' },
  Instagram: { label: 'Instagram', color: 'var(--chart-2)' },
  Facebook: { label: 'Facebook', color: 'var(--chart-3)' },
  Email: { label: 'Email', color: 'var(--chart-4)' },
} satisfies ChartConfig

const channelColors = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
]

export function ChannelChart() {
  return (
    <ChartContainer
      config={channelConfig}
      className="mx-auto aspect-square h-[220px]"
    >
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="channel" />} />
        <Pie
          data={channelSplit}
          dataKey="value"
          nameKey="channel"
          innerRadius={55}
          strokeWidth={4}
          stroke="var(--card)"
        >
          {channelSplit.map((_, i) => (
            <Cell key={i} fill={channelColors[i % channelColors.length]} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}

const adsConfig = {
  facebook: { label: 'Facebook', color: 'var(--chart-3)' },
  instagram: { label: 'Instagram', color: 'var(--chart-2)' },
  tiktok: { label: 'TikTok', color: 'var(--chart-1)' },
} satisfies ChartConfig

export function AdsChart() {
  return (
    <ChartContainer config={adsConfig} className="h-[220px] w-full">
      <BarChart data={adsPerformance} margin={{ left: 4, right: 4, top: 8 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="week"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          className="text-xs"
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="facebook" fill="var(--color-facebook)" radius={3} />
        <Bar dataKey="instagram" fill="var(--color-instagram)" radius={3} />
        <Bar dataKey="tiktok" fill="var(--color-tiktok)" radius={3} />
      </BarChart>
    </ChartContainer>
  )
}

const tiktokConfig = {
  views: { label: 'Views', color: 'var(--chart-1)' },
  followers: { label: 'Followers', color: 'var(--chart-4)' },
} satisfies ChartConfig

export function TikTokChart() {
  return (
    <ChartContainer config={tiktokConfig} className="h-[260px] w-full">
      <AreaChart data={tiktokSeries} margin={{ left: 4, right: 4, top: 8 }}>
        <defs>
          <linearGradient id="fillViews" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-views)" stopOpacity={0.5} />
            <stop offset="95%" stopColor="var(--color-views)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          className="text-xs"
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          dataKey="views"
          type="monotone"
          fill="url(#fillViews)"
          stroke="var(--color-views)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  )
}
