// Smart qualification engine: per-service question sets, lead scoring (0-100),
// tier messaging, consultation routing, upsell rules and VIP membership tiers.

import type { ServiceOffering, ServiceId } from '@/lib/services'

export type QualOption = { value: string; label: string; score: number }

export type QualField = {
  id: string
  label: string
  kind: 'select' | 'text'
  placeholder?: string
  options?: QualOption[]
}

// Categories that require qualification before checkout.
export type QualCategory = 'Website' | 'Advertising' | 'TikTok' | 'Email'

export function categoryNeedsQualification(
  category: ServiceOffering['category'],
): category is QualCategory {
  return (
    category === 'Website' ||
    category === 'Advertising' ||
    category === 'TikTok' ||
    category === 'Email'
  )
}

// Shared option sets ---------------------------------------------------------

const objectiveOptions: QualOption[] = [
  { value: 'leads', label: 'More leads', score: 18 },
  { value: 'sales', label: 'More sales', score: 20 },
  { value: 'brand', label: 'Brand awareness', score: 12 },
  { value: 'info', label: 'Information website', score: 6 },
  { value: 'other', label: 'Other', score: 8 },
]

const revenueOptions: QualOption[] = [
  { value: '<5k', label: 'Under $5k / mo', score: 4 },
  { value: '5-20k', label: '$5k – $20k / mo', score: 12 },
  { value: '20-50k', label: '$20k – $50k / mo', score: 20 },
  { value: '50-100k', label: '$50k – $100k / mo', score: 27 },
  { value: '100k+', label: '$100k+ / mo', score: 32 },
]

// Question sets --------------------------------------------------------------

export const qualQuestions: Record<QualCategory, QualField[]> = {
  Website: [
    { id: 'industry', label: 'What industry are you in?', kind: 'text', placeholder: 'e.g. Skincare, SaaS, Hospitality' },
    {
      id: 'hasWebsite',
      label: 'Do you currently have a website?',
      kind: 'select',
      options: [
        { value: 'no', label: 'No, this would be my first', score: 14 },
        { value: 'outdated', label: 'Yes, but it needs a rebuild', score: 18 },
        { value: 'yes', label: 'Yes, and it performs well', score: 8 },
      ],
    },
    {
      id: 'budget',
      label: 'What is your estimated budget?',
      kind: 'select',
      options: [
        { value: '<2k', label: 'Under $2,000', score: 4 },
        { value: '2-5k', label: '$2,000 – $5,000', score: 16 },
        { value: '5-10k', label: '$5,000 – $10,000', score: 26 },
        { value: '10k+', label: '$10,000+', score: 34 },
      ],
    },
    { id: 'goal', label: 'What is your primary goal?', kind: 'select', options: objectiveOptions },
  ],
  Advertising: [
    {
      id: 'adBudget',
      label: 'Monthly advertising budget',
      kind: 'select',
      options: [
        { value: '<1k', label: 'Under $1,000', score: 4 },
        { value: '1-5k', label: '$1,000 – $5,000', score: 16 },
        { value: '5-15k', label: '$5,000 – $15,000', score: 26 },
        { value: '15k+', label: '$15,000+', score: 34 },
      ],
    },
    { id: 'revenue', label: 'Current monthly revenue', kind: 'select', options: revenueOptions },
    {
      id: 'runsAds',
      label: 'Do you currently run ads?',
      kind: 'select',
      options: [
        { value: 'no', label: 'No, not yet', score: 6 },
        { value: 'self', label: 'Yes, managed in-house', score: 14 },
        { value: 'agency', label: 'Yes, with another agency', score: 18 },
      ],
    },
    { id: 'objective', label: 'Main objective', kind: 'select', options: objectiveOptions },
    { id: 'industry', label: 'Industry', kind: 'text', placeholder: 'e.g. E-commerce, Local services' },
  ],
  TikTok: [
    { id: 'profile', label: 'TikTok profile link', kind: 'text', placeholder: 'https://tiktok.com/@yourbrand' },
    {
      id: 'followers',
      label: 'Current follower count',
      kind: 'select',
      options: [
        { value: '<1k', label: 'Under 1,000', score: 6 },
        { value: '1-10k', label: '1,000 – 10,000', score: 14 },
        { value: '10-50k', label: '10,000 – 50,000', score: 22 },
        { value: '50k+', label: '50,000+', score: 30 },
      ],
    },
    { id: 'revenue', label: 'Monthly revenue', kind: 'select', options: revenueOptions },
    { id: 'objective', label: 'Main objective', kind: 'select', options: objectiveOptions },
    { id: 'industry', label: 'Industry', kind: 'text', placeholder: 'e.g. Fashion, Food & beverage' },
  ],
  Email: [
    {
      id: 'subscribers',
      label: 'Subscriber count',
      kind: 'select',
      options: [
        { value: '<1k', label: 'Under 1,000', score: 6 },
        { value: '1-10k', label: '1,000 – 10,000', score: 16 },
        { value: '10-50k', label: '10,000 – 50,000', score: 26 },
        { value: '50k+', label: '50,000+', score: 34 },
      ],
    },
    {
      id: 'platform',
      label: 'Current email platform',
      kind: 'select',
      options: [
        { value: 'none', label: 'None yet', score: 6 },
        { value: 'mailchimp', label: 'Mailchimp', score: 14 },
        { value: 'klaviyo', label: 'Klaviyo', score: 18 },
        { value: 'other', label: 'Other', score: 12 },
      ],
    },
    { id: 'revenue', label: 'Monthly revenue', kind: 'select', options: revenueOptions },
    { id: 'objective', label: 'Main objective', kind: 'select', options: objectiveOptions },
  ],
}

export type QualTier = 'high' | 'medium' | 'low'

export type QualResult = {
  score: number
  tier: QualTier
  headline: string
  message: string
  allowPurchase: boolean
  revenuePotential: number
}

// Compute a 0-100 lead score from answers by summing scored options and
// normalizing against the maximum achievable score for that question set.
export function scoreQualification(
  category: QualCategory,
  answers: Record<string, string>,
): number {
  const fields = qualQuestions[category]
  let earned = 0
  let max = 0
  for (const field of fields) {
    if (!field.options) continue
    const best = Math.max(...field.options.map((o) => o.score))
    max += best
    const chosen = field.options.find((o) => o.value === answers[field.id])
    if (chosen) earned += chosen.score
  }
  if (max === 0) return 0
  return Math.round((earned / max) * 100)
}

export function tierFromScore(score: number): QualTier {
  if (score >= 70) return 'high'
  if (score >= 45) return 'medium'
  return 'low'
}

// Rough monthly revenue-potential estimate used in the admin lead center.
export function estimateRevenuePotential(
  service: ServiceOffering,
  score: number,
): number {
  const base = service.unit === 'monthly' ? service.price * 12 : service.price
  return Math.round(base * (0.6 + score / 100))
}

export function evaluateQualification(
  service: ServiceOffering,
  answers: Record<string, string>,
): QualResult {
  const category = service.category as QualCategory
  const score = scoreQualification(category, answers)
  const tier = tierFromScore(score)
  const revenuePotential = estimateRevenuePotential(service, score)

  if (tier === 'high') {
    return {
      score,
      tier,
      headline: 'Excellent fit for SONAWEB.',
      message:
        'Your goals and resources align perfectly with this service. You can proceed to checkout right away.',
      allowPurchase: true,
      revenuePotential,
    }
  }
  if (tier === 'medium') {
    return {
      score,
      tier,
      headline: 'Good fit for SONAWEB.',
      message:
        'This service is a strong match for where your business is today. You can proceed to checkout.',
      allowPurchase: true,
      revenuePotential,
    }
  }
  return {
    score,
    tier,
    headline: 'We recommend a free strategy consultation first.',
    message:
      'Before investing, let’s make sure this is the right move for your business. Book a free strategy call and our team will map out the best path for you.',
    allowPurchase: false,
    revenuePotential,
  }
}

// Consultation routing -------------------------------------------------------

export const consultationByCategory: Record<QualCategory, string> = {
  Website: 'Website Strategy Call',
  Advertising: 'Advertising Audit',
  TikTok: 'TikTok Growth Call',
  Email: 'Email Marketing Audit',
}

export const consultationTypes = [
  'Website Strategy Call',
  'Marketing Strategy Call',
  'TikTok Growth Call',
  'Advertising Audit',
  'Email Marketing Audit',
]

// Smart upsell engine --------------------------------------------------------

export const upsellRules: Partial<Record<ServiceId, ServiceId[]>> = {
  website: ['facebook-ads', 'tiktok-marketing', 'email-marketing'],
  'website-maintenance': ['facebook-ads', 'email-marketing'],
  'tiktok-production': ['tiktok-ads', 'facebook-content'],
  'tiktok-marketing': ['tiktok-ads', 'tiktok-production'],
  'facebook-ads': ['website', 'email-marketing'],
  'instagram-ads': ['website', 'email-marketing'],
  'tiktok-ads': ['website', 'email-marketing'],
  'instagram-content': ['instagram-ads', 'social-management'],
  'facebook-content': ['facebook-ads', 'social-management'],
  'social-management': ['facebook-ads', 'email-marketing'],
  'email-marketing': ['newsletter', 'facebook-ads'],
  newsletter: ['email-marketing', 'instagram-content'],
}

// Recommend services the client doesn't own yet, driven by what they do own.
export function recommendedUpsells(owned: ServiceId[]): ServiceId[] {
  const set = new Set<ServiceId>()
  for (const id of owned) {
    for (const rec of upsellRules[id] ?? []) {
      if (!owned.includes(rec)) set.add(rec)
    }
  }
  return [...set]
}

// VIP membership tiers -------------------------------------------------------

export type MemberTier = 'Member' | 'Pro' | 'Elite' | 'Black'

export const memberTiers: {
  id: MemberTier
  label: string
  minSpend: number
  accent: string
  benefits: string[]
}[] = [
  {
    id: 'Member',
    label: 'Member',
    minSpend: 0,
    accent: 'text-muted-foreground',
    benefits: ['Standard support', 'Access to the client portal', 'Monthly reporting'],
  },
  {
    id: 'Pro',
    label: 'Pro',
    minSpend: 1500,
    accent: 'text-chart-2',
    benefits: [
      'Priority support',
      'Faster turnaround times',
      'Quarterly strategy calls',
    ],
  },
  {
    id: 'Elite',
    label: 'Elite',
    minSpend: 3500,
    accent: 'text-chart-4',
    benefits: [
      'Priority support',
      'Faster turnaround times',
      'Exclusive monthly strategy calls',
      'Early access to new services',
    ],
  },
  {
    id: 'Black',
    label: 'Black',
    minSpend: 6000,
    accent: 'text-primary',
    benefits: [
      'White-glove priority support',
      'Fastest turnaround times',
      'Exclusive strategy calls',
      'Early access to new services',
      'Dedicated account manager',
    ],
  },
]

export function tierFromSpend(monthlySpend: number): MemberTier {
  const sorted = [...memberTiers].sort((a, b) => b.minSpend - a.minSpend)
  return (sorted.find((t) => monthlySpend >= t.minSpend)?.id as MemberTier) ?? 'Member'
}

export function getMemberTier(id: MemberTier) {
  return memberTiers.find((t) => t.id === id)!
}

// Client health score --------------------------------------------------------

export type HealthInputs = {
  activeServices: number
  monthlySpend: number
  engagement: number // 0-100, portal activity
  projectCompletion: number // 0-100
  meetingsAttended: number
}

export function clientHealthScore(input: HealthInputs): number {
  const services = Math.min(input.activeServices / 6, 1) * 25
  const spend = Math.min(input.monthlySpend / 6000, 1) * 25
  const engagement = (input.engagement / 100) * 20
  const completion = (input.projectCompletion / 100) * 20
  const meetings = Math.min(input.meetingsAttended / 4, 1) * 10
  return Math.round(services + spend + engagement + completion + meetings)
}

export function healthLabel(score: number): { label: string; tone: string } {
  if (score >= 80) return { label: 'Excellent', tone: 'text-chart-2' }
  if (score >= 60) return { label: 'Healthy', tone: 'text-chart-4' }
  if (score >= 40) return { label: 'Needs attention', tone: 'text-primary' }
  return { label: 'At risk', tone: 'text-destructive' }
}
