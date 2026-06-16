// types/index.ts

export type Role = "admin" | "member" | "client";
export type TaskStatus = "backlog" | "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export interface Team {
  id: string;
  name: string; // pl. "SonaWeb Ügynökség"
  ownerId: string;
}

export interface Project {
  id: string;
  teamId: string;
  name: string;
  description?: string;
  status: "active" | "archived" | "completed";
  progress: number; // 0-100%
  createdAt: any;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string; // pl. Ádám UID-ja
  dueDate?: any;
  estimatedHours?: number;
  tags: string[];
  order: number; 
  createdAt: any;
}

export interface Page {
  id: string;
  projectId: string;
  parentId?: string; // A fa struktúrához (almappák)
  title: string;
  content: string; // JSON vagy Markdown a Rich Text Editorhoz
  lastEditedBy: string;
  updatedAt: any;
}

export interface TimeEntry {
  id: string;
  projectId: string;
  taskId?: string; // Opcionális, lehet csak projektszintű is
  userId: string;
  description: string;
  startTime: any;
  endTime: any | null;
  duration: number; // Másodpercben
}

export interface Activity {
  id: string;
  teamId: string;
  projectId?: string;
  userId: string;
  action: string; // pl. "létrehozta", "elindította", "módosította"
  targetName: string; // pl. "Landing page", "SEO Audit timer"
  timestamp: any;
}

// CRM-lite Modell
export interface Lead {
  id: string;
  teamId: string;
  companyName: string;
  contactName: string;
  value?: number;
  status: "new" | "contacted" | "proposal" | "won" | "lost";
  createdAt: any;
}