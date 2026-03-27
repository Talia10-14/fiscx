export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erreur serveur interne';

  console.error(`[ERROR] ${statusCode}: ${message}`, err);

  res.status(statusCode).json({
    error: message,
    code: err.code || 'INTERNAL_ERROR',
    details: process.env.NODE_ENV === 'development' ? err : undefined,
  });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    code: 'NOT_FOUND',
    path: req.path,
  });
};

export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}
