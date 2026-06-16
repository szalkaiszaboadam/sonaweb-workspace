// Master catalog of services SONAWEB sells. Each service can gate a portal route.
// Replace owned-service resolution with Supabase/Stripe data when wiring the backend.

export type ServiceId =
  | 'website'
  | 'website-maintenance'
  | 'tiktok-marketing'
  | 'tiktok-production'
  | 'facebook-content'
  | 'instagram-content'
  | 'social-management'
  | 'facebook-ads'
  | 'instagram-ads'
  | 'tiktok-ads'
  | 'email-marketing'
  | 'newsletter'

export type ServiceOffering = {
  id: ServiceId
  name: string
  tagline: string
  price: number
  unit: 'one-time' | 'monthly'
  delivery: string
  category: 'Website' | 'TikTok' | 'Content' | 'Advertising' | 'Email'
  description: string
  includes: string[]
  benefits: string[]
  caseStudy: { client: string; result: string; metric: string }
}

export const serviceCatalog: ServiceOffering[] = [
  {
    id: 'website',
    name: 'Website Development',
    tagline: 'A conversion-focused website engineered to grow your brand.',
    price: 4800,
    unit: 'one-time',
    delivery: '4–6 weeks',
    category: 'Website',
    description:
      'A fully bespoke, high-performance website built around your brand and your business goals. From strategy to launch, our team designs, builds, and optimizes every pixel for conversion.',
    includes: [
      'Discovery & strategy workshop',
      'Custom UI/UX design',
      'Responsive development',
      'CMS integration & training',
      'Performance & SEO optimization',
      '30 days post-launch support',
    ],
    benefits: [
      'Higher conversion rates',
      'Faster load times & better SEO',
      'A premium brand presence',
    ],
    caseStudy: {
      client: 'Lumen Skincare',
      result: 'Rebuilt their storefront and saw conversions climb',
      metric: '+38% conversion rate',
    },
  },
  {
    id: 'website-maintenance',
    name: 'Website Maintenance',
    tagline: 'Keep your site fast, secure, and always up to date.',
    price: 240,
    unit: 'monthly',
    delivery: 'Ongoing',
    category: 'Website',
    description:
      'Proactive monitoring, security patches, backups, and content updates so your website always performs at its best without you lifting a finger.',
    includes: [
      'Daily backups & monitoring',
      'Security updates & patches',
      'Monthly content updates',
      'Uptime & speed reporting',
      'Priority technical support',
    ],
    benefits: ['Zero downtime', 'Always secure', 'Peace of mind'],
    caseStudy: {
      client: 'Atelier Nord',
      result: 'Maintained 99.99% uptime across a full year',
      metric: '99.99% uptime',
    },
  },
  {
    id: 'tiktok-marketing',
    name: 'TikTok Marketing',
    tagline: 'Go viral with a strategy built for the For You page.',
    price: 1100,
    unit: 'monthly',
    delivery: 'Ongoing',
    category: 'TikTok',
    description:
      'A full TikTok growth engine — trend research, content strategy, posting cadence, and community management designed to grow your following and drive real business results.',
    includes: [
      'Monthly TikTok strategy',
      'Trend & hashtag research',
      'Posting & scheduling',
      'Community management',
      'Performance analytics',
    ],
    benefits: ['Explosive reach', 'Engaged community', 'Trend-ready content'],
    caseStudy: {
      client: 'Brew & Co.',
      result: 'Grew from 0 to 120k followers in five months',
      metric: '120k followers',
    },
  },
  {
    id: 'tiktok-production',
    name: 'TikTok Video Production',
    tagline: 'Scroll-stopping short-form video, produced for you.',
    price: 890,
    unit: 'monthly',
    delivery: '8 videos / mo',
    category: 'TikTok',
    description:
      'Professional short-form video production — concepting, filming, and editing 8 high-performing TikTok videos every month, fully managed by our creative team.',
    includes: [
      '8 produced videos / month',
      'Concepting & scripting',
      'Professional editing',
      'Captions & hashtags',
      'Trend-driven hooks',
    ],
    benefits: ['Consistent output', 'Studio-grade quality', 'Higher watch time'],
    caseStudy: {
      client: 'Móda Studio',
      result: 'Averaged 280k views per produced video',
      metric: '280k avg views',
    },
  },
  {
    id: 'facebook-content',
    name: 'Facebook Content Creation',
    tagline: 'On-brand Facebook content that builds community.',
    price: 640,
    unit: 'monthly',
    delivery: '12 posts / mo',
    category: 'Content',
    description:
      'A steady stream of branded Facebook posts — graphics, copy, and scheduling — crafted to keep your audience engaged and your page active.',
    includes: [
      '12 posts / month',
      'Custom graphics & copy',
      'Scheduling & publishing',
      'Engagement reporting',
    ],
    benefits: ['Always-on presence', 'Brand consistency', 'Audience growth'],
    caseStudy: {
      client: 'Verde Market',
      result: 'Doubled page engagement in one quarter',
      metric: '+104% engagement',
    },
  },
  {
    id: 'instagram-content',
    name: 'Instagram Content Creation',
    tagline: 'A feed worth following — designed and managed for you.',
    price: 680,
    unit: 'monthly',
    delivery: '12 posts / mo',
    category: 'Content',
    description:
      'Beautifully designed Instagram posts, carousels, and reels with captions and scheduling, all built to grow your followers and strengthen your brand.',
    includes: [
      '12 posts / month',
      'Carousels & reels',
      'Captions & hashtags',
      'Scheduling & publishing',
    ],
    benefits: ['Cohesive aesthetic', 'More saves & shares', 'Follower growth'],
    caseStudy: {
      client: 'Lumen Skincare',
      result: 'Grew followers by 47k in six months',
      metric: '+47k followers',
    },
  },
  {
    id: 'social-management',
    name: 'Social Media Management',
    tagline: 'Your entire social presence, fully managed.',
    price: 1100,
    unit: 'monthly',
    delivery: 'Full service',
    category: 'Content',
    description:
      'End-to-end management across all your social channels — strategy, content, scheduling, community management, and reporting under one roof.',
    includes: [
      'Multi-channel strategy',
      'Content calendar',
      'Daily community management',
      'Monthly reporting',
    ],
    benefits: ['One team, all channels', 'Time saved', 'Consistent growth'],
    caseStudy: {
      client: 'Atelier Nord',
      result: 'Unified five channels into one growth engine',
      metric: '3.2x reach',
    },
  },
  {
    id: 'facebook-ads',
    name: 'Facebook Advertising',
    tagline: 'Profitable Facebook campaigns, managed end to end.',
    price: 750,
    unit: 'monthly',
    delivery: 'Ongoing',
    category: 'Advertising',
    description:
      'Full-funnel Facebook ad management — creative, targeting, optimization, and reporting — engineered to maximize your return on ad spend.',
    includes: [
      'Campaign strategy & setup',
      'Ad creative & copy',
      'Audience targeting',
      'Daily optimization',
      'ROAS reporting',
    ],
    benefits: ['Higher ROAS', 'Lower cost per lead', 'Scalable growth'],
    caseStudy: {
      client: 'Brew & Co.',
      result: 'Scaled spend 4x while improving ROAS',
      metric: '5.1x ROAS',
    },
  },
  {
    id: 'instagram-ads',
    name: 'Instagram Advertising',
    tagline: 'Reach the right audience on Instagram, profitably.',
    price: 750,
    unit: 'monthly',
    delivery: 'Ongoing',
    category: 'Advertising',
    description:
      'Instagram ad campaigns built to convert — from thumb-stopping creative to precise targeting and continuous optimization.',
    includes: [
      'Campaign strategy & setup',
      'Story & feed ad creative',
      'Audience targeting',
      'Daily optimization',
      'ROAS reporting',
    ],
    benefits: ['Premium creative', 'Precise targeting', 'Measurable returns'],
    caseStudy: {
      client: 'Móda Studio',
      result: 'Drove a record sales month from Instagram ads',
      metric: '4.6x ROAS',
    },
  },
  {
    id: 'tiktok-ads',
    name: 'TikTok Advertising',
    tagline: 'Tap into TikTok’s ad engine with expert management.',
    price: 820,
    unit: 'monthly',
    delivery: 'Ongoing',
    category: 'Advertising',
    description:
      'TikTok ad campaigns that feel native and convert — spark ads, in-feed creative, targeting, and optimization handled by specialists.',
    includes: [
      'Campaign strategy & setup',
      'Native ad creative',
      'Spark ads & boosting',
      'Daily optimization',
      'ROAS reporting',
    ],
    benefits: ['Native-feeling ads', 'Low CPMs', 'Viral upside'],
    caseStudy: {
      client: 'Verde Market',
      result: 'Achieved their lowest-ever cost per acquisition',
      metric: '−42% CPA',
    },
  },
  {
    id: 'email-marketing',
    name: 'Email Marketing',
    tagline: 'Turn your list into your most profitable channel.',
    price: 520,
    unit: 'monthly',
    delivery: '4 campaigns / mo',
    category: 'Email',
    description:
      'Strategic email campaigns — design, copy, segmentation, and automation — built to nurture your audience and drive repeat revenue.',
    includes: [
      '4 campaigns / month',
      'Design & copywriting',
      'List segmentation',
      'Automation flows',
      'Performance reporting',
    ],
    benefits: ['Higher open rates', 'Repeat revenue', 'Owned audience'],
    caseStudy: {
      client: 'Lumen Skincare',
      result: 'Email became their #2 revenue channel',
      metric: '32% of revenue',
    },
  },
  {
    id: 'newsletter',
    name: 'Newsletter Management',
    tagline: 'A beautiful newsletter your subscribers look forward to.',
    price: 420,
    unit: 'monthly',
    delivery: 'Ongoing',
    category: 'Email',
    description:
      'A fully managed newsletter program — editorial planning, design, writing, and sending — to keep your brand top of mind every week.',
    includes: [
      'Editorial planning',
      'Design & writing',
      'Scheduling & sending',
      'Subscriber growth tactics',
      'Open & click reporting',
    ],
    benefits: ['Consistent cadence', 'Loyal readers', 'Brand authority'],
    caseStudy: {
      client: 'Atelier Nord',
      result: 'Grew their newsletter to 24k engaged readers',
      metric: '24k subscribers',
    },
  },
]

export function getService(id: ServiceId) {
  return serviceCatalog.find((s) => s.id === id)
}

// Which services unlock a given route. A route is accessible if the client owns
// at least one of the listed services.
export const routeAccess: Record<string, ServiceId[]> = {
  '/client/website': ['website', 'website-maintenance'],
  '/client/tiktok': ['tiktok-marketing', 'tiktok-production'],
  '/client/content': ['facebook-content', 'instagram-content', 'social-management'],
  '/client/scheduling': ['facebook-content', 'instagram-content', 'social-management', 'tiktok-production'],
  '/client/ads': ['facebook-ads', 'instagram-ads', 'tiktok-ads'],
  '/client/email': ['email-marketing', 'newsletter'],
}

// Services the demo client already owns. Ads and Email remain locked.
export const defaultOwnedServices: ServiceId[] = [
  'website',
  'tiktok-marketing',
  'tiktok-production',
  'instagram-content',
  'social-management',
]
