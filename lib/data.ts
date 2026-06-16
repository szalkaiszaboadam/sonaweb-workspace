// Centralized dummy data for the SONAWEB client portal.
// Replace with Supabase queries when wiring up the backend.

export const client = {
  name: 'Aurelia Studio',
  contact: 'Mara Ellison',
  plan: 'Growth Partner',
  initials: 'AS',
  cardId: 'SNW-0xC4-7781',
}

export const dashboardStats = [
  {
    key: 'visitors',
    label: 'Website Visitors',
    value: '48,213',
    delta: 12.4,
    sub: 'last 30 days',
  },
  {
    key: 'leads',
    label: 'Generated Leads',
    value: '1,284',
    delta: 8.1,
    sub: 'last 30 days',
  },
  {
    key: 'conversion',
    label: 'Conversion Rate',
    value: '4.7%',
    delta: 1.3,
    sub: 'vs last month',
  },
  {
    key: 'roas',
    label: 'Ad ROAS',
    value: '4.9x',
    delta: 0.6,
    sub: 'blended',
  },
]

export const visitorsSeries = [
  { month: 'Jan', visitors: 28400, leads: 720 },
  { month: 'Feb', visitors: 31200, leads: 810 },
  { month: 'Mar', visitors: 29800, leads: 770 },
  { month: 'Apr', visitors: 35600, leads: 940 },
  { month: 'May', visitors: 41200, leads: 1080 },
  { month: 'Jun', visitors: 39800, leads: 1010 },
  { month: 'Jul', visitors: 44300, leads: 1190 },
  { month: 'Aug', visitors: 48213, leads: 1284 },
]

export const channelSplit = [
  { channel: 'TikTok', value: 38 },
  { channel: 'Instagram', value: 27 },
  { channel: 'Facebook', value: 19 },
  { channel: 'Email', value: 16 },
]

export const adsPerformance = [
  { week: 'W1', facebook: 2.1, instagram: 3.2, tiktok: 4.0 },
  { week: 'W2', facebook: 2.6, instagram: 3.6, tiktok: 4.4 },
  { week: 'W3', facebook: 3.0, instagram: 3.9, tiktok: 5.1 },
  { week: 'W4', facebook: 3.4, instagram: 4.3, tiktok: 5.6 },
]

export const tiktokSeries = [
  { month: 'Apr', views: 180000, followers: 4200 },
  { month: 'May', views: 240000, followers: 5600 },
  { month: 'Jun', views: 310000, followers: 7100 },
  { month: 'Jul', views: 420000, followers: 9400 },
  { month: 'Aug', views: 568000, followers: 12800 },
]

export const tasks = [
  { id: 1, title: 'Approve August TikTok batch', due: 'Today', priority: 'high' },
  { id: 2, title: 'Upload Q3 brand assets', due: 'Tomorrow', priority: 'medium' },
  { id: 3, title: 'Review homepage copy revision', due: 'Aug 14', priority: 'medium' },
  { id: 4, title: 'Confirm ad budget increase', due: 'Aug 16', priority: 'low' },
]

export const approvals = [
  { id: 1, title: 'TikTok — "Behind the Brew" v2', type: 'TikTok Video', status: 'Waiting For Approval' },
  { id: 2, title: 'Instagram carousel — Launch day', type: 'Instagram Post', status: 'Waiting For Approval' },
  { id: 3, title: 'Facebook ad — Retargeting set', type: 'Advertisement', status: 'Revision Requested' },
]

export const recentActivity = [
  { id: 1, actor: 'SONAWEB', action: 'published 3 TikTok videos', time: '2h ago' },
  { id: 2, actor: 'Mara', action: 'approved the homepage hero design', time: '5h ago' },
  { id: 3, actor: 'SONAWEB', action: 'launched the retargeting campaign', time: 'Yesterday' },
  { id: 4, actor: 'System', action: 'generated the July performance report', time: '2d ago' },
]

export const deadlines = [
  { id: 1, label: 'Website launch', date: 'Aug 28', tag: 'Website' },
  { id: 2, label: 'September content plan', date: 'Aug 25', tag: 'Content' },
  { id: 3, label: 'Newsletter send', date: 'Aug 20', tag: 'Email' },
]

export const websiteProject = {
  status: 'In Development',
  domain: 'aurelia-studio.com',
  ssl: 'Active',
  speed: 96,
  uptime: 99.98,
  stages: [
    { name: 'Discovery & Strategy', progress: 100, status: 'Complete', date: 'Jul 2' },
    { name: 'Structure & Wireframes', progress: 100, status: 'Complete', date: 'Jul 9' },
    { name: 'Content Collection', progress: 100, status: 'Complete', date: 'Jul 18' },
    { name: 'Design Phase', progress: 100, status: 'Complete', date: 'Jul 30' },
    { name: 'Development Phase', progress: 64, status: 'In Progress', date: 'Aug 22' },
    { name: 'Testing & Optimization', progress: 0, status: 'Pending', date: 'Aug 26' },
    { name: 'Launch', progress: 0, status: 'Pending', date: 'Aug 28' },
    { name: 'Post-Launch Support', progress: 0, status: 'Pending', date: 'Ongoing' },
  ],
}

export const services = [
  { name: 'Website Development', price: 4800, unit: 'one-time', delivery: '4–6 weeks', category: 'Website' },
  { name: 'Landing Page Development', price: 1200, unit: 'one-time', delivery: '1–2 weeks', category: 'Website' },
  { name: 'Website Maintenance', price: 240, unit: 'monthly', delivery: 'Ongoing', category: 'Website' },
  { name: 'TikTok Video Production', price: 890, unit: 'monthly', delivery: '8 videos / mo', category: 'TikTok' },
  { name: 'TikTok Video Editing', price: 380, unit: 'monthly', delivery: '12 edits / mo', category: 'TikTok' },
  { name: 'Facebook Content Creation', price: 640, unit: 'monthly', delivery: '12 posts / mo', category: 'Content' },
  { name: 'Instagram Content Creation', price: 680, unit: 'monthly', delivery: '12 posts / mo', category: 'Content' },
  { name: 'Social Media Management', price: 1100, unit: 'monthly', delivery: 'Full service', category: 'Content' },
  { name: 'Facebook Advertising Management', price: 750, unit: 'monthly', delivery: 'Ongoing', category: 'Ads' },
  { name: 'Instagram Advertising Management', price: 750, unit: 'monthly', delivery: 'Ongoing', category: 'Ads' },
  { name: 'TikTok Advertising Management', price: 820, unit: 'monthly', delivery: 'Ongoing', category: 'Ads' },
  { name: 'Email Marketing Campaigns', price: 520, unit: 'monthly', delivery: '4 campaigns / mo', category: 'Email' },
  { name: 'Newsletter Design', price: 300, unit: 'one-time', delivery: '1 week', category: 'Email' },
  { name: 'Newsletter Management', price: 420, unit: 'monthly', delivery: 'Ongoing', category: 'Email' },
]

export const orders = [
  { id: 'ORD-2041', service: 'Website Development', status: 'Active', date: 'Jul 1', total: 4800 },
  { id: 'ORD-2038', service: 'TikTok Video Production', status: 'Active', date: 'Jun 1', total: 890 },
  { id: 'ORD-2030', service: 'Instagram Content Creation', status: 'Active', date: 'May 12', total: 680 },
  { id: 'ORD-1998', service: 'Landing Page Development', status: 'Completed', date: 'Apr 3', total: 1200 },
  { id: 'ORD-1975', service: 'Newsletter Design', status: 'Completed', date: 'Mar 9', total: 300 },
]

export const invoices = [
  { id: 'INV-0091', amount: 4800, status: 'Paid', date: 'Jul 1', service: 'Website Development' },
  { id: 'INV-0090', amount: 890, status: 'Paid', date: 'Aug 1', service: 'TikTok Production' },
  { id: 'INV-0089', amount: 680, status: 'Due', date: 'Aug 12', service: 'Instagram Content' },
  { id: 'INV-0088', amount: 750, status: 'Paid', date: 'Aug 1', service: 'Facebook Ads' },
]

export const documents = [
  { id: 1, name: 'July Performance Report.pdf', type: 'Report', size: '2.4 MB', date: 'Aug 2' },
  { id: 2, name: 'Service Agreement 2025.pdf', type: 'Contract', size: '480 KB', date: 'Jan 9' },
  { id: 3, name: 'Q3 Marketing Plan.pdf', type: 'Marketing Plan', size: '1.1 MB', date: 'Jun 28' },
  { id: 4, name: 'Brand Guidelines.pdf', type: 'Creative Asset', size: '8.2 MB', date: 'Feb 14' },
  { id: 5, name: 'Website Documentation.pdf', type: 'Documentation', size: '3.0 MB', date: 'Aug 1' },
]

export const messages = [
  { id: 1, from: 'SONAWEB Team', preview: 'The August TikTok batch is ready for your review.', time: '2h', unread: true },
  { id: 2, from: 'Project Manager', preview: 'Development phase is 64% complete — on track for launch.', time: '1d', unread: false },
  { id: 3, from: 'Support', preview: 'Your invoice INV-0089 is now available.', time: '2d', unread: false },
]
