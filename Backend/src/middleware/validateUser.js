export const validateUserPayload = (req, res, next) => {
  const { name, email, role, department } = req.body;
  const errors = [];

  if (req.method === 'POST') {
    if (!name || typeof name !== 'string' || !name.trim()) {
      errors.push('Full Name is required.');
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      errors.push('A valid work email address is required.');
    }

    if (!role || typeof role !== 'string') {
      errors.push('Assigning a valid role is required.');
    }
  }

  if (email && !email.includes('@')) {
    errors.push('Invalid email format.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation Failed',
      errors,
    });
  }

  next();
};
