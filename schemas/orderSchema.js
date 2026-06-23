import Joi from 'joi';

export const orderCreateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
  phone: Joi.string().trim().min(5).max(40).required(),
  address: Joi.string().trim().max(160).allow('', null),
  message: Joi.string().trim().max(1000).allow('', null),
  quantity: Joi.number().integer().min(1).max(99).default(1),
  productId: Joi.number().integer().positive(),
  productTitle: Joi.string().trim().max(120),
  productPrice: Joi.number().integer().positive(),
});

export const orderStatusSchema = Joi.object({
  status: Joi.string().valid('new', 'processed', 'completed', 'cancelled').required(),
});
