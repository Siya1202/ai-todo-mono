import { Request, Response, NextFunction } from 'express';
import { TodoService } from './todo.service';
import {
  TodoDueDateFilter,
  TodoPriorityFilter,
  TodoSortOption,
  TodoStatusFilter,
  TodoListViewFilters,
} from '../../types/todo.types';

const todoService = new TodoService();

function firstQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseTodoListFilters(query: Request['query']): TodoListViewFilters {
  const sort = firstQueryValue(query.sort);
  const status = firstQueryValue(query.status);
  const priority = firstQueryValue(query.priority);
  const dueDate = firstQueryValue(query.dueDate);

  const filters: TodoListViewFilters = {};

  if (sort === 'order' || sort === 'priority' || sort === 'dueDate') {
    filters.sort = sort as TodoSortOption;
  }

  if (status === 'all' || status === 'pending' || status === 'completed') {
    filters.status = status as TodoStatusFilter;
  }

  if (priority === 'ALL' || priority === 'LOW' || priority === 'MEDIUM' || priority === 'HIGH') {
    filters.priority = priority as TodoPriorityFilter;
  }

  if (dueDate === 'all' || dueDate === 'overdue' || dueDate === 'today' || dueDate === 'upcoming') {
    filters.dueDate = dueDate as TodoDueDateFilter;
  }

  return filters;
}

export class TodoController {
  async generateTodoList(req: Request, res: Response, next: NextFunction) {
    try {
      const { goal, dueDate } = req.body;
      const userId = req.user!.userId;
      const result = await todoService.generateTodoList(goal, userId, dueDate);
      res.status(201).json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  }

  async getAllLists(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const lists = await todoService.getAllLists(userId);
      res.status(200).json({ status: 'success', data: lists });
    } catch (err) {
      next(err);
    }
  }

  async getListById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const filters = parseTodoListFilters(req.query);
      const list = await todoService.getListById(String(req.params.listId), userId, filters);
      res.status(200).json({ status: 'success', data: list });
    } catch (err) {
      next(err);
    }
  }

  async addItem(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await todoService.addItem(String(req.params.listId), req.body);
      res.status(201).json({ status: 'success', data: item });
    } catch (err) {
      next(err);
    }
  }

  async toggleItem(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await todoService.toggleItem(String(req.params.itemId));
      res.status(200).json({ status: 'success', data: item });
    } catch (err) {
      next(err);
    }
  }

  async updateItem(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await todoService.updateItem(String(req.params.itemId), req.body);
      res.status(200).json({ status: 'success', data: item });
    } catch (err) {
      next(err);
    }
  }

  async deleteItem(req: Request, res: Response, next: NextFunction) {
    try {
      await todoService.deleteItem(String(req.params.itemId));
      res.status(200).json({ status: 'success', data: null });
    } catch (err) {
      next(err);
    }
  }

  async deleteList(req: Request, res: Response, next: NextFunction) {
    try {
      await todoService.deleteList(String(req.params.listId));
      res.status(200).json({ status: 'success', data: null });
    } catch (err) {
      next(err);
    }
  }
}
