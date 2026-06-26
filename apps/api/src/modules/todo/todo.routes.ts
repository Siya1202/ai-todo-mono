import { Router } from 'express';
import { TodoController } from './todo.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const controller = new TodoController();

// All todo routes require a valid JWT
router.use(authMiddleware);

/**
 * @swagger
 * /todo/generate:
 *   post:
 *     summary: Generate a new todo list with AI
 *     description: Uses the AI planner to create tasks and a brutal honesty assessment for the goal.
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AIGenerateTodoRequest'
 *     responses:
 *       201:
 *         description: AI-generated todo list created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AIGenerateTodoResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/generate', (req, res, next) => controller.generateTodoList(req, res, next));

/**
 * @swagger
 * /todo:
 *   get:
 *     summary: Get all todo lists for the current user
 *     tags: [Todo]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all lists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TodoListArrayResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', (req, res, next) => controller.getAllLists(req, res, next));

/**
 * @swagger
 * /todo/{listId}:
 *   get:
 *     summary: Get a specific todo list by ID
 *     tags: [Todo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the todo list
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [order, priority, dueDate]
 *         description: Sort tasks before returning them
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, pending, completed]
 *         description: Filter tasks by completion state
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [ALL, LOW, MEDIUM, HIGH]
 *         description: Filter tasks by priority
 *       - in: query
 *         name: dueDate
 *         schema:
 *           type: string
 *           enum: [all, overdue, today, upcoming]
 *         description: Filter tasks by due date bucket
 *     responses:
 *       200:
 *         description: Successfully retrieved the todo list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TodoListResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Todo list not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:listId', (req, res, next) => controller.getListById(req, res, next));

/**
 * @swagger
 * /todo/{listId}/items:
 *   post:
 *     summary: Add a new todo item to a list
 *     tags: [Todo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the todo list
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddTodoItemInput'
 *     responses:
 *       201:
 *         description: Item added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TodoItemResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Todo list not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/:listId/items', (req, res, next) => controller.addItem(req, res, next));

/**
 * @swagger
 * /todo/item/{itemId}/toggle:
 *   patch:
 *     summary: Toggle completion status of a todo item
 *     tags: [Todo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the todo item to toggle
 *     responses:
 *       200:
 *         description: Item status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TodoItemResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Todo item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/item/:itemId/toggle', (req, res, next) => controller.toggleItem(req, res, next));

/**
 * @swagger
 * /todo/item/{itemId}:
 *   patch:
 *     summary: Update details of a todo item
 *     tags: [Todo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the todo item to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTodoItemInput'
 *     responses:
 *       200:
 *         description: Item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TodoItemResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Todo item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/item/:itemId', (req, res, next) => controller.updateItem(req, res, next));

/**
 * @swagger
 * /todo/item/{itemId}:
 *   delete:
 *     summary: Delete a todo item
 *     tags: [Todo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the todo item to delete
 *     responses:
 *       200:
 *         description: Item deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NullDataResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Todo item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/item/:itemId', (req, res, next) => controller.deleteItem(req, res, next));

/**
 * @swagger
 * /todo/{listId}:
 *   delete:
 *     summary: Delete a todo list
 *     tags: [Todo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the todo list to delete
 *     responses:
 *       200:
 *         description: Todo list deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NullDataResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Todo list not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:listId', (req, res, next) => controller.deleteList(req, res, next));

export default router;
