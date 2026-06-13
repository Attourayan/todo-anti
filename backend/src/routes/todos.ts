import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getTodos,
  getTodoById,
  createTodo,
  updateTodo,
  toggleTodo,
  deleteTodo,
} from '../controllers/todo.controller';

const router = Router();

router.use(authenticateToken); // Protect all todo routes

router.get('/', getTodos as any);
router.get('/:id', getTodoById as any);
router.post('/', createTodo as any);
router.put('/:id', updateTodo as any);
router.patch('/:id/toggle', toggleTodo as any);
router.delete('/:id', deleteTodo as any);

export default router;
