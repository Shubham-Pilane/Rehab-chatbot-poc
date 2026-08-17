const Joi = require('joi');

const createSessionSchema = Joi.object({
  title: Joi.string().max(100).optional()
});

const messageSchema = Joi.object({
  sessionId: Joi.string().uuid().required(),
  content: Joi.string().min(1).required()
});

const feedbackSchema = Joi.object({
  messageId: Joi.string().uuid().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().max(500).allow('').optional()
});

const searchSchema = Joi.object({
  query: Joi.string().min(2).required(),
  limit: Joi.number().integer().min(1).max(50).default(5)
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
  createSessionSchema,
  messageSchema,
  feedbackSchema,
  searchSchema,
  validateRequest
};
