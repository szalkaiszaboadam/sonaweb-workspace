// Public marketing website data layer.
// Self-contained from the client portal so the public site can render and sell
// without a logged-in session. Replace with CMS / Stripe data when wiring a backend.

import {
  Globe,
  PenLine,
  Star,
  Video,
  ImageIcon,
  Camera,
  Megaphone,
  Music2,
  Mail,
  MailCheck,
  Send,
  type LucideIcon,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/* SERVICES                                                            */
/* ------------------------------------------------------------------ */

export type MarketingCategory =
  | 'Website'
  | 'Content'
  | 'Video'
  | 'Photography'
  | 'Advertising'
  | 'Email'

export type ServicePackage = {
  name: string
  price: number
  unit: 'one-time' | 'monthly'
  note: string
  features: string[]
  popular?: boolean
}

export type MarketingService = {
  slug: string
  name: string
  category: MarketingCategory
  icon: LucideIcon
  tagline: string
  description: string
  forWho: string[]
  includes: string[]
  delivery: string
  packages: ServicePackage[]
  faq: { q: string; a: string }[]
}

export const marketingServices: MarketingService[] = [
  {
    slug: 'website-development',
    name: 'Website Development',
    category: 'Website',
    icon: Globe,
    tagline: 'Conversion-focused websites engineered to grow your brand.',
    description:
      'A fully bespoke, high-performance website built around your brand and business goals. From strategy and design through development and launch, every pixel is optimized for speed, SEO, and conversion.',
    forWho: [
      'Brands launching or rebuilding their online presence',
      'Businesses whose current site underperforms on conversions',
      'Companies that need a fast, SEO-ready foundation',
    ],
    includes: [
      'Discovery & strategy workshop',
      'Custom UI/UX design',
      'Responsive development',
      'CMS integration & training',
      'Performance & SEO optimization',
      '30 days post-launch support',
    ],
    delivery: '4–6 weeks',
    packages: [
      {
        name: 'Launch',
        price: 2800,
        unit: 'one-time',
        note: 'Up to 5 pages',
        features: ['5 custom pages', 'Mobile-first design', 'Basic SEO', 'CMS setup'],
      },
      {
        name: 'Growth',
        price: 4800,
        unit: 'one-time',
        note: 'Most popular',
        popular: true,
        features: [
          'Up to 12 pages',
          'Advanced SEO',
          'Animations & interactions',
          'Analytics & tracking',
          '30 days support',
        ],
      },
      {
        name: 'Scale',
        price: 8500,
        unit: 'one-time',
        note: 'E-commerce & custom',
        features: [
          'Unlimited pages',
          'E-commerce / custom app',
          'Conversion optimization',
          'Priority delivery',
          '90 days support',
        ],
      },
    ],
    faq: [
      {
        q: 'How long does a website take?',
        a: 'Most projects launch within 4–6 weeks depending on scope and how quickly content and feedback are provided.',
      },
      {
        q: 'Do you write the content?',
        a: 'We can. Copywriting is available as an add-on, or we work from content you provide.',
      },
      {
        q: 'Will I be able to edit the site myself?',
        a: 'Yes. We build on a CMS and train your team so you can update content without code.',
      },
    ],
  },
  {
    slug: 'blog-article-writing',
    name: 'Blog Article Writing',
    category: 'Content',
    icon: PenLine,
    tagline: 'SEO-driven articles that rank and convert readers into customers.',
    description:
      'Long-form, research-backed articles written to rank on search and build authority in your niche. Every piece is keyword-optimized, on-brand, and crafted to move readers toward action.',
    forWho: [
      'Brands building organic search traffic',
      'Businesses that want to be seen as an authority',
      'Teams without time to write consistently',
    ],
    includes: [
      'Keyword & topic research',
      'SEO-optimized long-form articles',
      'On-brand tone & editing',
      'Internal linking strategy',
      'Meta titles & descriptions',
    ],
    delivery: '4–8 articles / mo',
    packages: [
      {
        name: 'Starter',
        price: 480,
        unit: 'monthly',
        note: '4 articles / month',
        features: ['4 articles (1,000+ words)', 'Keyword research', 'SEO meta data'],
      },
      {
        name: 'Authority',
        price: 880,
        unit: 'monthly',
        note: 'Most popular',
        popular: true,
        features: [
          '8 articles (1,200+ words)',
          'Content calendar',
          'Internal linking',
          'Monthly reporting',
        ],
      },
    ],
    faq: [
      {
        q: 'Who writes the articles?',
        a: 'Experienced human writers specialized in your industry, supported by SEO research and editorial review.',
      },
      {
        q: 'Do you publish them for me?',
        a: 'Yes, we can publish directly to your CMS or hand off ready-to-publish drafts — your choice.',
      },
    ],
  },
  {
    slug: 'live-reviews-integration',
    name: 'Live Reviews Integration For Websites',
    category: 'Website',
    icon: Star,
    tagline: 'Turn real customer reviews into your most persuasive sales tool.',
    description:
      'We connect and display live Google, Trustpilot, and social reviews directly on your website with beautiful, conversion-focused widgets that build instant trust with new visitors.',
    forWho: [
      'Businesses with strong reviews not shown on their site',
      'Brands wanting to boost trust and conversions',
      'E-commerce and service businesses',
    ],
    includes: [
      'Review platform integration',
      'Custom-designed review widgets',
      'Auto-syncing live reviews',
      'Rating schema for SEO',
      'Mobile-optimized display',
    ],
    delivery: '1–2 weeks',
    packages: [
      {
        name: 'Standard',
        price: 390,
        unit: 'one-time',
        note: 'One platform',
        features: ['1 review platform', 'Custom widget', 'SEO rating schema'],
      },
      {
        name: 'Pro',
        price: 690,
        unit: 'one-time',
        note: 'Multi-platform',
        popular: true,
        features: ['Up to 3 platforms', 'Multiple widget styles', 'Auto-sync', 'Priority support'],
      },
    ],
    faq: [
      {
        q: 'Which platforms do you support?',
        a: 'Google, Trustpilot, Facebook, and most major review platforms with public APIs.',
      },
      {
        q: 'Do reviews update automatically?',
        a: 'Yes. New reviews sync live so your site always shows your latest social proof.',
      },
    ],
  },
  {
    slug: 'short-form-video',
    name: 'Short Form / TikTok Video Production',
    category: 'Video',
    icon: Video,
    tagline: 'Scroll-stopping short-form video, concepted, filmed and edited for you.',
    description:
      'A fully managed short-form video engine. We concept, script, film and edit high-performing TikTok, Reels and Shorts designed around trends and built to stop the scroll and drive watch time.',
    forWho: [
      'Brands that want to grow on TikTok, Reels & Shorts',
      'Businesses without an in-house video team',
      'Founders who want consistent, on-trend content',
    ],
    includes: [
      'Monthly content concepting',
      'Scripting & hooks',
      'Professional editing',
      'Captions & trending audio',
      'Posting-ready delivery',
    ],
    delivery: '8–16 videos / mo',
    packages: [
      {
        name: 'Creator',
        price: 890,
        unit: 'monthly',
        note: '8 videos / month',
        features: ['8 edited videos', 'Concepting & scripting', 'Captions & hooks'],
      },
      {
        name: 'Viral',
        price: 1490,
        unit: 'monthly',
        note: 'Most popular',
        popular: true,
        features: [
          '16 edited videos',
          'Trend research',
          'On-site filming day',
          'Performance review',
        ],
      },
    ],
    faq: [
      {
        q: 'Do you film the videos?',
        a: 'Yes — we can run on-site shoot days, or edit footage you capture using our guided briefs.',
      },
      {
        q: 'Do you post them too?',
        a: 'We deliver posting-ready files, and full scheduling is available as an add-on.',
      },
    ],
  },
  {
    slug: 'social-content-graphics',
    name: 'Instagram / Facebook Content Graphics',
    category: 'Content',
    icon: ImageIcon,
    tagline: 'On-brand graphics and carousels that build a feed worth following.',
    description:
      'Beautifully designed posts, carousels and story graphics that keep your social presence consistent, professional and engaging — fully designed, captioned and scheduling-ready.',
    forWho: [
      'Brands wanting a cohesive, premium feed',
      'Businesses posting inconsistently',
      'Teams without a designer',
    ],
    includes: [
      'Custom graphics & carousels',
      'On-brand templates',
      'Captions & hashtags',
      'Story graphics',
      'Scheduling-ready delivery',
    ],
    delivery: '12–20 posts / mo',
    packages: [
      {
        name: 'Essential',
        price: 640,
        unit: 'monthly',
        note: '12 posts / month',
        features: ['12 designed posts', 'Captions & hashtags', 'Brand templates'],
      },
      {
        name: 'Premium',
        price: 980,
        unit: 'monthly',
        note: 'Most popular',
        popular: true,
        features: ['20 posts + stories', 'Carousels', 'Content calendar', 'Monthly review'],
      },
    ],
    faq: [
      {
        q: 'Do you manage posting?',
        a: 'We deliver scheduling-ready assets, and full social management is available as an upgrade.',
      },
    ],
  },
  {
    slug: 'photography',
    name: 'Photography',
    category: 'Photography',
    icon: Camera,
    tagline: 'Premium brand and product photography that elevates everything you do.',
    description:
      'Professional photography for products, brand, and lifestyle — directed, shot and retouched to give your website, ads and social a premium, cohesive look.',
    forWho: [
      'E-commerce & product brands',
      'Businesses needing brand & team photos',
      'Anyone refreshing their visual identity',
    ],
    includes: [
      'Shoot planning & art direction',
      'Professional studio or on-site shoot',
      'Professional retouching',
      'Web & social optimized exports',
      'Usage rights included',
    ],
    delivery: '2–3 weeks',
    packages: [
      {
        name: 'Half Day',
        price: 690,
        unit: 'one-time',
        note: 'Up to 20 images',
        features: ['Half-day shoot', '20 retouched images', 'Web exports'],
      },
      {
        name: 'Full Day',
        price: 1200,
        unit: 'one-time',
        note: 'Most popular',
        popular: true,
        features: ['Full-day shoot', '50 retouched images', 'Art direction', 'All formats'],
      },
    ],
    faq: [
      {
        q: 'Where do shoots take place?',
        a: 'In our studio or on-site at your location — whichever suits the brief best.',
      },
    ],
  },
  {
    slug: 'facebook-ads',
    name: 'Facebook Advertising Management',
    category: 'Advertising',
    icon: Megaphone,
    tagline: 'Profitable Facebook campaigns managed end to end.',
    description:
      'Full-funnel Facebook ad management — strategy, creative, targeting, and daily optimization — engineered to maximize your return on ad spend and scale profitably.',
    forWho: [
      'Businesses ready to scale with paid ads',
      'Brands with an offer that converts',
      'Companies wanting predictable lead flow',
    ],
    includes: [
      'Campaign strategy & setup',
      'Ad creative & copy',
      'Audience targeting',
      'Daily optimization',
      'ROAS reporting',
    ],
    delivery: 'Ongoing',
    packages: [
      {
        name: 'Growth',
        price: 750,
        unit: 'monthly',
        note: 'Management fee',
        features: ['Up to $10k/mo ad spend', 'Creative & copy', 'Weekly optimization'],
      },
      {
        name: 'Scale',
        price: 1250,
        unit: 'monthly',
        note: 'Most popular',
        popular: true,
        features: ['Unlimited ad spend', 'Full-funnel creative', 'Daily optimization', 'Dedicated manager'],
      },
    ],
    faq: [
      {
        q: 'Is ad spend included?',
        a: 'No — the fee covers management. Ad spend is paid directly to the platform on your account.',
      },
    ],
  },
  {
    slug: 'instagram-ads',
    name: 'Instagram Advertising Management',
    category: 'Advertising',
    icon: Camera,
    tagline: 'Reach the right audience on Instagram, profitably.',
    description:
      'Instagram ad campaigns built to convert — from thumb-stopping creative to precise targeting and continuous optimization across feed, stories and reels.',
    forWho: [
      'Visual & lifestyle brands',
      'Businesses targeting younger audiences',
      'Brands with strong creative assets',
    ],
    includes: [
      'Campaign strategy & setup',
      'Story & feed ad creative',
      'Audience targeting',
      'Daily optimization',
      'ROAS reporting',
    ],
    delivery: 'Ongoing',
    packages: [
      {
        name: 'Growth',
        price: 750,
        unit: 'monthly',
        note: 'Management fee',
        features: ['Up to $10k/mo ad spend', 'Story & feed creative', 'Weekly optimization'],
      },
      {
        name: 'Scale',
        price: 1250,
        unit: 'monthly',
        note: 'Most popular',
        popular: true,
        features: ['Unlimited ad spend', 'Reels ad creative', 'Daily optimization', 'Dedicated manager'],
      },
    ],
    faq: [
      {
        q: 'Can you reuse our organic content?',
        a: 'Absolutely — top-performing organic posts often make the best ads, and we boost them strategically.',
      },
    ],
  },
  {
    slug: 'tiktok-ads',
    name: 'TikTok Advertising Management',
    category: 'Advertising',
    icon: Music2,
    tagline: 'Tap into TikTok’s ad engine with expert management.',
    description:
      'TikTok ad campaigns that feel native and convert — spark ads, in-feed creative, targeting and optimization handled by specialists who live on the platform.',
    forWho: [
      'Brands ready to scale on TikTok',
      'Businesses with viral or UGC-style content',
      'Companies chasing low-cost reach',
    ],
    includes: [
      'Campaign strategy & setup',
      'Native ad creative',
      'Spark ads & boosting',
      'Daily optimization',
      'ROAS reporting',
    ],
    delivery: 'Ongoing',
    packages: [
      {
        name: 'Growth',
        price: 820,
        unit: 'monthly',
        note: 'Management fee',
        features: ['Up to $10k/mo ad spend', 'Native creative', 'Weekly optimization'],
      },
      {
        name: 'Scale',
        price: 1350,
        unit: 'monthly',
        note: 'Most popular',
        popular: true,
        features: ['Unlimited ad spend', 'Spark ads', 'Daily optimization', 'Dedicated manager'],
      },
    ],
    faq: [
      {
        q: 'Do you produce the ad creative?',
        a: 'Yes — native-feeling TikTok creative is core to performance, and we produce it in-house.',
      },
    ],
  },
  {
    slug: 'email-marketing',
    name: 'Email Marketing',
    category: 'Email',
    icon: Mail,
    tagline: 'Turn your list into your most profitable channel.',
    description:
      'Strategic email marketing — design, copy, segmentation and automation — built to nurture your audience and drive repeat revenue from the list you already own.',
    forWho: [
      'E-commerce & DTC brands',
      'Businesses with an email list',
      'Companies wanting repeat revenue',
    ],
    includes: [
      'Email strategy',
      'Campaign design & copy',
      'List segmentation',
      'A/B testing',
      'Performance reporting',
    ],
    delivery: '4–8 campaigns / mo',
    packages: [
      {
        name: 'Essential',
        price: 520,
        unit: 'monthly',
        note: '4 campaigns / month',
        features: ['4 campaigns', 'Design & copy', 'Segmentation'],
      },
      {
        name: 'Revenue',
        price: 920,
        unit: 'monthly',
        note: 'Most popular',
        popular: true,
        features: ['8 campaigns', 'A/B testing', 'Automation tuning', 'Monthly reporting'],
      },
    ],
    faq: [
      {
        q: 'Which platforms do you work with?',
        a: 'Klaviyo, Mailchimp, and most major ESPs. We recommend the best fit for your goals.',
      },
    ],
  },
  {
    slug: 'email-welcome-flow',
    name: 'Email Welcome Flow Setup',
    category: 'Email',
    icon: MailCheck,
    tagline: 'A high-converting welcome series that earns revenue on autopilot.',
    description:
      'A done-for-you automated welcome flow that greets every new subscriber, builds trust and drives that crucial first purchase — set up once, earning revenue 24/7.',
    forWho: [
      'Brands collecting email signups',
      'E-commerce stores without automation',
      'Businesses leaving first-purchase revenue on the table',
    ],
    includes: [
      'Flow strategy & mapping',
      '5–7 automated emails',
      'Design & copywriting',
      'Segmentation & triggers',
      'Testing & launch',
    ],
    delivery: '2 weeks',
    packages: [
      {
        name: 'Welcome Flow',
        price: 740,
        unit: 'one-time',
        note: 'Done-for-you setup',
        popular: true,
        features: ['5–7 email flow', 'Design & copy', 'Triggers & segmentation', 'Testing & launch'],
      },
    ],
    faq: [
      {
        q: 'How soon will it earn revenue?',
        a: 'As soon as it goes live — every new subscriber enters the flow and starts receiving your welcome series automatically.',
      },
    ],
  },
  {
    slug: 'email-campaign',
    name: 'Email Marketing Campaign',
    category: 'Email',
    icon: Send,
    tagline: 'A single high-impact campaign, designed to convert.',
    description:
      'A one-off, fully managed email campaign — perfect for a launch, sale or announcement. Strategy, design, copy and send, all handled for you with a focus on results.',
    forWho: [
      'Brands with a launch or promotion',
      'Businesses testing email marketing',
      'Teams needing a high-impact send fast',
    ],
    includes: [
      'Campaign strategy',
      'Custom design & copy',
      'Segmentation',
      'Scheduling & send',
      'Results report',
    ],
    delivery: '3–5 days',
    packages: [
      {
        name: 'Single Campaign',
        price: 320,
        unit: 'one-time',
        note: 'One campaign',
        popular: true,
        features: ['Strategy & design', 'Copywriting', 'Segmented send', 'Results report'],
      },
    ],
    faq: [
      {
        q: 'Can this become a monthly service?',
        a: 'Yes — many clients start with a single campaign and upgrade to our ongoing Email Marketing service.',
      },
    ],
  },
]

export function getMarketingService(slug: string) {
  return marketingServices.find((s) => s.slug === slug)
}

export const marketingCategories: {
  id: MarketingCategory
  label: string
  blurb: string
}[] = [
  { id: 'Website', label: 'Website', blurb: 'Sites, reviews & conversion.' },
  { id: 'Content', label: 'Content', blurb: 'Articles, graphics & social.' },
  { id: 'Video', label: 'Video', blurb: 'Short-form that stops the scroll.' },
  { id: 'Photography', label: 'Photography', blurb: 'Premium brand visuals.' },
  { id: 'Advertising', label: 'Advertising', blurb: 'Profitable paid campaigns.' },
  { id: 'Email', label: 'Email', blurb: 'Flows & campaigns that convert.' },
]

/* ------------------------------------------------------------------ */
/* REFERENCES & CASE STUDIES                                          */
/* ------------------------------------------------------------------ */

export type ReferenceCategory = {
  slug: string
  label: string
  description: string
}

export const referenceCategories: ReferenceCategory[] = [
  {
    slug: 'website',
    label: 'Website References',
    description: 'Conversion-focused websites we have designed and built.',
  },
  {
    slug: 'tiktok-video',
    label: 'TikTok Video References',
    description: 'Short-form video work that drove reach and growth.',
  },
  {
    slug: 'social-content',
    label: 'Facebook / Instagram Content References',
    description: 'On-brand social content and graphics that built community.',
  },
  {
    slug: 'advertising',
    label: 'Advertising References',
    description: 'Paid campaigns engineered for profitable returns.',
  },
  {
    slug: 'email-marketing',
    label: 'Email Marketing References',
    description: 'Flows and campaigns that turned lists into revenue.',
  },
  {
    slug: 'photography',
    label: 'Photography References',
    description: 'Premium brand and product photography.',
  },
]

export type CaseStudy = {
  slug: string
  category: ReferenceCategory['slug']
  client: string
  industry: string
  serviceType: string
  resultSummary: string
  image: string
  problem: string
  solution: string
  delivered: string[]
  results: { label: string; value: string }[]
  gallery: string[]
  recommendedService: string // marketing service slug
}

export const caseStudies: CaseStudy[] = [
  {
    slug: 'lumen-skincare-website',
    category: 'website',
    client: 'Lumen Skincare',
    industry: 'Beauty & Skincare',
    serviceType: 'Website Development',
    resultSummary: 'Rebuilt storefront lifted conversion rate by 38%.',
    image: '/marketing/case-website.png',
    problem:
      'Lumen’s ageing storefront was slow, hard to navigate on mobile, and converting far below industry benchmarks despite strong traffic.',
    solution:
      'We rebuilt the site from the ground up with a conversion-first architecture, premium product storytelling, and a blazing-fast, mobile-first front end.',
    delivered: [
      'Full UX & UI redesign',
      'Headless, high-performance build',
      'Optimized product & checkout flow',
      'SEO & analytics foundation',
    ],
    results: [
      { label: 'Conversion rate', value: '+38%' },
      { label: 'Page load', value: '1.1s' },
      { label: 'Mobile revenue', value: '+52%' },
    ],
    gallery: ['/marketing/case-website.png', '/marketing/gallery-1.png'],
    recommendedService: 'live-reviews-integration',
  },
  {
    slug: 'brew-co-tiktok',
    category: 'tiktok-video',
    client: 'Brew & Co.',
    industry: 'Food & Beverage',
    serviceType: 'Short Form / TikTok Video Production',
    resultSummary: 'Grew from 0 to 120k followers in five months.',
    image: '/marketing/case-tiktok.png',
    problem:
      'Brew & Co. had a beloved product but no presence on TikTok and no internal capacity to produce consistent short-form video.',
    solution:
      'We built a trend-led content engine — concepting, filming and editing 16 videos a month designed around hooks and watch time.',
    delivered: [
      '16 produced videos / month',
      'Trend & hook research',
      'On-site filming days',
      'Performance optimization',
    ],
    results: [
      { label: 'Followers', value: '120k' },
      { label: 'Avg views', value: '210k' },
      { label: 'In months', value: '5' },
    ],
    gallery: ['/marketing/case-tiktok.png', '/marketing/gallery-2.png'],
    recommendedService: 'tiktok-ads',
  },
  {
    slug: 'moda-studio-social',
    category: 'social-content',
    client: 'Móda Studio',
    industry: 'Fashion',
    serviceType: 'Instagram / Facebook Content Graphics',
    resultSummary: 'Doubled engagement with a cohesive premium feed.',
    image: '/marketing/case-social.png',
    problem:
      'Móda’s social feed was inconsistent and off-brand, undermining a luxury positioning the brand had worked hard to build.',
    solution:
      'We designed a cohesive visual system and delivered 20 on-brand posts, carousels and stories every month with captions and scheduling.',
    delivered: [
      '20 designed posts / month',
      'Brand template system',
      'Carousels & stories',
      'Monthly content calendar',
    ],
    results: [
      { label: 'Engagement', value: '+104%' },
      { label: 'Saves', value: '+3.2x' },
      { label: 'Followers', value: '+47k' },
    ],
    gallery: ['/marketing/case-social.png', '/marketing/gallery-3.png'],
    recommendedService: 'short-form-video',
  },
  {
    slug: 'northwind-ads',
    category: 'advertising',
    client: 'Northwind Fitness',
    industry: 'Fitness',
    serviceType: 'Facebook & Instagram Advertising',
    resultSummary: 'Scaled spend 4x while improving ROAS to 5.1x.',
    image: '/marketing/case-ads.png',
    problem:
      'Northwind was stuck at a spend ceiling — every attempt to scale ads sent their cost per acquisition climbing.',
    solution:
      'We rebuilt the funnel with fresh creative, refined audiences and a structured testing framework that let spend scale profitably.',
    delivered: [
      'Full-funnel restructure',
      'Creative testing system',
      'Audience refinement',
      'Daily optimization',
    ],
    results: [
      { label: 'ROAS', value: '5.1x' },
      { label: 'Spend scaled', value: '4x' },
      { label: 'CPA', value: '-34%' },
    ],
    gallery: ['/marketing/case-ads.png', '/marketing/gallery-1.png'],
    recommendedService: 'facebook-ads',
  },
  {
    slug: 'atelier-email',
    category: 'email-marketing',
    client: 'Atelier Nord',
    industry: 'Home & Lifestyle',
    serviceType: 'Email Marketing',
    resultSummary: 'Email became the #2 revenue channel at 32% of sales.',
    image: '/marketing/case-email.png',
    problem:
      'Atelier had a sizeable list but emailed it rarely and without strategy, leaving significant repeat revenue untapped.',
    solution:
      'We built segmentation, automated flows and a consistent campaign calendar that nurtured subscribers into repeat buyers.',
    delivered: [
      'Welcome & post-purchase flows',
      '8 campaigns / month',
      'List segmentation',
      'A/B testing program',
    ],
    results: [
      { label: 'Of revenue', value: '32%' },
      { label: 'Open rate', value: '47%' },
      { label: 'List growth', value: '+24k' },
    ],
    gallery: ['/marketing/case-email.png', '/marketing/gallery-2.png'],
    recommendedService: 'email-welcome-flow',
  },
  {
    slug: 'verde-photography',
    category: 'photography',
    client: 'Verde Market',
    industry: 'Grocery & Retail',
    serviceType: 'Photography',
    resultSummary: 'A premium photo library that lifted ad performance.',
    image: '/marketing/case-photo.png',
    problem:
      'Verde’s product imagery was inconsistent and amateur, dragging down the perceived quality of their site and ads.',
    solution:
      'We art-directed and shot a full library of premium product and lifestyle photography, retouched and optimized for every channel.',
    delivered: [
      'Full-day brand shoot',
      '50 retouched images',
      'Lifestyle & product sets',
      'Channel-optimized exports',
    ],
    results: [
      { label: 'Ad CTR', value: '+41%' },
      { label: 'Images', value: '50' },
      { label: 'Channels', value: 'All' },
    ],
    gallery: ['/marketing/case-photo.png', '/marketing/gallery-3.png'],
    recommendedService: 'photography',
  },
]

export function getCaseStudiesByCategory(category: string) {
  return caseStudies.filter((c) => c.category === category)
}

export function getCaseStudy(slug: string) {
  return caseStudies.find((c) => c.slug === slug)
}

export function getReferenceCategory(slug: string) {
  return referenceCategories.find((c) => c.slug === slug)
}

/* ------------------------------------------------------------------ */
/* BLOG                                                                */
/* ------------------------------------------------------------------ */

export const blogCategories = [
  'Website Development',
  'TikTok Marketing',
  'Advertising',
  'Email Marketing',
  'Content Creation',
  'Business Growth',
] as const

export type BlogCategory = (typeof blogCategories)[number]

export type BlogPost = {
  slug: string
  title: string
  category: BlogCategory
  excerpt: string
  cover: string
  readingTime: string
  date: string
  author: string
  content: string[]
  recommendedServices: string[] // marketing service slugs
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'tiktok-growth-2026',
    title: 'How Brands Are Winning on TikTok in 2026',
    category: 'TikTok Marketing',
    excerpt:
      'The short-form playbook has changed again. Here is what is actually driving reach and followers this year.',
    cover: '/marketing/blog-tiktok.png',
    readingTime: '6 min read',
    date: '2026-05-28',
    author: 'SONAWEB Team',
    content: [
      'TikTok rewards one thing above all else: watch time. In 2026, the brands winning on the platform are the ones treating every video as a hook-first experiment rather than a polished advertisement.',
      'The first frame matters more than ever. If a viewer does not understand why they should keep watching within the first second, the algorithm moves on — and so do they. The most effective accounts open with tension, a bold claim, or a visual pattern interrupt.',
      'Consistency beats perfection. Accounts posting 4–5 times a week consistently outperform those posting one highly produced video. Volume gives the algorithm more chances to find your audience and gives you more data on what resonates.',
      'Finally, native creative wins. Content that feels like it belongs on the For You page — shot vertically, trend-aware, and authentic — dramatically outperforms repurposed ads. This is exactly why we produce TikTok content natively rather than retrofitting it.',
    ],
    recommendedServices: ['short-form-video', 'tiktok-ads'],
  },
  {
    slug: 'website-conversion-fundamentals',
    title: 'The 5 Website Fundamentals That Actually Drive Conversions',
    category: 'Website Development',
    excerpt:
      'Most websites lose customers for the same handful of reasons. Fix these and watch your conversion rate climb.',
    cover: '/marketing/blog-website.png',
    readingTime: '7 min read',
    date: '2026-05-20',
    author: 'SONAWEB Team',
    content: [
      'A beautiful website that does not convert is an expensive brochure. After building hundreds of sites, we have found that conversion almost always comes down to five fundamentals.',
      'Speed is non-negotiable. Every additional second of load time measurably reduces conversions. A fast, mobile-first build is the foundation everything else sits on.',
      'Clarity beats cleverness. Visitors should understand what you offer and what to do next within seconds. Clear headlines, obvious calls to action, and a focused layout outperform clever copy every time.',
      'Trust signals close the gap. Live reviews, recognizable logos, and real results reassure new visitors at the exact moment they are deciding whether to buy.',
      'A focused path to action removes friction. The fewer decisions and steps between landing and converting, the more people complete the journey.',
    ],
    recommendedServices: ['website-development', 'live-reviews-integration'],
  },
  {
    slug: 'email-welcome-flow-revenue',
    title: 'Why a Welcome Flow Is the Highest-ROI Email You Will Ever Build',
    category: 'Email Marketing',
    excerpt:
      'A single automated sequence can quietly become one of your most profitable revenue channels. Here is why.',
    cover: '/marketing/blog-email.png',
    readingTime: '5 min read',
    date: '2026-05-12',
    author: 'SONAWEB Team',
    content: [
      'A welcome flow is the one email asset that works while you sleep. Set it up once and every new subscriber is automatically nurtured toward their first purchase.',
      'New subscribers are at their most engaged the moment they join. A timely, well-crafted welcome series capitalizes on that attention before it fades.',
      'The best flows tell a story across 5–7 emails: who you are, why you exist, what others say about you, and a compelling reason to buy now. Each email earns the open of the next.',
      'Because it runs automatically, the ROI compounds. The flow you build today keeps earning months and years from now with zero additional effort.',
    ],
    recommendedServices: ['email-welcome-flow', 'email-marketing'],
  },
  {
    slug: 'scaling-paid-ads-profitably',
    title: 'How to Scale Paid Ads Without Killing Your ROAS',
    category: 'Advertising',
    excerpt:
      'Scaling spend is where most brands break their ad accounts. Here is the structured approach that keeps returns healthy.',
    cover: '/marketing/blog-ads.png',
    readingTime: '8 min read',
    date: '2026-05-04',
    author: 'SONAWEB Team',
    content: [
      'Scaling paid ads is not about spending more — it is about spending more profitably. The brands that scale successfully treat it as a structured, data-led process.',
      'Creative is the new targeting. With broad audiences increasingly the norm, the volume and quality of your ad creative is the single biggest lever on performance.',
      'Test small, scale winners. A steady stream of new creative tested at small budgets surfaces the winners you can then scale with confidence.',
      'Watch the funnel, not just the ad. Profitable scaling depends on the entire journey — landing page, offer and follow-up — not just the click.',
    ],
    recommendedServices: ['facebook-ads', 'instagram-ads'],
  },
  {
    slug: 'content-that-builds-brands',
    title: 'Content That Builds Brands, Not Just Engagement',
    category: 'Content Creation',
    excerpt:
      'Vanity metrics feel good but rarely build businesses. Here is how to create content that actually compounds.',
    cover: '/marketing/blog-content.png',
    readingTime: '6 min read',
    date: '2026-04-26',
    author: 'SONAWEB Team',
    content: [
      'Engagement is easy to chase and easy to fake. Brand-building content is harder — but it is what actually compounds into trust, recognition and revenue.',
      'Consistency in look and voice is what makes content recognizably yours. A cohesive visual system turns scattered posts into a brand.',
      'Value-first content earns the right to sell. Educate, entertain or inspire, and your audience will be there when you do have something to offer.',
      'Repurposing multiplies your effort. One strong idea can become a video, a carousel, an article and an email — each reinforcing the same brand story.',
    ],
    recommendedServices: ['social-content-graphics', 'blog-article-writing'],
  },
  {
    slug: 'marketing-systems-for-growth',
    title: 'Building Marketing Systems That Scale With Your Business',
    category: 'Business Growth',
    excerpt:
      'Sustainable growth comes from systems, not heroics. Here is how to build a marketing engine that compounds.',
    cover: '/marketing/blog-growth.png',
    readingTime: '7 min read',
    date: '2026-04-18',
    author: 'SONAWEB Team',
    content: [
      'Most businesses grow in bursts — a viral post here, a good campaign there. Durable growth comes from systems that produce results predictably, month after month.',
      'A marketing system connects the channels. Your website, content, ads and email should reinforce each other rather than operate in isolation.',
      'Measurement turns activity into learning. When every channel reports into a clear picture, you can double down on what works and cut what does not.',
      'This is exactly why we built the SONAWEB platform — to give clients one command center where every part of their growth engine works together.',
    ],
    recommendedServices: ['website-development', 'email-marketing'],
  },
]

export function getBlogPost(slug: string) {
  return blogPosts.find((p) => p.slug === slug)
}

export function getRelatedPosts(post: BlogPost, limit = 3) {
  return blogPosts
    .filter((p) => p.slug !== post.slug)
    .sort((a) => (a.category === post.category ? -1 : 1))
    .slice(0, limit)
}

/* ------------------------------------------------------------------ */
/* MEETINGS / BOOKING                                                  */
/* ------------------------------------------------------------------ */

export type MeetingType = {
  id: string
  name: string
  duration: string
  description: string
}

export const meetingTypes: MeetingType[] = [
  {
    id: 'website',
    name: 'Website Consultation',
    duration: '30 min',
    description: 'Review your current site and map out a plan to grow conversions.',
  },
  {
    id: 'tiktok',
    name: 'TikTok Strategy Call',
    duration: '30 min',
    description: 'Build a short-form content strategy tailored to your brand.',
  },
  {
    id: 'advertising',
    name: 'Advertising Consultation',
    duration: '45 min',
    description: 'Audit your paid ads and find opportunities to scale profitably.',
  },
  {
    id: 'email',
    name: 'Email Marketing Consultation',
    duration: '30 min',
    description: 'Uncover the revenue hiding in your email list.',
  },
  {
    id: 'general',
    name: 'General SONAWEB Consultation',
    duration: '30 min',
    description: 'Not sure where to start? Let’s find the highest-impact next step.',
  },
]

// Admin-controlled available time slots. In production these come from the
// team dashboard's scheduling settings.
export const availableSlots: { date: string; times: string[] }[] = [
  { date: '2026-06-17', times: ['09:00', '11:00', '14:00'] },
  { date: '2026-06-18', times: ['10:00', '13:00', '15:30'] },
  { date: '2026-06-19', times: ['09:30', '11:30', '16:00'] },
  { date: '2026-06-22', times: ['10:00', '14:00'] },
  { date: '2026-06-23', times: ['09:00', '11:00', '13:00', '15:00'] },
  { date: '2026-06-24', times: ['10:30', '14:30'] },
]

/* ------------------------------------------------------------------ */
/* PUBLIC CLIENT LOCATIONS (no sensitive data)                         */
/* ------------------------------------------------------------------ */

export type PublicClientLocation = {
  city: string
  country: string
  industry: string
  serviceCategory: MarketingCategory
  coordinates: [number, number] // [lng, lat]
}

export const publicClientLocations: PublicClientLocation[] = [
  { city: 'London', country: 'United Kingdom', industry: 'Retail', serviceCategory: 'Advertising', coordinates: [-0.1276, 51.5072] },
  { city: 'Stockholm', country: 'Sweden', industry: 'Home & Lifestyle', serviceCategory: 'Email', coordinates: [18.0686, 59.3293] },
  { city: 'Copenhagen', country: 'Denmark', industry: 'Food & Beverage', serviceCategory: 'Content', coordinates: [12.5683, 55.6761] },
  { city: 'Amsterdam', country: 'Netherlands', industry: 'Design Studio', serviceCategory: 'Website', coordinates: [4.9041, 52.3676] },
  { city: 'Berlin', country: 'Germany', industry: 'Fitness', serviceCategory: 'Advertising', coordinates: [13.405, 52.52] },
  { city: 'Dublin', country: 'Ireland', industry: 'Healthcare', serviceCategory: 'Website', coordinates: [-6.2603, 53.3498] },
  { city: 'Milan', country: 'Italy', industry: 'Fashion', serviceCategory: 'Video', coordinates: [9.19, 45.4642] },
  { city: 'Oslo', country: 'Norway', industry: 'Food & Beverage', serviceCategory: 'Video', coordinates: [10.7522, 59.9139] },
  { city: 'Paris', country: 'France', industry: 'Beauty', serviceCategory: 'Email', coordinates: [2.3522, 48.8566] },
  { city: 'Madrid', country: 'Spain', industry: 'Hospitality', serviceCategory: 'Photography', coordinates: [-3.7038, 40.4168] },
  { city: 'Lisbon', country: 'Portugal', industry: 'Travel', serviceCategory: 'Content', coordinates: [-9.1393, 38.7223] },
  { city: 'Vienna', country: 'Austria', industry: 'Professional Services', serviceCategory: 'Website', coordinates: [16.3738, 48.2082] },
  { city: 'Zurich', country: 'Switzerland', industry: 'Finance', serviceCategory: 'Advertising', coordinates: [8.5417, 47.3769] },
  { city: 'Warsaw', country: 'Poland', industry: 'E-commerce', serviceCategory: 'Email', coordinates: [21.0122, 52.2297] },
  { city: 'New York', country: 'United States', industry: 'Media', serviceCategory: 'Video', coordinates: [-74.006, 40.7128] },
  { city: 'Dubai', country: 'UAE', industry: 'Luxury Retail', serviceCategory: 'Photography', coordinates: [55.2708, 25.2048] },
]
