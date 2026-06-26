const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface TodoItem {
  id: string;
  task: string;
  description?: string;
  isCompleted: boolean;
  order: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  estimatedTime?: string;
  listId: string;
}

export interface TodoList {
  id: string;
  goal: string;
  createdAt: string;
  items: TodoItem[];
  counts?: {
    pending: number;
    completed: number;
    total: number;
  };
}

export interface BrutalHonesty {
  verdict: string;
  isAchievable: boolean;
  reasoning: string;
}

export interface GenerateResponse {
  todoList: TodoList;
  brutalHonesty: BrutalHonesty;
}

export type SortOption = 'order' | 'priority' | 'dueDate';
export type StatusFilter = 'all' | 'pending' | 'completed';
export type PriorityFilter = 'ALL' | 'LOW' | 'MEDIUM' | 'HIGH';
export type DueDateFilter = 'all' | 'overdue' | 'today' | 'upcoming';

export interface ListQueryFilters {
  sort?: SortOption;
  status?: StatusFilter;
  priority?: PriorityFilter;
  dueDate?: DueDateFilter;
}

export const api = {
  async register(name: string, email: string, password: string) {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return res.json();
  },

  async login(email: string, password: string) {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  async generateList(goal: string, dueDate?: string): Promise<{ status: string; data: GenerateResponse; message?: string }> {
    const res = await fetch(`${API_URL}/api/todo/generate`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ goal, dueDate }),
    });
    return res.json();
  },

  async getAllLists(): Promise<{ status: string; data: TodoList[] }> {
    const res = await fetch(`${API_URL}/api/todo`, {
      headers: authHeaders(),
    });
    return res.json();
  },

  async getList(listId: string, filters?: ListQueryFilters): Promise<{ status: string; data: TodoList }> {
    const params = new URLSearchParams();
    if (filters?.sort) params.set('sort', filters.sort);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.priority) params.set('priority', filters.priority);
    if (filters?.dueDate) params.set('dueDate', filters.dueDate);

    const query = params.toString();
    const res = await fetch(`${API_URL}/api/todo/${listId}${query ? `?${query}` : ''}`, {
      headers: authHeaders(),
    });
    return res.json();
  },

  async toggleItem(itemId: string): Promise<{ status: string; data: TodoItem }> {
    const res = await fetch(`${API_URL}/api/todo/item/${itemId}/toggle`, {
      method: 'PATCH',
      headers: authHeaders(),
    });
    return res.json();
  },

  async updateItem(itemId: string, data: object): Promise<{ status: string; data: TodoItem }> {
    const res = await fetch(`${API_URL}/api/todo/item/${itemId}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteItem(itemId: string) {
    const res = await fetch(`${API_URL}/api/todo/item/${itemId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return res.json();
  },

  async deleteList(listId: string) {
    const res = await fetch(`${API_URL}/api/todo/${listId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return res.json();
  },

  async addItem(listId: string, task: string): Promise<{ status: string; data: TodoItem }> {
    const res = await fetch(`${API_URL}/api/todo/${listId}/items`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ task }),
    });
    return res.json();
  },
};
