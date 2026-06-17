import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  Globe,
  Music2,
  ImageIcon,
  Megaphone,
  Mail,
  FileText,
  FolderOpen,
  MessageSquare,
  Settings,
  Target,
  CalendarClock,
  CalendarCheck,
  Sparkles,
  LayoutGrid,
  Users,
  ClipboardList,
  Kanban,
  FolderKanban,
} from 'lucide-react'

export type NavItem = {
  label: string
  href: string
  icon: LucideIcon
  group: 'overview' | 'services' | 'marketing' | 'workspace'
}

export type TeamNavItem = {
  label: string
  href: string
  icon: LucideIcon
  group: 'team-overview' | 'team-ops'
}

export const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/client',
    icon: LayoutDashboard,
    group: 'overview',
  },
  {
    label: 'Success Center',
    href: '/client/success',
    icon: Target,
    group: 'overview',
  },
  {
    label: 'Services',
    href: '/client/services',
    icon: Sparkles,
    group: 'services',
  },
  {
    label: 'Invoices',
    href: '/client/invoices',
    icon: FileText,
    group: 'services',
  },
  { label: 'Website', href: '/client/website', icon: Globe, group: 'marketing' },
  { label: 'TikTok', href: '/client/tiktok', icon: Music2, group: 'marketing' },
  {
    label: 'Content',
    href: '/client/content',
    icon: ImageIcon,
    group: 'marketing',
  },
  {
    label: 'Scheduling',
    href: '/client/scheduling',
    icon: CalendarClock,
    group: 'marketing',
  },
  {
    label: 'Advertisements',
    href: '/client/ads',
    icon: Megaphone,
    group: 'marketing',
  },
  {
    label: 'Email Marketing',
    href: '/client/email',
    icon: Mail,
    group: 'marketing',
  },
  {
    label: 'Meetings',
    href: '/client/meetings',
    icon: CalendarCheck,
    group: 'workspace',
  },
  {
    label: 'Documents',
    href: '/client/documents',
    icon: FolderOpen,
    group: 'workspace',
  },
  {
    label: 'Messages',
    href: '/client/messages',
    icon: MessageSquare,
    group: 'workspace',
  },
  {
    label: 'Settings',
    href: '/client/settings',
    icon: Settings,
    group: 'workspace',
  },
]

export const navGroups: { id: NavItem['group']; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'services', label: 'Services & Billing' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'workspace', label: 'Workspace' },
]

export const teamNavItems: TeamNavItem[] = [
  {
    label: 'Command Center',
    href: '/admin',
    icon: LayoutGrid,
    group: 'team-overview',
  },
  {
    label: 'Clients',
    href: '/admin/clients',
    icon: Users,
    group: 'team-ops',
  },
  {
    label: 'Projects',
    href: '/admin/projects',
    icon: FolderKanban,
    group: 'team-ops',
  },
  {
    label: 'Leads Pipeline',
    href: '/admin/leads',
    icon: ClipboardList,
    group: 'team-ops',
  },
  {
    label: 'Content Production',
    href: '/admin/content',
    icon: Kanban,
    group: 'team-ops',
  },
]

export const teamNavGroups: { id: TeamNavItem['group']; label: string }[] = [
  { id: 'team-overview', label: 'Overview' },
  { id: 'team-ops', label: 'Operations' },
]
