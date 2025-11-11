import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectMongoDB } from './db/connectMongoDB.js';
import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import noteRoutes from './routes/notesRoutes.js';
import { errors as celebrateErrorHandler } from 'celebrate';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();

app.use(logger);
app.set('trust proxy', 1);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/', noteRoutes);
app.use('/', authRoutes);
app.use('/', userRoutes);

app.get('/', (_req, res) => res.json({ ok: true }));
app.get('/favicon.ico', (_req, res) => res.status(204).end());

app.use(notFoundHandler);
app.use(celebrateErrorHandler());
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3000;

await connectMongoDB();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
