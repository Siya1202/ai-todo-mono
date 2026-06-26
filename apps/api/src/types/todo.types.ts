export interface CreateTodoInput {
  goal: string;
  dueDate?: string;
}

export type TodoSortOption = 'order' | 'priority' | 'dueDate';
export type TodoStatusFilter = 'all' | 'pending' | 'completed';
export type TodoPriorityFilter = 'ALL' | 'LOW' | 'MEDIUM' | 'HIGH';
export type TodoDueDateFilter = 'all' | 'overdue' | 'today' | 'upcoming';

export interface TodoListViewFilters {
  sort?: TodoSortOption;
  status?: TodoStatusFilter;
  priority?: TodoPriorityFilter;
  dueDate?: TodoDueDateFilter;
}

export interface UpdateTodoItemInput {
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  estimatedTime?: string;
  order?: number;
}

export interface AddTodoItemInput {
  task: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  estimatedTime?: string;
}

export interface TodoItemType {
  id: string;
  task: string;
  description: string | null;
  isCompleted: boolean;
  order: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: Date | null;
  estimatedTime: string | null;
  listId: string;
}

export interface TodoListType {
  id: string;
  goal: string;
  createdAt: Date;
  items: TodoItemType[];
}

export interface TodoListCounts {
  pending: number;
  completed: number;
  total: number;
}

export interface TodoListViewType extends TodoListType {
  counts: TodoListCounts;
}

export interface BrutalHonestyType {
  verdict: string;
  isAchievable: boolean;
  reasoning: string;
}
