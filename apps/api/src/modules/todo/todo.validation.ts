import { z } from 'zod';

export const createTodoSchema = z.object({
  body: z.object({
    goal: z.string({ message: 'Goal is required' }).min(3, 'Goal must be at least 3 characters'),
    dueDate: z.string().optional(),
  }),
});

export const updateTodoItemSchema = z.object({
  params: z.object({
    itemId: z.string({ message: 'Item ID is required' }),
  }),
  body: z.object({
    description: z.string().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    dueDate: z.string().optional(),
    estimatedTime: z.string().optional(),
    order: z.number().optional(),
  }),
});

export const addTodoItemSchema = z.object({
  params: z.object({
    listId: z.string({ message: 'List ID is required' }),
  }),
  body: z.object({
    task: z.string({ message: 'Task is required' }).min(1),
    description: z.string().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    dueDate: z.string().optional(),
    estimatedTime: z.string().optional(),
  }),
});

export const toggleItemSchema = z.object({
  params: z.object({
    itemId: z.string({ message: 'Item ID is required' }),
  }),
});