export const enforceTenant = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'User not authenticated' });
  }

  // Super Admin can access globally or pass specific tenant query parameter
  if (req.user.role === 'Super Admin') {
    req.tenantId = req.headers['x-tenant-id'] || req.query.tenantId || null;
    return next();
  }

  // For all other roles, enforce user's own tenantId
  if (!req.user.tenantId) {
    return res.status(400).json({
      success: false,
      message: 'User account has no associated Tenant ID.',
    });
  }

  req.tenantId = req.user.tenantId.toString();
  next();
};
