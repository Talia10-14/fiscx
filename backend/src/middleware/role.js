export const roleMiddleware = (allowedRoles = []) => {
  const set = new Set(allowedRoles);
  if (set.has('ACCOUNTANT')) set.add('COMPTABLE');
  return (req, res, next) => {
    if (!req.user?.role || !set.has(req.user.role)) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: 'Acces refuse',
      });
    }
    next();
  };
};
