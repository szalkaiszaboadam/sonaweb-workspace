// Operational data for the SONAWEB team / agency dashboard.
// Client, project, approval and meeting data live in lib/agency-store.tsx.

export const revenueByMonth = [
  { month: 'Jan', revenue: 42000 },
  { month: 'Feb', revenue: 47500 },
  { month: 'Mar', revenue: 51200 },
  { month: 'Apr', revenue: 56800 },
  { month: 'May', revenue: 61400 },
  { month: 'Jun', revenue: 68900 },
]

export type ProductionTask = {
  id: string
  title: string
  client: string
  type: 'Website' | 'TikTok' | 'Content' | 'Advertising' | 'Email'
  assignee: string
  due: string
  stage: 'Backlog' | 'In Progress' | 'Review' | 'Done'
}

export const productionTasks: ProductionTask[] = [
  { id: 't1', title: 'Homepage redesign', client: 'Atelier Nord', type: 'Website', assignee: 'Maya', due: 'Jun 18', stage: 'In Progress' },
  { id: 't2', title: 'June TikTok batch (8 videos)', client: 'Verde Market', type: 'TikTok', assignee: 'Leo', due: 'Jun 16', stage: 'Review' },
  { id: 't3', title: 'Summer sale ad creatives', client: 'Northwind Fitness', type: 'Advertising', assignee: 'Sage', due: 'Jun 20', stage: 'Backlog' },
  { id: 't4', title: 'Welcome email sequence', client: 'Lumen Dental', type: 'Email', assignee: 'Maya', due: 'Jun 22', stage: 'Backlog' },
  { id: 't5', title: 'Product photography', client: 'Cho Coffee Co.', type: 'Content', assignee: 'Leo', due: 'Jun 15', stage: 'Review' },
  { id: 't6', title: 'Landing page copy', client: 'Bloom Studio', type: 'Website', assignee: 'Sage', due: 'Jun 14', stage: 'In Progress' },
  { id: 't7', title: 'Brand guidelines v2', client: 'Verde Market', type: 'Content', assignee: 'Maya', due: 'Jun 10', stage: 'Done' },
  { id: 't8', title: 'TikTok hooks research', client: 'Móda Studio', type: 'TikTok', assignee: 'Leo', due: 'Jun 9', stage: 'Done' },
  { id: 't9', title: 'Runway recap edit', client: 'Móda Studio', type: 'TikTok', assignee: 'Sage', due: 'Jun 17', stage: 'In Progress' },
]

export const productionStages: ProductionTask['stage'][] = [
  'Backlog',
  'In Progress',
  'Review',
  'Done',
]
