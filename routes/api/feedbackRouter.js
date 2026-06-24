import { Router } from 'express';
import Feedback from '../../models/Feedback.js';
import { asyncHandler } from '../../helpers/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const feedbacks = await Feedback.findAll({ order: [['id', 'ASC']] });
  res.json(feedbacks);
}));

export default router;
