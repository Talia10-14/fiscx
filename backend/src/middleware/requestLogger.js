/**
 * Lightweight request timing log (pino-http already handles structured logs).
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    if (process.env.LOG_REQUESTS === 'false') return;
    const ms = Date.now() - start;
    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`
    );
  });
  next();
};
