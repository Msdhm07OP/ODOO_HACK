import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
const productController = new ProductController();

router.get('/', authenticate, productController.getAll);
router.get('/:id', authenticate, productController.getById);
router.post('/', authenticate, authorize('manager', 'admin'), productController.create);
router.put('/:id', authenticate, authorize('manager', 'admin'), productController.update);
router.delete('/:id', authenticate, authorize('admin'), productController.delete);

export default router;
