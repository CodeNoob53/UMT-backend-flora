import Joi from 'joi';

export const bouquetCreateSchema = Joi.object({
  title: Joi.string().required(),
  text: Joi.string(),
  description: Joi.string(),
  price: Joi.number().integer().positive().required(),
  favorite: Joi.boolean(),
  bestseller: Joi.boolean(),
  orders: Joi.number().integer().min(0),
  category: Joi.string(),
  slug: Joi.string(),
  alt: Joi.string(),
});

export const bouquetUpdateSchema = Joi.object({
  title: Joi.string(),
  text: Joi.string(),
  description: Joi.string(),
  price: Joi.number().integer().positive(),
  favorite: Joi.boolean(),
  bestseller: Joi.boolean(),
  orders: Joi.number().integer().min(0),
  category: Joi.string(),
  slug: Joi.string(),
  alt: Joi.string(),
}).min(1);
