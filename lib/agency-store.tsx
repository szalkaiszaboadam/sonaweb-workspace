'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react'

export type ServiceCategory =
  | 'Website'
  | 'TikTok'
  | 'Content'
  | 'Advertising'
  | 'Email'

export type Tier = 'Starter' | 'Pro' | 'Elite'

export type ProjectStatus =
  | 'Discovery'
  | 'In Progress'
  | 'Awaiting Client'
  | 'Review'
  | 'Live'
  | 'Delayed'

export type AgencyProject = {
  id: string
  clientId: string
  name: string
  service: ServiceCategory
  status: ProjectStatus
  progress: number
  due: string
  nextMilestone: string
  missingMaterials: string[]
}

export type ApprovalItem = {
  id: string
  clientId: string
  type: 'Video' | 'Post'
  title: string
  platform: string
  submitted: string
  status: 'Pending' | 'Approved' | 'Changes Requested'
}

export type AgencyMeeting = {
  id: string
  clientId: string
  title: string
  date: string // ISO date
  time: string
  kind: 'Meeting' | 'Shoot' | 'Photography'
}

export type AgencyClient = {
  id: string
  company: string
  contact: string
  email: string
  country: string
  city: string
  coordinates: [number, number] // [lng, lat]
  tier: Tier
  monthlySpend: number
  lifetimeSpend: number
  services: ServiceCategory[]
  status: 'Active' | 'At Risk' | 'Onboarding'
  health: number
  manager: string
}

// The portal client (single-tenant client view) maps to this agency client.
export const CURRENT_CLIENT_ID = 'verde'

const seedClients: AgencyClient[] = [
  {
    id: 'verde',
    company: 'Verde Market',
    contact: 'Marcus Bennett',
    email: 'marcus@verdemarket.com',
    country: 'United Kingdom',
    city: 'London',
    coordinates: [-0.1276, 51.5072],
    tier: 'Elite',
    monthlySpend: 4200,
    lifetimeSpend: 38400,
    services: ['Website', 'TikTok', 'Content', 'Advertising'],
    status: 'Active',
    health: 92,
    manager: 'Elena Marsh',
  },
  {
    id: 'atelier',
    company: 'Atelier Nord',
    contact: 'Sofia Larsen',
    email: 'sofia@ateliernord.com',
    country: 'Sweden',
    city: 'Stockholm',
    coordinates: [18.0686, 59.3293],
    tier: 'Pro',
    monthlySpend: 2400,
    lifetimeSpend: 21600,
    services: ['Content', 'Email'],
    status: 'Active',
    health: 78,
    manager: 'Elena Marsh',
  },
  {
    id: 'cho',
    company: 'Cho Coffee Co.',
    contact: 'Daniel Cho',
    email: 'daniel@chocoffee.com',
    country: 'Denmark',
    city: 'Copenhagen',
    coordinates: [12.5683, 55.6761],
    tier: 'Pro',
    monthlySpend: 1800,
    lifetimeSpend: 9400,
    services: ['Content', 'TikTok'],
    status: 'At Risk',
    health: 54,
    manager: 'Tom Reyes',
  },
  {
    id: 'bloom',
    company: 'Bloom Studio',
    contact: 'Priya Nair',
    email: 'priya@bloomstudio.com',
    country: 'Netherlands',
    city: 'Amsterdam',
    coordinates: [4.9041, 52.3676],
    tier: 'Starter',
    monthlySpend: 600,
    lifetimeSpend: 3000,
    services: ['Website'],
    status: 'At Risk',
    health: 41,
    manager: 'Tom Reyes',
  },
  {
    id: 'northwind',
    company: 'Northwind Fitness',
    contact: 'Jordan Hayes',
    email: 'jordan@northwind.fit',
    country: 'Germany',
    city: 'Berlin',
    coordinates: [13.405, 52.52],
    tier: 'Elite',
    monthlySpend: 3900,
    lifetimeSpend: 31200,
    services: ['Website', 'TikTok', 'Advertising', 'Email'],
    status: 'Active',
    health: 88,
    manager: 'Elena Marsh',
  },
  {
    id: 'lumen',
    company: 'Lumen Dental',
    contact: 'Dr. Amara Okafor',
    email: 'amara@lumendental.com',
    country: 'Ireland',
    city: 'Dublin',
    coordinates: [-6.2603, 53.3498],
    tier: 'Pro',
    monthlySpend: 2100,
    lifetimeSpend: 6300,
    services: ['Website', 'Content', 'Email'],
    status: 'Onboarding',
    health: 69,
    manager: 'Tom Reyes',
  },
  {
    id: 'moda',
    company: 'Móda Studio',
    contact: 'Giulia Romano',
    email: 'giulia@modastudio.it',
    country: 'Italy',
    city: 'Milan',
    coordinates: [9.19, 45.4642],
    tier: 'Elite',
    monthlySpend: 4600,
    lifetimeSpend: 41400,
    services: ['TikTok', 'Content', 'Advertising'],
    status: 'Active',
    health: 84,
    manager: 'Elena Marsh',
  },
  {
    id: 'brew',
    company: 'Brew & Co.',
    contact: 'Lars Eriksen',
    email: 'lars@brewco.no',
    country: 'Norway',
    city: 'Oslo',
    coordinates: [10.7522, 59.9139],
    tier: 'Pro',
    monthlySpend: 2200,
    lifetimeSpend: 15400,
    services: ['TikTok', 'Advertising'],
    status: 'Active',
    health: 81,
    manager: 'Tom Reyes',
  },
  {
    id: 'verdure',
    company: 'Verdure Paris',
    contact: 'Camille Dubois',
    email: 'camille@verdure.fr',
    country: 'France',
    city: 'Paris',
    coordinates: [2.3522, 48.8566],
    tier: 'Starter',
    monthlySpend: 820,
    lifetimeSpend: 4100,
    services: ['Email'],
    status: 'Onboarding',
    health: 63,
    manager: 'Tom Reyes',
  },
]

const seedProjects: AgencyProject[] = [
  {
    id: 'p1',
    clientId: 'verde',
    name: 'E-commerce website rebuild',
    service: 'Website',
    status: 'In Progress',
    progress: 68,
    due: '2026-06-28',
    nextMilestone: 'Design review of product pages',
    missingMaterials: ['High-res product photography', 'Brand font license'],
  },
  {
    id: 'p2',
    clientId: 'verde',
    name: 'June TikTok content batch',
    service: 'TikTok',
    status: 'Review',
    progress: 90,
    due: '2026-06-16',
    nextMilestone: '8 videos awaiting your approval',
    missingMaterials: [],
  },
  {
    id: 'p3',
    clientId: 'atelier',
    name: 'Homepage redesign',
    service: 'Website',
    status: 'Awaiting Client',
    progress: 45,
    due: '2026-06-22',
    nextMilestone: 'Need copy approval to continue',
    missingMaterials: ['Approved homepage copy'],
  },
  {
    id: 'p4',
    clientId: 'northwind',
    name: 'Summer ad campaign',
    service: 'Advertising',
    status: 'In Progress',
    progress: 55,
    due: '2026-06-25',
    nextMilestone: 'Creative production',
    missingMaterials: [],
  },
  {
    id: 'p5',
    clientId: 'bloom',
    name: 'Landing page build',
    service: 'Website',
    status: 'Delayed',
    progress: 30,
    due: '2026-06-14',
    nextMilestone: 'Blocked — awaiting client assets for 9 days',
    missingMaterials: ['Logo files', 'Service descriptions', 'Testimonials'],
  },
  {
    id: 'p6',
    clientId: 'cho',
    name: 'Product photography shoot',
    service: 'Content',
    status: 'Discovery',
    progress: 15,
    due: '2026-06-30',
    nextMilestone: 'Schedule on-site shoot',
    missingMaterials: ['Shoot location confirmation'],
  },
  {
    id: 'p7',
    clientId: 'moda',
    name: 'TikTok production — June',
    service: 'TikTok',
    status: 'In Progress',
    progress: 72,
    due: '2026-06-19',
    nextMilestone: 'Editing 4 of 8 videos',
    missingMaterials: [],
  },
  {
    id: 'p8',
    clientId: 'lumen',
    name: 'Website launch',
    service: 'Website',
    status: 'Review',
    progress: 95,
    due: '2026-06-17',
    nextMilestone: 'Final QA before go-live',
    missingMaterials: [],
  },
]

const seedApprovals: ApprovalItem[] = [
  { id: 'a1', clientId: 'verde', type: 'Video', title: 'Summer launch teaser', platform: 'TikTok', submitted: '2026-06-13', status: 'Pending' },
  { id: 'a2', clientId: 'verde', type: 'Video', title: 'Behind the scenes — market', platform: 'TikTok', submitted: '2026-06-13', status: 'Pending' },
  { id: 'a3', clientId: 'verde', type: 'Post', title: 'Weekend offer carousel', platform: 'Instagram', submitted: '2026-06-12', status: 'Pending' },
  { id: 'a4', clientId: 'moda', type: 'Video', title: 'Runway recap edit', platform: 'TikTok', submitted: '2026-06-13', status: 'Pending' },
  { id: 'a5', clientId: 'moda', type: 'Post', title: 'New collection drop', platform: 'Instagram', submitted: '2026-06-12', status: 'Pending' },
  { id: 'a6', clientId: 'northwind', type: 'Post', title: 'Transformation Tuesday', platform: 'Facebook', submitted: '2026-06-11', status: 'Pending' },
  { id: 'a7', clientId: 'cho', type: 'Video', title: 'Latte art tutorial', platform: 'TikTok', submitted: '2026-06-10', status: 'Approved' },
  { id: 'a8', clientId: 'brew', type: 'Video', title: 'Cold brew recipe', platform: 'TikTok', submitted: '2026-06-13', status: 'Pending' },
]

// This week is anchored around the demo "today" of 2026-06-14.
const seedMeetings: AgencyMeeting[] = [
  { id: 'm1', clientId: 'verde', title: 'Monthly strategy review', date: '2026-06-15', time: '10:00', kind: 'Meeting' },
  { id: 'm2', clientId: 'moda', title: 'TikTok video shoot', date: '2026-06-16', time: '09:00', kind: 'Shoot' },
  { id: 'm3', clientId: 'cho', title: 'Product photography session', date: '2026-06-17', time: '13:00', kind: 'Photography' },
  { id: 'm4', clientId: 'northwind', title: 'Ad campaign kickoff', date: '2026-06-18', time: '11:00', kind: 'Meeting' },
  { id: 'm5', clientId: 'brew', title: 'TikTok shoot — Oslo', date: '2026-06-19', time: '14:00', kind: 'Shoot' },
  { id: 'm6', clientId: 'lumen', title: 'Website launch walkthrough', date: '2026-06-20', time: '15:30', kind: 'Meeting' },
  { id: 'm7', clientId: 'atelier', title: 'Content planning', date: '2026-06-23', time: '10:30', kind: 'Meeting' },
]

const TODAY = new Date('2026-06-14T00:00:00')

function withinThisWeek(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`)
  const diff = (d.getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24)
  return diff >= 0 && diff <= 7
}

const TEAM_PASSCODE = 'sonaweb'
const AUTH_KEY = 'sonaweb_team_auth'

type AgencyContextValue = {
  clients: AgencyClient[]
  projects: AgencyProject[]
  approvals: ApprovalItem[]
  meetings: AgencyMeeting[]
  // derived metrics for the command center
  metrics: {
    activeClients: number
    mrr: number
    meetingsThisWeek: number
    videosPending: number
    postsPending: number
    delayedProjects: number
    shootsThisWeek: number
    urgentTasks: number
  }
  // actions
  setProjectStatus: (id: string, status: ProjectStatus) => void
  setProjectProgress: (id: string, progress: number) => void
  resolveApproval: (id: string, status: ApprovalItem['status']) => void
  getClient: (id: string) => AgencyClient | undefined
  // team auth (separate team system)
  teamAuthed: boolean
  login: (passcode: string) => boolean
  logout: () => void
}

const AgencyContext = createContext<AgencyContextValue | null>(null)

export function AgencyProvider({ children }: { children: React.ReactNode }) {
  const [clients] = useState<AgencyClient[]>(seedClients)
  const [projects, setProjects] = useState<AgencyProject[]>(seedProjects)
  const [approvals, setApprovals] = useState<ApprovalItem[]>(seedApprovals)
  const [meetings] = useState<AgencyMeeting[]>(seedMeetings)
  const [teamAuthed, setTeamAuthed] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.sessionStorage.getItem(AUTH_KEY) === '1') setTeamAuthed(true)
  }, [])

  const setProjectStatus = useCallback((id: string, status: ProjectStatus) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status,
              progress: status === 'Live' ? 100 : p.progress,
            }
          : p,
      ),
    )
  }, [])

  const setProjectProgress = useCallback((id: string, progress: number) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, progress: Math.max(0, Math.min(100, progress)) } : p,
      ),
    )
  }, [])

  const resolveApproval = useCallback(
    (id: string, status: ApprovalItem['status']) => {
      setApprovals((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a)),
      )
    },
    [],
  )

  const getClient = useCallback(
    (id: string) => clients.find((c) => c.id === id),
    [clients],
  )

  const login = useCallback((passcode: string) => {
    const ok = passcode.trim().toLowerCase() === TEAM_PASSCODE
    if (ok) {
      setTeamAuthed(true)
      if (typeof window !== 'undefined')
        window.sessionStorage.setItem(AUTH_KEY, '1')
    }
    return ok
  }, [])

  const logout = useCallback(() => {
    setTeamAuthed(false)
    if (typeof window !== 'undefined') window.sessionStorage.removeItem(AUTH_KEY)
  }, [])

  const metrics = useMemo(() => {
    const pendingApprovals = approvals.filter((a) => a.status === 'Pending')
    const delayed = projects.filter((p) => p.status === 'Delayed')
    const awaiting = projects.filter((p) => p.status === 'Awaiting Client')
    return {
      activeClients: clients.filter((c) => c.status !== 'Onboarding').length,
      mrr: clients.reduce((s, c) => s + c.monthlySpend, 0),
      meetingsThisWeek: meetings.filter((m) => withinThisWeek(m.date)).length,
      videosPending: pendingApprovals.filter((a) => a.type === 'Video').length,
      postsPending: pendingApprovals.filter((a) => a.type === 'Post').length,
      delayedProjects: delayed.length,
      shootsThisWeek: meetings.filter(
        (m) => m.kind !== 'Meeting' && withinThisWeek(m.date),
      ).length,
      urgentTasks: delayed.length + awaiting.length + pendingApprovals.length,
    }
  }, [clients, projects, approvals, meetings])

  const value = useMemo<AgencyContextValue>(
    () => ({
      clients,
      projects,
      approvals,
      meetings,
      metrics,
      setProjectStatus,
      setProjectProgress,
      resolveApproval,
      getClient,
      teamAuthed,
      login,
      logout,
    }),
    [
      clients,
      projects,
      approvals,
      meetings,
      metrics,
      setProjectStatus,
      setProjectProgress,
      resolveApproval,
      getClient,
      teamAuthed,
      login,
      logout,
    ],
  )

  return <AgencyContext.Provider value={value}>{children}</AgencyContext.Provider>
}

export function useAgency() {
  const ctx = useContext(AgencyContext)
  if (!ctx) throw new Error('useAgency must be used within AgencyProvider')
  return ctx
}
