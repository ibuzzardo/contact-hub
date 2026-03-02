export interface Contact {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  job_title?: string;
  group_id?: number;
  notes?: string;
  favorite: number;
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalContacts: number;
  totalGroups: number;
  recentContacts: Contact[];
  favoritesCount: number;
  newThisWeek: number;
}