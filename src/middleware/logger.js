import pinoHttp from 'pino-http';

export const logger =
  process.env.NODE_ENV === 'production'
    ? pinoHttp()
    : pinoHttp({
        transport: { target: 'pino-pretty' },
      });
