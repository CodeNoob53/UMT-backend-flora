import { HttpError } from '../helpers/HttpError.js';

export const validateBody = schema => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return next(new HttpError(400, error.details.map(d => d.message).join('; ')));
  }
  next();
};
