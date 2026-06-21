'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import {
  defaultOwnedServices,
  routeAccess,
  serviceCatalog,
  type ServiceId,
} from '@/lib/services'
import { tierFromSpend, type MemberTier, type QualTier } from '@/lib/qualification'

export type ContentStatus =
  | 'Draft'
  | 'Waiting For Approval'
  | 'Approved'
  | 'Scheduled'
  | 'Published'
  | 'Rejected'

export type Platform = 'TikTok' | 'Facebook' | 'Instagram'

export type Comment = {
  id: string
  author: string
  text: string
  time: string
}

export type ContentItem = {
  id: string
  title: string
  platform: Platform
  type: string
  caption: string
  hashtags: string
  status: ContentStatus
  date: string // ISO date string YYYY-MM-DD
  time: string // HH:MM
  comments: Comment[]
}

export type Notification = {
  id: string
  title: string
  body: string
  time: string
  read: boolean
  type: 'approval' | 'website' | 'report' | 'invoice' | 'meeting' | 'service' | 'order'
}

export type Meeting = {
  id: string
  type: string
  date: string
  time: string
  duration: number
  status: 'Upcoming' | 'Completed'
}

export type LeadStatus = 'New' | 'Approved' | 'Flagged' | 'Follow-up'

export type Lead = {
  id: string
  name: string
  company: string
  serviceId: ServiceId
  serviceName: string
  category: string
  answers: { label: string; value: string }[]
  score: number
  tier: QualTier
  revenuePotential: number
  status: LeadStatus
  accountManager: string | null
  createdAt: string
}

const today = new Date()
function iso(offsetDays: number) {
  const d = new Date(today)
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

const initialContent: ContentItem[] = [
  {
    id: 'c1',
    title: 'Behind the Brew — v2',
    platform: 'TikTok',
    type: 'TikTok Video',
    caption: 'Ever wondered how your morning cup comes to life? ☕',
    hashtags: '#coffee #behindthescenes #smallbusiness',
    status: 'Waiting For Approval',
    date: iso(1),
    time: '09:00',
    comments: [],
  },
  {
    id: 'c2',
    title: 'Launch Day Carousel',
    platform: 'Instagram',
    type: 'Instagram Post',
    caption: 'The wait is over. Meet the new collection.',
    hashtags: '#launch #newcollection #design',
    status: 'Waiting For Approval',
    date: iso(2),
    time: '12:30',
    comments: [],
  },
  {
    id: 'c3',
    title: 'Weekend Promo',
    platform: 'Facebook',
    type: 'Facebook Post',
    caption: 'This weekend only — 20% off everything.',
    hashtags: '#weekendsale #promo',
    status: 'Scheduled',
    date: iso(3),
    time: '10:00',
    comments: [],
  },
  {
    id: 'c4',
    title: 'Founder Story Reel',
    platform: 'Instagram',
    type: 'Instagram Reel',
    caption: 'How it started vs. how it’s going.',
    hashtags: '#founderstory #journey',
    status: 'Approved',
    date: iso(4),
    time: '17:00',
    comments: [],
  },
  {
    id: 'c5',
    title: 'Trending Sound Skit',
    platform: 'TikTok',
    type: 'TikTok Video',
    caption: 'When the order is finally ready 😅',
    hashtags: '#fyp #trending #funny',
    status: 'Draft',
    date: iso(6),
    time: '15:00',
    comments: [],
  },
  {
    id: 'c6',
    title: 'Customer Spotlight',
    platform: 'Facebook',
    type: 'Facebook Post',
    caption: 'Meet Sofia — one of our favorite regulars.',
    hashtags: '#community #spotlight',
    status: 'Published',
    date: iso(-2),
    time: '11:00',
    comments: [],
  },
]

const initialMeetings: Meeting[] = [
  {
    id: 'm1',
    type: 'Marketing consultation',
    date: iso(2),
    time: '14:00',
    duration: 30,
    status: 'Upcoming',
  },
]

const initialLeads: Lead[] = [
  {
    id: 'l1',
    name: 'Marcus Bennett',
    company: 'Verde Market',
    serviceId: 'facebook-ads',
    serviceName: 'Facebook Advertising',
    category: 'Advertising',
    answers: [
      { label: 'Monthly advertising budget', value: '$15,000+' },
      { label: 'Current monthly revenue', value: '$100k+ / mo' },
      { label: 'Do you currently run ads?', value: 'Yes, with another agency' },
      { label: 'Main objective', value: 'More sales' },
      { label: 'Industry', value: 'E-commerce' },
    ],
    score: 92,
    tier: 'high',
    revenuePotential: 14400,
    status: 'New',
    accountManager: null,
    createdAt: '2026-06-12',
  },
  {
    id: 'l2',
    name: 'Sofia Larsen',
    company: 'Atelier Nord',
    serviceId: 'website',
    serviceName: 'Website Development',
    category: 'Website',
    answers: [
      { label: 'What industry are you in?', value: 'Interior design' },
      { label: 'Do you currently have a website?', value: 'Yes, but it needs a rebuild' },
      { label: 'What is your estimated budget?', value: '$5,000 – $10,000' },
      { label: 'What is your primary goal?', value: 'More leads' },
    ],
    score: 71,
    tier: 'high',
    revenuePotential: 7100,
    status: 'Approved',
    accountManager: 'Elena Marsh',
    createdAt: '2026-06-10',
  },
  {
    id: 'l3',
    name: 'Daniel Cho',
    company: 'Cho Coffee Co.',
    serviceId: 'tiktok-marketing',
    serviceName: 'TikTok Marketing',
    category: 'TikTok',
    answers: [
      { label: 'TikTok profile link', value: '@chocoffee' },
      { label: 'Current follower count', value: '1,000 – 10,000' },
      { label: 'Monthly revenue', value: '$5k – $20k / mo' },
      { label: 'Main objective', value: 'Brand awareness' },
      { label: 'Industry', value: 'Food & beverage' },
    ],
    score: 52,
    tier: 'medium',
    revenuePotential: 9200,
    status: 'Follow-up',
    accountManager: null,
    createdAt: '2026-06-08',
  },
  {
    id: 'l4',
    name: 'Priya Nair',
    company: 'Bloom Studio',
    serviceId: 'email-marketing',
    serviceName: 'Email Marketing',
    category: 'Email',
    answers: [
      { label: 'Subscriber count', value: 'Under 1,000' },
      { label: 'Current email platform', value: 'None yet' },
      { label: 'Monthly revenue', value: 'Under $5k / mo' },
      { label: 'Main objective', value: 'Information website' },
    ],
    score: 28,
    tier: 'low',
    revenuePotential: 4500,
    status: 'Flagged',
    accountManager: null,
    createdAt: '2026-06-05',
  },
]

const initialNotifications: Notification[] = [
  {
    id: 'n1',
    title: 'Content ready for approval',
    body: '2 new posts are waiting for your approval.',
    time: '2h ago',
    read: false,
    type: 'approval',
  },
  {
    id: 'n2',
    title: 'Website update completed',
    body: 'The development phase reached 64%.',
    time: '5h ago',
    read: false,
    type: 'website',
  },
  {
    id: 'n3',
    title: 'New report uploaded',
    body: 'Your July performance report is available.',
    time: '2d ago',
    read: true,
    type: 'report',
  },
]

type PortalContextValue = {
  ownedServices: ServiceId[]
  hasService: (id: ServiceId) => boolean
  isRouteUnlocked: (href: string) => boolean
  unlockService: (id: ServiceId) => void
  notifications: Notification[]
  unreadCount: number
  addNotification: (n: Omit<Notification, 'id' | 'time' | 'read'>) => void
  markAllRead: () => void
  content: ContentItem[]
  addContent: (c: Omit<ContentItem, 'id' | 'comments'>) => void
  setContentStatus: (id: string, status: ContentStatus) => void
  addComment: (id: string, text: string) => void
  meetings: Meeting[]
  addMeeting: (m: Omit<Meeting, 'id' | 'status'>) => void
  leads: Lead[]
  addLead: (l: Omit<Lead, 'id' | 'status' | 'accountManager' | 'createdAt'>) => void
  setLeadStatus: (id: string, status: LeadStatus) => void
  assignManager: (id: string, manager: string) => void
  monthlySpend: number
  memberTier: MemberTier
  assistantOpen: boolean
  setAssistantOpen: (open: boolean) => void
}

const PortalContext = createContext<PortalContextValue | null>(null)

export function PortalProvider({ children }: { children: React.ReactNode }) {
  const [ownedServices, setOwnedServices] =
    useState<ServiceId[]>(defaultOwnedServices)
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications)
  const [content, setContent] = useState<ContentItem[]>(initialContent)
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings)
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [assistantOpen, setAssistantOpen] = useState(false)

  const addNotification = useCallback(
    (n: Omit<Notification, 'id' | 'time' | 'read'>) => {
      setNotifications((prev) => [
        { ...n, id: `n${Date.now()}`, time: 'Just now', read: false },
        ...prev,
      ])
    },
    [],
  )

  const hasService = useCallback(
    (id: ServiceId) => ownedServices.includes(id),
    [ownedServices],
  )

  const isRouteUnlocked = useCallback(
    (href: string) => {
      const required = routeAccess[href]
      if (!required) return true
      return required.some((s) => ownedServices.includes(s))
    },
    [ownedServices],
  )

  const unlockService = useCallback(
    (id: ServiceId) => {
      setOwnedServices((prev) => (prev.includes(id) ? prev : [...prev, id]))
      addNotification({
        title: 'Service unlocked',
        body: 'Your new service is now active in the portal.',
        type: 'service',
      })
    },
    [addNotification],
  )

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const addContent = useCallback(
    (c: Omit<ContentItem, 'id' | 'comments'>) => {
      setContent((prev) => [{ ...c, id: `c${Date.now()}`, comments: [] }, ...prev])
      addNotification({
        title: 'New content scheduled',
        body: `"${c.title}" was added to the calendar.`,
        type: 'approval',
      })
    },
    [addNotification],
  )

  const setContentStatus = useCallback(
    (id: string, status: ContentStatus) => {
      setContent((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status } : c)),
      )
    },
    [],
  )

  const addComment = useCallback(
    (id: string, text: string) => {
      setContent((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                comments: [
                  ...c.comments,
                  {
                    id: `cm${Date.now()}`,
                    author: 'You',
                    text,
                    time: 'Just now',
                  },
                ],
              }
            : c,
        ),
      )
      addNotification({
        title: 'Feedback submitted',
        body: 'The SONAWEB team has been notified of your feedback.',
        type: 'approval',
      })
    },
    [addNotification],
  )

  const addMeeting = useCallback(
    (m: Omit<Meeting, 'id' | 'status'>) => {
      setMeetings((prev) => [
        ...prev,
        { ...m, id: `m${Date.now()}`, status: 'Upcoming' },
      ])
      addNotification({
        title: 'Meeting booked',
        body: `Your ${m.type.toLowerCase()} is confirmed for ${m.date} at ${m.time}.`,
        type: 'meeting',
      })
    },
    [addNotification],
  )

  const addLead = useCallback(
    (l: Omit<Lead, 'id' | 'status' | 'accountManager' | 'createdAt'>) => {
      setLeads((prev) => [
        {
          ...l,
          id: `l${Date.now()}`,
          status: 'New',
          accountManager: null,
          createdAt: new Date().toISOString().slice(0, 10),
        },
        ...prev,
      ])
    },
    [],
  )

  const setLeadStatus = useCallback((id: string, status: LeadStatus) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)))
  }, [])

  const assignManager = useCallback((id: string, manager: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, accountManager: manager } : l)),
    )
  }, [])

  const monthlySpend = useMemo(
    () =>
      ownedServices.reduce((sum, id) => {
        const svc = serviceCatalog.find((s) => s.id === id)
        if (!svc) return sum
        return sum + (svc.unit === 'monthly' ? svc.price : 0)
      }, 0),
    [ownedServices],
  )

  const memberTier = useMemo(() => tierFromSpend(monthlySpend), [monthlySpend])

  const unreadCount = notifications.filter((n) => !n.read).length

  const value = useMemo<PortalContextValue>(
    () => ({
      ownedServices,
      hasService,
      isRouteUnlocked,
      unlockService,
      notifications,
      unreadCount,
      addNotification,
      markAllRead,
      content,
      addContent,
      setContentStatus,
      addComment,
      meetings,
      addMeeting,
      leads,
      addLead,
      setLeadStatus,
      assignManager,
      monthlySpend,
      memberTier,
      assistantOpen,
      setAssistantOpen,
    }),
    [
      ownedServices,
      hasService,
      isRouteUnlocked,
      unlockService,
      notifications,
      unreadCount,
      addNotification,
      markAllRead,
      content,
      addContent,
      setContentStatus,
      addComment,
      meetings,
      addMeeting,
      leads,
      addLead,
      setLeadStatus,
      assignManager,
      monthlySpend,
      memberTier,
      assistantOpen,
    ],
  )

  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>
}

export function usePortal() {
  const ctx = useContext(PortalContext)
  if (!ctx) throw new Error('usePortal must be used within PortalProvider')
  return ctx
}
