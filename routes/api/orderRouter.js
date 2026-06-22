import { Router } from 'express';
import * as ctrl from '../../controllers/orderController.js';
import { basicAuth } from '../../middlewares/basicAuth.js';
import { validateBody } from '../../middlewares/validateBody.js';
import { orderCreateSchema, orderStatusSchema } from '../../schemas/orderSchema.js';

const router = Router();

router.get('/', basicAuth, ctrl.getAll);
router.get('/:id', basicAuth, ctrl.getById);
router.post('/', validateBody(orderCreateSchema), ctrl.create);
router.patch('/:id/status', basicAuth, validateBody(orderStatusSchema), ctrl.updateStatus);
router.delete('/:id', basicAuth, ctrl.remove);

export default router;
