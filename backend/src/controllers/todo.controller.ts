import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { AuthRequest } from '../middleware/auth';

const todoSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().datetime().optional().nullable(),
});

export const getTodos = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const { completed, priority, search } = req.query;

    const where: any = { userId };

    if (completed !== undefined) {
      where.completed = completed === 'true';
    }

    if (priority) {
      where.priority = priority;
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string } },
        { description: { contains: search as string } },
      ];
    }

    const todos = await prisma.todo.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ todos });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching todos' });
  }
};

export const getTodoById = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const userId = req.user.id;

    const todo = await prisma.todo.findFirst({
      where: { id, userId },
    });

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.json({ todo });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching todo' });
  }
};

export const createTodo = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const validatedData = todoSchema.parse(req.body);

    const todo = await prisma.todo.create({
      data: {
        ...validatedData,
        userId,
      },
    });

    res.status(201).json({ todo });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: (error as any).errors });
    }
    res.status(500).json({ message: 'Error creating todo' });
  }
};

export const updateTodo = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const userId = req.user.id;
    const validatedData = todoSchema.parse(req.body);

    // Verify ownership
    const existingTodo = await prisma.todo.findFirst({ where: { id, userId } });
    if (!existingTodo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    const todo = await prisma.todo.update({
      where: { id },
      data: validatedData,
    });

    res.json({ todo });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: (error as any).errors });
    }
    res.status(500).json({ message: 'Error updating todo' });
  }
};

export const toggleTodo = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const userId = req.user.id;

    const existingTodo = await prisma.todo.findFirst({ where: { id, userId } });
    if (!existingTodo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    const todo = await prisma.todo.update({
      where: { id },
      data: { completed: !existingTodo.completed },
    });

    res.json({ todo });
  } catch (error) {
    res.status(500).json({ message: 'Error toggling todo' });
  }
};

export const deleteTodo = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const userId = req.user.id;

    const existingTodo = await prisma.todo.findFirst({ where: { id, userId } });
    if (!existingTodo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    await prisma.todo.delete({ where: { id } });

    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting todo' });
  }
};
