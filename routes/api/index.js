import { Router } from 'express';
import bouquetRouter from './bouquetRouter.js';
import orderRouter from './orderRouter.js';

const router = Router();

router.use('/bouquets', bouquetRouter);
router.use('/orders', orderRouter);

export default router;
