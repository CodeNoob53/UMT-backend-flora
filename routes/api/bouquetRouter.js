import { Router } from 'express';
import * as ctrl from '../../controllers/bouquetController.js';
import { basicAuth } from '../../middlewares/basicAuth.js';
import { validateBody } from '../../middlewares/validateBody.js';
import { upload } from '../../middlewares/multerUpload.js';
import { bouquetCreateSchema, bouquetUpdateSchema } from '../../schemas/bouquetSchema.js';

const router = Router();

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', basicAuth, validateBody(bouquetCreateSchema), ctrl.create);
router.put('/:id', basicAuth, validateBody(bouquetUpdateSchema), ctrl.update);
router.delete('/:id', basicAuth, ctrl.remove);
router.patch('/:id/favorite', basicAuth, ctrl.toggleFavorite);
router.patch('/:id/photo', basicAuth, upload.single('photo'), ctrl.updatePhoto);

export default router;
