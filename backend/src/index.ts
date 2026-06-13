import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import todoRoutes from './routes/todos';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for secure cookies behind reverse proxy (Render)
app.set('trust proxy', 1);

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(cors({
  origin: frontendUrl,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/auth', authRoutes);
app.use('/api/todos', todoRoutes);

// Error Handling Middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
