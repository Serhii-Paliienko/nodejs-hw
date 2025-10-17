import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';

const app = express();

const logger =
  process.env.NODE_ENV === 'production'
    ? pinoHttp()
    : pinoHttp({
        transport: { target: 'pino-pretty' },
      });

app.use(logger);
app.use(cors());
app.use(express.json());

app.get('/notes', (_req, res) => {
  res.status(200).json({ message: 'Retrieved all notes' });
});

app.get('/notes/:noteId', (req, res) => {
  const { noteId } = req.params;
  res.status(200).json({ message: `Retrieved note with ID: ${noteId}` });
});

app.get('/test-error', () => {
  throw new Error('Simulated server error');
});

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  });
});

app.get('/', (_req, res) => {
  res.status(200).json({ message: 'API is up' });
});

app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, _next) => {
  req.log?.error({ err }, 'Unhandled error');
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
