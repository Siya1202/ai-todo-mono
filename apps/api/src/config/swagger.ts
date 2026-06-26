import swaggerJSDoc from 'swagger-jsdoc';
import packageJson from '../../package.json';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Antigravity API',
      version: packageJson.version,
      description: 'Antigravity backend API documentation',
    },
    servers: [
      {
        url: '/api',
        description: 'Antigravity API server',
      },
    ],
    tags: [
      {
        name: 'Auth',
        description: 'User authentication and session endpoints',
      },
      {
        name: 'AI',
        description: 'Endpoints that call the AI planner to generate or evaluate todo lists',
      },
      {
        name: 'Todo',
        description: 'CRUD operations for generated todo lists and items',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        RegisterBody: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
          },
          required: ['name', 'email', 'password'],
        },
        LoginBody: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
          required: ['email', 'password'],
        },
        CreateTodoInput: {
          type: 'object',
          properties: {
            goal: { type: 'string', minLength: 3 },
          },
          required: ['goal'],
        },
        AIGenerateTodoRequest: {
          allOf: [
            {
              $ref: '#/components/schemas/CreateTodoInput',
            },
          ],
          description: 'Input sent to the AI planning endpoint',
        },
        AddTodoItemInput: {
          type: 'object',
          properties: {
            task: { type: 'string', minLength: 1 },
            description: { type: 'string', nullable: true },
            priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
            dueDate: { type: 'string', format: 'date-time', nullable: true },
            estimatedTime: { type: 'string', nullable: true },
          },
          required: ['task'],
        },
        UpdateTodoItemInput: {
          type: 'object',
          properties: {
            description: { type: 'string', nullable: true },
            priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
            dueDate: { type: 'string', format: 'date-time', nullable: true },
            estimatedTime: { type: 'string', nullable: true },
            order: { type: 'integer' },
          },
        },
        TodoItemType: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            task: { type: 'string' },
            description: { type: 'string', nullable: true },
            isCompleted: { type: 'boolean' },
            order: { type: 'integer' },
            priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
            dueDate: { type: 'string', format: 'date-time', nullable: true },
            estimatedTime: { type: 'string', nullable: true },
            listId: { type: 'string' },
          },
          required: ['id', 'task', 'description', 'isCompleted', 'order', 'priority', 'dueDate', 'estimatedTime', 'listId'],
        },
        TodoListType: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            goal: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            items: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/TodoItemType',
              },
            },
          },
          required: ['id', 'goal', 'createdAt', 'items'],
        },
        TodoListCounts: {
          type: 'object',
          properties: {
            pending: { type: 'integer' },
            completed: { type: 'integer' },
            total: { type: 'integer' },
          },
          required: ['pending', 'completed', 'total'],
        },
        TodoListViewType: {
          allOf: [
            {
              $ref: '#/components/schemas/TodoListType',
            },
            {
              type: 'object',
              properties: {
                counts: {
                  $ref: '#/components/schemas/TodoListCounts',
                },
              },
              required: ['counts'],
            },
          ],
        },
        BrutalHonestyType: {
          type: 'object',
          properties: {
            verdict: { type: 'string' },
            isAchievable: { type: 'boolean' },
            reasoning: { type: 'string' },
          },
          required: ['verdict', 'isAchievable', 'reasoning'],
        },
        AuthSuccessResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            data: {
              type: 'object',
              properties: {
                token: { type: 'string' },
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                  },
                  required: ['id', 'name', 'email'],
                },
              },
              required: ['token', 'user'],
            },
          },
          required: ['status', 'data'],
        },
        TodoListResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            data: {
              $ref: '#/components/schemas/TodoListViewType',
            },
          },
          required: ['status', 'data'],
        },
        TodoGenerateResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            data: {
              type: 'object',
              properties: {
                todoList: {
                  $ref: '#/components/schemas/TodoListType',
                },
                brutalHonesty: {
                  $ref: '#/components/schemas/BrutalHonestyType',
                },
              },
              required: ['todoList', 'brutalHonesty'],
            },
          },
          required: ['status', 'data'],
        },
        AIGenerateTodoResponse: {
          allOf: [
            {
              $ref: '#/components/schemas/TodoGenerateResponse',
            },
          ],
          description: 'AI-generated todo list plus the honesty evaluation',
        },
        TodoListArrayResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/TodoListType',
              },
            },
          },
          required: ['status', 'data'],
        },
        TodoItemResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            data: {
              $ref: '#/components/schemas/TodoItemType',
            },
          },
          required: ['status', 'data'],
        },
        NullDataResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            data: { type: 'object', nullable: true, example: null },
          },
          required: ['status', 'data'],
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'error' },
            message: { type: 'string' },
          },
          required: ['status', 'message'],
        },
      },
    },
  },
  apis: ['./src/modules/**/*.routes.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);
