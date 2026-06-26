import prisma from '../../config/database';
import {
  UpdateTodoItemInput,
  AddTodoItemInput,
  TodoListViewFilters,
  TodoListViewType,
  TodoItemType,
} from '../../types/todo.types';

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function getPriorityRank(priority: TodoItemType['priority']) {
  if (priority === 'HIGH') return 0;
  if (priority === 'MEDIUM') return 1;
  return 2;
}

function normalizeDate(value: Date | string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export class TodoRepository {
  async findAllByUser(userId: string) {
    return prisma.todoList.findMany({
      where: { userId },
      include: {
        items: { orderBy: { order: 'asc' } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByIdAndUser(
    listId: string,
    userId: string,
    filters: TodoListViewFilters = {}
  ): Promise<TodoListViewType | null> {
    const list = await prisma.todoList.findFirst({
      where: { id: listId, userId },
      include: { items: { orderBy: { order: 'asc' } } },
    });

    if (!list) return null;

    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfTomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const counts = list.items.reduce(
      (acc, item) => {
        if (item.isCompleted) {
          acc.completed += 1;
        } else {
          acc.pending += 1;
        }
        return acc;
      },
      { pending: 0, completed: 0, total: list.items.length }
    );

    const items = list.items
      .filter((item) => {
        if (filters.status === 'pending' && item.isCompleted) return false;
        if (filters.status === 'completed' && !item.isCompleted) return false;

        if (filters.priority && filters.priority !== 'ALL' && item.priority !== filters.priority) {
          return false;
        }

        if (filters.dueDate && filters.dueDate !== 'all') {
          const due = normalizeDate(item.dueDate);
          if (!due) return false;

          if (filters.dueDate === 'overdue') return due < startOfToday;
          if (filters.dueDate === 'today') return isSameDay(due, today);
          if (filters.dueDate === 'upcoming') return due >= startOfTomorrow;
        }

        return true;
      })
      .sort((left, right) => {
        switch (filters.sort) {
          case 'priority': {
            const priorityDelta = getPriorityRank(left.priority) - getPriorityRank(right.priority);
            return priorityDelta !== 0 ? priorityDelta : left.order - right.order;
          }
          case 'dueDate': {
            const leftDue = normalizeDate(left.dueDate)?.getTime() ?? Number.POSITIVE_INFINITY;
            const rightDue = normalizeDate(right.dueDate)?.getTime() ?? Number.POSITIVE_INFINITY;
            if (leftDue !== rightDue) return leftDue - rightDue;
            return left.order - right.order;
          }
          case 'order':
          default:
            return left.order - right.order;
        }
      });

    return {
      ...list,
      items,
      counts,
    };
  }

  async createListWithItems(goal: string, userId: string, items: AddTodoItemInput[]) {
    return prisma.todoList.create({
      data: {
        goal,
        userId,
        items: {
          create: items.map((item, index) => ({
            task: item.task,
            description: item.description,
            order: index,
            priority: item.priority || 'MEDIUM',
          })),
        },
      },
      include: { items: { orderBy: { order: 'asc' } } },
    });
  }

  async addItem(listId: string, data: AddTodoItemInput) {
    const count = await prisma.todoItem.count({ where: { listId } });
    return prisma.todoItem.create({
      data: {
        task: data.task,
        description: data.description,
        listId,
        order: count,
        priority: data.priority || 'MEDIUM',
      },
    });
  }

  async toggleItem(itemId: string) {
    const item = await prisma.todoItem.findUnique({ where: { id: itemId } });
    if (!item) return null;
    return prisma.todoItem.update({
      where: { id: itemId },
      data: { isCompleted: !item.isCompleted },
    });
  }

  async updateItem(itemId: string, data: UpdateTodoItemInput) {
    return prisma.todoItem.update({ where: { id: itemId }, data });
  }

  async deleteItem(itemId: string) {
    return prisma.todoItem.delete({ where: { id: itemId } });
  }

  async deleteList(listId: string) {
    return prisma.todoList.delete({ where: { id: listId } });
  }
}
