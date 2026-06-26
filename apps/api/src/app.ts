import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import todoRoutes from './modules/todo/todo.routes';
import authRoutes from './modules/auth/auth.routes';
import { errorMiddleware } from './middleware/error.middleware';

const app = express();

app.use(helmet());
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Swagger documentation
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api/docs.json', (req, res) => {
    res.json(swaggerSpec);
  });
}

// Public routes (no login needed)
app.use('/api/auth', authRoutes);

// Protected routes (login required)
app.use('/api/todo', todoRoutes);

app.use(errorMiddleware);

export default app;