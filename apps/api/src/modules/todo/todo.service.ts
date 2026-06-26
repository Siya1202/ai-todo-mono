import { callOpenRouter } from '../../shared/utils/openrouter.utils';
import { TodoRepository } from './todo.repository';
import {
  UpdateTodoItemInput,
  AddTodoItemInput,
  BrutalHonestyType,
  TodoListViewFilters,
} from '../../types/todo.types';
import { NotFoundException } from '../../shared/exceptions';

const todoRepo = new TodoRepository();

export class TodoService {
  async generateTodoList(goal: string, userId: string, dueDate?: string) {
    const todayStr = new Date().toISOString().slice(0, 10);
    const timelineInfo = dueDate 
      ? `Today's date is ${todayStr}. The target deadline (due date) for this goal is ${dueDate}.`
      : '';

    const raw = await callOpenRouter([
      {
        role: 'system',
        content: 'You are a brutally honest productivity assistant. Respond with ONLY valid JSON — no markdown, no backticks, no explanation.',
      },
      {
        role: 'user',
        content: `Generate a structured todo list for this goal: "${goal}".
${timelineInfo}

You must evaluate if this goal is realistically achievable within the given timeline (if a deadline is specified). Be brutally honest and realistic. If the tasks required to achieve this goal cannot be reasonably completed by the due date, set "isAchievable" to false, and write a sarcastic/brutally honest "verdict" and "reasoning" explaining why they will fail. If it is realistic to complete all tasks by the due date, set "isAchievable" to true.

Respond with ONLY this JSON shape:
{
  "tasks": [
    { "task": "Task title", "description": "What to do and why", "priority": "HIGH" | "MEDIUM" | "LOW" }
  ],
  "verdict": "One punchy, brutally honest sentence verdict on whether this goal is realistic given the timeline",
  "isAchievable": true or false,
  "reasoning": "2-3 sentences of brutally honest reasoning about the timeline and feasibility"
}`,
      },
    ]);

    let parsed: { tasks: AddTodoItemInput[]; verdict: string; isAchievable: boolean; reasoning: string };
    try {
      const clean = raw.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(clean);
    } catch {
      throw new Error('AI returned invalid JSON');
    }

    const todoList = await todoRepo.createListWithItems(goal, userId, parsed.tasks);

    const brutalHonesty: BrutalHonestyType = {
      verdict: parsed.verdict,
      isAchievable: parsed.isAchievable,
      reasoning: parsed.reasoning,
    };

    return { todoList, brutalHonesty };
  }

  async getAllLists(userId: string) {
    return todoRepo.findAllByUser(userId);
  }

  async getListById(listId: string, userId: string, filters: TodoListViewFilters = {}) {
    const list = await todoRepo.findByIdAndUser(listId, userId, filters);
    if (!list) throw new NotFoundException('Todo list not found');
    return list;
  }

  async addItem(listId: string, data: AddTodoItemInput) {
    return todoRepo.addItem(listId, data);
  }

  async toggleItem(itemId: string) {
    const item = await todoRepo.toggleItem(itemId);
    if (!item) throw new NotFoundException('Todo item not found');
    return item;
  }

  async updateItem(itemId: string, data: UpdateTodoItemInput) {
    return todoRepo.updateItem(itemId, data);
  }

  async deleteItem(itemId: string) {
    return todoRepo.deleteItem(itemId);
  }

  async deleteList(listId: string) {
    return todoRepo.deleteList(listId);
  }
}
