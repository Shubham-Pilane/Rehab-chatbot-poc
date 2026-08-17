const Joi = require('joi');

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().max(50).allow(''),
  lastName: Joi.string().max(50).allow(''),
  roles: Joi.array().items(Joi.string().valid('Admin', 'Project Manager', 'Finance Manager', 'Vendor Manager', 'Homeowner', 'Viewer'))
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errorMessage = error.details.map(d => d.message).join(', ');
      return res.status(400).json({ error: errorMessage });
    }
    req.validatedBody = value;
    next();
  };
};

module.exports = {
  registerSchema,
  loginSchema,
  validateRequest
};
