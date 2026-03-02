export interface Contact {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  group_id?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: number;
  name: string;
  created_at: string;
  contact_count?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
  details?: string[];
}

export interface DashboardStats {
  totalContacts: number;
  totalGroups: number;
  recentContacts: Contact[];
}