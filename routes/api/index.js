import { Router } from 'express';
import bouquetRouter from './bouquetRouter.js';
import orderRouter from './orderRouter.js';
import feedbackRouter from './feedbackRouter.js';

const router = Router();

router.use('/bouquets', bouquetRouter);
router.use('/products', bouquetRouter);
router.use('/orders', orderRouter);
router.use('/feedbacks', feedbackRouter);

export default router;
