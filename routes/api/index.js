import { Router } from 'express';
import bouquetRouter from './bouquetRouter.js';

const router = Router();

router.use('/bouquets', bouquetRouter);

export default router;
