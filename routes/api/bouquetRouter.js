import { Router } from 'express';
import * as ctrl from '../../controllers/bouquetController.js';
import { validateBody } from '../../middlewares/validateBody.js';
import { upload } from '../../middlewares/multerUpload.js';
import { bouquetCreateSchema, bouquetUpdateSchema } from '../../schemas/bouquetSchema.js';

const router = Router();

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', validateBody(bouquetCreateSchema), ctrl.create);
router.put('/:id', validateBody(bouquetUpdateSchema), ctrl.update);
router.delete('/:id', ctrl.remove);
router.patch('/:id/favorite', ctrl.toggleFavorite);
router.patch('/:id/photo', upload.single('photo'), ctrl.updatePhoto);

export default router;
